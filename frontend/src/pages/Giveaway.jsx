import React, { useState, useEffect } from 'react';
import api from '../api';
import AppLayout from '../layouts/AppLayout';
import { Gift, Trophy, History, User, Calendar, DollarSign, Loader2 } from 'lucide-react';

const Giveaway = () => {
    const [eligible, setEligible] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [drawing, setDrawing] = useState(false);
    const [winner, setWinner] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [eligibleRes, historyRes] = await Promise.all([
                api.get('/giveaway/eligible'),
                api.get('/giveaway/history')
            ]);
            setEligible(Array.isArray(eligibleRes.data) ? eligibleRes.data : []);
            setHistory(Array.isArray(historyRes.data) ? historyRes.data : []);
        } catch (error) {
            console.error('Error fetching giveaway data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const drawWinner = async () => {
        if (eligible.length === 0) return;
        setDrawing(true);
        setWinner(null);
        
        try {
            const response = await api.get('/giveaway/random-winner');
            setWinner(response.data.winner);
            fetchData(); // Refresh history and eligible
        } catch (error) {
            console.error('Error drawing winner:', error);
            alert('Failed to draw winner');
        } finally {
            setDrawing(false);
        }
    };

    return (
        <AppLayout title="Giveaway" subtitle="Manage and draw giveaway winners">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                <div className="card">
                    <div className="card-header">
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Trophy size={20} color="var(--primary)" />
                            Draw Winner
                        </h3>
                    </div>
                    
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <div style={{ 
                            fontSize: '3rem', 
                            fontWeight: '800', 
                            color: 'var(--primary)',
                            marginBottom: '8px'
                        }}>
                            {eligible.length}
                        </div>
                        <div style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>
                            Eligible Participants
                        </div>

                        {winner && (
                            <div style={{
                                background: 'var(--success-bg)',
                                border: '1px solid var(--success-border)',
                                padding: '20px',
                                borderRadius: 'var(--radius-md)',
                                marginBottom: '24px',
                                animation: 'bounceIn 0.5s ease'
                            }}>
                                <div style={{ color: '#065f46', fontWeight: '700', fontSize: '1.2rem', marginBottom: '4px' }}>
                                    Winner Selected!
                                </div>
                                <div style={{ fontWeight: '600' }}>{winner.winner_name}</div>
                                <div style={{ fontSize: '0.85rem', color: '#065f46' }}>{winner.winner_email}</div>
                            </div>
                        )}

                        <button 
                            className="btn-primary" 
                            style={{ width: '100%', padding: '16px' }}
                            onClick={drawWinner}
                            disabled={drawing || eligible.length === 0}
                        >
                            {drawing ? (
                                <>
                                    <Loader2 size={18} className="spinner" />
                                    Selecting Winner...
                                </>
                            ) : (
                                <>
                                    <Gift size={18} />
                                    Draw a Winner
                                </>
                            )}
                        </button>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <History size={20} color="var(--primary)" />
                            Winner History
                        </h3>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '400px', overflowY: 'auto' }}>
                        {history.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                No winners yet
                            </div>
                        ) : (
                            history.map((win) => (
                                <div key={win.id} style={{
                                    padding: '16px',
                                    background: 'var(--bg)',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--border)'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <div style={{ fontWeight: '700' }}>{win.winner_name}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                            {new Date(win.drawn_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Calendar size={14} />
                                        Emirate: {win.winner_emirate || 'N/A'}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default Giveaway;
