// src/components/MyCoursesPage.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './MyCoursesPage.css';

function MyCoursesPage() {
  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fungsi untuk mengambil data kursus (dibuat terpisah agar bisa dipanggil ulang)
  const fetchMyCourses = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Please log in to see your courses.");
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/api/enrollments/my-courses', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setMyCourses(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching my courses:', error);
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        alert('Your session has expired. Please log in again.');
        navigate('/login');
      }
      setLoading(false);
    }
  };

  // Panggil fungsi saat komponen dimuat
  useEffect(() => {
    fetchMyCourses();
  }, [navigate]); // Dependensi navigate dihapus dari sini

  // ▼▼▼ FUNGSI BARU UNTUK UN-ENROLL ▼▼▼
  const handleUnenroll = async (courseId) => {
    // Konfirmasi dulu
    if (!window.confirm("Are you sure you want to un-enroll from this course?")) {
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      alert("Your session has expired. Please log in again.");
      navigate('/login');
      return;
    }

    try {
      // Panggil API Gateway (DELETE)
      const response = await axios.delete(
        `http://localhost:8000/api/enrollments/course/${courseId}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      alert(response.data.message); // "Un-enrolled successfully!"
      
      // Update tampilan frontend: Hapus card dari state
      setMyCourses(currentCourses => 
        currentCourses.filter(course => course.course_id !== courseId)
      );

    } catch (error) {
      console.error('Error un-enrolling:', error);
      if (error.response) {
        alert(`Error: ${error.response.data.error}`);
      } else {
        alert('Un-enrollment failed. Please try again.');
      }
    }
  };

  if (loading) {
    return <div className="loading-message">Loading your courses...</div>;
  }

  return (
    <div className="my-courses-container">
      <h2>My Enrolled Courses</h2>
      
      {myCourses.length === 0 ? (
        <p className="empty-message">You are not enrolled in any courses yet.</p>
      ) : (
        <div className="course-grid">
          {myCourses.map(course => (
            <div key={course.course_id} className="course-card">
              <span className="course-category">{course.category}</span>
              <h3>{course.title}</h3>
              <p>{course.description}</p>
              
              {/* Grup tombol */}
              <div className="card-buttons">
                <Link 
                  to={`/course/${course.course_id}`} 
                  className="enroll-button continue-button"
                >
                  Continue Learning
                </Link>
                
                {/* ▼▼▼ TOMBOL DELETE BARU ▼▼▼ */}
                <button 
                  onClick={() => handleUnenroll(course.course_id)}
                  className="enroll-button unenroll-button"
                >
                  Un-enroll
                </button>
              </div>
              
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyCoursesPage;