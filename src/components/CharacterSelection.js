import React, { useState, useEffect } from 'react';
import './CharacterSelection.css';

const characters = [
  { id: 'man', name: 'Öğrenci', image: './assets/man.jpg' },
  { id: 'nurse', name: 'Hemşire', image: './assets/nurse.png' },
  { id: 'police', name: 'Güvenlik', image: './assets/police.jpg' },
  { id: 'teacher', name: 'Asistan Doktor', image: './assets/teacher.png' },
  { id: 'teacher2', name: 'Stajyer Doktor', image: './assets/teacher2.png' },
  { id: 'ambulansDriver', name: 'Ambulans Şoförü', image: './assets/ambulansDriver.png' },
  { id: 'people', name: 'Öğretim Görevlisi', image: './assets/people.jpg' },
  { id: 'student', name: 'Tıp Öğrencisi', image: './assets/student.jpg' }
];

const preloadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = src;
    img.onload = resolve;
    img.onerror = reject;
  });
};

const CharacterSelection = ({ onCharacterSelect }) => {
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  useEffect(() => {
    const loadImages = async () => {
      try {
        await Promise.all(characters.map(char => preloadImage(char.image)));
        setImagesLoaded(true);
      } catch (error) {
        console.error('Resim yükleme hatası:', error);
        setImagesLoaded(true); // Hata olsa bile kullanıcının seçim yapmasına izin ver
      }
    };

    loadImages();
  }, []);

  const handleCharacterSelect = (character) => {
    setSelectedCharacter(character);
    const audio = new Audio('./assets/ambians.mp3');
    audio.play();
    onCharacterSelect(character);
  };

  if (!imagesLoaded) {
    return (
      <div className="character-selection">
        <h2>Karakterler Yükleniyor...</h2>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="character-selection">
      <h2>Karakterinizi Seçin</h2>
      <div className="character-grid">
        {characters.map((character) => (
          <div
            key={character.id}
            className={`character-card ${selectedCharacter?.id === character.id ? 'selected' : ''}`}
            onClick={() => handleCharacterSelect(character)}
          >
            <img 
              src={character.image} 
              alt={character.name}
              loading="lazy"
              decoding="async"
            />
            <h3>{character.name}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CharacterSelection; 