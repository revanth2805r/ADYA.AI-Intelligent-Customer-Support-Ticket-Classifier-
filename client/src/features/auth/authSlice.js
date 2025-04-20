import { createSlice } from '@reduxjs/toolkit';

// Safely load user from localStorage
let userFromStorage = null;
let tokenFromStorage = null;

try {
  const userData = localStorage.getItem('user');
  const tokenData = localStorage.getItem('token');

  if (userData && userData !== 'undefined') {
    userFromStorage = JSON.parse(userData);
  }
  if (tokenData) {
    tokenFromStorage = tokenData;
  }
} catch (error) {
  console.error('Failed to parse user/token from localStorage:', error);
}

const initialState = {
  user: userFromStorage,
  token: tokenFromStorage,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    authSuccess: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.loading = false;
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
    },
    authFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      // Optional: Clear error after some time (e.g., 3 seconds)
      setTimeout(() => {
        state.error = null;
      }, 3000);
    },
    login: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    },
  },
});

export const { authStart, authSuccess, authFail, login, logout } = authSlice.actions;
export default authSlice.reducer;
