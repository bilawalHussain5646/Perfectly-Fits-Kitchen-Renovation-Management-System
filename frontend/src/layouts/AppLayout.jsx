import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Menu } from 'lucide-react';

const AppLayout = ({ children, title, subtitle }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="app-layout">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <main className="main-content">
                <header className="page-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button
                            className="mobile-menu-btn"
                            onClick={() => setSidebarOpen(true)}
                            aria-label="Open menu"
                        >
                            <Menu size={22} />
                        </button>
                        <div>
                            <h1>{title}</h1>
                            {subtitle && <p className="subtitle">{subtitle}</p>}
                        </div>
                    </div>
                </header>

                {children}
            </main>
        </div>
    );
};

export default AppLayout;
