const express = require('express');
const cors = require('cors');

const roadmapRoutes = require('./routes/roadmapRoutes');

const app = express();

const allowedOrigins = Array.from(
  new Set(
    [
      ...(process.env.CORS_ORIGINS || '').split(','),
      ...(process.env.FRONTEND_ORIGIN || '').split(','),
      'http://localhost:3000',
      'http://127.0.0.1:3000',
    ]
      .map((value) => value.trim())
      .filter(Boolean)
  )
);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error(`Origin not allowed by CORS: ${origin}`));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/roadmap', roadmapRoutes);

app.use((err, _req, res, _next) => {
  console.error('Unhandled API error:', err);
  res.status(err.statusCode || 500).json({
    error: err.message || 'Internal server error',
  });
});

module.exports = app;
