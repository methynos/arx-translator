import React from 'react';

export default function PricingCard({ name, price, description, features, button, popular }) {
  return (
    <div className={`pricing-card card ${popular ? 'popular' : ''}`}>
      {popular && <div className="popular-badge">POPULAR</div>}
      
      <h3>{name}</h3>
      <p className="description">{description}</p>
      
      <div className="price">
        <span className="amount">{price}</span>
        {!name.includes('Permanent') && <span className="period">/month</span>}
      </div>

      <ul className="features">
        {features.map((feature, i) => (
          <li key={i}>{feature}</li>
        ))}
      </ul>

      <button className="btn btn-primary" onClick={button.onClick}>
        {button.text}
      </button>
    </div>
  );
}