import React, { useState, useEffect, useRef, useCallback } from 'react';
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

  // Ses yönetimi için state'ler
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [isAmbiansPlaying, setIsAmbiansPlaying] = useState(false);
  const [isNabizPlaying, setIsNabizPlaying] = useState(false);

  // Ses referansları
  const ambiansRef = useRef(null);
  const nabizRef = useRef(null);

  // Ses yönetimi için memoized fonksiyonlar
  const initializeAudio = useCallback(() => {
    try {
      // Ses dosyalarını yükle
      ambiansRef.current = new Audio('./assets/ambians.mp3');
      nabizRef.current = new Audio('./assets/nabizAtisi.mp3');

      // Ses ayarlarını yapılandır
      ambiansRef.current.volume = 0.5;
      nabizRef.current.volume = 0.7;
      
      // Döngü ayarları
      ambiansRef.current.loop = true;
      nabizRef.current.loop = false;

      // Hata yakalama
      const handleError = (e) => {
        console.error('Ses yükleme hatası:', e);
        setIsSoundEnabled(false);
      };

      ambiansRef.current.addEventListener('error', handleError);
      nabizRef.current.addEventListener('error', handleError);

      // Ses bittiğinde state'i güncelle
      ambiansRef.current.addEventListener('ended', () => setIsAmbiansPlaying(false));
      nabizRef.current.addEventListener('ended', () => setIsNabizPlaying(false));

    } catch (error) {
      console.error('Ses sistemi başlatılamadı:', error);
      setIsSoundEnabled(false);
    }
  }, []);

  // Sesleri temizle
  const cleanupAudio = useCallback(() => {
    try {
      if (ambiansRef.current) {
        ambiansRef.current.pause();
        ambiansRef.current.currentTime = 0;
        setIsAmbiansPlaying(false);
      }
      if (nabizRef.current) {
        nabizRef.current.pause();
        nabizRef.current.currentTime = 0;
        nabizRef.current.onended = null; // Event listener'ı temizle
        setIsNabizPlaying(false);
      }
    } catch (error) {
      console.error('Ses temizleme hatası:', error);
    }
  }, []);

  // Ambians sesini çal
  const playAmbians = useCallback(async () => {
    if (!isSoundEnabled || isAmbiansPlaying) return;

    try {
      if (ambiansRef.current) {
        ambiansRef.current.currentTime = 0;
        await ambiansRef.current.play();
        setIsAmbiansPlaying(true);
      }
    } catch (error) {
      console.error('Ambians ses çalma hatası:', error);
      setIsSoundEnabled(false);
    }
  }, [isSoundEnabled, isAmbiansPlaying]);

  // Nabız sesini çal
  const playNabizSesi = useCallback(async () => {
    if (!isSoundEnabled || isNabizPlaying) return;

    try {
      if (nabizRef.current) {
        nabizRef.current.currentTime = 0;
        await nabizRef.current.play();
        setIsNabizPlaying(true);

        // Nabız sesinin süresini kontrol et ve bittiğinde state'i güncelle
        nabizRef.current.onended = () => {
          setIsNabizPlaying(false);
          // Eğer hala soru ekranındaysa tekrar çal
          if (gameState === 'question') {
            playNabizSesi();
          }
        };
      }
    } catch (error) {
      console.error('Nabız sesi çalma hatası:', error);
      setIsNabizPlaying(false);
    }
  }, [isSoundEnabled, isNabizPlaying, gameState]);

  // Component mount/unmount yönetimi
  useEffect(() => {
    initializeAudio();
    return () => {
      cleanupAudio();
    };
  }, [initializeAudio, cleanupAudio]);

  // GameState değişimini izle
  useEffect(() => {
    // Soru ekranı kapandığında nabız sesini durdur
    if (gameState !== 'question') {
      if (nabizRef.current) {
        nabizRef.current.pause();
        nabizRef.current.currentTime = 0;
        setIsNabizPlaying(false);
      }
    } else {
      // Soru ekranı açıldığında nabız sesini başlat
      playNabizSesi();
    }
  }, [gameState, playNabizSesi]);

  // Timer yönetimi için memoized fonksiyon
  const startTimer = useCallback(() => {
    setTimeLeft(10);
    clearTimer();
    
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearTimer();
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // Timer cleanup fonksiyonu
  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

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

  // Ses çalma fonksiyonu optimize edildi
  const playAmbiansAndStartQuiz = useCallback(async (character) => {
    setSelectedCharacter(character);
    
    try {
      await playAmbians();
      
      setTimeout(async () => {
        cleanupAudio();
        setGameState('question');
        setCurrentLevel(1);
        setCorrectAnswers(0);
        setQuestionCount(0);
        setCurrentQuestion(sorular[1][0]);
        startTimer();
        await playNabizSesi();
      }, 5000);
    } catch (error) {
      console.error('Quiz başlatma hatası:', error);
      setGameState('question');
      setCurrentLevel(1);
      setCorrectAnswers(0);
      setQuestionCount(0);
      setCurrentQuestion(sorular[1][0]);
      startTimer();
    }
  }, [playAmbians, cleanupAudio, playNabizSesi, startTimer]);

  const handleCharacterSelect = useCallback((character) => {
    playAmbiansAndStartQuiz(character);
    setGameState('map');
  }, [playAmbiansAndStartQuiz]);

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
    // Yeni seviye başladığında nabız sesi otomatik başlayacak (useEffect ile)
  };

  const handleAnswer = (answer) => {
    clearTimer();
    // Cevap verildiğinde nabız sesini durdur
    if (nabizRef.current) {
      nabizRef.current.pause();
      nabizRef.current.currentTime = 0;
      setIsNabizPlaying(false);
    }

    const currentQuestionData = sorular[currentLevel][questionCount];
    const isCorrect = answer === currentQuestionData.dogruCevap;
    
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      setAlertInfo({
        show: true,
        type: 'success',
        message: 'Doğru teşhis! Hasta iyileşiyor.',
        icon: '💚'
      });

      setTimeout(async () => {
        setAlertInfo({ show: false, type: '', message: '' });
        setQuestionCount(prev => prev + 1);
        
        if (questionCount + 1 >= 4) {
          if (correctAnswers + 1 >= 4) {
            if (currentLevel < 4) {
              setUnlockedLevels(prev => {
                if (!prev.includes(currentLevel + 1)) {
                  return [...prev, currentLevel + 1];
                }
                return prev;
              });
              
              setAlertInfo({
                show: true,
                type: 'success',
                message: 'Tebrikler! Bir sonraki seviyeye geçtiniz.',
                icon: '🏆'
              });
            } else {
              setShowCelebration(true);
              setTimeout(() => {
                setShowCelebration(false);
                setGameState('map');
              }, 5000);
            }
          }
          setTimeout(() => {
            setGameState('map');
            setCorrectAnswers(0);
            setQuestionCount(0);
            setAlertInfo({ show: false, type: '', message: '' });
            cleanupAudio();
          }, 2000);
        } else {
          setCurrentQuestion({
            ...sorular[currentLevel][questionCount + 1],
            questionNumber: questionCount + 2
          });
          startTimer();
          // Yeni soru için nabız sesi otomatik başlayacak (useEffect ile)
        }
      }, 2000);
    } else {
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
        setGameState('map');
        cleanupAudio();
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
