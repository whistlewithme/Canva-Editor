import React, { useEffect } from 'react';
import './WelcomeAnimation.css';

const WelcomeAnimation = ({ onComplete }) => {
  // No state needed, we'll use CSS animations only
  
  useEffect(() => {
    // Wait 3 seconds then call onComplete
    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [onComplete]);
  
  return (
    <div className="welcome-animation">
      <div className="welcome-content">
        <div className="welcome-logo">
          <img src="./assets/appypie-logo.svg" alt="Appy Pie Logo" />
        </div>
        <div className="loading-bar">
          <div className="loading-progress"></div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeAnimation; 