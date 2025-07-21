// backend/services/codeExecutorService.js
const axios = require('axios');

const runCode = async ({ code, language, input }) => {
  try {
    const response = await axios.post('http://localhost:8002/run', {
      code,
      language,
      input,
    });
    return response.data;
  } catch (error) {
    console.error('Executor Service Error:', error.message);
    throw new Error('Failed to execute code.');
  }
};

module.exports = { runCode };
