import React, { useState } from 'react';
import './CharacterSelection.css';

const characters = [
  { id: 'man', name: 'Öğrenci', image: `${process.env.PUBLIC_URL}/assets/man.jpg` },
  { id: 'nurse', name: 'Hemşire', image: `${process.env.PUBLIC_URL}/assets/nurse.png` },
  { id: 'police', name: 'Güvenlik', image: `${process.env.PUBLIC_URL}/assets/police.jpg` },
  { id: 'teacher', name: 'Asistan Doktor', image: `${process.env.PUBLIC_URL}/assets/teacher.png` },
  { id: 'teacher2', name: 'Stajyer Doktor', image: `${process.env.PUBLIC_URL}/assets/teacher2.png` },
  { id: 'ambulansDriver', name: 'Ambulans Şoförü', image: `${process.env.PUBLIC_URL}/assets/ambulansDriver.png` },
  { id: 'people', name: 'Öğretim Görevlisi', image: `${process.env.PUBLIC_URL}/assets/people.jpg` },
  { id: 'student', name: 'Tıp Öğrencisi', image: `${process.env.PUBLIC_URL}/assets/student.jpg` }
];

const CharacterSelection = ({ onCharacterSelect }) => {
  const [selectedCharacter, setSelectedCharacter] = useState(null);

  const handleCharacterSelect = (character) => {
    setSelectedCharacter(character);
    const audio = new Audio('/assets/ambians.mp3');
    audio.play();
    onCharacterSelect(character);
  };

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
            <img src={character.image} alt={character.name} />
            <h3>{character.name}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CharacterSelection; 