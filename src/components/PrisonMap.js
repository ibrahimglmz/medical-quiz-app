import React, { useState, useEffect } from 'react';
import './PrisonMap.css';

const levelImages = {
  1: `${process.env.PUBLIC_URL}/images/goAmbulance.jpeg`,
  2: `${process.env.PUBLIC_URL}/images/ambulance.jpg`,
  3: `${process.env.PUBLIC_URL}/images/hospital.png`,
  4: `${process.env.PUBLIC_URL}/images/ameliyat.jpeg`
};

const PrisonMap = ({ unlockedLevels, onLevelSelect, levelTitles, predefinedPositions }) => {
  const [locks, setLocks] = useState([]);

  useEffect(() => {
    const generateLocks = () => {
      const positions = [];
      for (let i = 0; i < 4; i++) {
        const id = i + 1;
        positions.push({
          id,
          left: predefinedPositions[id].left,
          top: predefinedPositions[id].top,
          isUnlocked: unlockedLevels.includes(id)
        });
      }
      return positions;
    };

    setLocks(generateLocks());
  }, [unlockedLevels, predefinedPositions]);

  return (
    <div className="prison-map">
      <img src={`${process.env.PUBLIC_URL}/assets/gameMaps.jpg`} alt="Hastane Haritası" className="map-background" />
      {locks.map((lock) => (
        <div
          key={lock.id}
          className={`lock ${lock.isUnlocked ? 'unlocked' : ''}`}
          style={{
            left: `${lock.left}%`,
            top: `${lock.top}%`
          }}
          onClick={() => lock.isUnlocked && onLevelSelect(lock.id)}
        >
          <div className="level-image-container">
            <img 
              src={levelImages[lock.id]} 
              alt={`Seviye ${lock.id}`} 
              className={`level-image ${!lock.isUnlocked ? 'locked' : ''}`}
            />
          </div>
          <div className="lock-label">
            <div className="level-number">Seviye {lock.id}</div>
            <div className="level-title">{levelTitles[lock.id]}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PrisonMap; 