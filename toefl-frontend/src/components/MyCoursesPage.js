// src/components/MyCoursesPage.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './MyCoursesPage.css';

function MyCoursesPage() {
  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyCourses = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        alert("Please log in to see your courses.");
        navigate('/login');
        return;
      }

      try {
        // ▼▼▼ PERUBAHAN DI SINI ▼▼▼
        // Panggil API Gateway (port 8000)
        const response = await axios.get('http://localhost:8000/api/enrollments/my-courses', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
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

    fetchMyCourses();
  }, [navigate]);

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
              
              <Link 
                to={`/course/${course.course_id}`} 
                className="enroll-button continue-button"
              >
                Continue Learning
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyCoursesPage;