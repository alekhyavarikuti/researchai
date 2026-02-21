import { useState, useRef, useEffect } from 'react';
import { uploadPaper, getPapers, summarizePaper } from '../services/api';
import { UploadCloud, FileText, Wand2, X, AlertCircle, CheckCircle, Loader2, BookOpen, Clock, FileType } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Library() {
    const [papers, setPapers] = useState([]);
    const [status, setStatus] = useState('idle');
    const [selectedPaper, setSelectedPaper] = useState(null);
    const [summary, setSummary] = useState('');
    const [loadingSummary, setLoadingSummary] = useState(false);
    const fileInput = useRef(null);

    useEffect(() => {
        loadPapers();
    }, []);

    const loadPapers = async () => {
        try {
            const res = await getPapers();
            setPapers(res.data.papers);
        } catch (error) {
            console.error(error);
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setStatus('uploading');
        try {
            await uploadPaper(file);
            setStatus('success');
            await loadPapers(); // Refresh list
            setTimeout(() => setStatus('idle'), 3000);
        } catch (error) {
            console.error(error);
            setStatus('error');
            setTimeout(() => setStatus('idle'), 3000);
        }
    };

    const handleSummarize = async (filename) => {
        setSelectedPaper(filename);
        setLoadingSummary(true);
        setSummary('');
        try {
            const res = await summarizePaper({ filename });
            setSummary(res.data.summary);
        } catch (error) {
            console.error(error);
            setSummary('Error generating summary. Please try again.');
        } finally {
            setLoadingSummary(false);
        }
    };

    const handleModalClick = (e) => {
        if (e.target === e.currentTarget) {
            setSelectedPaper(null);
        }
    };

    return (
        <div style={{
            height: '100%',
            background: '#0b0c10',
            overflowY: 'auto',
            padding: '2rem'
        }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '3rem' }}>

                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
                        Knowledge Base
                    </h1>
                    <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>Manage your research repository and generate AI-powered insights.</p>
                </motion.div>

                {/* Upload Area */}
                <motion.div
                    whileHover={{ scale: 1.01 }}
                    style={{
                        padding: '4rem 2rem',
                        textAlign: 'center',
                        cursor: 'pointer',
                        border: '2px dashed #334155',
                        borderRadius: '24px',
                        background: status === 'uploading' ? 'rgba(7, 89, 133, 0.1)' : 'rgba(30, 41, 59, 0.5)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        position: 'relative',
                        overflow: 'hidden',
                        backdropFilter: 'blur(20px)'
                    }}
                    onClick={() => status !== 'uploading' && fileInput.current.click()}
                >
                    <input
                        type="file"
                        ref={fileInput}
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                        accept=".pdf,.txt"
                    />

                    <div style={{ position: 'relative', zIndex: 10 }}>
                        {status === 'idle' && (
                            <>
                                <div style={{ width: '80px', height: '80px', background: 'rgba(45, 212, 191, 0.1)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', border: '1px solid rgba(45, 212, 191, 0.2)' }}>
                                    <UploadCloud size={40} color="#2dd4bf" />
                                </div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#fff', marginBottom: '0.5rem' }}>Drop your research here</h3>
                                <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Supports PDF and TXT documents up to 10MB</p>
                            </>
                        )}

                        {status === 'uploading' && (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <Loader2 size={48} color="#2dd4bf" className="spin" style={{ marginBottom: '1.5rem' }} />
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#2dd4bf' }}>Processing Document...</h3>
                                <p style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '0.5rem' }}>AI is indexing content for searching</p>
                            </div>
                        )}

                        {status === 'success' && (
                            <>
                                <div style={{ width: '80px', height: '80px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                    <CheckCircle size={40} color="#10b981" />
                                </div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#10b981' }}>Analysis Complete</h3>
                            </>
                        )}

                        <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
                    </div>
                </motion.div>

                {/* Papers List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <BookOpen size={20} color="#2dd4bf" /> Repository
                        </h3>
                        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{papers.length} Documents</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                        {papers.length === 0 ? (
                            <div style={{ gridColumn: '1 / -1', padding: '4rem', textAlign: 'center', color: '#475569', background: 'rgba(30, 41, 59, 0.3)', borderRadius: '20px', border: '1px dashed #334155' }}>
                                No research papers found. Upload your first document to begin.
                            </div>
                        ) : (
                            papers.map((paper, index) => (
                                <motion.div
                                    key={index}
                                    whileHover={{ y: -5 }}
                                    style={{
                                        background: '#1e293b',
                                        padding: '1.5rem',
                                        borderRadius: '20px',
                                        border: '1px solid #334155',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '1.5rem',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                                        <div style={{ width: '48px', height: '48px', background: '#0f172a', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <FileType size={24} color="#2dd4bf" />
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ fontWeight: 600, color: '#f1f5f9', fontSize: '1rem', margin: '0 0 0.5rem 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {paper}
                                            </p>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.8rem' }}>
                                                <Clock size={12} /> Added Recently
                                            </div>
                                        </div>
                                    </div>

                                    <motion.button
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleSummarize(paper)}
                                        style={{
                                            width: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '10px',
                                            background: 'rgba(255, 255, 255, 0.05)',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            color: '#e2e8f0',
                                            padding: '0.75rem',
                                            borderRadius: '12px',
                                            fontSize: '0.9rem',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => { e.target.style.background = 'rgba(255, 255, 255, 0.1)'; e.target.style.color = '#fff'; }}
                                        onMouseLeave={(e) => { e.target.style.background = 'rgba(255, 255, 255, 0.05)'; e.target.style.color = '#e2e8f0'; }}
                                    >
                                        <Wand2 size={16} color="#2dd4bf" /> Digest Insight
                                    </motion.button>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>

                {/* Summary Modal */}
                <AnimatePresence>
                    {selectedPaper && (
                        <div
                            onClick={handleModalClick}
                            style={{
                                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                                background: 'rgba(0, 0, 0, 0.8)',
                                backdropFilter: 'blur(8px)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
                                padding: '1rem'
                            }}
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                style={{
                                    width: '100%',
                                    maxWidth: '800px',
                                    maxHeight: '85vh',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    background: '#1e293b',
                                    border: '1px solid #334155',
                                    borderRadius: '24px',
                                    overflow: 'hidden',
                                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                                }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div style={{ padding: '2rem', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ minWidth: 0 }}>
                                        <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>AI Digest</h3>
                                        <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{selectedPaper}</p>
                                    </div>
                                    <button
                                        onClick={() => setSelectedPaper(null)}
                                        style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s', color: '#94a3b8' }}
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <div style={{ padding: '2.5rem', overflowY: 'auto', flex: 1 }}>
                                    {loadingSummary ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
                                            <Loader2 size={48} color="#2dd4bf" className="spin" style={{ marginBottom: '1.5rem' }} />
                                            <p style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '1.1rem' }}>Analyzing latent semantics...</p>
                                            <p style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '0.5rem' }}>Synthesizing key methodologies and findings</p>
                                        </div>
                                    ) : (
                                        <div style={{ fontSize: '1.05rem', lineHeight: '1.8', color: '#cbd5e1', whiteSpace: 'pre-wrap' }}>
                                            {summary}
                                        </div>
                                    )}
                                </div>

                                {!loadingSummary && (
                                    <div style={{ padding: '1.5rem 2rem', borderTop: '1px solid #334155', background: '#0f172a', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                        <button
                                            onClick={() => setSelectedPaper(null)}
                                            style={{ background: 'transparent', border: '1px solid #334155', color: '#94a3b8', padding: '0.75rem 1.5rem', borderRadius: '12px', fontWeight: 600, cursor: 'pointer' }}
                                        >
                                            Close
                                        </button>
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(summary);
                                                alert("Summary copied to clipboard!");
                                            }}
                                            style={{ background: 'linear-gradient(135deg, #2dd4bf, #0ea5e9)', border: 'none', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}
                                        >
                                            Copy Analysis
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

