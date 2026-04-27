import React from 'react';
import { Home, FileText, Settings, LogOut, PlusCircle, X, Gift, UsersRound, Layout } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

import { useConfig } from '../context/ConfigContext';

const Sidebar = ({ isOpen, onClose }) => {
    const { logout, isSuperAdmin } = useAuth();
    const { visibility, loading } = useConfig();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleNav = (path) => {
        navigate(path);
        if (onClose) onClose();
    };

    const isActive = (path) => location.pathname === path;

    const allNavItems = [
        { path: '/dashboard', icon: <Home size={20} />, label: 'Dashboard', key: 'show_dashboard_page' },
        { path: '/create-invoice', icon: <PlusCircle size={20} />, label: 'Create Invoice', key: 'show_create_invoice_page' },
        { path: '/invoices', icon: <FileText size={20} />, label: 'Entries', key: 'show_invoices_page' },
        { path: '/giveaway', icon: <Gift size={20} />, label: 'Giveaway', key: 'show_giveaway_page' },
        { path: '/settings', icon: <Settings size={20} />, label: 'Settings', key: 'show_settings_page' },
    ];

    const navItems = allNavItems.filter(item => {
        // If it's a super admin, they see everything or we can still hide for them if we want
        // Usually, super admin should see everything by default, but let's follow the "hide" rule
        // BUT if it's hidden, even super admin shouldn't see it in the main flow unless they unhide it?
        // Let's make it so super admin sees it if either isSuperAdmin is true AND (visibility[item.key] is true OR item.key is undefined)
        if (item.key && visibility[item.key] === false) return false;
        return true;
    });

    // Add super admin only pages
    if (isSuperAdmin) {
        navItems.push({ path: '/users', icon: <UsersRound size={20} />, label: 'User Management' });
        navItems.push({ path: '/visibility-settings', icon: <Layout size={20} />, label: 'Panel Config' });
    }

    return (
        <>
            <div
                className={`sidebar-overlay ${isOpen ? 'visible' : ''}`}
                onClick={onClose}
            />

            <div className={`sidebar ${isOpen ? 'open' : ''}`}>
                <div>
                    <div className="sidebar-brand">
                        <div className="sidebar-brand-logo" style={{ background: 'white', padding: '5px' }}>
                            <img src="https://lggf-promotor.com/img/logo.f5171e37.svg" alt="LG Logo" style={{ width: '100%', height: '100%' }} />
                        </div>
                        <div className="sidebar-brand-text">
                            <div className="brand-name">LGE GF</div>
                            <div className="brand-sub">Management Panel</div>
                        </div>
                        {isOpen && (
                            <button
                                onClick={onClose}
                                style={{
                                    marginLeft: 'auto',
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--text-muted)',
                                    cursor: 'pointer',
                                    padding: '4px',
                                    display: 'none'
                                }}
                                className="mobile-close-btn"
                            >
                                <X size={20} />
                            </button>
                        )}
                    </div>

                    <nav>
                        <ul>
                            {!loading && navItems.map((item) => (
                                <li
                                    key={item.path}
                                    className={`sidebar-nav-item ${isActive(item.path) ? 'active' : ''}`}
                                    onClick={() => handleNav(item.path)}
                                >
                                    {item.icon}
                                    <span>{item.label}</span>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>

                <div className="sidebar-footer">
                    <button className="sidebar-logout" onClick={handleLogout}>
                        <LogOut size={20} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
