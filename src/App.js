import React, { useState } from 'react';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import StencilEditor from './components/StencilEditor/StencilEditor';
import WelcomeAnimation from './components/WelcomeAnimation/WelcomeAnimation';
import './App.css';

function App() {
  const [showWelcome, setShowWelcome] = useState(true);

  const handleAnimationComplete = () => {
    setShowWelcome(false);
  };

  return (
    <Provider store={store}>
      <div className="App">
        {showWelcome && <WelcomeAnimation onComplete={handleAnimationComplete} />}
        <StencilEditor />
      </div>
    </Provider>
  );
}

export default App; 