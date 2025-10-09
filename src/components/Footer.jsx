import React from 'react';
import logo from '../assets/nudli-logo.svg';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="nf-footer" role="contentinfo">
      <div className="nf-footer__container">
        <div className="nf-footer__top">
          <div className="nf-footer__brand">
            <img src={logo} alt="Nudli Fordító logó" className="nf-footer__logo" width={64} height={64} />
            <div className="nf-footer__brandText">
              <strong className="nf-footer__title">Nudli Fordító</strong><br />
              <span className="nf-footer__tagline">Gyors & egyszerű fordítás</span>
            </div>
          </div>
          <nav aria-label="Hasznos linkek" className="nf-footer__nav">
            <ul className="nf-footer__links">
              <li><a href="/docs">Dokumentáció</a></li>
              <li><a href="https://github.com/felhasznalo/nudli-fordito" target="_blank" rel="noopener noreferrer">Forráskód</a></li>
            </ul>
          </nav>
        </div>
        <div className="nf-footer__bottom">
          <small className="nf-footer__copy">© {year} Nudli Fordító</small>
        </div>
      </div>
    </footer>
  );
}
