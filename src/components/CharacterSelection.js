import React, { useState } from 'react';
import './CharacterSelection.css';

const characters = [
  { id: 'man', name: 'Doktor', image: '/assets/man.jpg' },
  { id: 'nurse', name: 'Hemşire', image: '/assets/nurse.png' },
  { id: 'police', name: 'Güvenlik', image: '/assets/police.jpg' },
  { id: 'teacher', name: 'Asistan Doktor', image: '/assets/teacher.png' },
  { id: 'teacher2', name: 'Stajyer Doktor', image: '/assets/teacher2.png' }
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