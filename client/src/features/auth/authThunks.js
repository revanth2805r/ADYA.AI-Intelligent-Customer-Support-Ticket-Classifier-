import API from '../..'; // Adjust path as needed
import { authStart, authSuccess, authFail } from './authSlice';

// Login User
export const loginUser = (credentials) => async (dispatch) => {
  try {
    dispatch(authStart());

    // Send API request to verify the user's credentials
    const res = await API.post('http://localhost:5000/api/users/login', credentials);

    const { token, user } = res.data;

    // Store user data and token in localStorage and update Redux state
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));

    dispatch(authSuccess({ user, token }));
  } catch (err) {
    // Handle login failure
    dispatch(authFail(err.response?.data?.message || 'Login failed'));
    throw err;  // Propagate error to handle UI-side failure
  }
};

// Register User
export const registerUser = (userData) => async (dispatch) => {
  try {
    dispatch(authStart());
    await API.post('http://localhost:5000/api/users/register', userData);
    // Optional: Auto-login here
  } catch (err) {
    dispatch(authFail(err.response?.data?.message || 'Registration failed'));
  }
};
