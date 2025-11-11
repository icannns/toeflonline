// index.js (enrollment-service)

const express = require('express');
const cors = require('cors');
const db = require('./db.js');
const jwt = require('jsonwebtoken');
const axios = require('axios'); // <-- 1. IMPOR AXIOS

const app = express();
const port = 3003;
const JWT_SECRET = 'ini_adalah_kunci_rahasia_saya_12345';
const COURSE_SERVICE_URL = 'http://localhost:3001'; // <-- 2. URL Layanan Kursus

app.use(cors());
app.use(express.json());

// ===== MIDDLEWARE OTENTIKASI (Sudah Ada) =====
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    return res.status(401).json({ error: "Token required" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Token is not valid" });
    }
    req.user = user;
    next();
  });
}


// ===== API ENDPOINT ENROLL (Sudah Ada) =====
app.post('/enroll', authenticateToken, (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user.userId;

    if (!courseId) {
      return res.status(400).json({ error: "Course ID is required" });
    }

    const sql = "INSERT INTO enrollments (user_id, course_id, status) VALUES (?, ?, 'not_started')";
    
    db.query(sql, [userId, courseId], (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(409).json({ error: "You are already enrolled in this course" });
        }
        console.error("Error inserting enrollment:", err);
        return res.status(500).json({ error: "Internal server error" });
      }
      res.status(201).json({ message: "Enrolled successfully!" });
    });

  } catch (error) {
    console.error("Error during enrollment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


// ===== 3. [BARU] API UNTUK "KURSUS SAYA" (Service-to-Service) =====
//
// [GET] /my-courses
// Endpoint ini dilindungi dan akan memanggil layanan lain.
//
app.get('/my-courses', authenticateToken, async (req, res) => {
  try {
    // 1. Dapatkan ID pengguna dari token
    const userId = req.user.userId;

    // 2. Cari semua course_id yang diambil oleh pengguna ini dari tabel 'enrollments'
    const sql = "SELECT course_id FROM enrollments WHERE user_id = ?";
    
    db.query(sql, [userId], async (err, results) => {
      if (err) {
        console.error("Error fetching enrollments:", err);
        return res.status(500).json({ error: "Internal server error" });
      }

      if (results.length === 0) {
        // Jika pengguna belum mendaftar kursus apa pun
        return res.status(200).json([]); // Kirim array kosong
      }

      // 3. Kita punya daftar ID kursus (misal: [1, 3])
      const courseIds = results.map(row => row.course_id);
      
      // 4. [KOMUNIKASI ANTAR LAYANAN DIMULAI]
      // Siapkan array untuk menampung detail kursus
      let courseDetailsList = [];

      // Loop untuk setiap ID kursus dan panggil 'course-service'
      for (const id of courseIds) {
        try {
          // Panggil API 'course-service'
          const response = await axios.get(`${COURSE_SERVICE_URL}/courses/${id}`);
          courseDetailsList.push(response.data);
        } catch (error) {
          console.error(`Error fetching details for course ${id}:`, error.message);
          // Lewati jika satu kursus gagal (misal: datanya terhapus di course-service)
        }
      }
      
      // 5. Kirim gabungan data (yang sudah ada detailnya) ke frontend
      res.status(200).json(courseDetailsList);
    });

  } catch (error) {
    console.error("Error fetching my courses:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


// Jalankan server
app.listen(port, () => {
  console.log(`Enrollment Service running on http://localhost:${port}`);
});