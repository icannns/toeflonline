// src/components/CertificatePage.js

import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CertificatePage.css';

function CertificatePage() {
  const [username, setUsername] = useState('');
  const [courseTitle, setCourseTitle] = useState('');
  const [score, setScore] = useState(null); // <-- 1. STATE BARU UNTUK SKOR
  const [loading, setLoading] = useState(true);

  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Cek login
    const token = localStorage.getItem('token');
    const storedUsername = localStorage.getItem('username');
    if (!token || !storedUsername) {
      alert("You are not logged in.");
      navigate('/login');
      return;
    }
    setUsername(storedUsername);

    // 2. Ambil judul kursus DAN SKOR dari state
    //    Ini adalah cara paling efisien
    if (location.state && location.state.courseTitle && location.state.userScore !== undefined) {
      setCourseTitle(location.state.courseTitle);
      setScore(location.state.userScore); // <-- 2. AMBIL SKOR DARI STATE
      setLoading(false);
    } else {
      // 3. Fallback jika pengguna merefresh/membuka URL langsung
      //    (Kita tidak bisa mendapatkan skor, jadi kita redirect)
      alert("Cannot access certificate directly. Please complete the quiz first.");
      navigate(`/course/${id}`); // Kirim kembali ke halaman kuis
    }
  }, [id, location.state, navigate]);

  if (loading) {
    return <div className="loading-message">Generating certificate...</div>;
  }

  return (
    <div className="certificate-container">
      <div className="certificate-border">
        <div className="certificate-content">
          <span className="certificate-sub">Certificate of Completion</span>
          <h1 className="certificate-title">TOEFL ONLINE</h1>
          <span className="certificate-text">This certificate is proudly presented to</span>
          <h2 className="certificate-name">{username}</h2>
          <span className="certificate-text">For the successful completion of the course</span>
          <h3 className="certificate-course">{courseTitle}</h3>
          
          {/* ▼▼▼ 3. TAMPILKAN SKOR DI SINI ▼▼▼ */}
          <span className="certificate-text">With a final score of</span>
          <h2 className="certificate-score">{score}%</h2>
          
          <span className="certificate-date">
            Issued on: {new Date().toLocaleDateString('en-US')}
          </span>
        </div>
      </div>
    </div>
  );
}

export default CertificatePage;