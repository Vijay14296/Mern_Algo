const fs = require('fs');
const path = require('path');
const { v4: uuid } = require('uuid');
const Docker = require('dockerode');
const languageConfigs = require('./languageConfigs');

const docker = new Docker({ socketPath: '/var/run/docker.sock' });

const HOST_TEMP_DIR = path.resolve(process.env.HOST_TEMP_DIR || '/tmp/online-judge-temp');
const TEMP_DIR = '/code';

// Ensure HOST_TEMP_DIR exists
if (!fs.existsSync(HOST_TEMP_DIR)) {
  fs.mkdirSync(HOST_TEMP_DIR, { recursive: true });
  console.log('🛠️ Created HOST_TEMP_DIR:', HOST_TEMP_DIR);
} else {
  console.log('📁 Using existing HOST_TEMP_DIR:', HOST_TEMP_DIR);
}

// Write input file
function writeInputFile(input) {
  const inputFilename = `input-${uuid()}.txt`;
  const fullPath = path.join(HOST_TEMP_DIR, inputFilename);
  fs.writeFileSync(fullPath, input, 'utf8');
  console.log(`📝 Input file created: ${fullPath}`);
  return inputFilename;
}

// Normalize output
function normalizeOutput(str) {
  return str.replace(/[\x00-\x1F\x7F-\x9F]/g, '').replace(/\r\n/g, '\n').trim();
}

async function runCodeInDocker({ code, language, input = '', timeLimit = 5, memoryLimit = 256 }) {
  const lang = languageConfigs[language];
  if (!lang) throw new Error(`Unsupported language: ${language}`);

  const filename = language === 'java' ? 'Main.java' : `Main-${uuid()}${lang.extension}`;
  const hostCodePath = path.join(HOST_TEMP_DIR, filename);
  const containerCodePath = path.join(TEMP_DIR, filename);

  console.log(`💾 Writing code file: ${hostCodePath}`);
  fs.writeFileSync(hostCodePath, code, 'utf8');

  let inputFilename, containerInputPath;
  if (input && input.trim()) {
    inputFilename = writeInputFile(input);
    containerInputPath = path.join(TEMP_DIR, inputFilename);
  }

  let runCommand = language === 'java' ? lang.runCmd() : lang.runCmd(filename);
  if (containerInputPath) runCommand += ` < ${containerInputPath}`;

  console.log('🛠️ Running command inside container:', runCommand);

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
        Memory: memoryLimit * 1024 * 1024,
        CpuShares: 256,
      },
      WorkingDir: TEMP_DIR,
    });

    const stream = await container.attach({ stream: true, stdout: true, stderr: true });

    let stdout = '';
    let stderr = '';

    // Demux stream to capture stdout & stderr safely
    container.modem.demuxStream(stream,
      { write: chunk => { stdout += chunk.toString('utf8'); } },
      { write: chunk => { stderr += chunk.toString('utf8'); } }
    );

    await container.start();

    // Wait for container to finish OR timeout
    await Promise.race([
      container.wait(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Execution timed out')), timeLimit * 1000))
    ]);

    // Normalize outputs
    const cleanedStdout = normalizeOutput(stdout);
    const cleanedStderr = normalizeOutput(stderr);

    const isError = /error|traceback|exception|cannot find symbol/i.test(cleanedStdout + cleanedStderr);

    // Cleanup temp files
    if (fs.existsSync(hostCodePath)) fs.unlinkSync(hostCodePath);
    if (inputFilename && fs.existsSync(path.join(HOST_TEMP_DIR, inputFilename))) fs.unlinkSync(path.join(HOST_TEMP_DIR, inputFilename));

    console.log('✅ Execution finished. stdout:', cleanedStdout, 'stderr:', cleanedStderr);

    return {
      stdout: cleanedStdout,
      error: isError ? cleanedStderr || cleanedStdout : null,
    };

  } catch (err) {
    // Cleanup on error
    if (fs.existsSync(hostCodePath)) fs.unlinkSync(hostCodePath);
    if (inputFilename && fs.existsSync(path.join(HOST_TEMP_DIR, inputFilename))) fs.unlinkSync(path.join(HOST_TEMP_DIR, inputFilename));
    if (container) {
      try { await container.remove({ force: true }); } catch (_) {}
    }

    console.error('🔥 Docker execution failed:', err);
    return { stdout: '', error: err.message };
  }
}

module.exports = runCodeInDocker;
