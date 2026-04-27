import React from 'react';
import { Navigate } from 'react-router-dom';
import { useConfig } from '../context/ConfigContext';

/**
 * VisibilityRoute wraps a page that can be toggled off in Panel Config.
 * - While settings are loading: renders nothing (prevents flash).
 * - If the page is hidden: redirects to /invoices.
 * - If the page is visible: renders children normally.
 */
const VisibilityRoute = ({ visibilityKey, children }) => {
    const { visibility, loading } = useConfig();

    // While fetching settings from the API, render nothing at all.
    // This prevents the brief flash where the page shows before being hidden.
    if (loading) return null;

    // If the key is explicitly set to false, redirect away.
    if (visibilityKey && visibility[visibilityKey] === false) {
        return <Navigate to="/invoices" replace />;
    }

    return children;
};

export default VisibilityRoute;
