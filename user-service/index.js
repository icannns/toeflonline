// index.js (user-service)

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const db = require('./db.js');
const jwt = require('jsonwebtoken'); // <-- 1. Impor paket baru

const app = express();
const port = 3002;
const saltRounds = 10;

// 2. Tentukan kunci rahasia untuk Token Anda (bisa berupa string acak apa saja)
const JWT_SECRET = 'ini_adalah_kunci_rahasia_saya_12345';

// Gunakan CORS dan JSON middleware
app.use(cors());
app.use(express.json());


// ===== API ENDPOINT UNTUK REGISTRASI (Sudah Ada) =====
app.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "Username, email, and password are required" });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const sql = "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)";
    
    db.query(sql, [username, email, hashedPassword], (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(409).json({ error: "Email or username already exists" });
        }
        console.error("Error inserting user:", err);
        return res.status(500).json({ error: "Internal server error" });
      }
      res.status(201).json({ message: "User registered successfully!", userId: result.insertId });
    });

  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


// ===== 3. [BARU] API ENDPOINT UNTUK LOGIN =====
app.post('/login', (req, res) => {
  try {
    // 1. Ambil email dan password dari request
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // 2. Cari pengguna di database berdasarkan email
    const sql = "SELECT * FROM users WHERE email = ?";
    db.query(sql, [email], async (err, results) => {
      if (err) {
        console.error("Error finding user:", err);
        return res.status(500).json({ error: "Internal server error" });
      }

      // 3. Cek apakah email ditemukan
      if (results.length === 0) {
        // (Sengaja samarkan pesan error demi keamanan)
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const user = results[0]; // Data pengguna dari database

      // 4. Bandingkan password yang diinput dengan hash di database
      const passwordMatch = await bcrypt.compare(password, user.password_hash);

      if (!passwordMatch) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // 5. Jika password cocok: Buat JSON Web Token (JWT)
      const token = jwt.sign(
        { 
          userId: user.user_id, 
          username: user.username 
        },
        JWT_SECRET,
        { expiresIn: '1h' } // Token akan hangus dalam 1 jam
      );

      // 6. Kirim token dan pesan sukses ke frontend
      res.status(200).json({
        message: "Login successful!",
        token: token,
        username: user.username
      });
    });

  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


// Jalankan server
app.listen(port, () => {
  console.log(`User Service running on http://localhost:${port}`);
});