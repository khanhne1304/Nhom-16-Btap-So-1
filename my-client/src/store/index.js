// src/store/index.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: { auth: authReducer },
});

// (tuỳ chọn) chỉ để hỗ trợ IntelliSense cục bộ, KHÔNG export:
/// @ts-check
/** @typedef {ReturnType<typeof store.getState>} RootState */
/** @typedef {typeof store.dispatch} AppDispatch */
