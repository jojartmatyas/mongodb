import React, { useEffect } from 'react';

// Interaktív parallax + részecske generátor
export default function FXController({ particles = 18 }) {
  useEffect(() => {
    const root = document.documentElement;
    function handleMove(e) {
      const x = (e.clientX / window.innerWidth) * 2 - 1; // -1 .. 1
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      root.style.setProperty('--px', x.toFixed(4));
      root.style.setProperty('--py', y.toFixed(4));
    }
    window.addEventListener('pointermove', handleMove, { passive: true });
    return () => window.removeEventListener('pointermove', handleMove);
  }, []);

  return (
    <div className="fx-particles" aria-hidden>
      {Array.from({ length: particles }).map((_, i) => {
        const delay = (Math.random() * 12).toFixed(2);
        const size = 4 + Math.random() * 10;
        const left = Math.random() * 100;
        const duration = 12 + Math.random() * 18;
        const style = {
          '--delay': `${delay}s`,
          '--dur': `${duration}s`,
          '--sx': `${(Math.random() * 2 - 1).toFixed(2)}`,
          '--fx-size': `${size}px`,
          left: `${left}%`
        };
        return <span key={i} className="p" style={style} />;
      })}
    </div>
  );
}
