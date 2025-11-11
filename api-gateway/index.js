// index.js (api-gateway)

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
const port = 8000; // Ini adalah Pintu Gerbang Utama Anda

// Izinkan CORS
app.use(cors());

// ---- Konfigurasi Rute Proxy ----
// Kita akan membuat aturan:
// Permintaan ke /api/users/... akan diteruskan ke user-service (3002)
// Permintaan ke /api/courses/... akan diteruskan ke course-service (3001)
// Permintaan ke /api/enrollments/... akan diteruskan ke enrollment-service (3003)

// 1. Proxy untuk User Service (Login & Register)
app.use('/api/users', createProxyMiddleware({
  target: 'http://localhost:3002', // Alamat user-service
  changeOrigin: true,
  pathRewrite: {
    '^/api/users': '', // Hapus /api/users dari URL sebelum meneruskan
    // Contoh: /api/users/login -> /login
  },
}));

// 2. Proxy untuk Course Service (Daftar Kursus)
app.use('/api/courses', createProxyMiddleware({
  target: 'http://localhost:3001', // Alamat course-service
  changeOrigin: true,
  pathRewrite: {
    '^/api/courses': '', // Hapus /api/courses
    // Contoh: /api/courses/1 -> /courses/1
  },
}));

// 3. Proxy untuk Enrollment Service (Enroll & My Courses)
app.use('/api/enrollments', createProxyMiddleware({
  target: 'http://localhost:3003', // Alamat enrollment-service
  changeOrigin: true,
  pathRewrite: {
    '^/api/enrollments': '', // Hapus /api/enrollments
    // Contoh: /api/enrollments/enroll -> /enroll
  },
}));

// Jalankan server Gateway
app.listen(port, () => {
  console.log(`API Gateway running on http://localhost:${port}`);
});