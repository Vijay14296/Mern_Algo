module.exports = {
  python: {
    extension: '.py',
    image: 'python:3.10-slim',
    runCmd: (filename) => `python ${filename}`
  },
  cpp: {
    extension: '.cpp',
    image: 'gcc:latest',
    runCmd: (filename) => `g++ ${filename} -o main && ./main`
  },
  c: {
    extension: '.c',
    image: 'gcc:latest',
    runCmd: (filename) => `gcc ${filename} -o main && ./main`
  },
  java: {
    extension: '.java',
    image: 'openjdk:17',
    runCmd: (filename) => {
      const className = filename.replace('.java', '');
      return `javac ${filename} && java ${className}`;
    }
  },
  javascript: {
    extension: '.js',
    image: 'node:18',
    runCmd: (filename) => `node ${filename}`
  }
};
