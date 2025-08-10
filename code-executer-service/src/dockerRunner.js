const fs = require('fs');
const path = require('path');
const { v4: uuid } = require('uuid');
const Docker = require('dockerode');
const languageConfigs = require('./languageConfigs');

const docker = new Docker({ socketPath: '/var/run/docker.sock' });

const HOST_TEMP_DIR = path.resolve(process.env.HOST_TEMP_DIR || '/tmp/online-judge-temp');
const TEMP_DIR = '/code';

// Ensure HOST_TEMP_DIR exists and writable
if (!fs.existsSync(HOST_TEMP_DIR)) {
  fs.mkdirSync(HOST_TEMP_DIR, { recursive: true });
  console.log('🛠️ Created HOST_TEMP_DIR:', HOST_TEMP_DIR);
} else {
  console.log('📁 Using existing HOST_TEMP_DIR:', HOST_TEMP_DIR);
}

// Helper: safely write input to a temp file
function writeInputFile(input, dir) {
  const inputFilename = `input-${uuid()}.txt`;
  const inputPath = path.join(dir, inputFilename);
  fs.writeFileSync(inputPath, input);
  return inputFilename;
}

async function runCodeInDocker({ code, language, input = '' }) {
  const lang = languageConfigs[language];
  if (!lang) throw new Error(`Unsupported language: ${language}`);

  const filename = `Main-${uuid()}${lang.extension}`;
  const hostCodePath = path.join(HOST_TEMP_DIR, filename);
  const containerCodePath = path.join(TEMP_DIR, filename);

  try {
    // Write code file
    fs.writeFileSync(hostCodePath, code, { encoding: 'utf8' });
  } catch (err) {
    console.error('❌ Failed to write code file:', err);
    throw err;
  }

  // Prepare input file if input is provided
  let inputFilename;
  let containerInputPath;
  if (input && input.trim() !== '') {
    inputFilename = writeInputFile(input, HOST_TEMP_DIR);
    containerInputPath = path.join(TEMP_DIR, inputFilename);
  }

  // Build command safely
  // Instead of echo | cmd, run command with input redirection if input exists
  let runCommand = lang.runCmd(filename);
  if (inputFilename) {
    runCommand += ` < ${inputFilename}`;
  }

  console.log('🛠️ Running command in container:', runCommand);

  let container;
  try {
    container = await docker.createContainer({
      Image: lang.image,
      Cmd: ['/bin/sh', '-c', runCommand],
      Tty: false,
      HostConfig: {
        Binds: [`${HOST_TEMP_DIR}:${TEMP_DIR}`],
        AutoRemove: true,
        NetworkMode: 'none',
        // Resource limits example (adjust as needed)
        Memory: 256 * 1024 * 1024, // 256 MB
        CpuShares: 256,
      },
      WorkingDir: TEMP_DIR,
    });

    console.log('🐳 Created container:', container.id);

    const stream = await container.attach({ stream: true, stdout: true, stderr: true });

    let output = '';
    stream.on('data', (chunk) => {
      const chunkStr = chunk.toString('utf8');
      output += chunkStr;
      // Comment this out if output is large and noisy
      console.log('📥 Container output chunk:', chunkStr.trim());
    });

    await container.start();
    console.log('▶️ Started container');

    // Optional timeout: stop container if it runs too long (e.g., 5 seconds)
    const timeout = 5000;
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Execution timed out')), timeout)
    );

    await Promise.race([container.wait(), timeoutPromise]);

    console.log('⏳ Container finished execution');

    // Cleanup input file
    if (inputFilename) {
      try {
        fs.unlinkSync(path.join(HOST_TEMP_DIR, inputFilename));
        console.log('🧹 Deleted input file:', inputFilename);
      } catch (e) {
        console.warn('⚠️ Failed to delete input file:', inputFilename, e);
      }
    }

    // Cleanup code file
    try {
      fs.unlinkSync(hostCodePath);
      console.log('🧹 Deleted code file:', filename);
    } catch (e) {
      console.warn('⚠️ Failed to delete code file:', filename, e);
    }

    const cleanedOutput = output.replace(/[\x00-\x1F\x7F-\x9F]/g, '').trim();
    const isError = /error|traceback|exception/i.test(cleanedOutput.toLowerCase());

    return {
      output: cleanedOutput,
      error: isError ? cleanedOutput : null,
    };
  } catch (err) {
    // Cleanup files if error occurred
    if (inputFilename) {
      try {
        fs.unlinkSync(path.join(HOST_TEMP_DIR, inputFilename));
      } catch {}
    }
    try {
      if (fs.existsSync(hostCodePath)) fs.unlinkSync(hostCodePath);
    } catch {}

    if (container) {
      try {
        await container.remove({ force: true });
      } catch {}
    }

    console.error('🔥 Docker execution failed:', err);
    throw err;
  }
}

module.exports = runCodeInDocker;
