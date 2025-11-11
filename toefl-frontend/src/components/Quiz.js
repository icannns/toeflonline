// src/components/Quiz.js

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Quiz.css';

// --- Bank Soal ---
const quizQuestions = [
  {
    id: 'q1',
    text: 'The term "e-commerce" refers to...',
    options: {
      A: 'Selling goods in a physical store',
      B: 'Buying and selling goods using the internet',
      C: 'Only transferring money',
      D: 'All aspects of operating an online business'
    },
    correct: 'B'
  },
  {
    id: 'q2',
    text: 'What does "e-business" refer to?',
    options: {
      A: 'Only the transaction of goods',
      B: 'Only the sale of physical products',
      C: 'All aspects of operating an online business',
      D: 'The history of online sales'
    },
    correct: 'C'
  },
  {
    id: 'q3',
    text: 'When did the first-ever online sale happen?',
    options: {
      A: '1994',
      B: '2000',
      C: '1990',
      D: '2005'
    },
    correct: 'A'
  },
  {
    id: 'q4',
    text: 'The word "facilitated" in the passage is closest in meaning to...',
    options: {
      A: 'stopped',
      B: 'made easier',
      C: 'made harder',
      D: 'discovered'
    },
    correct: 'B'
  },
  {
    id: 'q5',
    text: 'E-commerce can describe any kind of commercial transaction that is...',
    options: {
      A: 'done face-to-face',
      B: 'facilitated through the internet',
      C: 'only for physical products',
      D: 'related to marketing'
    },
    correct: 'B'
  }
];

function Quiz({ courseId, courseTitle }) {
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);

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
  };

  if (score !== null) {
    return (
      <div className="quiz-results">
        <h3>Quiz Completed!</h3>
        <p className="score-text">Your Score: <span className="score-number">{score}%</span></p>
        <p>{score >= 80 ? 'Congratulations! You passed.' : 'You did not pass. Please try again.'}</p>
        
        {score >= 80 && (
          // ▼▼▼ PERUBAHAN ADA DI SINI ▼▼▼
          <Link 
            to={`/certificate/${courseId}`} 
            className="certificate-button"
            state={{ courseTitle: courseTitle, userScore: score }} // Kirim judul DAN skor
          >
            View Your Certificate
          </Link>
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
    </div>
  );
}

export default Quiz;