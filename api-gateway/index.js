// index.js (api-gateway)

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

// Impor paket Swagger
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
// Pastikan file 'swagger.yaml' ada di folder yang sama
const swaggerDocument = YAML.load('./swagger.yaml'); 

const app = express();
const port = 8000; // Ini adalah Pintu Gerbang Utama Anda

// Izinkan CORS (Sangat penting agar browser React bisa mengakses port 8000)
app.use(cors());

// ▼▼▼ Endpoint untuk Dokumentasi Swagger ▼▼▼
// (Harus diletakkan sebelum rute proxy)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


// ---- Konfigurasi Rute Proxy ----

// 1. Proxy untuk User Service (Port 3002)
app.use('/api/users', createProxyMiddleware({
  target: 'http://localhost:3002', // Alamat user-service
  changeOrigin: true,
  pathRewrite: {
    '^/api/users': '', // /api/users/login -> /login
  },
}));

// 2. Proxy untuk Course Service (Port 3001)
app.use('/api/courses', createProxyMiddleware({
  target: 'http://localhost:3001/courses', // Pindahkan /courses ke target
  changeOrigin: true,
  pathRewrite: {
    '^/api/courses': '', // /api/courses -> /courses
                          // /api/courses/2 -> /courses/2
  },
}));

// 3. Proxy untuk Enrollment Service (Port 3003)
app.use('/api/enrollments', createProxyMiddleware({
  target: 'http://localhost:3003', // Alamat enrollment-service
  changeOrigin: true,
  pathRewrite: {
    '^/api/enrollments': '', // /api/enrollments/enroll -> /enroll
  },
}));

// 4. Proxy untuk Assessment Service (Port 3004)
app.use('/api/assessment', createProxyMiddleware({
  target: 'http://localhost:3004', // Alamat assessment-service
  changeOrigin: true,
  pathRewrite: {
    '^/api/assessment': '', // /api/assessment/quiz/101 -> /quiz/101
  },
}));

// Jalankan server Gateway
app.listen(port, () => {
  console.log(`API Gateway running on http://localhost:${port}`);
  console.log(`Swagger Docs available at http://localhost:${port}/api-docs`);
});