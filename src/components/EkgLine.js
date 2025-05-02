import React from 'react';
import './EkgLine.css';

const EkgLine = () => {
  return (
    <div className="ekg-container">
      <div className="ekg-grid">
        {/* Grid çizgileri için 20 dikey çizgi */}
        {[...Array(20)].map((_, i) => (
          <div key={`v-${i}`} className="grid-line vertical" />
        ))}
        {/* Grid çizgileri için 10 yatay çizgi */}
        {[...Array(10)].map((_, i) => (
          <div key={`h-${i}`} className="grid-line horizontal" />
        ))}
      </div>
      <div className="ekg-line">
        <svg
          viewBox="0 0 1000 100"
          className="ekg-svg"
        >
          {/* Normal EKG dalga formu için path - daha uzun ve gerçekçi */}
          <path
            className="ekg-path"
            d="M0,50 
               L100,50 
               L120,50 
               L130,20 
               L140,80 
               L150,20 
               L160,50 
               L200,50
               L220,50 
               L230,20 
               L240,80 
               L250,20 
               L260,50 
               L300,50
               L320,50 
               L330,20 
               L340,80 
               L350,20 
               L360,50 
               L400,50
               L420,50 
               L430,20 
               L440,80 
               L450,20 
               L460,50 
               L500,50"
            fill="none"
            strokeWidth="1.5"
            stroke="#FF0000"
          />
          {/* Animasyon için aynı path'in tekrarı */}
          <path
            className="ekg-path"
            d="M0,50 
               L100,50 
               L120,50 
               L130,20 
               L140,80 
               L150,20 
               L160,50 
               L200,50
               L220,50 
               L230,20 
               L240,80 
               L250,20 
               L260,50 
               L300,50
               L320,50 
               L330,20 
               L340,80 
               L350,20 
               L360,50 
               L400,50
               L420,50 
               L430,20 
               L440,80 
               L450,20 
               L460,50 
               L500,50"
            fill="none"
            strokeWidth="1.5"
            stroke="#FF0000"
          />
        </svg>
      </div>
    </div>
  );
};

export default EkgLine; 