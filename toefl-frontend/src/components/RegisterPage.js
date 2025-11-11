// src/components/RegisterPage.js

import React, { useState } from 'react';
import axios from 'axios';
import './RegisterPage.css';

function RegisterPage() {
  // State untuk menyimpan data form
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // State untuk pesan sukses atau error
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false); // State untuk style pesan

  // Fungsi yang dipanggil saat form di-submit
  const handleRegister = async (e) => {
    e.preventDefault(); // Mencegah refresh halaman
    setMessage(''); // Bersihkan pesan lama
    setIsSuccess(false); // Reset style

    try {
      // ▼▼▼ PERUBAHAN DI SINI ▼▼▼
      // Panggil API Gateway (port 8000)
      const response = await axios.post('http://localhost:8000/api/users/register', {
        username: username,
        email: email,
        password: password
      });

      // Jika sukses
      setMessage(response.data.message);
      setIsSuccess(true); // Set pesan ke 'sukses' (hijau)
      // Kosongkan form
      setUsername('');
      setEmail('');
      setPassword('');

    } catch (error) {
      // Jika error
      setIsSuccess(false); // Set pesan ke 'error' (merah)
      if (error.response) {
        setMessage(error.response.data.error);
      } else {
        setMessage('Registration failed. Server is not responding.');
      }
      console.error('Registration error:', error);
    }
  };

  return (
    <div className="register-container">
      <form className="register-form" onSubmit={handleRegister}>
        <h2>Create Account</h2>
        
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        
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
        
        <button type="submit" className="register-button">Register</button>
        
        {/* Tampilkan pesan sukses (hijau) atau error (merah) */}
        {message && <p className={`message ${isSuccess ? 'success' : ''}`}>{message}</p>}
      </form>
    </div>
  );
}

export default RegisterPage;