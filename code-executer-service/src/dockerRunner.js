const fs = require('fs');
const path = require('path');
const { v4: uuid } = require('uuid');
const { exec } = require('child_process');
const languageConfigs = require('./languageConfigs');

const HOST_TEMP_DIR = path.resolve(process.env.HOST_TEMP_DIR || '/tmp/online-judge-temp');

// Ensure HOST_TEMP_DIR exists
if (!fs.existsSync(HOST_TEMP_DIR)) {
  fs.mkdirSync(HOST_TEMP_DIR, { recursive: true });
  console.log('🛠️ Created HOST_TEMP_DIR:', HOST_TEMP_DIR);
} else {
  console.log('📁 Using existing HOST_TEMP_DIR:', HOST_TEMP_DIR);
}

// Normalize output
function normalizeOutput(str) {
  return str.replace(/[\x00-\x1F\x7F-\x9F]/g, '').replace(/\r\n/g, '\n').trim();
}

// Write input file
function writeInputFile(input) {
  const inputFilename = `input-${uuid()}.txt`;
  const fullPath = path.join(HOST_TEMP_DIR, inputFilename);
  fs.writeFileSync(fullPath, input, 'utf8');
  console.log(`📝 Input file created: ${fullPath}`);
  return fullPath;
}

async function runCode({ code, language, input = '', timeLimit = 5 }) {
  const lang = languageConfigs[language];
  if (!lang) throw new Error(`Unsupported language: ${language}`);

  const filename = language === 'java' ? 'Main.java' : `Main-${uuid()}${lang.extension}`;
  const filePath = path.join(HOST_TEMP_DIR, filename);

  fs.writeFileSync(filePath, code, 'utf8');
  console.log(`💾 Code written to ${filePath}`);

  let inputPath;
  if (input && input.trim()) {
    inputPath = writeInputFile(input);
  }

  let runCmd = language === 'java' ? lang.runCmd() : lang.runCmd(filename);
  if (inputPath) runCmd += ` < "${inputPath}"`;

  console.log('🛠️ Running command:', runCmd);

  return new Promise((resolve) => {
    const proc = exec(runCmd, { cwd: HOST_TEMP_DIR, timeout: timeLimit * 1000 }, (err, stdout, stderr) => {
      const cleanedStdout = normalizeOutput(stdout);
      const cleanedStderr = normalizeOutput(stderr);

      const isError = /error|traceback|exception|cannot find symbol/i.test(cleanedStdout + cleanedStderr);

      // Cleanup files
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      if (inputPath && fs.existsSync(inputPath)) fs.unlinkSync(inputPath);

      console.log('✅ Execution finished. stdout:', cleanedStdout, 'stderr:', cleanedStderr);

      resolve({
        stdout: cleanedStdout,
        error: isError ? cleanedStderr || cleanedStdout : null,
      });
    });
  });
}

module.exports = runCode;
