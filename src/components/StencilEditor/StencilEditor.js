import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Canvas from '../Canvas/Canvas';
import Controls from '../Controls/Controls';
import ImageUpload from '../ImageUpload/ImageUpload';
import DebugPanel from '../DebugPanel/DebugPanel';
import { setCanvasSize } from '../../redux/editorSlice';
import './StencilEditor.css';

const StencilEditor = () => {
  const dispatch = useDispatch();
  const { canvasSize, stencilShape } = useSelector(state => state.editor);
  const [width, setWidth] = useState(canvasSize.width);
  const [height, setHeight] = useState(canvasSize.height);
  const [maxWidth, setMaxWidth] = useState(2000);
  const [maxHeight, setMaxHeight] = useState(2000);
  
  const containerRef = useRef(null);

  // Calculate max dimensions based on container size
  useEffect(() => {
    const updateMaxDimensions = () => {
      if (containerRef.current) {
        // Get the container dimensions, accounting for padding and borders
        const containerRect = containerRef.current.getBoundingClientRect();
        // Subtract some padding to ensure it fits within the container
        const availableWidth = containerRect.width - 40; // 20px padding on each side
        const availableHeight = containerRect.height - 40;
        
        setMaxWidth(Math.floor(availableWidth));
        setMaxHeight(Math.floor(availableHeight));
        
        // If current dimensions exceed the new max, adjust them
        if (width > availableWidth) {
          setWidth(Math.floor(availableWidth));
        }
        if (height > availableHeight) {
          setHeight(Math.floor(availableHeight));
        }
      }
    };

    // Initial calculation
    updateMaxDimensions();
    
    // Recalculate on window resize
    window.addEventListener('resize', updateMaxDimensions);
    
    return () => {
      window.removeEventListener('resize', updateMaxDimensions);
    };
  }, [width, height]);

  // Update local state when Redux state changes
  useEffect(() => {
    setWidth(canvasSize.width);
    setHeight(canvasSize.height);
  }, [canvasSize]);

  const handleWidthChange = (e) => {
    const newWidth = parseInt(e.target.value, 10);
    if (!isNaN(newWidth) && newWidth > 0 && newWidth <= maxWidth) {
      setWidth(newWidth);
    }
  };

  const handleHeightChange = (e) => {
    const newHeight = parseInt(e.target.value, 10);
    if (!isNaN(newHeight) && newHeight > 0 && newHeight <= maxHeight) {
      setHeight(newHeight);
    }
  };

  const handleSizeUpdate = () => {
    // Ensure dimensions don't exceed container
    const validatedWidth = Math.min(width, maxWidth);
    const validatedHeight = Math.min(height, maxHeight);
    
    dispatch(setCanvasSize({ 
      width: validatedWidth, 
      height: validatedHeight 
    }));
  };

  return (
    <div className="stencil-editor">
      <div className="editor-header">
        <div className="app-logo">
          <img src="./assets/appypie-logo.svg" alt="Appy Pie" />
        </div>
        
        <div className="canvas-size-controls">
          <div className="size-input-group">
            <label htmlFor="canvas-width">Width:</label>
            <input 
              id="canvas-width"
              type="number" 
              value={width} 
              onChange={handleWidthChange}
              min="300"
              max={maxWidth}
            />
          </div>
          <div className="size-input-group">
            <label htmlFor="canvas-height">Height:</label>
            <input 
              id="canvas-height"
              type="number" 
              value={height} 
              onChange={handleHeightChange}
              min="300"
              max={maxHeight}
            />
          </div>
          <button 
            className="apply-size-button"
            onClick={handleSizeUpdate}
          >
            Apply Size
          </button>
        </div>
      </div>
      <div className="editor-container" ref={containerRef}>
        <Canvas />
        <div className="editor-sidebar">
          <ImageUpload />
          <Controls />
            <div className="empty-state">
              <p>Instructions</p>
              <p>1. You can resize the canvas using Width and Height controls (Top Right Corner)</p>
              <p>2. Press Shift Key to Move or Resize the {stencilShape.charAt(0).toUpperCase() + stencilShape.slice(1)} Stencil</p>
            </div>
        </div>
      </div>
      <DebugPanel />
    </div>
  );
};

export default StencilEditor; 
