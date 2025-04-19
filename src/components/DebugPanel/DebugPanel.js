import React from 'react';
import { useSelector } from 'react-redux';

const DebugPanel = () => {
  const state = useSelector(state => state.editor);
  
  return (
    <div style={{ 
      position: 'fixed', 
      bottom: 0, 
      right: 0, 
      background: 'rgba(0,0,0,0.7)', 
      color: 'white',
      padding: '10px',
      fontSize: '12px',
      fontFamily: 'monospace',
      maxWidth: '300px',
      zIndex: 9999
    }}>
      <h4>Debug State:</h4>
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
  );
};

export default DebugPanel; 