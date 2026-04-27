import React, { useState, useEffect } from 'react';
import api from '../api';
import AppLayout from '../layouts/AppLayout';
import { Layout, CheckCircle, AlertCircle, Save, Power } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const VisibilitySettings = () => {
    const { isSuperAdmin } = useAuth();
    const navigate = useNavigate();
    const [settings, setSettings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (!isSuperAdmin) {
            navigate('/dashboard');
            return;
        }
        fetchSettings();
    }, [isSuperAdmin, navigate]);

    const fetchSettings = async () => {
        try {
            const response = await api.get('/settings/visibility');
            setSettings(response.data);
        } catch (error) {
            console.error('Error fetching visibility settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = (key) => {
        setSettings(prev => prev.map(s => 
            s.key === key ? { ...s, value: !s.value } : s
        ));
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage({ type: '', text: '' });
        
        const updateData = {};
        settings.forEach(s => {
            updateData[s.key] = s.value;
        });

        try {
            await api.post('/settings/visibility', updateData);
            setMessage({ type: 'success', text: 'Settings updated successfully!' });
            
            // Notify other components (Sidebar, Dashboard) to refresh
            window.dispatchEvent(new CustomEvent('visibilitySettingsUpdated'));
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update settings' });
        } finally {
            setSaving(false);
        }
    };

    const pages = settings.filter(s => s.category === 'page');
    const elements = settings.filter(s => s.category === 'dashboard_element');

    return (
        <AppLayout title="Panel Configuration" subtitle="Control visibility of pages and UI elements">
            <div style={{ maxWidth: '800px' }}>
                {message.text && (
                    <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}
                         style={{ marginBottom: '24px' }}>
                        {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                        {message.text}
                    </div>
                )}

                <div style={{ display: 'grid', gap: '24px' }}>
                    <div className="card">
                        <div className="card-header">
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Layout size={20} color="var(--primary)" />
                                Page Navigation
                            </h3>
                            <span className="badge">Control sidebar links</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {pages.map(setting => (
                                <div key={setting.key} style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center',
                                    padding: '12px 16px',
                                    background: 'var(--bg)',
                                    borderRadius: 'var(--radius-md)'
                                }}>
                                    <div>
                                        <div style={{ fontWeight: '600' }}>{setting.label}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                            Show "{setting.label.replace(' Page', '')}" in sidebar
                                        </div>
                                    </div>
                                    <button 
                                        className={`btn-toggle ${setting.value ? 'active' : ''}`}
                                        onClick={() => handleToggle(setting.key)}
                                        style={{
                                            width: '56px',
                                            height: '28px',
                                            borderRadius: '20px',
                                            position: 'relative',
                                            border: 'none',
                                            cursor: 'pointer',
                                            padding: 0
                                        }}
                                    >
                                        <div style={{
                                            width: '20px',
                                            height: '20px',
                                            background: 'white',
                                            borderRadius: '50%',
                                            position: 'absolute',
                                            top: '4px',
                                            left: setting.value ? '32px' : '4px',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                        }}></div>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Layout size={20} color="var(--primary)" />
                                Dashboard Elements
                            </h3>
                            <span className="badge">Control home widgets</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {elements.map(setting => (
                                <div key={setting.key} style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center',
                                    padding: '12px 16px',
                                    background: 'var(--bg)',
                                    borderRadius: 'var(--radius-md)'
                                }}>
                                    <div>
                                        <div style={{ fontWeight: '600' }}>{setting.label}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                            Toggle visibility of this element
                                        </div>
                                    </div>
                                    <button 
                                        className={`btn-toggle ${setting.value ? 'active' : ''}`}
                                        onClick={() => handleToggle(setting.key)}
                                        style={{
                                            width: '56px',
                                            height: '28px',
                                            borderRadius: '20px',
                                            position: 'relative',
                                            border: 'none',
                                            cursor: 'pointer',
                                            padding: 0
                                        }}
                                    >
                                        <div style={{
                                            width: '20px',
                                            height: '20px',
                                            background: 'white',
                                            borderRadius: '50%',
                                            position: 'absolute',
                                            top: '4px',
                                            left: setting.value ? '32px' : '4px',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                        }}></div>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                        <button 
                            className="btn-primary" 
                            onClick={handleSave}
                            disabled={saving}
                            style={{ height: '52px', padding: '0 40px' }}
                        >
                            {saving ? (
                                <div className="spinner"></div>
                            ) : (
                                <>
                                    <Save size={18} />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default VisibilitySettings;
