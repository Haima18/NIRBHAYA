import React from 'react';

export const Footer: React.FC = () => (
  <footer className="app-footer">
    <div className="app-footer__inner">
      <div>
        <strong>NIRBHAYA</strong>
        <p>Your safety. Your voice. Your choice.</p>
      </div>

      <p className="app-footer__note">
        Protective technology, evidence logging, and guidance — not an emergency dispatcher, court, or police
        authority. In immediate danger, call <a href="tel:112">112</a> or go to the nearest police station.
      </p>
    </div>
  </footer>
);
