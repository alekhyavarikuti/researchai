import React, { useState, useEffect } from 'react';
import { getDashboardData } from '../services/api';
import { motion } from 'framer-motion';
import { History, Clock, FileText, ArrowRight } from 'lucide-react';

export default function HistoryPage() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getDashboardData()
            .then(res => {
                setHistory(res.data.recent_activity || []);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load history", err);
                setLoading(false);
            });
    }, []);

    return (
        <div style={{
            height: '100vh',
            background: '#0b0c10',
            color: '#e2e8f0',
            padding: '2rem',
            overflowY: 'auto'
        }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <header style={{ marginBottom: '3rem', borderBottom: '1px solid #1e293b', paddingBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '0.5rem' }}>
                        <div style={{ padding: '10px', background: 'rgba(45, 212, 191, 0.1)', borderRadius: '12px' }}>
                            <History size={24} color="#2dd4bf" />
                        </div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 700, background: 'linear-gradient(to right, #f1f5f9, #cbd5e1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
                            Activity History
                        </h1>
                    </div>
                    <p style={{ color: '#94a3b8', marginLeft: '3.5rem' }}>View your recent interactions and research activities.</p>
                </header>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>Loading history...</div>
                ) : history.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem', background: '#1e293b', borderRadius: '16px', border: '1px solid #334155' }}>
                        <Clock size={48} color="#475569" style={{ marginBottom: '1rem' }} />
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.5rem' }}>No history yet</h3>
                        <p style={{ color: '#94a3b8' }}>Start chatting or researching to see your activity here.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {history.map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                style={{
                                    background: '#1e293b',
                                    padding: '1.5rem',
                                    borderRadius: '16px',
                                    border: '1px solid #334155',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1.5rem',
                                    transition: 'transform 0.2s',
                                }}
                                whileHover={{ scale: 1.01, borderColor: '#475569' }}
                            >
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '12px',
                                    background: '#0f172a',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#2dd4bf',
                                    flexShrink: 0
                                }}>
                                    {item.action === 'Chat' ? <History size={20} /> : <FileText size={20} />}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem', fontWeight: 600, color: '#f1f5f9' }}>
                                        {item.item || "Untitled Activity"}
                                    </h4>
                                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: '#94a3b8' }}>
                                        <span>{item.action}</span>
                                        <span>•</span>
                                        <span>{item.time || 'Unknown time'}</span>
                                    </div>
                                </div>
                                <div style={{ color: '#64748b' }}>
                                    {/* Could add action buttons here later */}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
