import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import CharacterSelection from './components/CharacterSelection';
import QuestionScreen from './components/QuestionScreen';
import PrisonMap from './components/PrisonMap';
import sorular from './sorular/sorular';

const levelTitles = {
  1: "Temel İlk Yardım Eğitimi",
  2: "Acil Durum Müdahaleleri",
  3: "Özel Durum Yönetimi",
  4: "İleri İlk Yardım Teknikleri"
};

// Önceden belirlenmiş kilit konumları
const predefinedLockPositions = {
  1: { left: 25, top: 25 },  // Sol üst
  2: { left: 75, top: 25 },  // Sağ üst
  3: { left: 25, top: 75 },  // Sol alt
  4: { left: 75, top: 75 }   // Sağ alt
};

const levelIcons = {
  1: "🚑", // Ambulans için
  2: "🏥", // Hastane için
  3: "🔬", // Ameliyathane için
  4: "⚕️", // Ameliyat için
};

function App() {
  const [gameState, setGameState] = useState('character-selection');
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [currentLevel, setCurrentLevel] = useState(null);
  const [unlockedLevels, setUnlockedLevels] = useState([1]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ show: false, type: '', message: '' });
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [showCelebration, setShowCelebration] = useState(false);
  const timerRef = useRef(null);

  // Ses referansları
  const ambiansRef = useRef(new Audio('./assets/ambians.mp3'));
  const nabizRef = useRef(new Audio('./assets/nabizAtisi.mp3'));

  // Timer'ı başlat
  const startTimer = () => {
    setTimeLeft(10);
    if (timerRef.current) clearInterval(timerRef.current);
    
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Timer'ı temizle
  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Süre dolduğunda
  const handleTimeOut = () => {
    setAlertInfo({
      show: true,
      type: 'error',
      message: 'Süre doldu! Hastanın durumu kritik!',
      icon: '⏰'
    });

    setTimeout(() => {
      setAlertInfo({ show: false, type: '', message: '' });
      setCorrectAnswers(0);
      setQuestionCount(0);
    }, 2000);
  };

  const handleHomeClick = () => {
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    setGameState('character-selection');
    setSelectedCharacter(null);
    setCurrentLevel(null);
    setUnlockedLevels([1]);
    setCurrentQuestion(null);
    setShowConfirm(false);
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };

  // Ambians sesini çal ve bitince soru ekranına geç
  const playAmbiansAndStartQuiz = async (character) => {
    setSelectedCharacter(character);
    
    try {
      // Ses çalmadan önce mevcut durumu kontrol et
      if (ambiansRef.current) {
        ambiansRef.current.currentTime = 0;
        await ambiansRef.current.play();
      }
      
      // 5 saniye sonra sorulara geç
      const timer = setTimeout(async () => {
        if (ambiansRef.current) {
          try {
            ambiansRef.current.pause();
            ambiansRef.current.currentTime = 0;
          } catch (error) {
            console.error('Ambians ses durdurma hatası:', error);
          }
        }
        
        setCurrentLevel(1);
        setCorrectAnswers(0);
        setQuestionCount(0);
        setCurrentQuestion(sorular[1][0]);
        setGameState('question');
        startTimer();
        await playNabizSesi(); // İlk soru için nabız sesini çal
      }, 5000);

      return () => clearTimeout(timer);
    } catch (error) {
      console.error('Ses çalma hatası:', error);
      // Ses çalınamazsa direkt soru ekranına geç
      setCurrentLevel(1);
      setCorrectAnswers(0);
      setQuestionCount(0);
      setCurrentQuestion(sorular[1][0]);
      setGameState('question');
      startTimer();
    }
  };

  // Nabız sesini çal
  const playNabizSesi = async () => {
    try {
      if (nabizRef.current) {
        nabizRef.current.currentTime = 0; // Sesi başa sar
        await nabizRef.current.play();
      }
    } catch (error) {
      console.error('Nabız sesi çalma hatası:', error);
    }
  };

  // Component unmount olduğunda sesleri temizle
  useEffect(() => {
    if (currentQuestion) {
      playNabizSesi();
    }

    return () => {
      const currentAmbians = ambiansRef.current;
      const currentNabiz = nabizRef.current;
      
      if (currentAmbians) {
        currentAmbians.pause();
        currentAmbians.currentTime = 0;
      }
      
      if (currentNabiz) {
        currentNabiz.pause();
        currentNabiz.currentTime = 0;
      }
    };
  }, [currentQuestion]);

  const handleCharacterSelect = (character) => {
    const audio = new Audio('./assets/ambians.mp3');
    audio.play();
    playAmbiansAndStartQuiz(character);
    setGameState('map');
  };

  const handleLevelSelect = (levelId) => {
    setCurrentLevel(levelId);
    setCorrectAnswers(0);
    setQuestionCount(0);
    setCurrentQuestion({
      ...sorular[levelId][0],
      questionNumber: 1
    });
    setGameState('question');
    startTimer();
  };

  const handleAnswer = (answer) => {
    clearTimer();
    const currentQuestionData = sorular[currentLevel][questionCount];
    const isCorrect = answer === currentQuestionData.dogruCevap;
    
    setQuestionCount(prev => prev + 1);
    
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      setAlertInfo({
        show: true,
        type: 'success',
        message: 'Doğru teşhis! Hasta iyileşiyor.',
        icon: '💚'
      });

      setTimeout(() => {
        setAlertInfo({ show: false, type: '', message: '' });
        
        if (questionCount + 1 >= 4) {
          if (correctAnswers + 1 >= 4) {
            if (currentLevel < 4) {
              setUnlockedLevels(prev => {
                if (!prev.includes(currentLevel + 1)) {
                  return [...prev, currentLevel + 1];
                }
                return prev;
              });
            }
            
            // Tüm seviyeler tamamlandıysa
            if (currentLevel === 4) {
              setShowCelebration(true);
              setTimeout(() => {
                setShowCelebration(false);
              }, 5000);
            } else {
              setAlertInfo({
                show: true,
                type: 'success',
                message: 'Tebrikler! Bir sonraki seviyeye geçtiniz.',
                icon: '🏆'
              });
              setTimeout(() => {
                setAlertInfo({ show: false, type: '', message: '' });
              }, 2000);
            }
          } else {
            setAlertInfo({
              show: true,
              type: 'error',
              message: 'Seviyeyi geçmek için tüm soruları doğru cevaplamalısınız.',
              icon: '❌'
            });
            setTimeout(() => {
              setAlertInfo({ show: false, type: '', message: '' });
            }, 2000);
          }
          setCorrectAnswers(0);
          setQuestionCount(0);
        } else {
          setCurrentQuestion({
            ...sorular[currentLevel][questionCount + 1],
            questionNumber: questionCount + 2
          });
          startTimer();
        }
      }, 2000);
    } else {
      // Yanlış cevap durumu
      const dogruSecenekMetni = currentQuestionData.secenekler.find(
        secenek => secenek.startsWith(currentQuestionData.dogruCevap)
      );

      setAlertInfo({
        show: true,
        type: 'error',
        message: `Yanlış teşhis! Hastanın durumu kötüleşiyor.\nDoğru cevap: ${dogruSecenekMetni}`,
        icon: '💔',
        isWrongAnswer: true
      });

      setTimeout(() => {
        setAlertInfo({ show: false, type: '', message: '' });
        setCorrectAnswers(0);
        setQuestionCount(0);
      }, 3000);
    }
  };

  const getCurrentLevelIcon = () => {
    if (unlockedLevels.length === 1) {
      return levelIcons[1];
    } else if (unlockedLevels.includes(4)) {
      return levelIcons[4];
    } else {
      return levelIcons[Math.max(...unlockedLevels)];
    }
  };

  // Component unmount olduğunda timer'ı temizle
  useEffect(() => {
    return () => clearTimer();
  }, []);

  return (
    <div className="app">
      {showCelebration && (
        <div className="celebration-overlay">
          <div className="celebration-content">
            <div className="celebration-icon">🎉</div>
            <div className="doctor-image">
              <img src="./assets/happyDoctor.png" alt="Başarılı Doktor" />
            </div>
            <h1 className="celebration-title">Muhteşem Başarı!</h1>
            <p className="celebration-message">
              Tüm seviyeleri başarıyla tamamladınız!<br/>
              Artık deneyimli bir sağlık çalışanısınız.
            </p>
            <div className="celebration-badges">
              <span className="badge" title="İlk Yardım Uzmanı">🚑</span>
              <span className="badge" title="Hastane Yöneticisi">🏥</span>
              <span className="badge" title="Laboratuvar Uzmanı">🔬</span>
              <span className="badge" title="Tıp Doktoru">⚕️</span>
            </div>
            <div className="fireworks">
              <div className="firework"></div>
              <div className="firework"></div>
              <div className="firework"></div>
            </div>
          </div>
        </div>
      )}

      {alertInfo.show && (
        <div className={`medical-alert-overlay ${alertInfo.type}`}>
          <div className={`medical-alert ${alertInfo.type}`}>
            <div className="medical-alert-icon">{alertInfo.icon}</div>
            <div className="medical-alert-content">
              <div className="medical-alert-title">
                {alertInfo.type === 'success' ? 'Başarılı Tedavi!' : 'Tedavi Başarısız!'}
              </div>
              <div className="medical-alert-message">
                {alertInfo.message.split('\n').map((line, index) => (
                  <span key={index} className={index === 1 ? 'correct-answer' : ''}>
                    {line}
                    {index === 0 && alertInfo.isWrongAnswer && <br />}
                  </span>
                ))}
              </div>
            </div>
            <div className={`vital-signs ${alertInfo.type}`}>
              <div className="heartbeat-line"></div>
            </div>
          </div>
        </div>
      )}

      {showConfirm && (
        <div className="confirm-popup-overlay">
          <div className="confirm-popup">
            <h2>Dikkat!</h2>
            <p>Ana sayfaya dönmek istediğinize emin misiniz? Tüm ilerlemeniz kaydedilmeyecek ve baştan başlamanız gerekecek.</p>
            <div className="confirm-buttons">
              <button className="confirm-button" onClick={handleConfirm}>
                Evet, Dön
              </button>
              <button className="cancel-button" onClick={handleCancel}>
                İptal
              </button>
            </div>
          </div>
        </div>
      )}

      {gameState !== 'character-selection' && (
        <button className="home-button" onClick={handleHomeClick}>
          <span className="home-icon">🏠</span>
          Ana Sayfa
        </button>
      )}

      {gameState === 'character-selection' && (
        <CharacterSelection onCharacterSelect={handleCharacterSelect} />
      )}
      
      {gameState === 'map' && (
        <div className="map-container">
          <div className="character-info">
            <div className="character-details">
              <img src={`.${selectedCharacter?.image}`} alt={selectedCharacter?.name} />
              <h3>{selectedCharacter?.name}</h3>
            </div>
            <div className="level-info">
              <h4>
                <span className="task-icon">📋</span>
                Mevcut Görev:
              </h4>
              <p className="current-mission">
                <span className="mission-icon">{getCurrentLevelIcon()}</span>
                {unlockedLevels.length === 1 ? levelTitles[1] :
                 unlockedLevels.includes(4) ? levelTitles[4] :
                 levelTitles[Math.max(...unlockedLevels)]}
              </p>
            </div>
          </div>
          <PrisonMap
            unlockedLevels={unlockedLevels}
            onLevelSelect={handleLevelSelect}
            levelTitles={levelTitles}
            predefinedPositions={predefinedLockPositions}
          />
        </div>
      )}
      
      {gameState === 'question' && currentQuestion && (
        <QuestionScreen
          question={currentQuestion}
          currentQuestionIndex={questionCount}
          totalQuestions={sorular[currentLevel]?.length}
          timeLeft={timeLeft}
          onAnswerSubmit={handleAnswer}
        />
      )}
    </div>
  );
}

export default App;
