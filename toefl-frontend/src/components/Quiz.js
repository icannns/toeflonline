// src/components/Quiz.js

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Quiz.css';

// --- BANK SOAL BARU (ECHOLOCATION) ---
const quizQuestions = [
  {
    id: 'q1',
    text: 'What is the primary purpose of echolocation described in the passage?',
    options: {
      A: 'To communicate with other animals',
      B: 'To navigate and find prey in low-light conditions',
      C: 'To scare away predators',
      D: 'To detect changes in water temperature'
    },
    correct: 'B'
  },
  {
    id: 'q2',
    text: 'The passage states that the sounds emitted for echolocation are often...',
    options: {
      A: 'Within the range of human hearing',
      B: 'At a very low frequency',
      C: 'Ultrasonic, or above the range of human hearing',
      D: 'A form of visual light wave'
    },
    correct: 'C'
  },
  {
    id: 'q3',
    text: 'How does an animal build a "sonic map" of its surroundings?',
    options: {
      A: 'By seeing the sound waves bounce',
      B: 'By feeling the vibrations in the air',
      C: 'By processing the time and intensity of returning echoes',
      D: 'By remembering the path from the previous day'
    },
    correct: 'C'
  },
  {
    id: 'q4',
    text: 'According to the passage, bats can use echolocation to detect...',
    options: {
      A: 'Objects as thin as a human hair',
      B: 'Only large objects like trees',
      C: 'Colors in the dark',
      D: 'Buried objects'
    },
    correct: 'A'
  },
  {
    id: 'q5',
    text: 'The passage mentions echolocation as a "powerful example of evolutionary adaptation" because it allows animals to...',
    options: {
      A: 'Rely solely on vision',
      B: 'Live in any environment on Earth',
      C: 'Stop using their other senses',
      D: 'Thrive in niches unavailable to animals that only use vision'
    },
    correct: 'D'
  }
];

function Quiz({ courseId, courseTitle }) {
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null); // null = kuis belum dikerjakan
  const [showAnswers, setShowAnswers] = useState(false); // State untuk review jawaban

  // Fungsi untuk menyimpan jawaban user
  const handleAnswerChange = (questionId, optionKey) => {
    setAnswers({
      ...answers,
      [questionId]: optionKey
    });
  };

  // Fungsi untuk menghitung nilai
  const handleSubmitQuiz = (e) => {
    e.preventDefault();
    let correctAnswers = 0;
    
    for (const question of quizQuestions) {
      if (answers[question.id] === question.correct) {
        correctAnswers++;
      }
    }
    
    // Hitung skor (skala 0-100)
    const newScore = (correctAnswers / quizQuestions.length) * 100;
    setScore(newScore);
    setShowAnswers(false); // Sembunyikan review jika mengerjakan ulang
  };

  // Tampilkan hasil
  if (score !== null) {
    return (
      <div className="quiz-results">
        <h3>Quiz Completed!</h3>
        <p className="score-text">Your Score: <span className="score-number">{score}%</span></p>
        <p>{score >= 80 ? 'Congratulations! You passed.' : 'You did not pass. Please try again.'}</p>
        
        {/* Tombol sertifikat HANYA muncul jika nilai >= 80 */}
        {score >= 80 && (
          <Link 
            to={`/certificate/${courseId}`} 
            className="certificate-button"
            state={{ courseTitle: courseTitle, userScore: score }} // Kirim judul DAN skor
          >
            View Your Certificate
          </Link>
        )}
        
        {/* Tombol untuk review jawaban */}
        <button onClick={() => setShowAnswers(!showAnswers)} className="review-answers-button">
          {showAnswers ? 'Hide Answers' : 'Review Answers'}
        </button>
        
        {/* Blok untuk tampilkan jawaban */}
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
    );
  }

  // Tampilkan kuis
  return (
    <div className="quiz-container">
      <h3>Practice Quiz</h3>
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
                    required // Wajib diisi
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
    </div>
  );
}

export default Quiz;