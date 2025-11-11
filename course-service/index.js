// index.js (course-service)

const express = require('express');
const cors = require('cors');
const db = require('./db.js'); // Impor koneksi database

const app = express();
const port = 3001; // Port untuk service kursus

// Gunakan CORS agar React bisa mengakses API ini
app.use(cors());

// Middleware untuk parse JSON
app.use(express.json());


// ===== API ENDPOINT UNTUK KURSUS =====

// [GET] /courses
// Tugas: Mengambil semua data dari tabel 'courses'
app.get('/courses', (req, res) => {
  const sql = "SELECT * FROM courses";
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error querying database:", err);
      res.status(500).json({ error: "Internal server error" });
      return;
    }
    
    // Jika berhasil, kirim data kursus sebagai JSON
    res.status(200).json(results);
  });
});

// [GET] /courses/:id
// Tugas: Mengambil SATU kursus berdasarkan ID-nya
// (Dibutuhkan oleh Enrollment Service)
app.get('/courses/:id', (req, res) => {
  const courseId = req.params.id; // Ambil ID dari URL
  const sql = "SELECT * FROM courses WHERE course_id = ?";
  
  db.query(sql, [courseId], (err, results) => {
    if (err) {
      console.error("Error querying database:", err);
      res.status(500).json({ error: "Internal server error" });
      return;
    }
    
    if (results.length === 0) {
      res.status(404).json({ error: "Course not found" });
      return;
    }

    // Kirim data kursus (hanya 1 baris)
    res.status(200).json(results[0]); 
  });
});

// Jalankan server
app.listen(port, () => {
  console.log(`Course Service running on http://localhost:${port}`);
});