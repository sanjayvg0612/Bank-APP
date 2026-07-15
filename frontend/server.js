const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
// API target can be provided via environment variable, otherwise default to localhost:5000
const API_TARGET = process.env.API_TARGET || 'http://localhost:5000';

// Proxy /api to the backend
app.use('/api', createProxyMiddleware({
  target: API_TARGET,
  changeOrigin: true,
  pathRewrite: { '^/api': '/api' },
}));

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname)));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Frontend server listening on port ${PORT}, proxying /api -> ${API_TARGET}`);
});
