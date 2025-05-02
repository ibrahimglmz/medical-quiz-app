import React from 'react';

const PrisonMap = ({ unlockedLevels, completedLevels, onLockClick }) => {
  const locks = [
    { id: 1, position: { top: '20%', left: '30%' } },
    { id: 2, position: { top: '40%', left: '70%' } },
    { id: 3, position: { top: '70%', left: '25%' } },
    { id: 4, position: { top: '60%', left: '80%' } },
  ];

  return (
    <div className="prison-map">
      <div className="map-container">
        {locks.map((lock) => (
          <button
            key={lock.id}
            className={`lock-button ${
              unlockedLevels.includes(lock.id) ? 'unlocked' : 'locked'
            } ${completedLevels.includes(lock.id) ? 'completed' : ''}`}
            onClick={() => onLockClick(lock.id)}
            disabled={!unlockedLevels.includes(lock.id)}
            style={{
              position: 'absolute',
              top: lock.position.top,
              left: lock.position.left,
            }}
          >
            <div className="lock-content">
              <span className="lock-number">{lock.id}</span>
              <span className="lock-text">
                {completedLevels.includes(lock.id)
                  ? "Kilit Açıldı"
                  : unlockedLevels.includes(lock.id)
                  ? "Kilidi Aç"
                  : "Kilitli"}
              </span>
              {!unlockedLevels.includes(lock.id) && <span className="lock-icon">🔒</span>}
              {completedLevels.includes(lock.id) && <span className="complete-icon">✓</span>}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default PrisonMap; 