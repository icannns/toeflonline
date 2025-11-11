// src/components/CourseList.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CourseList.css';
import { useNavigate } from 'react-router-dom'; // Kita akan butuh ini

function CourseList() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Inisialisasi navigasi

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        // ▼▼▼ PERUBAHAN DI SINI ▼▼▼
        // Menggunakan API Gateway (port 8000) dan path baru
        const response = await axios.get('http://localhost:8000/api/courses');
        
        setCourses(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Gagal mengambil data kursus:', error);
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const handleEnroll = async (courseId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You must be logged in to enroll in a course.');
      navigate('/login'); // Arahkan ke login jika belum
      return;
    }

    try {
      // ▼▼▼ PERUBAHAN DI SINI ▼▼▼
      // Menggunakan API Gateway (port 8000) dan path baru
      const response = await axios.post(
        'http://localhost:8000/api/enrollments/enroll', // URL Endpoint Gateway
        { courseId: courseId },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      alert(response.data.message);

    } catch (error) {
      if (error.response) {
        alert(`Error: ${error.response.data.error}`);
      } else {
        alert('Enrollment failed. Please try again.');
      }
      console.error('Enrollment error:', error);
    }
  };

  if (loading) {
    return <div className="loading-message">Loading courses...</div>;
  }

  return (
    <div className="course-list-container">
      <h2>Available Courses</h2>
      <div className="course-grid">
        {courses.map(course => (
          <div key={course.course_id} className="course-card">
            <span className="course-category">{course.category}</span>
            <h3>{course.title}</h3>
            <p>{course.description}</p>
            <button 
              className="enroll-button" 
              onClick={() => handleEnroll(course.course_id)}
            >
              Enroll Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CourseList;