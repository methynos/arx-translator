import React from 'react';

export default function Footer({ onNavigate }) {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <h4>Product</h4>
            <button onClick={() => onNavigate('home')}>Translator</button>
            <button onClick={() => onNavigate('pricing')}>Pricing</button>
          </div>
          <div>
            <h4>Legal</h4>
            <button onClick={() => onNavigate('terms')}>Terms</button>
            <button onClick={() => onNavigate('privacy')}>Privacy</button>
          </div>
          <div>
            <h4>Payment</h4>
            <p>💬 Discord Payment</p>
            <p>Manual verification</p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2025 ARX  — Code Translator</p>
          <p>Made with ❤️ by methy</p>
        </div>
      </div>
    </footer>
  );
}