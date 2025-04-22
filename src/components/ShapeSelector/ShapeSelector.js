import React from 'react';
import { useDispatch } from 'react-redux';
import { setStencilShape } from '../../redux/editorSlice';
import './ShapeSelector.css';

const ShapeSelector = ({ onComplete }) => {
  const dispatch = useDispatch();
  
  const handleShapeSelect = (shape) => {
    dispatch(setStencilShape(shape));
    if (onComplete) onComplete();
  };
  
  return (
    <div className="shape-selector">
      <div className="shape-selector-content">
        <h2>Select Stencil Shape</h2>
        <div className="shape-options">
          <div 
            className="shape-option" 
            onClick={() => handleShapeSelect('rectangle')}
          >
            <div className="shape-preview">
              <svg width="100" height="100" viewBox="0 0 100 100">
                <rect x="5" y="5" width="90" height="90" rx="10" ry="10" 
                  fill="rgba(255,255,255,0.2)" stroke="#333" strokeWidth="2" />
              </svg>
            </div>
            <span>Rectangle</span>
          </div>
          
          <div 
            className="shape-option" 
            onClick={() => handleShapeSelect('triangle')}
          >
            <div className="shape-preview">
              <svg width="100" height="100" viewBox="0 0 100 100">
                <polygon points="50,10 10,90 90,90" 
                  fill="rgba(255,255,255,0.2)" stroke="#333" strokeWidth="2" />
              </svg>
            </div>
            <span>Triangle</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShapeSelector; 