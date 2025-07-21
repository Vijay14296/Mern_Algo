const express = require('express');
const dotenv = require('dotenv');
const runCodeInDocker = require('./dockerRunner');

dotenv.config();
const app = express();
app.use(express.json());

app.post('/run', async (req, res) => {
  const { code, language, input } = req.body;

  // 🧼 Input validation
  if (!code || !language) {
    return res.status(400).json({
      error: 'Missing required fields: code and language are required.',
    });
  }

  try {
    const result = await runCodeInDocker({ code, language, input });
    
    res.json({
      output: result.output || '',
      error: result.error || null,
    });
  } catch (err) {
    console.error('🔥 Docker execution failed:', err);

    res.status(500).json({
      error: 'Code execution failed',
      details: err.message || err.toString(),
    });
  }
});

const PORT = process.env.PORT || 8002;
app.listen(PORT, () => console.log(`🚀 Code Executor running on port ${PORT}`));
