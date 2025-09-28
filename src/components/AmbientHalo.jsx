import React from 'react';

// Egyszerűsített, csak CSS animációt használó háttér halo.
// A korábbi JS frame-by-frame mozgatást kivettük az átláthatóság és minimális kód érdekében.
// count: hány réteg (kevesebb = visszafogottabb, több = erősebb fény)
export default function AmbientHalo({ count = 5 }) {
  return (
    <div className="ambient-halo" aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} className="halo" style={{ '--i': i }} />
      ))}
    </div>
  );
}
