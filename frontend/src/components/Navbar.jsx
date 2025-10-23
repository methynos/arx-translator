import React, { useState } from 'react';
import { Menu, X, LogOut } from 'lucide-react';

export default function Navbar({ user, onLogout, onLogin, onSignup, onNavigate }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <div className="navbar-brand" onClick={() => onNavigate('home')}>
            <div className="logo">ARX</div>
            <span>v3</span>
          </div>

          <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X /> : <Menu />}
          </button>

          <div className={`navbar-menu ${menuOpen ? 'open' : ''}`}>
            <button onClick={() => { onNavigate('home'); setMenuOpen(false); }}>Translate</button>
            <button onClick={() => { onNavigate('pricing'); setMenuOpen(false); }}>Pricing</button>

            {user ? (
              <>
                <button onClick={() => { onNavigate('dashboard'); setMenuOpen(false); }}>Dashboard</button>
                <button className="btn btn-primary" onClick={() => { onLogout(); setMenuOpen(false); }}>
                  <LogOut size={16} /> Logout
                </button>
              </>
            ) : (
              <>
                <button className="btn btn-secondary" onClick={() => { onLogin(); setMenuOpen(false); }}>
                  Login
                </button>
                <button className="btn btn-primary" onClick={() => { onSignup(); setMenuOpen(false); }}>
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}