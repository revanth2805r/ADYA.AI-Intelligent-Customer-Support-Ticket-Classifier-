// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { login, logout } from '../features/auth/authSlice';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const dispatch = useDispatch();

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
            setUser(storedUser);
            dispatch(login(storedUser)); // Set user data in Redux
        }
    }, [dispatch]);

    const handleLogin = (userData) => {
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        dispatch(login(userData)); // Store in Redux
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        setUser(null);
        dispatch(logout()); // Remove user from Redux
    };

    return (
        <AuthContext.Provider value={{ user, handleLogin, handleLogout }}>
            {children}
        </AuthContext.Provider>
    );
};
