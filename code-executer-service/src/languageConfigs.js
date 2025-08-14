module.exports = {
  python: {
    extension: '.py',
    image: 'python:3.10-slim',
    runCmd: (filename) => `python3 ${filename}`,
  },
  cpp: {
    extension: '.cpp',
    image: 'gcc:latest',
    runCmd: (filename) => `g++ ${filename} -o a.out && ./a.out`,
  },
  java: {
    extension: '.java',
    image: 'openjdk:20-jdk-slim',
    runCmd: () => 'javac Main.java && java Main',
  },

};
