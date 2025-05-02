import React, { useState, useEffect } from 'react';
import './QuestionScreen.css';
import { FaHeartbeat, FaClock, FaThermometerHalf } from 'react-icons/fa';
import EkgLine from './EkgLine';

const QuestionScreen = ({ 
  question,
  currentQuestionIndex = 0, 
  totalQuestions = 0, 
  timeLeft = 0, 
  onAnswerSubmit = () => {} 
}) => {
  const [heartRate, setHeartRate] = useState(80);
  const [temperature] = useState(36.6);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeartRate(prev => prev + Math.random() * 2 - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  return (
    <div className="question-screen">
      <div className="medical-monitor">
        <div className="monitor-header">
          <div className="vital-signs">
            <div className="vital-sign heart-rate">
              <FaHeartbeat />
              <div>
                <div className="vital-sign-label">Nabız</div>
                <div className="vital-sign-value">{Math.round(heartRate)} BPM</div>
              </div>
            </div>
            <div className="vital-sign temperature">
              <FaThermometerHalf />
              <div>
                <div className="vital-sign-label">Sıcaklık</div>
                <div className="vital-sign-value">{temperature.toFixed(1)}°C</div>
              </div>
            </div>
          </div>
        </div>

        <EkgLine />

        <div className="timer-container">
          <FaClock className="timer-icon" />
          <div className="timer-value">{timeLeft}s</div>
        </div>

        <div className="question-container">
          <div className="question-header">
            <div className="question-number">Soru {currentQuestionIndex + 1}</div>
          </div>
          
          <div className="question-text">{question.soru}</div>

          <div className="answers-grid">
            {question.secenekler && question.secenekler.map((secenek, index) => (
              <button
                key={index}
                className="answer-option"
                onClick={() => onAnswerSubmit(secenek.charAt(0))}
              >
                <div className="answer-letter">
                  {secenek.charAt(0)}
                </div>
                <div className="answer-text">{secenek.slice(3)}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="progress-bar">
          <div 
            className="progress" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default QuestionScreen; 