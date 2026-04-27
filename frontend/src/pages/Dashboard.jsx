import React, { useState, useEffect, useRef } from 'react';
import api from '../api';
import AppLayout from '../layouts/AppLayout';
import { FileText, DollarSign, Users, BarChart3 } from 'lucide-react';
import { useConfig } from '../context/ConfigContext';

const Dashboard = () => {
    const { visibility } = useConfig();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            const response = await api.get('/stats');
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const allStatCards = stats ? [
        {
            label: 'Total Records',
            value: stats.total,
            sub: 'All time entries',
            icon: <FileText size={24} />,
            color: '#A50034',
            key: 'show_total_records_card'
        },
        {
            label: 'With Proof of Purchase',
            value: stats.with_receipts,
            sub: 'Entries with attachments',
            icon: <DollarSign size={24} />,
            color: '#10b981',
            key: 'show_above_7000_card'
        },
        {
            label: 'Giveaway Participants',
            value: stats.giveaway_participants,
            sub: 'Eligible for draw',
            icon: <Users size={24} />,
            color: '#3b82f6',
            key: 'show_participants_card'
        }
    ] : [];

    const statCards = allStatCards.filter(card => !visibility || visibility[card.key] !== false);

    const monthlyTrend = stats?.monthly_trend || [];
    const maxMonthly = Math.max(...monthlyTrend.map(m => m.count), 1);

    const barColors = ['#A50034', '#d4004a', '#e8336a', '#f06090', '#f799b5', '#fcc8d6'];

    return (
        <AppLayout title="Dashboard" subtitle="Overview of participation records">
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
                    <div className="spinner" style={{
                        width: '40px', height: '40px',
                        border: '4px solid var(--border)',
                        borderTopColor: 'var(--primary)'
                    }}></div>
                </div>
            ) : (
                <>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                        gap: '20px',
                        marginBottom: '32px'
                    }}>
                        {statCards.map((card, idx) => (
                            <div className="stat-card" key={idx}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    marginBottom: '12px'
                                }}>
                                    <div className="stat-label">{card.label}</div>
                                    <div style={{
                                        width: '44px', height: '44px',
                                        borderRadius: 'var(--radius-md)',
                                        background: `${card.color}15`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: card.color
                                    }}>
                                        {card.icon}
                                    </div>
                                </div>
                                <div className="stat-value">{card.value}</div>
                                <div className="stat-sub">{card.sub}</div>
                            </div>
                        ))}
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr',
                        gap: '20px',
                        marginBottom: '32px'
                    }}>
                    {(!visibility || visibility.show_monthly_trend_chart !== false) && (
                        <div className="card">
                            <div className="card-header">
                                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <BarChart3 size={20} color="var(--primary)" />
                                    Monthly Trend
                                </h3>
                                <span className="badge">Last 6 months</span>
                            </div>
                            <div style={{
                                display: 'flex',
                                alignItems: 'flex-end',
                                justifyContent: 'space-between',
                                gap: '12px',
                                height: '200px',
                                padding: '0 8px'
                            }}>
                                {monthlyTrend.map((month, idx) => {
                                    const height = (month.count / maxMonthly) * 100;
                                    return (
                                        <div key={idx} style={{
                                            flex: 1,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}>
                                            <div style={{
                                                width: '100%',
                                                height: '140px',
                                                display: 'flex',
                                                alignItems: 'flex-end',
                                                justifyContent: 'center',
                                                position: 'relative'
                                            }}>
                                                <div style={{
                                                    width: '32px',
                                                    height: `${height}%`,
                                                    background: 'linear-gradient(180deg, var(--primary) 0%, var(--primary-dark) 100%)',
                                                    borderRadius: '6px 6px 0 0',
                                                    transition: 'height 1s cubic-bezier(0.4, 0, 0.2, 1)',
                                                    cursor: 'pointer'
                                                }} title={`${month.label}: ${month.count}`}></div>
                                            </div>
                                            <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)' }}>
                                                {month.label}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                    </div>
                </>
            )}
        </AppLayout>
    );
};

export default Dashboard;
