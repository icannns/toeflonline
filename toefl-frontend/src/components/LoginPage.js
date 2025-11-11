// src/components/LoginPage.js

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

function LoginPage() {
  // State untuk form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false); // State untuk style pesan
  
  const navigate = useNavigate(); // Inisialisasi hook navigasi

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsSuccess(false);

    try {
      // ▼▼▼ PERUBAHAN DI SINI ▼▼▼
      // Panggil API Gateway (port 8000)
      const response = await axios.post('http://localhost:8000/api/users/login', {
        email: email,
        password: password
      });

      // --- JIKA BERHASIL ---
      // 1. Tampilkan pesan sukses
      setMessage(response.data.message);
      setIsSuccess(true); // Set pesan ke 'sukses' (hijau)
      
      // 2. Simpan "token" dan "username" ke localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('username', response.data.username);

      // 3. Arahkan pengguna ke Halaman Utama ("/") setelah 1 detik
      setTimeout(() => {
        navigate('/');
        window.location.reload(); // Reload untuk update Navbar
      }, 1000);

    } catch (error) {
      // --- JIKA GAGAL ---
      setIsSuccess(false); // Set pesan ke 'error' (merah)
      if (error.response) {
        setMessage(error.response.data.error);
      } else {
        setMessage('Login failed. Server is not responding.');
      }
      console.error('Login error:', error);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleLogin}>
        <h2>Login to Your Account</h2>
        
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <button type="submit" className="login-button">Login</button>
        
        {/* Tampilkan pesan sukses (hijau) atau error (merah) */}
        {message && (
          <p className={`message ${isSuccess ? 'success' : ''}`}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
}

export default LoginPage;