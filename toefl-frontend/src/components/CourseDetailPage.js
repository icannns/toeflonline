// src/components/CourseDetailPage.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './CourseDetailPage.css';
import Quiz from './Quiz'; // Impor komponen Kuis

function CourseDetailPage() {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Please log in to view this course.");
      navigate('/login');
      return;
    }

    const fetchCourseDetails = async () => {
      try {
        setLoading(true);
        
        // ▼▼▼ PERUBAHAN DI SINI ▼▼▼
        // Panggil API Gateway (port 8000)
        const response = await axios.get(`http://localhost:8000/api/courses/${id}`);
        
        setCourse(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching course details:", err);
        setError("Failed to load course details. Server may be down.");
        setLoading(false);
      }
    };
    fetchCourseDetails();
  }, [id, navigate]);

  if (loading) {
    return <div className="loading-message">Loading course...</div>;
  }
  if (error) {
    return <div className="loading-message">{error}</div>;
  }
  if (!course) {
    return <div className="loading-message">Course not found.</div>;
  }

  // Tampilkan halaman kursus
  return (
    <div className="course-detail-container">
      <header className="course-detail-header">
        <span className="course-category">{course.category}</span>
        <h2>{course.title}</h2>
        <p>{course.description}</p>
      </header>

      {/* Tampilkan komponen Kuis */}
      <div className="course-content">
        <Quiz courseId={id} courseTitle={course.title} />
      </div>
    </div>
  );
}

export default CourseDetailPage;