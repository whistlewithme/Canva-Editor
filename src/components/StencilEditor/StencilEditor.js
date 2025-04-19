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
      <div className="editor-header">
        <div className="app-logo">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 16V8.00002C21 6.34317 19.6569 5.00002 18 5.00002H6C4.34315 5.00002 3 6.34317 3 8.00002V16C3 17.6569 4.34315 19 6 19H18C19.6569 19 21 17.6569 21 16Z" stroke="#4ca1af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3 16L8.22999 10.77C8.63274 10.3673 9.36128 10.3673 9.76404 10.77L14.24 15.246C14.6427 15.6488 15.3713 15.6488 15.774 15.246L17 14.02C17.4027 13.6173 18.1313 13.6173 18.534 14.02L21 16.5" stroke="#2c3e50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 10C16.5523 10 17 9.55228 17 9C17 8.44772 16.5523 8 16 8C15.4477 8 15 8.44772 15 9C15 9.55228 15.4477 10 16 10Z" fill="#4ca1af" stroke="#4ca1af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Stencil Editor</span>
        </div>
      </div>
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