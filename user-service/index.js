// index.js (user-service)

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const db = require('./db.js');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3002;
const saltRounds = 10;
const JWT_SECRET = 'ini_adalah_kunci_rahasia_saya_12345';

app.use(cors());
app.use(express.json());

// ===== [BARU] MIDDLEWARE UNTUK OTENTIKASI =====
// Kita perlukan ini untuk melindungi endpoint profile
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.status(401).json({ error: "Token required" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Token is not valid" });
    req.user = user; // Menyimpan data user (userId, username) ke request
    next();
  });
}

// ===== API ENDPOINT REGISTRASI (Sudah Ada) =====
app.post('/register', async (req, res) => {
  // ... (Kode /register Anda yang sudah ada)
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
        return res.status(500).json({ error: "Internal server error" });
      }
      res.status(201).json({ message: "User registered successfully!", userId: result.insertId });
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// ===== API ENDPOINT LOGIN (Sudah Ada) =====
app.post('/login', (req, res) => {
  // ... (Kode /login Anda yang sudah ada)
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    const sql = "SELECT * FROM users WHERE email = ?";
    db.query(sql, [email], async (err, results) => {
      if (err) return res.status(500).json({ error: "Internal server error" });
      if (results.length === 0) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
      const user = results[0];
      const passwordMatch = await bcrypt.compare(password, user.password_hash);
      if (!passwordMatch) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
      const token = jwt.sign(
        { userId: user.user_id, username: user.username },
        JWT_SECRET,
        { expiresIn: '1h' }
      );
      res.status(200).json({
        message: "Login successful!",
        token: token,
        username: user.username
      });
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// ===== [BARU] API ENDPOINT UPDATE PROFILE (PUT) =====
app.put('/profile', authenticateToken, (req, res) => {
  try {
    // 1. Ambil ID pengguna dari token (yang sudah disisipkan middleware)
    const userId = req.user.userId;
    
    // 2. Ambil username baru dari body request
    const { newUsername } = req.body;

    if (!newUsername) {
      return res.status(400).json({ error: "New username is required" });
    }

    // 3. Update database
    const sql = "UPDATE users SET username = ? WHERE user_id = ?";
    
    db.query(sql, [newUsername, userId], (err, result) => {
      if (err) {
         // Cek jika error karena username baru sudah dipakai orang lain
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(409).json({ error: "Username already taken" });
        }
        console.error("Error updating profile:", err);
        return res.status(500).json({ error: "Internal server error" });
      }

      // 4. Kirim respons sukses
      res.status(200).json({ 
        message: "Profile updated successfully!",
        newUsername: newUsername 
      });
    });

  } catch (error) {
    console.error("Error during profile update:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Jalankan server
app.listen(port, () => {
  console.log(`User Service running on http://localhost:${port}`);
});