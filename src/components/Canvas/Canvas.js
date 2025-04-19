import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Canvas as FabricCanvas, Image as FabricImage } from 'fabric';
import { 
  createStencil, 
  createClippingMask, 
  fitImageToStencil,
  updateImagePosition,
  updateImageZoom,
  updateStencilPosition
} from '../../utils/fabricUtils';
import { 
  setStencilLoaded, 
  setPosition, 
  setZoom, 
  setStencilPosition 
} from '../../redux/editorSlice';
import './Canvas.css';

const Canvas = () => {
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const stencilRef = useRef(null);
  const imageRef = useRef(null);
  
  const dispatch = useDispatch();
  // Get all needed state from Redux
  const { 
    image, 
    imageData, 
    zoom, 
    position, 
    stencilPosition, 
    stencilLoaded 
  } = useSelector(state => state.editor);
  
  const [dragStartPosition, setDragStartPosition] = useState(null);
  const [stencilDragStart, setStencilDragStart] = useState(null);
  const [dragMode, setDragMode] = useState('image'); // 'image' or 'stencil'
  
  // Initialize canvas - make it larger to allow stencil movement
  useEffect(() => {
    console.log('Initializing canvas');
    const canvas = new FabricCanvas('canvas', {
      width: 1000,
      height: 800,
      selection: false,
      backgroundColor: '#f0f0f0' // Light gray background
    });
    
    console.log('Canvas created:', canvas);
    fabricCanvasRef.current = canvas;
    
    // Create stencil - now make it selectable and movable
    const stencil = createStencil(canvas, 600, 400);
    console.log('Stencil created:', stencil);
    stencilRef.current = stencil;
    
    // Make sure to set stencilLoaded to true
    dispatch(setStencilLoaded(true));
    
    // Set up stencil movement events
    stencil.on('moving', (e) => {
      if (imageRef.current) {
        // Move the image along with the stencil
        imageRef.current.left += (stencil.left - stencil._previousLeft);
        imageRef.current.top += (stencil.top - stencil._previousTop);
        
        // Update the clipPath position
        if (imageRef.current.clipPath) {
          imageRef.current.clipPath.left = stencil.left;
          imageRef.current.clipPath.top = stencil.top;
        }
        
        canvas.renderAll();
      }
      
      // Store previous position for next move
      stencil._previousLeft = stencil.left;
      stencil._previousTop = stencil.top;
    });
    
    stencil.on('mousedown', (e) => {
      // Store starting position for history
      setStencilDragStart({
        x: stencil.left,
        y: stencil.top
      });
      
      // Store previous position for movement calculation
      stencil._previousLeft = stencil.left;
      stencil._previousTop = stencil.top;
    });
    
    stencil.on('mouseup', (e) => {
      if (stencilDragStart && 
          (stencilDragStart.x !== stencil.left || 
           stencilDragStart.y !== stencil.top)) {
        
        // Update stencil position in Redux
        dispatch({
          type: 'editor/updateStencilPositionWithHistory',
          payload: {
            previousPosition: stencilDragStart,
            newPosition: { 
              x: stencil.left, 
              y: stencil.top 
            }
          }
        });
        
        // Also update image position
        if (imageRef.current) {
          dispatch(setPosition({ 
            x: imageRef.current.left, 
            y: imageRef.current.top 
          }));
        }
      }
      
      setStencilDragStart(null);
    });
    
    // Set up image dragging events
    canvas.on('mouse:down', (opt) => {
      const evt = opt.e;
      if (imageRef.current && opt.target === imageRef.current) {
        // Store the starting position for history
        setDragStartPosition({
          x: imageRef.current.left,
          y: imageRef.current.top
        });
        
        imageRef.current.isDragging = true;
        imageRef.current.lastPosX = evt.clientX;
        imageRef.current.lastPosY = evt.clientY;
      }
    });
    
    canvas.on('mouse:move', (opt) => {
      if (imageRef.current && imageRef.current.isDragging) {
        const evt = opt.e;
        const movementFactor = 0.5;
        const deltaX = (evt.clientX - imageRef.current.lastPosX) * movementFactor;
        const deltaY = (evt.clientY - imageRef.current.lastPosY) * movementFactor;
        
        const newLeft = imageRef.current.left + deltaX;
        const newTop = imageRef.current.top + deltaY;
        
        // Update the image position on the canvas, but don't update Redux yet
        const constrainedPosition = updateImagePosition(
          fabricCanvasRef.current, 
          imageRef.current, 
          stencilRef.current, 
          { x: newLeft, y: newTop }
        );
        
        // Update the last position for the next move event
        imageRef.current.lastPosX = evt.clientX;
        imageRef.current.lastPosY = evt.clientY;
      }
    });
    
    canvas.on('mouse:up', () => {
      if (imageRef.current && imageRef.current.isDragging) {
        imageRef.current.isDragging = false;
        
        // Only update Redux position when drag ends
        if (dragStartPosition && 
            (dragStartPosition.x !== imageRef.current.left || 
             dragStartPosition.y !== imageRef.current.top)) {
          
          console.log('Drag ended, saving position to history:', {
            from: dragStartPosition,
            to: { x: imageRef.current.left, y: imageRef.current.top }
          });
          
          // Use a special action that handles both saving history and updating position
          dispatch({
            type: 'editor/updatePositionWithHistory',
            payload: {
              previousPosition: dragStartPosition,
              newPosition: { 
                x: imageRef.current.left, 
                y: imageRef.current.top 
              }
            }
          });
        }
        
        setDragStartPosition(null);
      }
    });
    
    return () => {
      console.log('Disposing canvas');
      canvas.dispose();
    };
  }, [dispatch]);
  
  // Handle image data changes
  useEffect(() => {
    // Use imageData directly from the component props, not from useSelector inside the effect
    if (imageData && fabricCanvasRef.current && stencilRef.current && stencilLoaded) {
      // Create Fabric.js image from the base64 data
      const img = new window.Image();
      img.onload = () => {
        const fabricImage = new FabricImage(img, {
          selectable: true,
          evented: true
        });
        
        // Remove previous image if exists
        if (imageRef.current) {
          fabricCanvasRef.current.remove(imageRef.current);
        }
        
        // Add new image to canvas
        fabricCanvasRef.current.add(fabricImage);
        imageRef.current = fabricImage;
        
        // Fit image to stencil
        fitImageToStencil(fabricCanvasRef.current, fabricImage, stencilRef.current);
        
        // Apply clipping mask
        createClippingMask(fabricCanvasRef.current, stencilRef.current, fabricImage);
        
        // Bring image to front but behind stencil
        fabricCanvasRef.current.remove(stencilRef.current);
        fabricCanvasRef.current.add(stencilRef.current);
        fabricCanvasRef.current.renderAll();
        
        // Make image selectable and draggable
        fabricImage.set({
          selectable: true,
          evented: true,
          hasBorders: false,
          hasControls: false,
          hoverCursor: 'move',
          perPixelTargetFind: true,
          targetFindTolerance: 4
        });
        
        // Move the image to the front by removing and re-adding it
        fabricCanvasRef.current.remove(fabricImage);
        fabricCanvasRef.current.add(fabricImage);
        fabricCanvasRef.current.renderAll();
        
        // Update position in Redux
        dispatch(setPosition({ x: fabricImage.left, y: fabricImage.top }));
        
        // Update the zoom value in Redux to match the actual scale
        dispatch(setZoom(fabricImage.scaleX));

        // Save the initial state to history explicitly
        dispatch({ 
          type: 'editor/saveInitialState', 
          payload: {
            imageData: imageData,
            zoom: fabricImage.scaleX,
            position: { x: fabricImage.left, y: fabricImage.top }
          }
        });
      };
      img.src = imageData;
    }
  }, [imageData, stencilLoaded, dispatch]);
  
  // Handle image changes
  useEffect(() => {
    console.log('Image effect triggered with:', { 
      hasImage: !!image, 
      hasCanvas: !!fabricCanvasRef.current, 
      hasStencil: !!stencilRef.current, 
      stencilLoaded 
    });
    
    if (image && fabricCanvasRef.current && stencilRef.current && stencilLoaded) {
      console.log('Rendering image to canvas:', image);
      console.log('Image properties:', {
        width: image.width,
        height: image.height,
        type: image.type
      });
      
      try {
        // Remove previous image if exists
        if (imageRef.current) {
          console.log('Removing previous image');
          fabricCanvasRef.current.remove(imageRef.current);
        }
        
        // Add new image to canvas
        fabricCanvasRef.current.add(image);
        imageRef.current = image;
        
        // Fit image to stencil
        fitImageToStencil(fabricCanvasRef.current, image, stencilRef.current);
        
        // Apply clipping mask
        createClippingMask(fabricCanvasRef.current, stencilRef.current, image);
        
        // Bring image to front but behind stencil
        fabricCanvasRef.current.remove(stencilRef.current);
        fabricCanvasRef.current.add(stencilRef.current);
        fabricCanvasRef.current.renderAll();
        
        // Make image selectable and draggable
        image.set({
          selectable: true,
          evented: true,
          hasBorders: false,
          hasControls: false
        });
        
        // Update position in Redux
        dispatch(setPosition({ x: image.left, y: image.top }));
        
        // Move the image in front of the stencil for interaction
        // Remove and re-add the image to bring it to the front
        fabricCanvasRef.current.remove(imageRef.current);
        fabricCanvasRef.current.add(imageRef.current);
        fabricCanvasRef.current.renderAll();
        
        fabricCanvasRef.current.renderAll();
        console.log('Image rendered successfully');
      } catch (error) {
        console.error('Error rendering image:', error);
      }
    } else {
      console.log('Not rendering image. Conditions:', {
        hasImage: !!image,
        hasCanvas: !!fabricCanvasRef.current,
        hasStencil: !!stencilRef.current,
        stencilLoaded
      });
    }
  }, [image, stencilLoaded, dispatch]);
  
  // Handle zoom changes
  useEffect(() => {
    if (imageRef.current && fabricCanvasRef.current && stencilRef.current) {
      console.log('Updating zoom to:', zoom);
      try {
        updateImageZoom(fabricCanvasRef.current, imageRef.current, stencilRef.current, zoom);
        fabricCanvasRef.current.renderAll();
      } catch (error) {
        console.error('Error updating zoom:', error);
      }
    } else {
      console.log('Cannot update zoom, missing references:', {
        hasImage: !!imageRef.current,
        hasCanvas: !!fabricCanvasRef.current,
        hasStencil: !!stencilRef.current
      });
    }
  }, [zoom]);
  
  // Handle position changes
  useEffect(() => {
    if (imageRef.current && fabricCanvasRef.current && stencilRef.current) {
      updateImagePosition(fabricCanvasRef.current, imageRef.current, stencilRef.current, position);
    }
  }, [position]);
  
  // Handle stencil position changes from Redux
  useEffect(() => {
    if (stencilRef.current && fabricCanvasRef.current) {
      updateStencilPosition(
        fabricCanvasRef.current, 
        stencilRef.current, 
        imageRef.current,
        stencilPosition
      );
    }
  }, [stencilPosition]);
  
  // Add a keyboard event listener to toggle modes
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Shift') {
        // When Shift is pressed, switch to stencil dragging mode
        setDragMode('stencil');
        if (stencilRef.current && imageRef.current) {
          console.log('Switching to stencil mode');
          stencilRef.current.selectable = true;
          stencilRef.current.evented = true;
          
          // Make sure the stencil is in front for selection
          fabricCanvasRef.current.remove(stencilRef.current);
          fabricCanvasRef.current.add(stencilRef.current);
          
          // Disable image selection
          imageRef.current.selectable = false;
          imageRef.current.evented = false;
          
          fabricCanvasRef.current.renderAll();
          fabricCanvasRef.current.setActiveObject(stencilRef.current);
        }
      }
    };
    
    const handleKeyUp = (e) => {
      if (e.key === 'Shift') {
        // When Shift is released, switch back to image dragging mode
        setDragMode('image');
        if (stencilRef.current && imageRef.current) {
          console.log('Switching to image mode');
          stencilRef.current.selectable = false;
          
          // Re-enable image selection
          imageRef.current.selectable = true;
          imageRef.current.evented = true;
          
          // Make sure the image is in front for selection
          fabricCanvasRef.current.remove(imageRef.current);
          fabricCanvasRef.current.add(imageRef.current);
          
          fabricCanvasRef.current.renderAll();
          fabricCanvasRef.current.discardActiveObject();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);
  
  return (
    <div className="canvas-container">
      <canvas ref={canvasRef} id="canvas" />
      <div className="drag-mode-indicator">
        {dragMode === 'image' ? 'Image Drag Mode' : 'Stencil Drag Mode (Shift)'}
      </div>
    </div>
  );
};

export default Canvas; 