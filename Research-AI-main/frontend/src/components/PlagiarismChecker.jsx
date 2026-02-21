import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { checkPlagiarism } from '../services/api';
import { ShieldAlert, FileText, CheckCircle, Upload, AlertTriangle, Loader, AlertCircle, Globe, Hash, Zap, Book } from 'lucide-react';

const CircularProgress = ({ value, label, color }) => {
    const radius = 35;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{ position: 'relative', width: '90px', height: '90px' }}>
                <svg width="90" height="90" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="45" cy="45" r={radius} stroke="#334155" strokeWidth="8" fill="transparent" />
                    <motion.circle
                        cx="45" cy="45" r={radius} stroke={color} strokeWidth="8" fill="transparent"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        strokeLinecap="round"
                    />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 'bold' }}>
                    {value}%
                </div>
            </div>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>{label}</span>
        </div>
    );
};

const StatBadge = ({ icon: Icon, label, value, color }) => (
    <div style={{ background: '#0f172a', padding: '10px 15px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid #334155' }}>
        <Icon size={16} color={color} />
        <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>{label}</div>
            <div style={{ fontSize: '0.9rem', color: '#f1f5f9', fontWeight: 600 }}>{value}</div>
        </div>
    </div>
);

const PlagiarismChecker = () => {
    const [text, setText] = useState('');
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    const handleCheck = async () => {
        if (!text && !file) {
            setError("Please enter text or upload a file.");
            return;
        }

        setLoading(true);
        setError('');
        setResult(null);

        try {
            let data;
            if (file) {
                const formData = new FormData();
                formData.append('file', file);
                data = formData;
            } else {
                data = { text };
            }

            const res = await checkPlagiarism(data);
            setResult(res.data.result);
        } catch (err) {
            console.error(err);
            setError("Failed to check plagiarism. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            height: '100vh',
            background: '#0b0c10',
            color: '#e2e8f0',
            overflowY: 'auto',
            padding: '2rem'
        }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        style={{ display: 'inline-block', padding: '1rem', background: 'rgba(45, 212, 191, 0.1)', borderRadius: '20px', marginBottom: '1rem' }}
                    >
                        <ShieldAlert size={48} color="#2dd4bf" />
                    </motion.div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 700, background: 'linear-gradient(to right, #2dd4bf, #0ea5e9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.5rem' }}>
                        Research Paper Plagiarism Checker
                    </h1>
                    <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>Advanced Perplexity, Burstiness & Web-Match Analysis.</p>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem' }}>

                    {/* Left Column: Input */}
                    <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        style={{ background: '#1e293b', borderRadius: '24px', padding: '2rem', border: '1px solid #334155', alignSelf: 'start' }}
                    >
                        <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.25rem', marginBottom: '1.5rem' }}>
                            <FileText size={20} color="#cbd5e1" /> Document Input
                        </h2>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <textarea
                                placeholder="Paste text for advanced analysis..."
                                value={text}
                                onChange={(e) => { setText(e.target.value); setFile(null); }}
                                style={{
                                    width: '100%',
                                    height: '350px',
                                    padding: '1rem',
                                    borderRadius: '12px',
                                    background: '#0f172a',
                                    border: '1px solid #334155',
                                    color: '#f1f5f9',
                                    fontSize: '1rem',
                                    resize: 'none',
                                    outline: 'none',
                                    fontFamily: 'inherit'
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                            <label style={{
                                flex: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                padding: '0.75rem',
                                background: '#334155',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                color: '#e2e8f0',
                                border: file ? '1px solid #2dd4bf' : '1px solid transparent'
                            }}>
                                <Upload size={16} color={file ? '#2dd4bf' : '#e2e8f0'} />
                                {file ? file.name : "Upload Research Paper"}
                                <input type="file" onChange={(e) => { setFile(e.target.files[0]); setText(''); }} style={{ display: 'none' }} accept=".pdf,.txt" />
                            </label>
                        </div>

                        {error && <div style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}><AlertCircle size={16} /> {error}</div>}

                        <button
                            onClick={handleCheck}
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '1.25rem',
                                borderRadius: '12px',
                                background: loading ? '#334155' : 'linear-gradient(135deg, #2dd4bf 0%, #0ea5e9 100%)',
                                border: 'none',
                                color: '#fff',
                                fontWeight: 600,
                                fontSize: '1rem',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px'
                            }}
                        >
                            {loading ? <><Loader size={20} className="spin" /> Cross-Referencing Knowledge...</> : "Generate Plagiarism Report"}
                        </button>
                    </motion.div>

                    {/* Right Column: Result */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <motion.div
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            style={{ background: '#1e293b', borderRadius: '24px', padding: '2rem', border: '1px solid #334155', flex: 1 }}
                        >
                            {!result ? (
                                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#64748b', opacity: 0.5 }}>
                                    <ShieldAlert size={80} style={{ marginBottom: '1.5rem' }} />
                                    <p style={{ fontSize: '1.1rem' }}>No active audit. Run analysis to see results.</p>
                                </div>
                            ) : (
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                                        <h2 style={{ fontSize: '1.5rem', color: '#f1f5f9', margin: 0 }}>Audit Report</h2>
                                        <div style={{ padding: '6px 15px', background: result.originality_score > 70 ? 'rgba(45, 212, 191, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: result.originality_score > 70 ? '#2dd4bf' : '#ef4444', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', border: '1px solid' }}>
                                            {result.originality_score > 70 ? 'Likely Authentic' : 'Suspicious'}
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
                                        <CircularProgress value={result.originality_score} label="Originality" color="#2dd4bf" />
                                        <CircularProgress value={result.ai_detection_score} label="AI Probability" color="#f472b6" />
                                        <CircularProgress value={result.plagiarism_score} label="Plagiarism" color="#ef4444" />
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2.5rem' }}>
                                        <StatBadge icon={Zap} label="Perplexity" value={result.perplexity} color="#60a5fa" />
                                        <StatBadge icon={Hash} label="Burstiness" value={result.burstiness} color="#fbbf24" />
                                    </div>

                                    <div style={{ marginBottom: '2rem' }}>
                                        <h3 style={{ fontSize: '1rem', color: '#94a3b8', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Globe size={18} /> Web & Knowledge-Base Matches</h3>
                                        <div style={{ background: '#0f172a', borderRadius: '12px', padding: '1rem' }}>
                                            {result.web_matches && result.web_matches.length > 0 ? (
                                                result.web_matches.map((m, i) => (
                                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < result.web_matches.length - 1 ? '1px solid #1e293b' : 'none' }}>
                                                        <span style={{ color: '#e2e8f0', fontSize: '0.9rem' }}>{m.source}</span>
                                                        <span style={{ color: '#ef4444', fontWeight: 700 }}>{m.match_percentage}% Match</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <div style={{ color: '#64748b', fontSize: '0.9rem' }}>No significant web matches detected.</div>
                                            )}
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: '2rem' }}>
                                        <h3 style={{ fontSize: '1rem', color: '#94a3b8', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Book size={18} /> Internal Database Matches</h3>
                                        <div style={{ background: '#0f172a', borderRadius: '12px', padding: '1rem' }}>
                                            {result.internal_matches && result.internal_matches.length > 0 ? (
                                                result.internal_matches.map((m, i) => (
                                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < result.internal_matches.length - 1 ? '1px solid #1e293b' : 'none' }}>
                                                        <span style={{ color: '#e2e8f0', fontSize: '0.9rem' }}>Similarity with {m.source}</span>
                                                        <span style={{ color: '#ef4444', fontWeight: 700 }}>Conflict Detected</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <div style={{ color: '#64748b', fontSize: '0.9rem' }}>No internal conflicts found.</div>
                                            )}
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: '2rem' }}>
                                        <h3 style={{ fontSize: '1rem', color: '#94a3b8', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Book size={18} /> Citation Audit</h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            {result.citation_report && result.citation_report.length > 0 ? (
                                                result.citation_report.map((c, i) => (
                                                    <div key={i} style={{ background: '#0f172a', padding: '12px', borderRadius: '10px', borderLeft: `3px solid ${c.status === 'Verified' ? '#2dd4bf' : '#ef4444'}` }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                            <span style={{ fontSize: '0.9rem', color: '#f1f5f9', fontWeight: 600 }}>{c.citation}</span>
                                                            <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '10px', background: c.status === 'Verified' ? 'rgba(45, 212, 191, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: c.status === 'Verified' ? '#2dd4bf' : '#ef4444' }}>{c.status}</span>
                                                        </div>
                                                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{c.reason}</div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div style={{ color: '#64748b', fontSize: '0.9rem', padding: '10px', background: '#0f172a', borderRadius: '10px' }}>No formal citations detected in snippet.</div>
                                            )}
                                        </div>
                                    </div>

                                    <div style={{ background: '#0f172a', padding: '1.5rem', borderRadius: '16px', border: '1px solid #334155' }}>
                                        <h3 style={{ fontSize: '0.9rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '1px' }}>Linguistic Assessment</h3>
                                        <p style={{ color: '#e2e8f0', lineHeight: 1.7, margin: 0, fontSize: '0.95rem' }}>{result.assessment}</p>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>
            </div>
            <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default PlagiarismChecker;
