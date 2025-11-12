// index.js (api-gateway)

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

// ▼▼▼ IMPOR PAKET BARU ▼▼▼
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml'); // Membaca file

const app = express();
const port = 8000;

app.use(cors());

// ▼▼▼ TAMBAHKAN ENDPOINT BARU UNTUK DOKUMENTASI ▼▼▼
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


// ---- Konfigurasi Rute Proxy (Tetap Sama) ----

// 1. Proxy untuk User Service (Port 3002)
app.use('/api/users', createProxyMiddleware({
  target: 'http://localhost:3002',
  changeOrigin: true,
  pathRewrite: {
    '^/api/users': '',
  },
}));

// 2. Proxy untuk Course Service (Port 3001)
app.use('/api/courses', createProxyMiddleware({
  target: 'http://localhost:3001/courses',
  changeOrigin: true,
  pathRewrite: {
    '^/api/courses': '',
  },
}));

// 3. Proxy untuk Enrollment Service (Port 3003)
app.use('/api/enrollments', createProxyMiddleware({
  target: 'http://localhost:3003',
  changeOrigin: true,
  pathRewrite: {
    '^/api/enrollments': '',
  },
}));

// 4. Proxy untuk Assessment Service (Port 3004)
app.use('/api/assessment', createProxyMiddleware({
  target: 'http://localhost:3004',
  changeOrigin: true,
  pathRewrite: {
    '^/api/assessment': '',
  },
}));

// Jalankan server Gateway
app.listen(port, () => {
  console.log(`API Gateway running on http://localhost:${port}`);
  
  // ▼▼▼ PESAN BARU ▼▼▼
  console.log(`Swagger Docs available at http://localhost:${port}/api-docs`);
});