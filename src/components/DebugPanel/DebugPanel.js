import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import './DebugPanel.css';

const DebugPanel = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const state = useSelector(state => state.editor);
  
  return (
    <div className={`debug-panel ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="debug-header" onClick={() => setIsExpanded(!isExpanded)}>
        <h4>Debug Info {isExpanded ? '▼' : '▶'}</h4>
      </div>
      {isExpanded && (
        <div className="debug-content">
          <pre>{JSON.stringify({
            hasImage: !!state.image,
            imageType: state.image ? state.image.type : 'none',
            imageProps: state.image ? {
              width: state.image.width,
              height: state.image.height
            } : 'none',
            zoom: state.zoom,
            position: state.position,
            stencilLoaded: state.stencilLoaded
          }, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default DebugPanel; 