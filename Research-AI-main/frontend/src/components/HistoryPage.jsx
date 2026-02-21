import React, { useState, useEffect } from 'react';
import { getDashboardData } from '../services/api';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { History, Clock, FileText, ArrowRight, MessageSquare, Zap, Target, Bot, User } from 'lucide-react';

function parseMessages(content) {
    try {
        if (content && content.startsWith('[')) {
            const parsed = JSON.parse(content);
            if (Array.isArray(parsed)) return parsed;
        }
    } catch (_) { }
    return null;
}

export default function HistoryPage() {
    const navigate = useNavigate();
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

    const actionColor = {
        Chat: '#2dd4bf',
        Summarized: '#a78bfa',
        'Visual Abstract': '#f59e0b',
        'Forensic Audit': '#f472b6',
        'Web Research': '#0ea5e9',
    };

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
                    <p style={{ color: '#94a3b8', marginLeft: '3.5rem' }}>Click any chat to restore the full conversation.</p>
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
                        {history.map((item, idx) => {
                            const msgs = parseMessages(item.content);
                            const msgCount = msgs ? msgs.length : null;
                            const firstAI = msgs ? msgs.find(m => m.role === 'assistant')?.content : null;
                            const preview = firstAI ? (firstAI.slice(0, 120) + (firstAI.length > 120 ? '…' : '')) : null;
                            const accentColor = actionColor[item.action] || '#64748b';
                            const isClickable = item.action === 'Chat';

                            return (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    onClick={() => isClickable && navigate('/chat', { state: { historyItem: item } })}
                                    style={{
                                        background: '#1a2234',
                                        padding: '1.5rem',
                                        borderRadius: '16px',
                                        border: `1px solid ${isClickable ? '#2a3a5c' : '#1e293b'}`,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '0.75rem',
                                        transition: 'all 0.2s',
                                        cursor: isClickable ? 'pointer' : 'default'
                                    }}
                                    whileHover={isClickable ? { scale: 1.01, borderColor: accentColor + '55', background: '#1e2a40' } : {}}
                                >
                                    {/* Top row */}
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                                        <div style={{
                                            width: '44px', height: '44px', borderRadius: '12px',
                                            background: accentColor + '1a',
                                            border: `1px solid ${accentColor}40`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            flexShrink: 0
                                        }}>
                                            {item.action === 'Chat'
                                                ? <MessageSquare size={20} color={accentColor} />
                                                : <FileText size={20} color={accentColor} />}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#f1f5f9', wordBreak: 'break-word' }}>
                                                    {item.item || 'Untitled Activity'}
                                                </h4>
                                                {msgCount && (
                                                    <span style={{
                                                        fontSize: '0.7rem', padding: '2px 8px',
                                                        background: accentColor + '22', color: accentColor,
                                                        borderRadius: '99px', border: `1px solid ${accentColor}44`,
                                                        flexShrink: 0
                                                    }}>
                                                        {msgCount} messages
                                                    </span>
                                                )}
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '4px', fontSize: '0.8rem', color: '#64748b' }}>
                                                <span style={{ color: accentColor, fontWeight: 500 }}>{item.action}</span>
                                                <span>•</span>
                                                <span>{item.time || 'Unknown time'}</span>
                                            </div>
                                        </div>
                                        {isClickable && (
                                            <div style={{ color: '#475569', flexShrink: 0 }}>
                                                <ArrowRight size={18} />
                                            </div>
                                        )}
                                    </div>

                                    {/* AI response preview */}
                                    {preview && (
                                        <div style={{
                                            background: '#0f172a', borderRadius: '10px',
                                            padding: '0.75rem 1rem', fontSize: '0.82rem',
                                            color: '#94a3b8', lineHeight: 1.5,
                                            borderLeft: `3px solid ${accentColor}55`
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                                <Bot size={13} color={accentColor} />
                                                <span style={{ fontSize: '0.72rem', color: accentColor, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Response</span>
                                            </div>
                                            {preview}
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
