// src/components/ProfilePage.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProfilePage.css'; // Kita akan buat file CSS-nya

function ProfilePage() {
  // State untuk form
  const [newUsername, setNewUsername] = useState('');
  
  // State untuk pesan
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Ambil username saat ini dari localStorage untuk ditampilkan
  const currentUsername = localStorage.getItem('username') || 'User';

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsSuccess(false);

    // 1. Ambil token dari localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      setMessage('You must be logged in to update your profile.');
      return;
    }

    try {
      // 2. Panggil API Gateway (user-service)
      const response = await axios.put(
        'http://localhost:8000/api/users/profile', // Endpoint PUT baru
        { newUsername: newUsername }, // Data body
        {
          headers: {
            'Authorization': `Bearer ${token}` // Token otentikasi
          }
        }
      );

      // 3. Jika sukses
      setMessage(response.data.message);
      setIsSuccess(true);
      
      // 4. Update username di localStorage
      localStorage.setItem('username', response.data.newUsername);
      
      // Refresh halaman setelah 1 detik untuk update Navbar
      setTimeout(() => {
        window.location.reload(); 
      }, 1000);

    } catch (error) {
      // 5. Jika gagal
      setIsSuccess(false);
      if (error.response) {
        setMessage(error.response.data.error); // Misal: "Username already taken"
      } else {
        setMessage('Update failed. Server is not responding.');
      }
      console.error('Profile update error:', error);
    }
  };

  return (
    <div className="profile-container">
      <form className="profile-form" onSubmit={handleUpdateProfile}>
        <h2>Update Profile</h2>
        
        {/* Tampilkan username saat ini */}
        <p className="current-username">
          Current Username: <strong>{currentUsername}</strong>
        </p>

        <div className="form-group">
          <label htmlFor="newUsername">New Username</label>
          <input
            type="text"
            id="newUsername"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            required
            placeholder="Enter your new username"
          />
        </div>
        
        <button type="submit" className="update-button">Update Username</button>
        
        {/* Tampilkan pesan sukses (hijau) atau error (merah) */}
        {message && <p className={`message ${isSuccess ? 'success' : ''}`}>{message}</p>}
      </form>
    </div>
  );
}

export default ProfilePage;