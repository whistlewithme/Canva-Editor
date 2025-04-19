import { useSelector, useDispatch } from 'react-redux';
import { setZoom, undoChange, redoChange, resetToInitial } from '../../redux/editorSlice';
import './Controls.css';
import React, { useState, useEffect } from 'react';


const Controls = () => {
  const [isShiftPressed, setIsShiftPressed] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Shift') setIsShiftPressed(true);
    };
    const handleKeyUp = (e) => {
      if (e.key === 'Shift') setIsShiftPressed(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const dispatch = useDispatch();
  const { zoom, history, future } = useSelector(state => state.editor);

  // Define zoom increment/decrement amount
  const minZoom = -0.4; // Allow zooming out to 40%
  const maxZoom = 3.0;

  const handleZoomIn = () => {
    if (isShiftPressed) {
      window.dispatchEvent(new CustomEvent('resizeStencil', { detail: { type: 'increase' } }));
    } else {
      const newZoom = Math.min(zoom * 1.05, maxZoom);
      dispatch(setZoom(newZoom));
    }
  };

  const handleZoomOut = () => {
    if (isShiftPressed) {
      window.dispatchEvent(new CustomEvent('resizeStencil', { detail: { type: 'decrease' } }));
    } else {
      const newZoom = Math.max(zoom * 0.95, minZoom);
      dispatch(setZoom(newZoom));
    }
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
  const isDisabled = false;

  return (
    <div className="controls">
      <div className="zoom-controls">
        <button
          className="control-button"
          onClick={handleZoomOut}
          disabled={isDisabled || zoom <= minZoom}
          aria-label="Zoom out"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 12H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        <button
          className="control-button"
          onClick={handleZoomIn}
          disabled={isDisabled || zoom >= maxZoom}
          aria-label="Zoom in"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 6V18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M6 12H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="reset-controls">
        <button
          className="reset-button"
          onClick={handleUndo}
          disabled={isDisabled || history.length === 0}
          aria-label="Undo"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 16L4 12L10 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M4 12H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          className="reset-button"
          onClick={handleRedo}
          disabled={isDisabled || future.length === 0}
          aria-label="Redo"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 8L20 12L14 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M20 12H4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          className="reset-button"
          onClick={handleReset}
          disabled={isDisabled}
          aria-label="Reset"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 4V8H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M9 20V16H5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M20 9L15 4L8 11L4 15L9 20L16 13L20 9Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Controls; 