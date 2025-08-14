const express = require('express');
const dotenv = require('dotenv');
const runCodeInDocker = require('./dockerRunner');

dotenv.config();
const app = express();
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.send('🛠️ Code Executor Microservice is running!');
});

// Run code endpoint
app.post('/run', async (req, res) => {
  const { code, language, input = '', timeLimit = 5, memoryLimit = 256 } = req.body;

  // 🧼 Input validation
  if (!code || !language) {
    return res.status(400).json({
      error: 'Missing required fields: code and language are required.',
    });
  }

  console.log('🔹 Received request:', { language, inputSnippet: input.slice(0, 50) + '...' });

  try {
    const result = await runCodeInDocker({
      code,
      language,
      input,
      timeLimit,
      memoryLimit,
    });

    console.log('🔹 Execution result:', { stdout: result.stdout, error: result.error });

    res.json({
      stdout: result.stdout || '',
      stderr: result.error || '',
    });
  } catch (err) {
    console.error('🔥 Docker execution failed:', err);

    res.status(500).json({
      stdout: '',
      stderr: err.message || 'Unknown error',
    });
  }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`🚀 Code Executor running on port ${PORT}`));
