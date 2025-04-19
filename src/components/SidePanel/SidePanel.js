import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setImageData, addStencil } from '../../redux/editorSlice';
import './SidePanel.css';

// Predefined stencil shapes
const stencilTemplates = [
  { name: 'Rectangle', shape: 'rect', width: 300, height: 200 },
  { name: 'Square', shape: 'rect', width: 250, height: 250 },
  { name: 'Circle', shape: 'circle', width: 250, height: 250 }
];

const SidePanel = () => {
  const dispatch = useDispatch();
  const [uploadedImages, setUploadedImages] = useState([]);
  
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target.result;
        
        // Add the image to the uploaded images array
        setUploadedImages(prev => [...prev, imageUrl]);
        
        // Also set it as the current image data (optional)
        dispatch(setImageData(imageUrl));
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleImageDragStart = (e, imageUrl) => {
    console.log('Drag started with image:', imageUrl);
    
    // Set the drag data
    e.dataTransfer.setData('image/url', imageUrl);
    e.dataTransfer.setData('text/plain', imageUrl);
    e.dataTransfer.effectAllowed = 'copy';
    
    // Create a drag image
    const img = new Image();
    img.src = imageUrl;
    e.dataTransfer.setDragImage(img, 10, 10);
  };
  
  const handleStencilClick = (template) => {
    dispatch(addStencil(template));
  };
  
  return (
    <div className="side-panel">
      <div className="panel-section">
        <h3>Upload Image</h3>
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleImageUpload} 
          className="file-input"
        />
      </div>
      
      <div className="panel-section">
        <h3>Images</h3>
        <div className="image-gallery">
          {uploadedImages.map((imageUrl, index) => (
            <div 
              key={index}
              className="gallery-item"
              draggable
              onDragStart={(e) => handleImageDragStart(e, imageUrl)}
            >
              <img src={imageUrl} alt={`Uploaded ${index + 1}`} />
            </div>
          ))}
          {uploadedImages.length === 0 && (
            <div className="empty-gallery">
              No images uploaded yet
            </div>
          )}
        </div>
      </div>
      
      <div className="panel-section">
        <h3>Stencils</h3>
        <div className="stencil-gallery">
          {stencilTemplates.map((template, index) => (
            <div 
              key={index}
              className="stencil-item"
              onClick={() => handleStencilClick(template)}
            >
              <div 
                className={`stencil-preview ${template.shape}`}
                style={{ 
                  width: template.width / 5, 
                  height: template.height / 5 
                }}
              ></div>
              <span>{template.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SidePanel; 