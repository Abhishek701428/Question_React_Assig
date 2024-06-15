import React, { useState, useEffect, useRef } from 'react';

const Quiz = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [timer, setTimer] = useState(600); // 10 minutes = 600 seconds
  const quizRef = useRef(null);

  useEffect(() => {
    fetch('/question.json')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => setQuestions(data))
      .catch(error => console.error('Fetching error:', error));

    const savedIndex = localStorage.getItem('currentQuestionIndex');
    if (savedIndex) {
      setCurrentQuestionIndex(Number(savedIndex));
    }

    const savedTimer = localStorage.getItem('timer');
    if (savedTimer) {
      setTimer(Number(savedTimer));
    }

    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    localStorage.setItem('currentQuestionIndex', currentQuestionIndex.toString());
    localStorage.setItem('timer', timer.toString());
  }, [currentQuestionIndex, timer]);

  useEffect(() => {
    const handleFullScreenChange = () => {
      if (!document.fullscreenElement) {
        alert('Please enable fullscreen mode to continue the quiz.');
      }
    };

    document.addEventListener('fullscreenchange', handleFullScreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
    };
  }, []);

  const enableFullScreen = () => {
    if (quizRef.current) {
      if (quizRef.current.requestFullscreen) {
        quizRef.current.requestFullscreen();
      } else if (quizRef.current.mozRequestFullScreen) {
        quizRef.current.mozRequestFullScreen();
      } else if (quizRef.current.webkitRequestFullscreen) {
        quizRef.current.webkitRequestFullscreen();
      } else if (quizRef.current.msRequestFullscreen) {
        quizRef.current.msRequestFullscreen();
      }
    }
  };

  const handleOptionChange = (index) => {
    setSelectedOption(index);
  };

  const handleNextQuestion = () => {
    if (selectedOption !== null) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
    }
  };

  if (timer <= 0) {
    alert('Time is up!');
    return <div>Time is up!</div>;
  }

  if (questions.length === 0) {
    return <div>Loading...</div>;
  }

  if (currentQuestionIndex >= questions.length) {
    return <div>Quiz completed!</div>;
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div ref={quizRef} className="quiz-container">
      <button className="start-fullscreen" onClick={enableFullScreen}>Start Quiz in Fullscreen</button>
      <h1>Quiz</h1>
      <div className="question">
        <p>{currentQuestion.question}</p>
        {currentQuestion.options.map((option, index) => (
          <label key={index} className={selectedOption === index ? 'selected' : ''}>
            <input
              type="radio"
              name="option"
              checked={selectedOption === index}
              onChange={() => handleOptionChange(index)}
            />
            {option}
          </label>
        ))}
      </div>
      <button onClick={handleNextQuestion} disabled={selectedOption === null}>Next</button>
      <div className="timer">Time left: {Math.floor(timer / 60)}:{timer % 60 < 10 ? `0${timer % 60}` : timer % 60}</div>
    </div>
  );
};

export default Quiz;
