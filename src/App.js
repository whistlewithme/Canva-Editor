import React from 'react';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import StencilEditor from './components/StencilEditor/StencilEditor';
import './App.css';

function App() {
  return (
    <Provider store={store}>
      <div className="App">
        <StencilEditor />
      </div>
    </Provider>
  );
}

export default App; 