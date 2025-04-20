import { useDispatch, useSelector } from 'react-redux';
import { useState } from 'react';
import { loginUser } from '../features/auth/authThunks';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get loading, error, user, and token from Redux state
  const { loading, error, user, token } = useSelector((state) => state.auth);

  const [form, setForm] = useState({ username: '', password: '' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Dispatch the login action and await its completion
    await dispatch(loginUser(form));

    // After dispatching the login, check if user and token are available
    if (user && token) {
      // Store user and token in localStorage
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);

      console.log('User logged in:', user.username);

      // Navigate to dashboard
      navigate('/dashboard');
    } else {
      console.warn('User or token data is missing after login.');
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form className="bg-white p-6 rounded shadow-md w-96 space-y-4" onSubmit={handleSubmit}>
        <h2 className="text-xl font-bold text-center">Login</h2>
        <input
          type="text"
          name="username"
          placeholder="Username"
          className="w-full p-2 border rounded"
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          className="w-full p-2 border rounded"
          onChange={handleChange}
          required
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        {/* Register Link below the button */}
        <p className="text-center mt-4">
          Don't have an account?{' '}
          <button
            onClick={() => navigate('/register')}
            className="text-blue-600 hover:underline"
          >
            Register here
          </button>
        </p>
      </form>
    </div>
  );
}
