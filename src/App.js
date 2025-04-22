import React, { useState } from 'react';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import StencilEditor from './components/StencilEditor/StencilEditor';
import WelcomeAnimation from './components/WelcomeAnimation/WelcomeAnimation';
import ShapeSelector from './components/ShapeSelector/ShapeSelector';
import './App.css';

function App() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [showShapeSelector, setShowShapeSelector] = useState(false);

  const handleAnimationComplete = () => {
    setShowWelcome(false);
    setShowShapeSelector(true);
  };

  const handleShapeSelected = () => {
    setShowShapeSelector(false);
  };

  return (
    <Provider store={store}>
      <div className="App">
        {showWelcome && <WelcomeAnimation onComplete={handleAnimationComplete} />}
        {showShapeSelector && <ShapeSelector onComplete={handleShapeSelected} />}
        <StencilEditor />
      </div>
    </Provider>
  );
}

export default App; 