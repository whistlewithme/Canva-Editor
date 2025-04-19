import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setZoom, undoChange, redoChange, resetToInitial } from '../../redux/editorSlice';
import './Controls.css';

const Controls = () => {
  const dispatch = useDispatch();
  const { imageData, zoom, history, future } = useSelector(state => state.editor);
  
  // Define zoom increment/decrement amount
  const minZoom = 0.4; // Allow zooming out to 40%
  const maxZoom = 3.0;
  
  const handleZoomIn = () => {
    console.log('Zoom in clicked, current zoom:', zoom);
    // Use a smaller multiplier for smoother zooming
    const newZoom = Math.min(zoom * 1.05, maxZoom);
    console.log('Setting new zoom:', newZoom);
    dispatch(setZoom(newZoom));
  };
  
  const handleZoomOut = () => {
    console.log('Zoom out clicked, current zoom:', zoom);
    // Use a smaller multiplier for smoother zooming
    const newZoom = Math.max(zoom * 0.95, minZoom);
    console.log('Setting new zoom:', newZoom);
    dispatch(setZoom(newZoom));
  };
  
  const handleUndo = () => {
    dispatch(undoChange());
  };
  
  const handleRedo = () => {
    dispatch(redoChange());
  };
  
  const handleReset = () => {
    dispatch(resetToInitial());
  };
  
  // Disable controls if no image is loaded
  const isDisabled = !imageData;
  
  return (
    <div className="controls">
      <div className="zoom-controls">
        <button 
          className="control-button" 
          onClick={handleZoomOut}
          disabled={isDisabled || zoom <= minZoom}
        >
          -
        </button>
        <span className="zoom-level">{Math.round(zoom * 100)}%</span>
        <button 
          className="control-button" 
          onClick={handleZoomIn}
          disabled={isDisabled || zoom >= maxZoom}
        >
          +
        </button>
      </div>
      
      <div className="reset-controls">
        <button 
          className="reset-button"
          onClick={handleUndo}
          disabled={isDisabled || history.length === 0}
        >
          Undo
        </button>
        <button 
          className="reset-button"
          onClick={handleRedo}
          disabled={isDisabled || future.length === 0}
        >
          Redo
        </button>
        <button 
          className="reset-button"
          onClick={handleReset}
          disabled={isDisabled}
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default Controls; 