import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import playerReducer from './playerSlice';
import libraryReducer from './librarySlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    player: playerReducer,
    library: libraryReducer,
  },
});