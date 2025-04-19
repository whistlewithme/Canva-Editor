import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import './DebugPanel.css';

const DebugPanel = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { image, imageData, stencilPosition } = useSelector(state => state.editor);
  const editorState = useSelector(state => state.editor);
  
  return (
    <div className={`debug-panel ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="debug-header" onClick={() => setIsExpanded(!isExpanded)}>
        <h4>Debug Info {isExpanded ? '▼' : '▶'}</h4>
      </div>
      {isExpanded && (
        <div className="debug-content">
          <div className="debug-section">
            <h4>Image Source</h4>
            {image ? (
              <div>
                <p>Source: {image.src ? 'User Upload' : 'Unknown'}</p>
                <p>Dimensions: {image.width}x{image.height}</p>
                <p>Type: {image.type}</p>
                <p>Last Modified: {image.lastModified ? new Date(image.lastModified).toLocaleString() : 'N/A'}</p>
              </div>
            ) : imageData ? (
              <div>
                <p>Source: User Upload (Base64)</p>
                <p>Data Length: {imageData.length} characters</p>
                <p>Type: {imageData.startsWith('data:image/jpeg') ? 'JPEG' : 
                         imageData.startsWith('data:image/png') ? 'PNG' : 
                         imageData.startsWith('data:image/gif') ? 'GIF' : 'Unknown'}</p>
              </div>
            ) : (
              <p>No image loaded</p>
            )}
          </div>
          
          <div className="debug-section">
            <h4>Stencil Position</h4>
            <p>X: {stencilPosition?.x || 'Not set'}</p>
            <p>Y: {stencilPosition?.y || 'Not set'}</p>
            <p>Width: {stencilPosition?.width || 'Default'}</p>
            <p>Height: {stencilPosition?.height || 'Default'}</p>
          </div>
          
          <div className="debug-section">
            <h4>Editor State</h4>
            <pre>{JSON.stringify(editorState, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default DebugPanel; 