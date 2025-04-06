import { createSlice } from '@reduxjs/toolkit';

// Load saved state from localStorage if available
const loadSavedState = () => {
  try {
    const savedState = localStorage.getItem('playerState');
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      // Only restore volume and playback settings, not the current track
      return {
        currentTrack: null,
        isPlaying: false,
        queue: [],
        currentIndex: 0,
        volume: parsedState.volume || 0.7,
        repeatMode: parsedState.repeatMode || 'none',
        shuffleMode: parsedState.shuffleMode || false,
        trackStates: parsedState.trackStates || {},
      };
    }
  } catch (error) {
    console.error('Error loading player state:', error);
  }
  return null;
};

const initialState = loadSavedState() || {
  currentTrack: null,
  isPlaying: false,
  queue: [],
  currentIndex: 0,
  volume: 0.7,
  repeatMode: 'none', // none, one, all
  shuffleMode: false,
  trackStates: {}, // Store playback position for each track by ID
};

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    setCurrentTrack: (state, action) => {
      const track = action.payload;
      state.currentTrack = track;
      state.isPlaying = true;
      
      // Save track state
      if (track && track.id) {
        if (!state.trackStates[track.id]) {
          state.trackStates[track.id] = {
            lastPosition: 0,
            lastPlayed: Date.now(),
          };
        } else {
          state.trackStates[track.id].lastPlayed = Date.now();
        }
      }
      
      // Save state to localStorage
      saveStateToLocalStorage(state);
    },
    togglePlayPause: (state) => {
      state.isPlaying = !state.isPlaying;
      
      // Save state to localStorage
      saveStateToLocalStorage(state);
    },
    setQueue: (state, action) => {
      state.queue = action.payload;
      
      // Save state to localStorage
      saveStateToLocalStorage(state);
    },
    addToQueue: (state, action) => {
      state.queue.push(action.payload);
      
      // Save state to localStorage
      saveStateToLocalStorage(state);
    },
    nextTrack: (state) => {
      if (state.queue.length === 0) return;
      
      // Save current track position before changing
      if (state.currentTrack && state.currentTrack.id) {
        state.trackStates[state.currentTrack.id] = {
          ...state.trackStates[state.currentTrack.id],
          lastPosition: 0, // Reset position for next play
          lastPlayed: Date.now(),
        };
      }
      
      if (state.shuffleMode) {
        // Random but not the current track
        const availableIndices = Array.from(
          { length: state.queue.length },
          (_, i) => i
        ).filter(i => i !== state.currentIndex);
        
        if (availableIndices.length > 0) {
          const randomIndex = Math.floor(Math.random() * availableIndices.length);
          state.currentIndex = availableIndices[randomIndex];
        }
      } else {
        // Normal progression
        state.currentIndex = (state.currentIndex + 1) % state.queue.length;
      }
      state.currentTrack = state.queue[state.currentIndex];
      
      // Save state to localStorage
      saveStateToLocalStorage(state);
    },
    prevTrack: (state) => {
      if (state.queue.length === 0) return;
      
      // Save current track position before changing
      if (state.currentTrack && state.currentTrack.id) {
        state.trackStates[state.currentTrack.id] = {
          ...state.trackStates[state.currentTrack.id],
          lastPosition: 0, // Reset position for next play
          lastPlayed: Date.now(),
        };
      }
      
      if (state.currentIndex > 0) {
        state.currentIndex -= 1;
      } else {
        state.currentIndex = state.queue.length - 1;
      }
      state.currentTrack = state.queue[state.currentIndex];
      
      // Save state to localStorage
      saveStateToLocalStorage(state);
    },
    setVolume: (state, action) => {
      state.volume = action.payload;
      
      // Save state to localStorage
      saveStateToLocalStorage(state);
    },
    toggleRepeatMode: (state) => {
      const modes = ['none', 'one', 'all'];
      const currentIndex = modes.indexOf(state.repeatMode);
      state.repeatMode = modes[(currentIndex + 1) % modes.length];
      
      // Save state to localStorage
      saveStateToLocalStorage(state);
    },
    toggleShuffleMode: (state) => {
      state.shuffleMode = !state.shuffleMode;
      
      // Save state to localStorage
      saveStateToLocalStorage(state);
    },
    updateTrackPosition: (state, action) => {
      const { trackId, position } = action.payload;
      if (trackId && state.trackStates[trackId]) {
        state.trackStates[trackId].lastPosition = position;
        
        // Save state to localStorage
        saveStateToLocalStorage(state);
      }
    },
    clearQueue: (state) => {
      state.queue = [];
      state.currentIndex = 0;
      
      // Save state to localStorage
      saveStateToLocalStorage(state);
    },
  },
});

// Helper function to save state to localStorage
const saveStateToLocalStorage = (state) => {
  try {
    // Only save essential state to reduce localStorage size
    const stateToSave = {
      volume: state.volume,
      repeatMode: state.repeatMode,
      shuffleMode: state.shuffleMode,
      trackStates: state.trackStates,
    };
    localStorage.setItem('playerState', JSON.stringify(stateToSave));
  } catch (error) {
    console.error('Error saving player state:', error);
  }
};

export const {
  setCurrentTrack,
  togglePlayPause,
  setQueue,
  addToQueue,
  nextTrack,
  prevTrack,
  setVolume,
  toggleRepeatMode,
  toggleShuffleMode,
  updateTrackPosition,
  clearQueue,
} = playerSlice.actions;

export default playerSlice.reducer;