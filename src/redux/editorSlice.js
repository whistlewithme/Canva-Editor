import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  imageData: null,
  zoom: 1,
  position: { x: 0, y: 0 },
  stencilPosition: { x: 200, y: 200 }, // Initial stencil position
  stencilLoaded: false,
  canvasSize: { width: 1000, height: 800 }, // Default canvas size
  history: [],        // Past states
  future: [],         // Future states (for redo)
  initialState: null  // Initial state after loading image
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
        state.history.push({
          zoom: state.zoom,
          position: { ...state.position }
        });
        // Clear future history when making a new change
        state.future = [];
        state.zoom = action.payload;
      }
    },
    setPosition: (state, action) => {
      // Only save to history if the position is actually changing
      if (state.position.x !== action.payload.x || state.position.y !== action.payload.y) {
        // Save current state to history
        state.history.push({
          zoom: state.zoom,
          position: { ...state.position }
        });
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
        state.future.push({
          zoom: state.zoom,
          position: { ...state.position }
        });
        
        // Apply the previous state
        state.zoom = previousState.zoom;
        state.position = previousState.position;
      }
    },
    // Redo: Go forward one step in history
    redoChange: (state) => {
      if (state.future.length > 0) {
        // Get the next state from future
        const nextState = state.future.pop();
        
        // Save current state to history
        state.history.push({
          zoom: state.zoom,
          position: { ...state.position }
        });
        
        // Apply the next state
        state.zoom = nextState.zoom;
        state.position = nextState.position;
      }
    },
    // Reset: Go back to initial state
    resetToInitial: (state) => {
      if (state.initialState) {
        // Save current state to history before resetting
        state.history.push({
          zoom: state.zoom,
          position: { ...state.position }
        });
        
        // Clear future history
        state.future = [];
        
        // Apply initial state
        state.zoom = state.initialState.zoom;
        state.position = state.initialState.position;
      }
    },
    // Reset All: Clear everything
    resetAll: (state) => {
      state.imageData = null;
      state.zoom = 1;
      state.position = { x: 0, y: 0 };
      state.history = [];
      state.future = [];
      state.initialState = null;
    },
    // Save the initial state after loading an image
    saveInitialState: (state, action) => {
      state.initialState = action.payload;
      // Clear history when setting initial state
      state.history = [];
      state.future = [];
    },
    // Add this new reducer
    savePositionToHistory: (state, action) => {
      // Save the position to history without changing the current state
      state.history.push({
        zoom: state.zoom,
        position: action.payload
      });
      
      // Clear future history
      state.future = [];
    },
    // Add this new reducer
    updatePositionWithHistory: (state, action) => {
      const { previousPosition, newPosition } = action.payload;
      
      // First, save the previous position to history
      state.history.push({
        zoom: state.zoom,
        position: previousPosition
      });
      
      // Clear future history
      state.future = [];
      
      // Then update the current position
      state.position = newPosition;
      
      console.log('Position updated with history:', {
        history: state.history,
        current: state.position
      });
    },
    setStencilPosition: (state, action) => {
      // Only save to history if the position is actually changing
      if (state.stencilPosition.x !== action.payload.x || 
          state.stencilPosition.y !== action.payload.y) {
        
        state.history.push({
          zoom: state.zoom,
          position: { ...state.position },
          stencilPosition: { ...state.stencilPosition }
        });
        
        state.future = [];
        state.stencilPosition = action.payload;
      }
    },
    updateStencilPositionWithHistory: (state, action) => {
      const { previousPosition, newPosition } = action.payload;
      
      // Save previous state to history
      state.history.push({
        zoom: state.zoom,
        position: { ...state.position },
        stencilPosition: previousPosition
      });
      
      // Clear future history
      state.future = [];
      
      // Update stencil position
      state.stencilPosition = newPosition;
    },
    setCanvasSize: (state, action) => {
      state.canvasSize = action.payload;
    }
  }
});

export const { 
  setImageData, 
  setZoom, 
  setPosition, 
  setStencilLoaded, 
  setCanvasSize,
  undoChange,
  redoChange,
  resetToInitial,
  resetAll,
  saveInitialState,
  savePositionToHistory,
  updatePositionWithHistory,
  setStencilPosition,
  updateStencilPositionWithHistory
} = editorSlice.actions;

export default editorSlice.reducer; 