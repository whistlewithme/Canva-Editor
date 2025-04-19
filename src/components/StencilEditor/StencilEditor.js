import React from 'react';
import { useSelector } from 'react-redux';
import Canvas from '../Canvas/Canvas';
import Controls from '../Controls/Controls';
import ImageUpload from '../ImageUpload/ImageUpload';
import DebugPanel from '../DebugPanel/DebugPanel';
import './StencilEditor.css';

const StencilEditor = () => {
  const { image } = useSelector(state => state.editor);
  
  return (
    <div className="stencil-editor">
      <h1>Canvas Stencil Editor</h1>
      <div className="editor-container">
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
        </div>
      </div>
      <DebugPanel />
    </div>
  );
};

export default StencilEditor; 