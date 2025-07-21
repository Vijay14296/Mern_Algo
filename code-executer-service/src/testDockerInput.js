const Docker = require('dockerode');
const docker = new Docker({ socketPath: '//./pipe/docker_engine' });

const fs = require('fs');
const path = require('path');

(async () => {
  try {
    const tempDir = path.join(__dirname, 'temp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

    const pythonFilePath = path.join(tempDir, 'input_test.py');
    fs.writeFileSync(pythonFilePath, 'a = input()\nprint(a)\n');

    const container = await docker.createContainer({
      Image: 'python:3.10',
      Cmd: ['/bin/sh', '-c', 'echo "hello test" | python input_test.py'],
      Tty: false,
      HostConfig: {
        Binds: [`${tempDir}:/code`],
        AutoRemove: true,
        NetworkMode: 'none',
      },
      WorkingDir: '/code',
    });

    const stream = await container.attach({
      stream: true,
      stdout: true,
      stderr: true,
    });

    docker.modem.demuxStream(stream, process.stdout, process.stderr);

    await container.start();
    console.log('🚀 Container started');

    await container.wait();
    console.log('✅ Container finished');
  } catch (err) {
    console.error('❌ Error:', err);
  }
})();
