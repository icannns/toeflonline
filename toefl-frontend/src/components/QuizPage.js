// src/components/QuizPage.js

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './QuizPage.css'; // Kita akan buat file CSS baru

function QuizPage() {
  const [quizInfo, setQuizInfo] = useState(null); // Menyimpan info paket (judul, dll)
  const [quizQuestions, setQuizQuestions] = useState([]); // Menyimpan soal
  const [loading, setLoading] = useState(true);
  
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [showAnswers, setShowAnswers] = useState(false);
  
  const { quizId } = useParams(); // Mengambil ID paket soal dari URL
  const navigate = useNavigate();

  // Efek untuk mengambil data kuis dari backend
  useEffect(() => {
    // 1. Cek login
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Please log in to take the quiz.");
      navigate('/login');
      return;
    }

    // 2. Fungsi untuk mengambil soal
    const fetchQuizData = async () => {
      setLoading(true);
      try {
        // Panggil endpoint baru di assessment-service
        const response = await axios.get(`http://localhost:8000/api/assessment/quiz/${quizId}`);
        
        setQuizInfo(response.data.quizInfo);
        setQuizQuestions(response.data.questions);
        setLoading(false);
      } catch (err) {
        console.error("Gagal mengambil soal kuis:", err);
        setLoading(false);
      }
    };

    fetchQuizData();
  }, [quizId, navigate]); // Ambil ulang jika ID paket soal berubah

  // (Fungsi handleAnswerChange dan handleSubmitQuiz SAMA, tidak perlu diubah)
  const handleAnswerChange = (questionId, optionKey) => {
    setAnswers({
      ...answers,
      [questionId]: optionKey
    });
  };

  const handleSubmitQuiz = (e) => {
    e.preventDefault();
    let correctAnswers = 0;
    
    for (const question of quizQuestions) {
      if (answers[question.id] === question.correct) {
        correctAnswers++;
      }
    }
    
    const newScore = (correctAnswers / quizQuestions.length) * 100;
    setScore(newScore);
    setShowAnswers(false);
  };

  // Tampilan Loading
  if (loading) {
    return <div className="loading-message">Loading quiz questions...</div>;
  }
  
  // Tampilan jika tidak ada soal
  if (!quizInfo || quizQuestions.length === 0) {
    return <div className="loading-message">No quiz available for this packet.</div>;
  }

  // Tampilan Halaman Kuis
  return (
    <div className="quiz-page-container">
      {/* Header Halaman Kuis (Info dari API) */}
      <header className="quiz-header">
        <Link to={`/course/${quizInfo.course_id}`} className="back-link">&larr; Back to {quizInfo.courseTitle}</Link>
        <h2>{quizInfo.quizTitle}</h2>
      </header>

      {/* Konten Kuis */}
      <div className="quiz-content-box">
        {score === null ? (
          
          // --- TAMPILAN SOAL (Form Kuis) ---
          <form onSubmit={handleSubmitQuiz}>
            {quizQuestions.map((q, index) => (
              <div key={q.id} className="question-block-quiz">
                <p className="question-text-quiz">{index + 1}. {q.text}</p>
                <div className="options-group">
                  {Object.entries(q.options).map(([key, value]) => (
                    <label key={key} className="option-label">
                      <input
                        type="radio"
                        name={q.id}
                        value={key}
                        onChange={() => handleAnswerChange(q.id, key)}
                        required
                      />
                      <span>({key}) {value}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
            <button type="submit" className="submit-quiz-button">
              Submit Quiz
            </button>
          </form>
          
        ) : (
          
          // --- TAMPILAN HASIL ---
          <div className="quiz-results">
            <h3>Quiz Completed!</h3>
            <p className="score-text">Your Score: <span className="score-number">{score}%</span></p>
            <p>{score >= 80 ? 'Congratulations! You passed.' : 'You did not pass. Please try again.'}</p>
            
            {score >= 80 && (
              <Link 
                to={`/certificate/${quizInfo.course_id}`} // Kirim ID KURSUS (bukan kuis)
                className="certificate-button"
                state={{ courseTitle: quizInfo.courseTitle, userScore: score }}
              >
                View Your Certificate
              </Link>
            )}
            
            <button onClick={() => setShowAnswers(!showAnswers)} className="review-answers-button">
              {showAnswers ? 'Hide Answers' : 'Review Answers'}
            </button>
            
            {showAnswers && (
              <div className="answer-review-container">
                <h4>Answer Key</h4>
                {quizQuestions.map(q => {
                  const userAnswer = answers[q.id] || 'No Answer';
                  const isCorrect = userAnswer === q.correct;
                  return (
                    <div key={q.id} className="review-block">
                      <p className="review-question">{q.text}</p>
                      <p className={`review-answer ${isCorrect ? 'correct' : 'incorrect'}`}>
                        Your Answer: ({userAnswer}) {q.options[userAnswer] || ''}
                      </p>
                      {!isCorrect && (
                        <p className="review-answer correct">
                          Correct Answer: ({q.correct}) {q.options[q.correct]}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default QuizPage;