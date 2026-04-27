import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lock, User, ArrowRight, Shield } from 'lucide-react';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/invoices');
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const response = await api.post('/auth/login', {
                username,
                password
            });
            login(response.data.access_token, {
                username: response.data.username,
                is_super_admin: response.data.is_super_admin
            });
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid credentials');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-brand-panel">
                <div className="deco-circle"></div>
                <div className="deco-circle"></div>
                <div className="deco-circle"></div>

                <div className="login-brand-content">
                    <div className="login-brand-logo" style={{ background: 'white', padding: '10px' }}>
                        <img src="https://lggf-promotor.com/img/logo.f5171e37.svg" alt="LG Logo" style={{ width: '100%', height: '100%' }} />
                    </div>

                    <h1>Data Management</h1>
                    <p className="tagline">Secure Portal</p>

                    <div className="login-features">
                        {[
                            { icon: <Shield size={16} />, text: 'Secure Access' },
                            { icon: <Lock size={16} />, text: 'Encrypted' }
                        ].map((feature, idx) => (
                            <div key={idx} className="login-feature-badge">
                                {feature.icon}
                                <span>{feature.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="login-form-panel">
                <div className="login-form-wrapper">
                    <h2>Welcome Back</h2>
                    <p className="login-sub">Enter your credentials to access your account</p>

                    {error && (
                        <div className="alert alert-error" style={{ marginBottom: '20px' }}>
                            <span style={{ fontSize: '1.1rem' }}>⚠</span>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="login-form">
                        <div>
                            <label>Username</label>
                            <div className="login-input-group">
                                <User size={18} className="icon" />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    placeholder="Enter your username"
                                />
                            </div>
                        </div>

                        <div>
                            <label>Password</label>
                            <div className="login-input-group">
                                <Lock size={18} className="icon" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="Enter your password"
                                />
                            </div>
                        </div>

                        <div className="login-extras">
                            <label>
                                <input type="checkbox" />
                                Remember me
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-primary"
                            style={{ width: '100%', padding: '16px', marginTop: '4px' }}
                        >
                            {isLoading ? (
                                <>
                                    <div className="spinner"></div>
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
