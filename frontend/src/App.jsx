import React, { useState, useEffect } from 'react';
import { Copy, Download, Trash2, Zap, Code, GitBranch, Menu, X, LogOut, Settings, CreditCard, Lock, Unlock, Check, Star, ArrowRight, Mail } from 'lucide-react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import CodeEditor from './components/CodeEditor';
import PricingCard from './components/PricingCard';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const App = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('home');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Translator state
  const [sourceCode, setSourceCode] = useState('function hello(name) {\n  console.log(`Hello, ${name}!`);\n}');
  const [translatedCode, setTranslatedCode] = useState('');
  const [sourceLang, setSourceLang] = useState('javascript');
  const [targetLang, setTargetLang] = useState('python');
  const [translating, setTranslating] = useState(false);
  const [history, setHistory] = useState([]);

  const languages = ['JavaScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'PHP', 'Ruby', 'TypeScript'];

  // Load user from localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchCurrentUser(token);
    }
  }, []);

  const fetchCurrentUser = async (token) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const user = await response.json();
        setCurrentUser(user);
      } else {
        localStorage.removeItem('token');
      }
    } catch (err) {
      console.error('Error fetching user:', err);
    }
  };

  const handleLogin = async (email, password) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      setCurrentUser(data.user);
      setShowAuthModal(false);
      setError('');
      setSuccess('✅ Logged in successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (email, password, name) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      setCurrentUser(data.user);
      setShowAuthModal(false);
      setError('');
      setSuccess('✅ Account created successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
    setCurrentPage('home');
    setSuccess('✅ Logged out successfully!');
  };

  const handleTranslate = async () => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }

    try {
      setTranslating(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/translations/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ sourceCode, sourceLang, targetLang })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }

      const data = await response.json();
      setTranslatedCode(data.outputCode);
      setSuccess('✅ Code translated successfully!');
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setTranslating(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setSuccess('✅ Copied to clipboard!');
  };

  const handleDownload = (text, lang) => {
    const extensions = { javascript: 'js', python: 'py', java: 'java', 'c++': 'cpp', 'c#': 'cs', go: 'go', rust: 'rs', php: 'php', ruby: 'rb', typescript: 'ts' };
    const element = document.createElement('a');
    element.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(text)}`);
    element.setAttribute('download', `code.${extensions[lang.toLowerCase()] || 'txt'}`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Home page
  const HomePage = () => (
    <>
      {!currentUser && (
        <section className="hero">
          <h1>Translate Code Between Any Languages</h1>
          <p>Instantly convert code snippets between 10+ programming languages — powered by AI</p>
          <div className="hero-buttons">
            <button className="btn btn-primary" onClick={() => { setAuthMode('signup'); setShowAuthModal(true); }}>
              Get Started Free
            </button>
            <button className="btn btn-secondary" onClick={() => setCurrentPage('pricing')}>
              View Pricing
            </button>
          </div>
        </section>
      )}

      <section className="translator-section">
        <div className="container">
          <div className="editor-grid">
            <CodeEditor
              label="Source Code"
              value={sourceCode}
              onChange={setSourceCode}
              language={sourceLang}
              onLanguageChange={setSourceLang}
              languages={languages}
              readOnly={false}
            />

            <CodeEditor
              label="Translated Code"
              value={translatingCode}
              onChange={() => {}}
              language={targetLang}
              onLanguageChange={setTargetLang}
              languages={languages}
              readOnly={true}
              isLoading={translating}
            />
          </div>

          <div className="action-buttons">
            <button
              className="btn btn-primary"
              onClick={handleTranslate}
              disabled={!sourceCode || translating}
            >
              <Zap size={18} /> {translating ? 'Translating...' : 'Translate'}
            </button>
            <button className="btn btn-secondary" onClick={() => handleCopy(translatedCode)} disabled={!translatedCode}>
              <Copy size={18} /> Copy
            </button>
            <button className="btn btn-secondary" onClick={() => handleDownload(translatedCode, targetLang)} disabled={!translatedCode}>
              <Download size={18} /> Download
            </button>
            <button className="btn btn-secondary" onClick={() => setSourceCode('')}>
              <Trash2 size={18} /> Clear
            </button>
          </div>

          {error && <div className="text-error">❌ {error}</div>}
          {success && <div className="text-success">{success}</div>}
        </div>
      </section>

      <section className="ai-engine">
        <div className="container">
          <Zap size={32} className="icon" />
          <h2>Powered by Advanced AI</h2>
          <p>Our AI engine intelligently translates code while preserving logic and maintaining performance.</p>
        </div>
      </section>
    </>
  );

  // Pricing page
  const PricingPage = () => (
    <section className="pricing-section">
      <div className="container">
        <h1>Simple, Transparent Pricing</h1>
        <p>Choose the plan that fits your needs</p>

        <div className="pricing-grid">
          <PricingCard
            name="Free"
            price="€0"
            description="Perfect for getting started"
            features={[
              '✓ Up to 100 lines',
              '✓ 3 languages',
              '✗ Explain & Optimize',
              '✗ Translation history'
            ]}
            button={{ text: 'Get Started', onClick: () => { setAuthMode('signup'); setShowAuthModal(true); } }}
            popular={false}
          />

          <PricingCard
            name="Monthly Premium"
            price="€1.99"
            description="Billed monthly"
            features={[
              '✓ Unlimited code',
              '✓ All 10+ languages',
              '✓ Explain & Optimize',
              '✓ Translation history',
              '✓ Auto-renewal'
            ]}
            button={{
              text: 'Upgrade Now',
              onClick: () => currentUser ? setCurrentPage('checkout-monthly') : setShowAuthModal(true)
            }}
            popular={true}
          />

          <PricingCard
            name="Yearly Premium"
            price="€7.99"
            description="Save 66%"
            features={[
              '✓ Unlimited code',
              '✓ All 10+ languages',
              '✓ Explain & Optimize',
              '✓ Translation history',
              '✓ Annual billing'
            ]}
            button={{
              text: 'Upgrade Now',
              onClick: () => currentUser ? setCurrentPage('checkout-yearly') : setShowAuthModal(true)
            }}
            popular={false}
          />

          <PricingCard
            name="Permanent Premium"
            price="€14.99"
            description="One-time payment"
            features={[
              '✓ Unlimited code',
              '✓ All 10+ languages',
              '✓ Explain & Optimize',
              '✓ Translation history',
              '✓ Forever access'
            ]}
            button={{
              text: 'Buy Now',
              onClick: () => currentUser ? setCurrentPage('checkout-permanent') : setShowAuthModal(true)
            }}
            popular={true}
          />
        </div>
      </div>
    </section>
  );

  // Checkout page
  const CheckoutPage = ({ planType }) => {
    const plans = {
      monthly: { name: 'Monthly Premium', price: 1.99 },
      yearly: { name: 'Yearly Premium', price: 7.99 },
      permanent: { name: 'Permanent Premium', price: 14.99 }
    };

    const plan = plans[planType];

    return (
      <section className="checkout-section">
        <div className="container">
          <h1>Complete Your Purchase</h1>

          <div className="checkout-card card">
            <div className="order-summary">
              <h2>Order Summary</h2>
              <div className="summary-item">
                <span>{plan.name}</span>
                <span>€{plan.price}</span>
              </div>
              <div className="summary-total">
                <span>Total</span>
                <span>€{plan.price}</span>
              </div>
            </div>

            <div className="discord-payment">
              <h3>💬 Pay via Discord</h3>
              <p>Send €{plan.price} to the owner on Discord and include your email:</p>
              <input
                type="email"
                value={currentUser?.email || ''}
                readOnly
                className="email-input"
              />

              <button
                className="btn btn-primary"
                onClick={async () => {
                  try {
                    const token = localStorage.getItem('token');
                    const response = await fetch(`${API_URL}/api/payments/create-order`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                      },
                      body: JSON.stringify({ plan_type: planType })
                    });

                    if (!response.ok) throw new Error('Failed to create order');

                    const data = await response.json();
                    setSuccess(`✅ Payment request created. Message ID: ${data.paymentId}`);
                    
                    // Copy payment ID
                    navigator.clipboard.writeText(data.paymentId);
                    setSuccess('✅ Payment ID copied to clipboard!');
                  } catch (err) {
                    setError(err.message);
                  }
                }}
              >
                <CreditCard size={18} /> Complete Payment
              </button>

              <p className="discord-note">
                After sending payment, the owner will manually verify and activate your plan.
              </p>
            </div>

            {error && <div className="text-error">❌ {error}</div>}
            {success && <div className="text-success">{success}</div>}
          </div>
        </div>
      </section>
    );
  };

  // Dashboard page
  const DashboardPage = () => (
    <section className="dashboard-section">
      <div className="container">
        <h1>Dashboard</h1>

        <div className="dashboard-grid">
          <div className="card">
            <h2>Profile</h2>
            <p><strong>Email:</strong> {currentUser?.email}</p>
            <p><strong>Name:</strong> {currentUser?.name}</p>
            <p><strong>Plan:</strong> <span className="badge">{currentUser?.role.toUpperCase()}</span></p>
          </div>

          <div className="card">
            <h2>Usage Stats</h2>
            <p><strong>Translations:</strong> {currentUser?.translations_count || 0}</p>
            <p><strong>Limit:</strong> {currentUser?.role === 'free' ? '100 lines' : 'Unlimited'}</p>
            <button className="btn btn-primary" onClick={() => setCurrentPage('pricing')}>
              Upgrade Plan
            </button>
          </div>
        </div>
      </div>
    </section>
  );

  // Terms page
  const TermsPage = () => (
    <section className="content-section">
      <div className="container">
        <h1>Terms of Service</h1>
        <div className="card">
          <h2>1. Service Description</h2>
          <p>ARX v3 is an AI-powered code translator with Discord payment integration.</p>

          <h2>2. Pricing & Payment</h2>
          <ul>
            <li>Monthly: €1.99/month (auto-renews)</li>
            <li>Yearly: €7.99/year (annual billing)</li>
            <li>Permanent: €14.99 (one-time)</li>
          </ul>

          <h2>3. Cancellation</h2>
          <p>You can request cancellation anytime by contacting the owner on Discord.</p>

          <h2>4. Prohibited Uses</h2>
          <p>Do not use for illegal activities, IP violations, or malware creation.</p>
        </div>
      </div>
    </section>
  );

  // Privacy page
  const PrivacyPage = () => (
    <section className="content-section">
      <div className="container">
        <h1>Privacy Policy</h1>
        <div className="card">
          <h2>Data Collection</h2>
          <p>We collect: email, code snippets, and translation history. We don't sell your data.</p>

          <h2>Data Security</h2>
          <p>Your data is stored securely in SQLite and protected from unauthorized access.</p>

          <h2>Third Parties</h2>
          <p>Code translations are sent to OpenAI. Review their privacy policy.</p>
        </div>
      </div>
    </section>
  );

  return (
    <div className="app">
      <Navbar
        user={currentUser}
        onLogout={handleLogout}
        onLogin={() => { setAuthMode('login'); setShowAuthModal(true); }}
        onSignup={() => { setAuthMode('signup'); setShowAuthModal(true); }}
        onNavigate={setCurrentPage}
      />

      <main className="main-content">
        {currentPage === 'home' && <HomePage />}
        {currentPage === 'pricing' && <PricingPage />}
        {currentPage === 'checkout-monthly' && <CheckoutPage planType="monthly" />}
        {currentPage === 'checkout-yearly' && <CheckoutPage planType="yearly" />}
        {currentPage === 'checkout-permanent' && <CheckoutPage planType="permanent" />}
        {currentPage === 'dashboard' && currentUser && <DashboardPage />}
        {currentPage === 'terms' && <TermsPage />}
        {currentPage === 'privacy' && <PrivacyPage />}
      </main>

      {showAuthModal && (
        <AuthModal
          mode={authMode}
          onLogin={handleLogin}
          onSignup={handleSignup}
          onClose={() => setShowAuthModal(false)}
          onToggleMode={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
          loading={loading}
          error={error}
        />
      )}

      <Footer onNavigate={setCurrentPage} />
    </div>
  );
};

export default App;