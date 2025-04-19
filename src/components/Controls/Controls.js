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
        >
          -
        </button>
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