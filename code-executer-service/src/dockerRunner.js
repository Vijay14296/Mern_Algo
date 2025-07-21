const fs = require('fs');
const path = require('path');
const { v4: uuid } = require('uuid');
const Docker = require('dockerode');
const languageConfigs = require('./languageConfigs');

const docker = new Docker({ socketPath: '//./pipe/docker_engine' }); // Windows
const TEMP_DIR = path.join(__dirname, '..', 'temp');
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR);

async function runCodeInDocker({ code, language, input = '' }) {
  const lang = languageConfigs[language];
  if (!lang) throw new Error('Unsupported language');

  const filename = `Main-${uuid()}${lang.extension}`;
  const filepath = path.join(TEMP_DIR, filename);
  fs.writeFileSync(filepath, code);

  // Inject input via shell piping instead of stdin
  const baseCmd = lang.runCmd(filename);
  const command = input ? `echo "${input}" | ${baseCmd}` : baseCmd;

  console.log('🛠️ Running command:', command);

  try {
    const container = await docker.createContainer({
      Image: lang.image,
      Cmd: ['/bin/sh', '-c', command],
      Tty: false,
      HostConfig: {
        Binds: [`${TEMP_DIR}:/code`],
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

    let output = '';
    stream.on('data', (chunk) => {
      output += chunk.toString('utf8');
    });

    await container.start();
    console.log('🚀 Container started');

    await container.wait();
    fs.unlinkSync(filepath);

    const cleanedOutput = output.replace(/[\x00-\x1F\x7F-\x9F]/g, '').trim();
    const isError = /error|traceback/i.test(cleanedOutput.toLowerCase());

    return {
      output: cleanedOutput,
      error: isError ? cleanedOutput : null,
    };
  } catch (err) {
    if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
    throw new Error('Docker execution failed: ' + err.message);
  }
}

module.exports = runCodeInDocker;
