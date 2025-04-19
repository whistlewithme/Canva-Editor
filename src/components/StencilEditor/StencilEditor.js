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
  const { image, canvasSize } = useSelector(state => state.editor);
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
          <svg width="52" height="52" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#4ca1af', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#2c3e50', stopOpacity: 1 }} />
              </linearGradient>
            </defs>
            <rect x="3" y="4" width="18" height="16" rx="3" ry="3" stroke="url(#grad)" stroke-width="2" fill="none" />
            <circle cx="8" cy="8" r="2" fill="url(#grad)" />
            <path d="M3 17L9 11C9.5 10.5 10.5 10.5 11 11L15 15L17 13C17.5 12.5 18.5 12.5 19 13L21 15" stroke="url(#grad)" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <span>Stencil Editor</span>
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
          {!image && (
            <div className="empty-state">
              <p>Upload an image to get started</p>
              <p>You can then zoom and move the image within the stencil frame</p>
            </div>
          )}
          {image && (
            <div className="image-info">
              <p>Image dimensions: {image.width}x{image.height}</p>
              <p>Image type: {image.type}</p>
            </div>
          )}
        </div>
      </div>
      <DebugPanel />
    </div>
  );
};

export default StencilEditor; 