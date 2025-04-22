import { Rect, Triangle, Image as FabricImage } from 'fabric';


export const createStencil = (canvas, width, height, shape = 'rectangle') => {
  let stencil;
  
  // Common properties for all shapes
  const commonProps = {
    left: 200,
    top: 200,
    fill: 'rgba(255,255,255,0.2)',
    stroke: '#333',
    strokeWidth: 2,
    selectable: false,
    evented: true,
    hasControls: true,
    hasBorders: true,
    cornerSize: 12,
    cornerColor: 'blue',
    cornerStyle: 'circle',
    transparentCorners: false,
    lockRotation: true,
    lockScalingFlip: true,
    perPixelTargetFind: false,
    lockScalingX: true,
    lockScalingY: true
  };
  
  // Create the appropriate shape based on the shape parameter
  switch (shape) {
    case 'triangle':
      stencil = new Triangle({
        ...commonProps,
        width: width,
        height: height
      });
      break;
      
    case 'rectangle':
    default:
      stencil = new Rect({
        ...commonProps,
        width: width,
        height: height,
        rx: 20,
        ry: 20
      });
      break;
  }
  
  // Set control visibility - only allow corner resizing
  stencil.setControlsVisibility({
    mt: false, mb: false,
    ml: false, mr: false,
    tl: true, tr: true,
    bl: true, br: true
  });
  
  // Save original dimensions
  stencil.originalWidth = width;
  stencil.originalHeight = height;
  stencil.shapeType = shape;
  
  canvas.add(stencil);
  return stencil;
};


// Create a clipping mask for the image
export const createClippingMask = (canvas, stencil, image) => {
  let clipPath;
  
  // Create a clipPath based on the stencil's shape
  switch (stencil.shapeType) {
    case 'triangle':
      clipPath = new Triangle({
        width: stencil.width,
        height: stencil.height,
        left: stencil.left,
        top: stencil.top,
        absolutePositioned: true
      });
      break;
      
    case 'rectangle':
    default:
      clipPath = new Rect({
        width: stencil.width,
        height: stencil.height,
        left: stencil.left,
        top: stencil.top,
        rx: stencil.rx,
        ry: stencil.ry,
        absolutePositioned: true
      });
      break;
  }
  
  // Apply the clipPath to the image
  image.clipPath = clipPath;
  
  canvas.renderAll();
};

// Load an image from a file
export const loadImageFromFile = (file) => {
  return new Promise((resolve, reject) => {
    console.log('Loading image from file:', file.name);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      console.log('FileReader loaded file, creating image object');
      const imgElement = new window.Image();
      imgElement.src = e.target.result;
      
      imgElement.onload = () => {
        console.log('HTML Image loaded, dimensions:', imgElement.width, 'x', imgElement.height);
        const fabricImage = new FabricImage(imgElement, {
          selectable: true,
          evented: true
        });
        console.log('Fabric Image created:', fabricImage);
        resolve(fabricImage);
      };
      
      imgElement.onerror = (err) => {
        console.error('Error loading HTML Image:', err);
        reject(new Error('Failed to load image'));
      };
    };
    
    reader.onerror = (error) => {
      console.error('FileReader error:', error);
      reject(error);
    };
    
    reader.readAsDataURL(file);
  });
};

// Position and scale the image to fit within the stencil
export const fitImageToStencil = (canvas, image, stencil) => {
  // Calculate scale to fit the image within the stencil
  const scaleX = stencil.width / image.width;
  const scaleY = stencil.height / image.height;
  const scale = Math.max(scaleX, scaleY);
  
  // Scale the image
  image.scale(scale);
  
  // Center the image within the stencil
  image.left = stencil.left + stencil.width / 2 - (image.width * scale) / 2;
  image.top = stencil.top + stencil.height / 2 - (image.height * scale) / 2;
  
  // Set image properties
  image.setControlsVisibility({
    mt: false, mb: false, ml: false, mr: false,
    bl: false, br: false, tl: false, tr: false,
    mtr: false
  });
  
  canvas.renderAll();
};

