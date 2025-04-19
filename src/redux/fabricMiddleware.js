// Create a middleware to handle Fabric.js objects
const fabricObjectsMap = new Map();

export const fabricMiddleware = store => next => action => {
  if (action.type === 'editor/setImage') {
    // Store the Fabric.js object in our Map
    const id = Date.now().toString();
    fabricObjectsMap.set(id, action.payload);
    
    // Modify the action to store only the ID
    return next({
      type: action.type,
      payload: id
    });
  }
  
  return next(action);
};

// Helper to get a Fabric.js object by ID
export const getFabricObject = (id) => {
  return fabricObjectsMap.get(id);
}; 