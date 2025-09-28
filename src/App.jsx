import React from 'react';
import AuthCard from './components/AuthCard.jsx';
import BackgroundFX from './components/BackgroundFX.jsx';
import FXController from './components/FXController.jsx';
import AmbientHalo from './components/AmbientHalo.jsx';

export default function App() {
  return (
    <div className="app-bg">
      <div className="bg-image-overlay" />
  <BackgroundFX />
  <AmbientHalo />
  <FXController />
  <h1 className="site-title animated-title">Üdvözöljük Önt a<br /><span>Nudli</span> oldalon!</h1>
      <AuthCard />
    </div>
  );
}