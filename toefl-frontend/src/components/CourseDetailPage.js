// src/components/CourseDetailPage.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom'; // Impor Link
import './CourseDetailPage.css';
// Kita tidak lagi mengimpor Quiz.js di sini

function CourseDetailPage() {
  const [course, setCourse] = useState(null); // State untuk detail kursus
  const [quizPackets, setQuizPackets] = useState([]); // State BARU untuk daftar paket
  const [loading, setLoading] = useState(true);
  
  const { id } = useParams(); // Ini adalah courseId
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Please log in to view this course.");
      navigate('/login');
      return;
    }

    // Fungsi untuk mengambil detail kursus DAN paket soalnya
    const fetchCourseData = async () => {
      setLoading(true);
      try {
        // 1. Ambil detail kursus (Sama seperti sebelumnya)
        const courseRes = await axios.get(`http://localhost:8000/api/courses/${id}`);
        setCourse(courseRes.data);

        // 2. Ambil daftar paket soal (Endpoint BARU)
        const quizRes = await axios.get(`http://localhost:8000/api/assessment/quizzes/by-course/${id}`);
        setQuizPackets(quizRes.data);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching course data:", err);
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [id, navigate]);

  if (loading) {
    return <div className="loading-message">Loading course...</div>;
  }
  if (!course) {
    return <div className="loading-message">Course not found.</div>;
  }

  // Tampilkan halaman detail kursus
  return (
    <div className="course-detail-container">
      {/* Header Halaman (Info Kursus) */}
      <header className="course-detail-header">
        <span className="course-category">{course.category}</span>
        <h2>{course.title}</h2>
        <p>{course.description}</p>
      </header>

      {/* Konten Halaman (Daftar Paket Soal) */}
      <div className="course-content">
        <h3>Available Quiz Packets</h3>
        
        {/* Cek apakah ada paket soal */}
        {quizPackets.length === 0 ? (
          <p className="loading-message">No quiz packets available for this course yet.</p>
        ) : (
          <div className="quiz-packet-list">
            {/* Loop dan tampilkan setiap paket soal */}
            {quizPackets.map(packet => (
              <Link 
                to={`/quiz/${packet.quiz_id}`} 
                key={packet.quiz_id} 
                className="quiz-packet-link"
              >
                {packet.title}
                <span>Start Quiz &rarr;</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CourseDetailPage;