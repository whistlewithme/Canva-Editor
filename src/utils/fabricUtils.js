import { Canvas as FabricCanvas, Rect, Image as FabricImage } from 'fabric';

// Create a stencil shape (rounded rectangle) - now movable
export const createStencil = (canvas, width, height) => {
  const rect = new Rect({
    width: width,
    height: height,
    left: 200, // Initial position
    top: 200,
    rx: 20,
    ry: 20,
    fill: 'rgba(255,255,255,0.2)', // Slightly more visible
    stroke: '#333',
    strokeWidth: 2,
    selectable: false, // Start with stencil not selectable (image mode)
    evented: true,
    hasControls: false,
    hasBorders: true,
    hoverCursor: 'move',
    // Add these properties to make stencil less likely to interfere with image
    perPixelTargetFind: false,
    cornerSize: 10,
    transparentCorners: false
  });
  
  canvas.add(rect);
  return rect;
};

// Create a clipping mask for the image
export const createClippingMask = (canvas, stencil, image) => {
  // Create a clipPath from the stencil
  const clipPath = new Rect({
    width: stencil.width,
    height: stencil.height,
    left: 0,
    top: 0,
    rx: stencil.rx,
    ry: stencil.ry,
    absolutePositioned: true
  });
  
  // Apply the clipPath to the image
  image.clipPath = clipPath;
  
  // Position the clipPath relative to the stencil
  clipPath.left = stencil.left;
  clipPath.top = stencil.top;
  
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
  // The image should not move so far that it exposes white space
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
      image.clipPath.set({
        left: position.x,
        top: position.y
      });
    }
  }
  
  canvas.renderAll();
}; 