module.exports = {
  python: {
    extension: '.py',
    runCmd: (filename) => `python3 "${filename}"`,
  },
  cpp: {
    extension: '.cpp',
    runCmd: (filename) => `g++ "${filename}" -o a.out && ./a.out`,
  },
  java: {
    extension: '.java',
    runCmd: () => 'javac Main.java && java Main',
  },
};
