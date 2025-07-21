const runCodeInDocker = require('./dockerRunner');

(async () => {
  const result = await runCodeInDocker({
    language: 'python',
    code: `print("Hello World")`,
    input: ''

  });

  console.log("RESULT:", result);
})();
