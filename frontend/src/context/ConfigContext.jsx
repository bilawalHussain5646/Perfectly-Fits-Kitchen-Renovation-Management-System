import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import api from '../api';
import { useAuth } from './AuthContext';

const ConfigContext = createContext(null);

export const ConfigProvider = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const [visibility, setVisibility] = useState({});
    const [loading, setLoading] = useState(true);

    const fetchVisibility = useCallback(async () => {
        if (!isAuthenticated) return;
        try {
            const response = await api.get('/settings/visibility');
            const visibilityMap = {};
            response.data.forEach(s => {
                visibilityMap[s.key] = s.value;
            });
            setVisibility(visibilityMap);
        } catch (error) {
            console.error('Error fetching visibility config:', error);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        fetchVisibility();
        
        // Listen for updates from the VisibilitySettings page
        const handleUpdate = () => fetchVisibility();
        window.addEventListener('visibilitySettingsUpdated', handleUpdate);
        
        return () => window.removeEventListener('visibilitySettingsUpdated', handleUpdate);
    }, [fetchVisibility]);

    return (
        <ConfigContext.Provider value={{ visibility, loading, refreshVisibility: fetchVisibility }}>
            {children}
        </ConfigContext.Provider>
    );
};

export const useConfig = () => useContext(ConfigContext);
