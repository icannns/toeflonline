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
  const [showQuiz, setShowQuiz] = useState(false);
  
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
        // Kita gunakan API Gateway
        const response = await axios.get(`http://localhost:8000/api/courses/${id}`);
        setCourse(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching course details:", err);
        setError("Failed to load course details.");
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

      <div className="course-content">
      
        {!showQuiz ? (
          
          // --- TAMPILAN MATERI (BARU) ---
          <>
            <h3>Course Materials</h3>
            <h4>Reading Passage 1: Echolocation</h4>
            <p className="reading-passage">
              Echolocation is a fascinating biological sonar used by several animals,
              such as bats, dolphins, and whales. These animals emit
              calls out to the environment and listen to the **echoes** of those
              calls that return from various objects near them. They use these
              echoes to locate and identify the objects. Echolocation is used for
              navigation, finding prey, and avoiding obstacles, especially in
              environments where vision is limited, such as the deep sea or in
              complete darkness.
            </p>
            <p className="reading-passage">
              The process begins when the animal produces a high-frequency sound
              wave, often ultrasonic, meaning it is above the range of human
              hearing. These sound waves travel outward and bounce off
              objects in the vicinity. The returning echoes are captured by the
              animal's highly sensitive ears. The brain then processes this
              information with incredible speed, interpreting the time delay,
              intensity, and frequency shift of the echoes to build a detailed
              "sonic map" of their surroundings.
            </p>
             <p className="reading-passage">
              The precision of echolocation is remarkable. Using this ability,
              bats can detect objects as thin as a human hair or hunt tiny
              insects like mosquitoes in total darkness. Similarly, dolphins
              can distinguish between different types of fish or even locate
              objects buried in the sand on the ocean floor. This complex sensory
              system is a powerful example of evolutionary adaptation, allowing
              these species to thrive in ecological niches unavailable to
              animals that rely solely on vision.
            </p>
            
            {/* Tombol untuk memulai kuis */}
            <button onClick={() => setShowQuiz(true)} className="start-quiz-button">
              Mulai Kuis
            </button>
          </>
          
        ) : (
          
          // --- TAMPILAN KUIS ---
          <>
            <Quiz courseId={id} courseTitle={course.title} />
            {/* Tombol untuk kembali ke materi */}
            <button onClick={() => setShowQuiz(false)} className="back-to-material-button">
              Kembali ke Materi
            </button>
          </>
        )}
        
      </div>
    </div>
  );
}

export default CourseDetailPage;