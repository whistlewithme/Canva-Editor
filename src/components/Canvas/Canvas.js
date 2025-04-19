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
  setStencilPosition,
  updateStencilPositionWithHistory,
  saveStateToHistory
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
    stencilLoaded,
    canvasSize
  } = useSelector(state => state.editor);

  const [dragStartPosition, setDragStartPosition] = useState(null);
  const [stencilDragStart, setStencilDragStart] = useState(null);
  const [dragMode, setDragMode] = useState('image'); // 'image' or 'stencil'

  // Initialize canvas - make it larger to allow stencil movement
  useEffect(() => {
    console.log('Initializing canvas with size:', canvasSize);
    const canvas = new FabricCanvas('canvas', {
      width: canvasSize.width,
      height: canvasSize.height,
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
        y: stencil.top,
        width: stencil.width,
        height: stencil.height
      });

      // Store previous position for movement calculation
      stencil._previousLeft = stencil.left;
      stencil._previousTop = stencil.top;
      
      // Save the current state to history before making changes
      dispatch(saveStateToHistory());
    });

    stencil.on('mouseup', (e) => {
      const newWidth = stencil.width * stencil.scaleX;
      const newHeight = stencil.height * stencil.scaleY;

      const oldWidth = stencil.originalWidth || stencil.width;
      const oldHeight = stencil.originalHeight || stencil.height;

      const scaleX = newWidth / oldWidth;
      const scaleY = newHeight / oldHeight;

      // Only proceed if resized or moved
      if (
        (stencilDragStart &&
          (stencilDragStart.x !== stencil.left ||
            stencilDragStart.y !== stencil.top)) ||
        scaleX !== 1 ||
        scaleY !== 1
      ) {
        console.log('Stencil resized or moved, updating state');
        console.log('Previous state:', stencilDragStart);
        console.log('New state:', {
          x: stencil.left,
          y: stencil.top,
          width: newWidth,
          height: newHeight
        });

        // 1. Apply new dimensions & reset scale
        stencil.set({
          width: newWidth,
          height: newHeight,
          scaleX: 1,
          scaleY: 1
        });
        stencil.setCoords();

        // Save new original size
        stencil.originalWidth = newWidth;
        stencil.originalHeight = newHeight;

        // 2. Resize the image proportionally
        if (imageRef.current) {
          const img = imageRef.current;

          const newImageScaleX = img.scaleX * scaleX;
          const newImageScaleY = img.scaleY * scaleY;

          img.scaleX = newImageScaleX;
          img.scaleY = newImageScaleY;

          // 3. Update clipping mask size
          if (img.clipPath) {
            img.clipPath.width = newWidth;
            img.clipPath.height = newHeight;
            img.clipPath.left = stencil.left;
            img.clipPath.top = stencil.top;
          }

          // 4. Update zoom in Redux
          dispatch(setZoom(newImageScaleX));
        }

        // 5. Update Redux for position with complete stencil info
        dispatch(updateStencilPositionWithHistory({
          previousPosition: stencilDragStart,
          newPosition: {
            x: stencil.left,
            y: stencil.top,
            width: newWidth,
            height: newHeight
          }
        }));

        dispatch(setPosition({
          x: imageRef.current?.left,
          y: imageRef.current?.top
        }));

        fabricCanvasRef.current.renderAll();
      }

      setStencilDragStart(null);
    });

    stencil.on('scaling', () => {
      console.log('Stencil scaling');
      // We don't need to do anything here, just log for debugging
    });

    stencil.on('scaled', () => {
      console.log('Stencil scaled');
      // We don't need to do anything here, just log for debugging
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
  }, [dispatch, canvasSize]);

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
          hasBorders: true,
          hasControls: true,
          lockRotation: true,
          lockScalingFlip: true,
          hoverCursor: 'move',
          cornerStyle: 'circle',
          cornerColor: 'green',
          transparentCorners: false
        });

        fabricImage.setControlsVisibility({
          mt: false, mb: false, ml: false, mr: false,
          tl: true, tr: true, bl: true, br: true
        });
        fabricImage.on('scaling', () => {
          if (!stencilRef.current) return;

          // Update clipPath dimensions to stencil size
          if (fabricImage.clipPath) {
            fabricImage.clipPath.width = stencilRef.current.width;
            fabricImage.clipPath.height = stencilRef.current.height;
            fabricImage.clipPath.left = stencilRef.current.left;
            fabricImage.clipPath.top = stencilRef.current.top;
          }

          // Optionally update zoom value in Redux
          dispatch(setZoom(fabricImage.scaleX));
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
        if (stencilRef.current) {
          console.log('Switching to stencil mode');
          stencilRef.current.selectable = true;
          stencilRef.current.evented = true;

          stencilRef.current.lockScalingX = false;
          stencilRef.current.lockScalingY = false;
          // Make sure the stencil is in front for selection
          fabricCanvasRef.current.remove(stencilRef.current);
          fabricCanvasRef.current.add(stencilRef.current);

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

          stencilRef.current.lockScalingX = true;
          stencilRef.current.lockScalingY = true;
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

  useEffect(() => {
    const handleResizeStencil = (e) => {
      if (!stencilRef.current || !fabricCanvasRef.current || !imageRef.current) return;

      // Save the current state to history before making changes
      dispatch(saveStateToHistory());

      const stencil = stencilRef.current;
      const image = imageRef.current;
      const delta = 20;

      if (e.detail.type === 'increase') {
        // 1. Resize stencil
        stencil.set({
          width: stencil.width + delta,
          height: stencil.height + delta,
          left: stencil.left - delta / 2,
          top: stencil.top - delta / 2
        });

        // 2. Zoom image in (scale up)
        const newZoom = Math.min(image.scaleX * 1.05, 3.0); // same as in Controls
        image.scaleX = newZoom;
        image.scaleY = newZoom;

        // 3. Update Redux zoom (optional)
        dispatch(setZoom(newZoom));
      } else if (e.detail.type === 'decrease') {
        stencil.set({
          width: Math.max(50, stencil.width - delta),
          height: Math.max(50, stencil.height - delta),
          left: stencil.left + delta / 2,
          top: stencil.top + delta / 2
        });

        const newZoom = Math.max(image.scaleX * 0.95, 0.4);
        image.scaleX = newZoom;
        image.scaleY = newZoom;

        dispatch(setZoom(newZoom));
      }

      stencil.setCoords();

      // Update clipPath size & position
      if (image.clipPath) {
        image.clipPath.width = stencil.width;
        image.clipPath.height = stencil.height;
        image.clipPath.left = stencil.left;
        image.clipPath.top = stencil.top;
      }

      // Update stencil position in Redux
      dispatch(setStencilPosition({
        x: stencil.left,
        y: stencil.top,
        width: stencil.width,
        height: stencil.height
      }));

      fabricCanvasRef.current.renderAll();
    };

    window.addEventListener('resizeStencil', handleResizeStencil);

    return () => {
      window.removeEventListener('resizeStencil', handleResizeStencil);
    };
  }, [dispatch]);


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