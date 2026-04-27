import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';
import api from '../api';

const AuthContext = createContext(null);

// Set axios default header immediately from localStorage on module load
const storedToken = localStorage.getItem('token');
const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
if (storedToken) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
}

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(storedToken);
    const [user, setUser] = useState(storedUser);
    const [isAuthenticated, setIsAuthenticated] = useState(!!storedToken);

    // Fetch user info on load if we have a token but no user data
    useEffect(() => {
        if (storedToken && !storedUser) {
            api.get('/auth/me')
                .then(response => {
                    setUser(response.data);
                    localStorage.setItem('user', JSON.stringify(response.data));
                })
                .catch(() => {
                    // Token might be expired
                });
        }
    }, []);

    // Set up axios interceptor to handle 401 responses globally
    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401 && !error.config?.url?.includes('/api/auth/login')) {
                    console.warn('Session expired. Logging out.');
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    delete axios.defaults.headers.common['Authorization'];
                    setToken(null);
                    setUser(null);
                    setIsAuthenticated(false);
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.response.eject(interceptor);
        };
    }, []);

    const login = useCallback((newToken, userData) => {
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userData));
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        setToken(newToken);
        setUser(userData);
        setIsAuthenticated(true);
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
    }, []);

    const isSuperAdmin = user?.is_super_admin || false;

    return (
        <AuthContext.Provider value={{ token, user, isAuthenticated, isSuperAdmin, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
