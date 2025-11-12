// index.js (enrollment-service)

const express = require('express');
const cors = require('cors');
const db = require('./db.js');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const app = express();
const port = 3003;
const JWT_SECRET = 'ini_adalah_kunci_rahasia_saya_12345';
const COURSE_SERVICE_URL = 'http://localhost:3001';

app.use(cors());
app.use(express.json());

// ===== MIDDLEWARE OTENTIKASI (Sudah Ada) =====
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.status(401).json({ error: "Token required" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Token is not valid" });
    req.user = user;
    next();
  });
}

// ===== API ENDPOINT ENROLL (Sudah Ada) =====
app.post('/enroll', authenticateToken, (req, res) => {
  // ... (Kode /enroll Anda yang sudah ada)
  try {
    const { courseId } = req.body;
    const userId = req.user.userId;
    if (!courseId) return res.status(400).json({ error: "Course ID is required" });
    const sql = "INSERT INTO enrollments (user_id, course_id, status) VALUES (?, ?, 'not_started')";
    db.query(sql, [userId, courseId], (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(409).json({ error: "You are already enrolled in this course" });
        }
        return res.status(500).json({ error: "Internal server error" });
      }
      res.status(201).json({ message: "Enrolled successfully!" });
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// ===== API UNTUK "KURSUS SAYA" (Sudah Ada) =====
app.get('/my-courses', authenticateToken, async (req, res) => {
  // ... (Kode /my-courses Anda yang sudah ada)
  try {
    const userId = req.user.userId;
    const sql = "SELECT course_id FROM enrollments WHERE user_id = ?";
    db.query(sql, [userId], async (err, results) => {
      if (err) return res.status(500).json({ error: "Internal server error" });
      if (results.length === 0) return res.status(200).json([]);
      const courseIds = results.map(row => row.course_id);
      let courseDetailsList = [];
      for (const id of courseIds) {
        try {
          const response = await axios.get(`${COURSE_SERVICE_URL}/courses/${id}`);
          courseDetailsList.push(response.data);
        } catch (error) {
          // Lewati jika gagal
        }
      }
      res.status(200).json(courseDetailsList);
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// ===== [BARU] API ENDPOINT UN-ENROLL (DELETE) =====
app.delete('/course/:courseId', authenticateToken, (req, res) => {
  try {
    // 1. Ambil ID pengguna dari token
    const userId = req.user.userId;
    // 2. Ambil ID kursus dari URL
    const { courseId } = req.params;

    // 3. Hapus data dari database
    const sql = "DELETE FROM enrollments WHERE user_id = ? AND course_id = ?";
    
    db.query(sql, [userId, courseId], (err, result) => {
      if (err) {
        console.error("Error un-enrolling:", err);
        return res.status(500).json({ error: "Internal server error" });
      }
      
      // Cek apakah ada baris yang benar-benar dihapus
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Enrollment not found" });
      }

      // 4. Kirim respons sukses
      res.status(200).json({ message: "Un-enrolled successfully!" });
    });

  } catch (error) {
    console.error("Error during un-enrollment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


// Jalankan server
app.listen(port, () => {
  console.log(`Enrollment Service running on http://localhost:${port}`);
});