// Update image position within constraints
export const updateImagePosition = (canvas, image, stencil, position) => {
  // Get the scaled dimensions of the image
  const scaledWidth = image.getScaledWidth();
  const scaledHeight = image.getScaledHeight();
  
  // Calculate boundaries to keep the image covering the stencil
  const minX = stencil.left + stencil.width - scaledWidth;
  const maxX = stencil.left;
  const minY = stencil.top + stencil.height - scaledHeight;
  const maxY = stencil.top;
  
  // Constrain the position
  const constrainedX = Math.min(Math.max(position.x, minX), maxX);
  const constrainedY = Math.min(Math.max(position.y, minY), maxY);
  
  // Update image position
  image.set({
    left: constrainedX,
    top: constrainedY
  });
  
  canvas.renderAll();
  
  // Return the constrained position
  return { x: constrainedX, y: constrainedY };
};

// Update image zoom
export const updateImageZoom = (canvas, image, stencil, zoom) => {
  console.log('updateImageZoom called with zoom:', zoom);
  
  // Get the current scale
  const currentScale = image.scaleX;
  console.log('Current scale:', currentScale);
  
  // Store original position
  const originalLeft = image.left;
  const originalTop = image.top;
  
  // Store original dimensions
  const originalWidth = image.width;
  const originalHeight = image.height;
  
  // Instead of multiplying by zoom, set the scale directly to zoom
  // This ensures zoom value is used as an absolute scale, not a relative one
  image.scale(zoom);

  console.log('New scale applied:', zoom);
  console.log('Image after zoom:', {
    width: image.width,
    height: image.height,
    scaleX: image.scaleX,
    scaleY: image.scaleY,
    scaledWidth: image.getScaledWidth(),
    scaledHeight: image.getScaledHeight()
  });
  
  // Ensure image doesn't get too small
  if (image.getScaledWidth() < stencil.width || image.getScaledHeight() < stencil.height) {
    const scaleX = stencil.width / originalWidth;
    const scaleY = stencil.height / originalHeight;
    const minScale = Math.max(scaleX, scaleY);
    image.scale(minScale);
    console.log('Applied minimum scale:', minScale);
  }
  
  // Re-center the image if needed
  if (image.left > stencil.left ||
    image.left + image.getScaledWidth() < stencil.left + stencil.width) {
    image.left = stencil.left + (stencil.width - image.getScaledWidth()) / 2;
  }

  if (image.top > stencil.top ||
    image.top + image.getScaledHeight() < stencil.top + stencil.height) {
    image.top = stencil.top + (stencil.height - image.getScaledHeight()) / 2;
  }
  
  // Log position changes
  console.log('Position change:', {
    left: [originalLeft, image.left],
    top: [originalTop, image.top]
  });
  
  canvas.renderAll();
};

// Update stencil position and move image with it
export const updateStencilPosition = (canvas, stencil, image, position) => {
  if (!stencil) return;
  
  // Store original position for calculating delta
  const originalLeft = stencil.left;
  const originalTop = stencil.top;
  
  // Update stencil position
  stencil.set({
    left: position.x,
    top: position.y
  });
  
  // Calculate movement delta
  const deltaX = position.x - originalLeft;
  const deltaY = position.y - originalTop;
  
  // Move image along with stencil if it exists
  if (image) {
    image.set({
      left: image.left + deltaX,
      top: image.top + deltaY
    });
    
    // Update clipPath position
    if (image.clipPath) {
      if (stencil.shapeType === 'circle') {
        // For circle, update the center position
        image.clipPath.set({
          left: position.x,
          top: position.y
        });
      } else {
        // For other shapes, update the top-left position
        image.clipPath.set({
          left: position.x,
          top: position.y
        });
      }
    }
  }
  
  canvas.renderAll();
}; 