// PriceComp.jsx
import React from 'react';
import './PriceComp.css';

const PriceComp = () => {
  return (
    <div className="pricing-container">
      <h1 className="pricing-title">Plans and Pricing</h1>
      <p className="pricing-subtitle">Receive unlimited credits when you join Anna’s pricing plans and select your needs.</p>

      <div className="plans">
        {/* Free Plan */}
        <div className="plan-card">
          <h2 className="plan-title">Free</h2>
          <p className="plan-price">$0</p>
          <ul className="plan-features">
            <li>For hobby projects</li>
            <li>Basic components</li>
            <li>Limited support</li>
          </ul>
          <button className="plan-button">Get started for free</button>
        </div>

        {/* Pro Plan */}
        <div className="plan-card highlighted">
          <h2 className="plan-title">Pro <span className="plan-badge">Popular</span></h2>
          <p className="plan-price">$85</p>
          <ul className="plan-features">
            <li>Advanced components</li>
            <li>Custom design options</li>
            <li>Priority support</li>
          </ul>
          <button className="plan-button">Get started with Pro</button>
        </div>

        {/* Enterprise Plan */}
        <div className="plan-card">
          <h2 className="plan-title">Enterprise</h2>
          <p className="plan-price">Custom</p>
          <ul className="plan-features">
            <li>For multiple teams</li>
            <li>Dedicated design solutions</li>
            <li>24/7 support</li>
          </ul>
          <button className="plan-button">Get started with Enterprise</button>
        </div>
      </div>
    </div>
  );
};

export default PriceComp;