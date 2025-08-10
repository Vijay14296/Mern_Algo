const fs = require('fs');
const path = require('path');
const { v4: uuid } = require('uuid');
const Docker = require('dockerode');
const languageConfigs = require('./languageConfigs');

// Connect to Docker daemon via TCP at host.docker.internal:2375 (Docker Desktop on Windows)
const docker = new Docker({
  host: 'host.docker.internal',
  port: 2375,
});

// Host absolute temp directory, passed as env variable to microservice container
const HOST_TEMP_DIR = process.env.HOST_TEMP_DIR || 'D:/Vijay/L4/Online_Judge/src/temp';

// Microservice container mounts this host dir at /code
const TEMP_DIR = '/code';

if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
  console.log('🛠️ Created TEMP_DIR:', TEMP_DIR);
} else {
  console.log('📁 Using existing TEMP_DIR:', TEMP_DIR);
}

async function runCodeInDocker({ code, language, input = '' }) {
  const lang = languageConfigs[language];
  if (!lang) throw new Error(`Unsupported language: ${language}`);

  const filename = `Main-${uuid()}${lang.extension}`;
  const filepath = path.join(TEMP_DIR, filename);

  console.log('📁 TEMP_DIR absolute path:', TEMP_DIR);
  console.log('📝 Writing code to file:', filepath);

  try {
    fs.writeFileSync(filepath, code);
  } catch (writeErr) {
    console.error('❌ Failed to write code file:', writeErr);
    throw writeErr;
  }

  if (!fs.existsSync(filepath)) {
    const errMsg = `❌ Code file does not exist after writing: ${filepath}`;
    console.error(errMsg);
    throw new Error(errMsg);
  }
  console.log('✅ Code file successfully written.');

  const tempFiles = fs.readdirSync(TEMP_DIR);
  console.log('📂 Files currently in TEMP_DIR:', tempFiles);

  const baseCmd = lang.runCmd(filename);
  const command = input ? `echo "${input}" | ${baseCmd}` : baseCmd;

  console.log('🛠️ Running command in container:', command);

  let container;
  try {
    container = await docker.createContainer({
      Image: lang.image,
      Cmd: ['/bin/sh', '-c', command],
      Tty: false,
      HostConfig: {
        // Bind mount the **host absolute temp dir** directly so child container sees the code file
        Binds: [`${HOST_TEMP_DIR}:/code`],
        AutoRemove: true,
        NetworkMode: 'none',
      },
      WorkingDir: '/code',
    });

    console.log('🐳 Created container with ID:', container.id);

    const stream = await container.attach({
      stream: true,
      stdout: true,
      stderr: true,
    });

    let output = '';
    stream.on('data', (chunk) => {
      const chunkStr = chunk.toString('utf8');
      output += chunkStr;
      console.log('📥 Container output chunk:', chunkStr.trim());
    });

    await container.start();
    console.log('▶️ Started container');

    await container.wait();
    console.log('⏳ Container finished execution');

    // AutoRemove is true, so no need to explicitly remove container

    const cleanedOutput = output.replace(/[\x00-\x1F\x7F-\x9F]/g, '').trim();
    const isError = /error|traceback/i.test(cleanedOutput.toLowerCase());

    console.log('✅ Execution completed. Output:', cleanedOutput);

    try {
      fs.unlinkSync(filepath);
      console.log('🧹 Deleted local temp file:', filepath);
    } catch (unlinkErr) {
      console.warn('⚠️ Failed to delete temp file:', filepath, unlinkErr);
    }

    return {
      output: cleanedOutput,
      error: isError ? cleanedOutput : null,
    };

  } catch (err) {
    if (fs.existsSync(filepath)) {
      try {
        fs.unlinkSync(filepath);
        console.log('🧹 Deleted local temp file after error:', filepath);
      } catch (unlinkErr) {
        console.warn('⚠️ Failed to delete temp file after error:', filepath, unlinkErr);
      }
    }

    if (container) {
      try {
        await container.remove({ force: true });
        console.log('🗑️ Removed container after error');
      } catch (containerRemoveErr) {
        console.warn('⚠️ Failed to remove container after error:', containerRemoveErr);
      }
    }

    console.error('🔥 Docker execution failed:', err);
    throw new Error('Docker execution failed: ' + err.message);
  }
}

module.exports = runCodeInDocker;
