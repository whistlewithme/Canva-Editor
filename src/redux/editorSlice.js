import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  imageData: null,
  zoom: 1,
  position: { x: 0, y: 0 },
  stencilPosition: { x: 200, y: 200, width: 600, height: 400 }, // Include width and height
  stencilLoaded: false,
  canvasSize: { width: 1000, height: 800 }, // Default canvas size
  stencilShape: 'rectangle',
  history: [],        // Past states
  future: [],         // Future states (for redo)
  initialState: null  // Initial state after loading image
};

// Helper function to create a complete state snapshot
const createStateSnapshot = (state) => ({
  zoom: state.zoom,
  position: { ...state.position },
  stencilPosition: { ...state.stencilPosition }
});

// Helper function to apply a state snapshot
const applyStateSnapshot = (state, snapshot) => {
  state.zoom = snapshot.zoom;
  state.position = snapshot.position;
  state.stencilPosition = snapshot.stencilPosition;
};

export const editorSlice = createSlice({
  name: 'editor',
  initialState,
  reducers: {
    setImageData: (state, action) => {
      state.imageData = action.payload;
      // Clear history when loading a new image
      state.history = [];
      state.future = [];
    },
    setZoom: (state, action) => {
      // Only save to history if the value is actually changing
      if (state.zoom !== action.payload) {
        // Save current state to history
        state.history.push(createStateSnapshot(state));
        // Clear future history when making a new change
        state.future = [];
        state.zoom = action.payload;
      }
    },
    setPosition: (state, action) => {
      // Only save to history if the position is actually changing
      if (state.position.x !== action.payload.x || state.position.y !== action.payload.y) {
        // Save current state to history
        state.history.push(createStateSnapshot(state));
        // Clear future history when making a new change
        state.future = [];
        state.position = action.payload;
      }
    },
    setStencilLoaded: (state, action) => {
      state.stencilLoaded = action.payload;
    },
    // Undo: Go back one step in history
    undoChange: (state) => {
      if (state.history.length > 0) {
        // Get the last state from history
        const previousState = state.history.pop();
        
        // Save current state to future for possible redo
        state.future.push(createStateSnapshot(state));
        
        // Apply the previous state
        applyStateSnapshot(state, previousState);
      }
    },
    // Redo: Go forward one step in history
    redoChange: (state) => {
      if (state.future.length > 0) {
        // Get the next state from future
        const nextState = state.future.pop();
        
        // Save current state to history
        state.history.push(createStateSnapshot(state));
        
        // Apply the next state
        applyStateSnapshot(state, nextState);
      }
    },
    // Reset: Go back to initial state
    resetToInitial: (state) => {
      if (state.initialState) {
        // Save current state to history before resetting
        state.history.push(createStateSnapshot(state));
        
        // Clear future history
        state.future = [];
        
        // Apply initial state
        applyStateSnapshot(state, state.initialState);
      }
    },
    // Reset All: Clear everything
    resetAll: (state) => {
      state.imageData = null;
      state.zoom = 1;
      state.position = { x: 0, y: 0 };
      state.stencilPosition = { x: 200, y: 200, width: 600, height: 400 };
      state.history = [];
      state.future = [];
      state.initialState = null;
    },
    // Save the initial state after loading an image
    saveInitialState: (state, action) => {
      state.initialState = {
        zoom: action.payload.zoom,
        position: action.payload.position,
        stencilPosition: { ...state.stencilPosition }
      };
      // Clear history when setting initial state
      state.history = [];
      state.future = [];
    },
    // Save state before making changes
    saveStateToHistory: (state) => {
      state.history.push(createStateSnapshot(state));
      state.future = [];
    },
    // Update position with history tracking
    updatePositionWithHistory: (state, action) => {
      const { newPosition } = action.payload;
      
      // First, save the previous position to history
      state.history.push(createStateSnapshot(state));
      
      // Clear future history
      state.future = [];
      
      // Then update the current position
      state.position = newPosition;
    },
    // Set stencil position with history tracking
    setStencilPosition: (state, action) => {
      // Only save to history if the position is actually changing
      if (state.stencilPosition.x !== action.payload.x || 
          state.stencilPosition.y !== action.payload.y ||
          (action.payload.width && state.stencilPosition.width !== action.payload.width) ||
          (action.payload.height && state.stencilPosition.height !== action.payload.height)) {
        
        state.history.push(createStateSnapshot(state));
        state.future = [];
        
        // Update with new values while preserving any unspecified properties
        state.stencilPosition = {
          ...state.stencilPosition,
          ...action.payload
        };
      }
    },
    // Update stencil position with history tracking
    updateStencilPositionWithHistory: (state, action) => {
      const { previousPosition, newPosition } = action.payload;
      
      console.log('Updating stencil position with history:', {
        previous: previousPosition,
        new: newPosition
      });
      
      // Save previous state to history
      state.history.push(createStateSnapshot(state));
      
      // Clear future history
      state.future = [];
      
      // Update stencil position
      state.stencilPosition = {
        ...state.stencilPosition,
        ...newPosition
      };
      
      console.log('Updated stencil position:', state.stencilPosition);
      console.log('History length:', state.history.length);
    },
    setCanvasSize: (state, action) => {
      state.canvasSize = action.payload;
    },
    setStencilShape: (state, action) => {
      state.stencilShape = action.payload;
    }
  }
});

export const { 
  setImageData, 
  setZoom, 
  setPosition, 
  setStencilLoaded, 
  setCanvasSize,
  setStencilShape,
  undoChange,
  redoChange,
  resetToInitial,
  resetAll,
  saveInitialState,
  saveStateToHistory,
  updatePositionWithHistory,
  setStencilPosition,
  updateStencilPositionWithHistory
} = editorSlice.actions;

export default editorSlice.reducer; 