import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import VisibilityRoute from './components/VisibilityRoute';
import CreateInvoice from './pages/CreateInvoice';
import Invoices from './pages/Invoices';
import Settings from './pages/Settings';
import Giveaway from './pages/Giveaway';
import UserManagement from './pages/UserManagement';
import { ConfigProvider } from './context/ConfigContext';
import VisibilitySettings from './pages/VisibilitySettings';

function App() {
    return (
        <AuthProvider>
            <ConfigProvider>
                <Router>
                    <Routes>
                        <Route path="/login" element={<Login />} />

                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute>
                                    <VisibilityRoute visibilityKey="show_dashboard_page">
                                        <Dashboard />
                                    </VisibilityRoute>
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/create-invoice"
                            element={
                                <ProtectedRoute>
                                    <VisibilityRoute visibilityKey="show_create_invoice_page">
                                        <CreateInvoice />
                                    </VisibilityRoute>
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/invoices"
                            element={
                                <ProtectedRoute>
                                    <VisibilityRoute visibilityKey="show_invoices_page">
                                        <Invoices />
                                    </VisibilityRoute>
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/settings"
                            element={
                                <ProtectedRoute>
                                    <VisibilityRoute visibilityKey="show_settings_page">
                                        <Settings />
                                    </VisibilityRoute>
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/giveaway"
                            element={
                                <ProtectedRoute>
                                    <VisibilityRoute visibilityKey="show_giveaway_page">
                                        <Giveaway />
                                    </VisibilityRoute>
                                </ProtectedRoute>
                            }
                        />

                        {/* Super admin only — no visibility key needed */}
                        <Route
                            path="/visibility-settings"
                            element={
                                <ProtectedRoute>
                                    <VisibilitySettings />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/users"
                            element={
                                <ProtectedRoute>
                                    <UserManagement />
                                </ProtectedRoute>
                            }
                        />

                        <Route path="/" element={<Navigate to="/invoices" replace />} />
                    </Routes>
                </Router>
            </ConfigProvider>
        </AuthProvider>
    );
}

export default App;
