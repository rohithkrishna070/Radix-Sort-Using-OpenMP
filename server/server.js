const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const benchmarkRoutes = require('./routes/benchmark');
const { getExecutablePath } = require('./services/runner');

const app = express();
const clientDistPath = path.resolve(__dirname, '../client/dist');

// Middleware
app.use(cors()); // Allow all origins for dev
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api', benchmarkRoutes);

// Serve the built React app from the same backend port when it has been built
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }

    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ error: 'API route not found' });
    }

    res.status(404).send(`Frontend build not found. Run "cd ../client && npm run build" before starting the server.`);
  });
}

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Global Error Handler:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  
  // Check C executables on startup
  try {
    const serialPath = getExecutablePath('radix_serial');
    console.log(`Found serial executable at: ${serialPath}`);
  } catch (e) {
    console.warn(`WARNING: radix_serial executable not found. Make sure to compile the C code. ${e.message}`);
  }

  try {
    const parallelPath = getExecutablePath('radix_parallel');
    console.log(`Found parallel executable at: ${parallelPath}`);
  } catch (e) {
    console.warn(`WARNING: radix_parallel executable not found. Make sure to compile the C code. ${e.message}`);
  }
});
