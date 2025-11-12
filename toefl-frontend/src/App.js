// src/App.js

import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';

import './App.css'; 

// Impor semua halaman/komponen Anda
import CourseList from './components/CourseList'; 
import RegisterPage from './components/RegisterPage';
import LoginPage from './components/LoginPage';
import MyCoursesPage from './components/MyCoursesPage';
import CourseDetailPage from './components/CourseDetailPage';
import CertificatePage from './components/CertificatePage';
import ProfilePage from './components/ProfilePage'; // <-- 1. IMPOR HALAMAN BARU

// --- Komponen Halaman Utama ---
function HomePage() {
  return (
    <>
      <header className="main-header">
        <h1>Selamat Datang di Platform TOEFL Online</h1>
        <p>Mulai perjalanan Anda untuk menguasai TOEFL bersama kami.</p>
        <a href="#courses" className="cta-button">
          Lihat Semua Kursus
        </a>
      </header>
      <div id="courses">
        <CourseList />
      </div>
    </>
  );
}
// --- Selesai komponen Halaman Utama ---


// --- Komponen Navbar (Dengan Avatar) ---
function NavigationBar() {
  const [username, setUsername] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setUsername(null);
    navigate('/');
    window.location.reload(); 
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        TOEFL Online
      </Link>
      <ul className="navbar-nav">
        <li className="nav-item">
          <a href="/#courses" className="nav-link">Courses</a>
        </li>
        
        {!username ? (
          // --- TAMPILAN JIKA BELUM LOGIN ---
          <>
            <li className="nav-item">
              <Link to="/login" className="nav-link">Login</Link>
            </li>
            <li className="nav-item">
              <Link to="/register" className="nav-link-button">Register</Link>
            </li>
          </>
        ) : (
          // --- TAMPILAN JIKA SUDAH LOGIN ---
          <>
            <li className="nav-item">
              <Link to="/my-courses" className="nav-link">My Courses</Link>
            </li>
            
            {/* ▼▼▼ 2. TAMBAHKAN LINK PROFIL DI SINI ▼▼▼ */}
            <li className="nav-item">
              <Link to="/profile" className="nav-link">Profile</Link>
            </li>
            
            <li className="nav-item nav-profile">
              <div className="avatar-circle">
                <span className="avatar-initials">{getInitials(username)}</span>
              </div>
              <span className="avatar-name">Hi, {username}</span>
            </li>
            <li className="nav-item">
              <button onClick={handleLogout} className="nav-link-button logout-button">
                Logout
              </button>
            </li>
          </>
        )}
        
      </ul>
    </nav>
  );
}
// --- Selesai komponen Navbar ---


function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <NavigationBar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/my-courses" element={<MyCoursesPage />} />
            <Route path="/course/:id" element={<CourseDetailPage />} />
            <Route path="/certificate/:id" element={<CertificatePage />} />
            
            {/* ▼▼▼ 3. TAMBAHKAN RUTE BARU DI SINI ▼▼▼ */}
            <Route path="/profile" element={<ProfilePage />} />
            
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;