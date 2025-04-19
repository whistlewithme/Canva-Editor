import React, { useRef } from 'react';
import { useDispatch } from 'react-redux';
import { setImageData } from '../../redux/editorSlice';
import { loadImageFromFile } from '../../utils/fabricUtils';
import './ImageUpload.css';

const ImageUpload = () => {
  const fileInputRef = useRef(null);
  const dispatch = useDispatch();
  
  const handleUploadClick = () => {
    fileInputRef.current.click();
  };
  
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('File selected:', file.name, file.type, file.size);
      try {
        // Store only the base64 data in Redux
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageData = e.target.result; // This is a base64 string
          dispatch(setImageData(imageData));
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Error loading image:', error);
        alert('Failed to load image. Please try another file.');
      }
    }
  };
  
  return (
    <div className="image-upload">
      <button 
        className="upload-button" 
        onClick={handleUploadClick}
      >
        Upload Image
      </button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default ImageUpload; 