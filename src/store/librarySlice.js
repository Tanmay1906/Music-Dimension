import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { musicService } from '../api/api';

export const searchTracks = createAsyncThunk(
  'library/searchTracks',
  async (query, { rejectWithValue }) => {
    try {
      const response = await musicService.searchTracks(query);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Search failed');
    }
  }
);

export const fetchPopularTracks = createAsyncThunk(
  'library/fetchPopularTracks',
  async (_, { rejectWithValue }) => {
    try {
      const response = await musicService.getPopularTracks();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch popular tracks');
    }
  }
);

// Load saved state from localStorage if available
const loadSavedState = () => {
  try {
    const savedState = localStorage.getItem('libraryState');
    if (savedState) {
      return JSON.parse(savedState);
    }
  } catch (error) {
    console.error('Error loading library state:', error);
  }
  return null;
};

const initialState = loadSavedState() || {
  searchResults: [],
  popularTracks: [],
  playlists: [], // User playlists
  favoriteTrackIds: [], // IDs of favorite tracks
  uploadedTracks: [], // Tracks uploaded by the user
  loading: false,
  error: null,
};

const librarySlice = createSlice({
  name: 'library',
  initialState,
  reducers: {
    toggleFavorite: (state, action) => {
      const trackId = action.payload;
      const index = state.favoriteTrackIds.indexOf(trackId);
      
      if (index === -1) {
        // Add to favorites
        state.favoriteTrackIds.push(trackId);
      } else {
        // Remove from favorites
        state.favoriteTrackIds.splice(index, 1);
      }
      
      // Save state to localStorage
      saveStateToLocalStorage(state);
    },
    createPlaylist: (state, action) => {
      // Check if we're updating an existing playlist
      if (action.payload.id) {
        const index = state.playlists.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          // Update existing playlist
          state.playlists[index] = {
            ...state.playlists[index],
            name: action.payload.name,
            tracks: action.payload.tracks || state.playlists[index].tracks,
            cover: action.payload.cover || state.playlists[index].cover,
            description: action.payload.description || state.playlists[index].description
          };
          
          // Save state to localStorage
          saveStateToLocalStorage(state);
          return;
        }
      }
      
      // Create a new playlist
      state.playlists.push({
        id: Date.now().toString(),
        name: action.payload.name,
        tracks: action.payload.tracks || [],
        cover: action.payload.cover || null,
        description: action.payload.description || ''
      });
      
      // Save state to localStorage
      saveStateToLocalStorage(state);
    },
    addToPlaylist: (state, action) => {
      const { playlistId, track } = action.payload;
      const playlist = state.playlists.find(p => p.id === playlistId);
      if (playlist) {
        // Check if track is already in the playlist
        const trackExists = playlist.tracks.some(t => t.id === track.id);
        if (!trackExists) {
          playlist.tracks.push(track);
          
          // Save state to localStorage
          saveStateToLocalStorage(state);
        }
      }
    },
    removeFromPlaylist: (state, action) => {
      const { playlistId, trackId } = action.payload;
      const playlist = state.playlists.find(p => p.id === playlistId);
      if (playlist) {
        playlist.tracks = playlist.tracks.filter(t => t.id !== trackId);
        
        // Save state to localStorage
        saveStateToLocalStorage(state);
      }
    },
    deletePlaylist: (state, action) => {
      const playlistId = action.payload;
      state.playlists = state.playlists.filter(p => p.id !== playlistId);
      
      // Save state to localStorage
      saveStateToLocalStorage(state);
    },
    uploadTrack: (state, action) => {
      const track = action.payload;
      
      // Add to uploaded tracks
      state.uploadedTracks.push(track);
      
      // If this is the first track, create a "My Uploads" playlist
      if (state.uploadedTracks.length === 1) {
        const myUploadsPlaylist = state.playlists.find(p => p.name === "My Uploads");
        if (!myUploadsPlaylist) {
          state.playlists.push({
            id: Date.now().toString(),
            name: "My Uploads",
            tracks: [track],
            cover: track.image || null,
            description: "Tracks uploaded by you"
          });
        }
      } else {
        // Add to "My Uploads" playlist if it exists
        const myUploadsPlaylist = state.playlists.find(p => p.name === "My Uploads");
        if (myUploadsPlaylist) {
          const trackExists = myUploadsPlaylist.tracks.some(t => t.id === track.id);
          if (!trackExists) {
            myUploadsPlaylist.tracks.push(track);
          }
        }
      }
      
      // Save state to localStorage
      saveStateToLocalStorage(state);
    },
    deleteUploadedTrack: (state, action) => {
      const trackId = action.payload;
      
      // Remove from uploaded tracks
      state.uploadedTracks = state.uploadedTracks.filter(t => t.id !== trackId);
      
      // Remove from all playlists
      state.playlists.forEach(playlist => {
        playlist.tracks = playlist.tracks.filter(t => t.id !== trackId);
      });
      
      // Remove from favorites
      const favoriteIndex = state.favoriteTrackIds.indexOf(trackId);
      if (favoriteIndex !== -1) {
        state.favoriteTrackIds.splice(favoriteIndex, 1);
      }
      
      // Save state to localStorage
      saveStateToLocalStorage(state);
    },
    downloadTrack: (state, action) => {
      // This is just a placeholder - actual download functionality will be handled in the component
      console.log('Downloading track:', action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchTracks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchTracks.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload.results || [];
      })
      .addCase(searchTracks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchPopularTracks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPopularTracks.fulfilled, (state, action) => {
        state.loading = false;
        state.popularTracks = action.payload.results || [];
      })
      .addCase(fetchPopularTracks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Helper function to save state to localStorage
const saveStateToLocalStorage = (state) => {
  try {
    // Only save essential state to reduce localStorage size
    const stateToSave = {
      playlists: state.playlists,
      favoriteTrackIds: state.favoriteTrackIds,
      uploadedTracks: state.uploadedTracks,
    };
    localStorage.setItem('libraryState', JSON.stringify(stateToSave));
  } catch (error) {
    console.error('Error saving library state:', error);
  }
};

export const {
  toggleFavorite,
  createPlaylist,
  addToPlaylist,
  removeFromPlaylist,
  deletePlaylist,
  uploadTrack,
  deleteUploadedTrack,
  downloadTrack,
} = librarySlice.actions;

export default librarySlice.reducer;