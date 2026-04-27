import React, { useState } from 'react';
import api from '../api';
import AppLayout from '../layouts/AppLayout';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lock, CheckCircle, AlertCircle, Layout } from 'lucide-react';

const Settings = () => {
    const { isSuperAdmin } = useAuth();
    const navigate = useNavigate();
    const [currentPassword, setCurrentPassword] = useState('');
    // ... rest of state ...
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });
    const [isLoading, setIsLoading] = useState(false);

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match' });
            return;
        }

        if (newPassword.length < 6) {
            setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
            return;
        }

        setIsLoading(true);
        try {
            await api.post('/auth/change-password', {
                current_password: currentPassword,
                new_password: newPassword
            });
            setMessage({ type: 'success', text: 'Password changed successfully!' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            setMessage({
                type: 'error',
                text: err.response?.data?.error || 'Failed to change password'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AppLayout title="Settings" subtitle="Manage your account settings">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', maxWidth: '1000px' }}>
                <div className="card">
                    <div style={{ marginBottom: '28px' }}>
                        <h3 style={{
                            fontSize: '1.2rem',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            marginBottom: '6px'
                        }}>
                            <Lock size={22} color="var(--primary)" />
                            Change Password
                        </h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            Update your password to keep your account secure
                        </p>
                    </div>

                    {message.text && (
                        <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}
                             style={{ marginBottom: '20px' }}>
                            {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handlePasswordChange} style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '20px'
                    }}>
                        <div>
                            <label>Current Password</label>
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                required
                                placeholder="Enter current password"
                            />
                        </div>

                        <div>
                            <label>New Password</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                placeholder="Enter new password"
                            />
                        </div>

                        <div>
                            <label>Confirm New Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                placeholder="Confirm new password"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-primary"
                            style={{ marginTop: '8px' }}
                        >
                            {isLoading ? 'Updating...' : 'Update Password'}
                        </button>
                    </form>
                </div>

                {isSuperAdmin && (
                    <div className="card">
                        <div style={{ marginBottom: '28px' }}>
                            <h3 style={{
                                fontSize: '1.2rem',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                marginBottom: '6px'
                            }}>
                                <Layout size={22} color="var(--primary)" />
                                Panel Configuration
                            </h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                Manage visibility of pages and dashboard elements
                            </p>
                        </div>
                        
                        <div style={{ 
                            padding: '20px', 
                            background: 'var(--bg)', 
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '16px'
                        }}>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                Configure which parts of the admin panel are visible to users.
                            </div>
                            <button 
                                className="btn-secondary" 
                                onClick={() => navigate('/visibility-settings')}
                                style={{ justifyContent: 'center', padding: '12px' }}
                            >
                                Open Configuration
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
};

export default Settings;
