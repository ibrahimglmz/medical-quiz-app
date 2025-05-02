import { render, screen } from '@testing-library/react';
import App from './App';
import sorular from './sorular/sorular';

test('Her seviyede 4 soru olmalı', () => {
  render(<App />);
  
  // Her seviyede 4 soru var mı kontrol et
  Object.keys(sorular).forEach(seviye => {
    expect(sorular[seviye].length).toBe(4);
  });
  
  // Toplam 4 seviye var mı kontrol et
  expect(Object.keys(sorular).length).toBe(4);
});
