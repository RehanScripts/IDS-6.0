const express = require('express');
const cors = require('cors');

const roadmapRoutes = require('./routes/roadmapRoutes');

const app = express();

function isTruthy(value) {
  return ['1', 'true', 'yes', 'on'].includes(String(value || '').trim().toLowerCase());
}

function isProductionEnv() {
  const envName = String(
    process.env.ENVIRONMENT || process.env.APP_ENV || process.env.NODE_ENV || ''
  )
    .trim()
    .toLowerCase();
  return envName === 'prod' || envName === 'production' || Boolean(process.env.RENDER);
}

function normalizeOrigin(value) {
  return String(value || '').trim().replace(/\/$/, '');
}

const allowedOrigins = Array.from(
  new Set(
    [
      ...(process.env.CORS_ORIGINS || '').split(','),
      ...(process.env.FRONTEND_ORIGIN || '').split(','),
      ...(process.env.FRONTEND_URL || '').split(','),
      'http://localhost:3000',
      'http://127.0.0.1:3000',
    ]
      .map((value) => normalizeOrigin(value))
      .filter(Boolean)
  )
);

const useOnrenderPattern =
  process.env.CORS_ALLOW_ONRENDER == null
    ? isProductionEnv()
    : isTruthy(process.env.CORS_ALLOW_ONRENDER);

const useVercelPattern =
  process.env.CORS_ALLOW_VERCEL == null
    ? isProductionEnv()
    : isTruthy(process.env.CORS_ALLOW_VERCEL);

const defaultPatterns = [
  ...(useOnrenderPattern ? [/^https:\/\/[a-z0-9-]+\.onrender\.com$/i] : []),
  ...(useVercelPattern ? [/^https:\/\/[a-z0-9-]+\.vercel\.app$/i] : []),
];

const customPattern = String(process.env.CORS_ORIGIN_REGEX || '').trim();
const allowedOriginPatterns = [
  ...(customPattern ? [new RegExp(customPattern, 'i')] : []),
  ...defaultPatterns,
];

function isAllowedOrigin(origin) {
  const normalized = normalizeOrigin(origin);
  if (!normalized) return true;
  if (allowedOrigins.includes(normalized)) return true;
  return allowedOriginPatterns.some((pattern) => pattern.test(normalized));
}

app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) {
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
