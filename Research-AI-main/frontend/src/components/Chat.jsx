import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    askQuestion, uploadPaper, getDashboardData, visualizePaper, deepWebResearch,
    getKnowledgeGraph, getPapers, getPaperContent, summarizePaper, matchJournals,
    getResearchTrends, scoutFunding, checkIEEEFormat, draftAcademicSection,
    synthesizePapers, createRoom, getRoom, addRoomMessage, saveChatHistory
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Paperclip, Sparkles, Send, User, Users, ArrowUp, Bot, FileText, Zap, X, Menu, History, MessageSquare, Trash2, Volume2, VolumeX, Globe, Share2, ExternalLink, Network, BarChart2, LineChart, TrendingUp, DollarSign, Award, FileCheck, PenTool, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Customized Animation Components ---

const ReadingAnimation = () => (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '20px', padding: '0 10px' }}>
        <style>{`
            @keyframes sound-wave {
                0%, 100% { height: 4px; }
                50% { height: 16px; }
            }
            .wave-bar {
                width: 3px;
                background: #2dd4bf;
                border-radius: 1px;
                animation: sound-wave 1s infinite ease-in-out;
            }
        `}</style>
        <div className="wave-bar" style={{ animationDelay: '0s' }}></div>
        <div className="wave-bar" style={{ animationDelay: '0.2s' }}></div>
        <div className="wave-bar" style={{ animationDelay: '0.4s' }}></div>
        <div className="wave-bar" style={{ animationDelay: '0.1s' }}></div>
        <div className="wave-bar" style={{ animationDelay: '0.3s' }}></div>
    </div>
);

const ThinkingAnimation = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '12px' }}>
        <style>{`
            @keyframes pulse-teal {
                0%, 100% { opacity: 0.3; transform: scale(0.8); }
                50% { opacity: 1; transform: scale(1.1); }
            }
            .dot-teal {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: linear-gradient(135deg, #2dd4bf, #0ea5e9); 
                animation: pulse-teal 1.4s infinite ease-in-out both;
            }
        `}</style>
        <div className="dot-teal" style={{ animationDelay: '0s' }}></div>
        <div className="dot-teal" style={{ animationDelay: '0.2s' }}></div>
        <div className="dot-teal" style={{ animationDelay: '0.4s' }}></div>
    </div>
);

const ImageGenerationAnimation = () => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '2rem', background: '#0f172a', borderRadius: '24px', border: '1px dashed #2dd4bf', maxWidth: '400px', margin: '1rem auto' }}>
        <style>{`
            @keyframes scan {
                0% { top: 0; }
                100% { top: 100%; }
            }
            @keyframes shimmer {
                0% { background-position: -200% 0; }
                100% { background-position: 200% 0; }
            }
        `}</style>
        <div style={{ width: '150px', height: '150px', borderRadius: '16px', background: 'linear-gradient(90deg, #1e293b 25%, #334155 50%, #1e293b 75%)', backgroundSize: '200% 100%', animation: 'shimmer 2s infinite', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', left: 0, width: '100%', height: '2px', background: '#2dd4bf', boxShadow: '0 0 15px #2dd4bf', animation: 'scan 3s linear infinite' }}></div>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={32} color="#2dd4bf" className="pulse" />
            </div>
        </div>
        <p style={{ color: '#2dd4bf', fontWeight: 600, fontSize: '0.85rem', textAlign: 'center' }}>
            Synthesizing visual concepts...
        </p>
    </div>
);

const SearchAnimation = () => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '1.5rem', background: 'rgba(14, 165, 233, 0.05)', borderRadius: '20px', border: '1px solid rgba(14, 165, 233, 0.2)', marginBottom: '1rem' }}>
        <style>{`
            @keyframes orbit {
                from { transform: rotate(0deg) translateX(20px) rotate(0deg); }
                to { transform: rotate(360deg) translateX(20px) rotate(-360deg); }
            }
        `}</style>
        <div style={{ position: 'relative', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Globe size={32} color="#0ea5e9" className="pulse" />
            <div style={{ position: 'absolute', width: '8px', height: '8px', borderRadius: '50%', background: '#2dd4bf', animation: 'orbit 2s linear infinite' }}></div>
        </div>
        <p style={{ color: '#0ea5e9', fontWeight: 600, fontSize: '0.85rem' }}>Scouring global research databases...</p>
    </div>
);

const KnowledgeMap = ({ data, onClose }) => {
    const containerRef = useRef(null);
    const [positions, setPositions] = useState({});
    const [, forceUpdate] = useState(0);
    const livePos = useRef({});   // Tracks real-time drag positions for SVG edges
    const [size, setSize] = useState({ w: 0, h: 0 });


    const nodeTypeColors = {
        theory: '#a78bfa', model: '#a78bfa',
        concept: '#2dd4bf',
        method: '#f59e0b', methodology: '#f59e0b',
        entity: '#0ea5e9',
        result: '#84cc16',
        default: '#64748b',
    };

    const getColor = (type = '') => {
        const t = type.toLowerCase();
        const found = Object.keys(nodeTypeColors).find(k => t.includes(k));
        return nodeTypeColors[found || 'default'];
    };

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const update = () => setSize({ w: el.offsetWidth, h: el.offsetHeight });
        update();
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, []);

    useEffect(() => {
        if (!data?.nodes?.length || !size.w || !size.h) return;
        const nodes = data.nodes;
        const cx = size.w / 2, cy = size.h / 2;
        const radius = Math.min(size.w, size.h) * 0.36;
        const map = {};
        nodes.forEach((n, i) => {
            const angle = (2 * Math.PI * i) / nodes.length - Math.PI / 2;
            map[n.id] = {
                x: Math.round(cx + radius * Math.cos(angle)),
                y: Math.round(cy + radius * Math.sin(angle)),
            };
        });
        setPositions(map);
        livePos.current = { ...map };
    }, [data, size]);

    if (!data || !data.nodes) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{
                position: 'fixed', inset: '2rem', zIndex: 1000,
                background: 'rgba(11, 12, 16, 0.95)', backdropFilter: 'blur(12px)',
                borderRadius: '32px', border: '1px solid #1e293b', padding: '2rem',
                display: 'flex', flexDirection: 'column', boxShadow: '0 0 100px rgba(0,0,0,0.5)'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Network size={28} color="#2dd4bf" /> Interactive Knowledge Map
                    </h2>
                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Visualizing relationships and core concepts from your research.</p>
                </div>
                <button onClick={onClose} style={{ background: '#1e293b', border: 'none', borderRadius: '12px', padding: '10px', color: '#fff', cursor: 'pointer' }}>
                    <X size={24} />
                </button>
            </div>

            <div
                ref={containerRef}
                style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#0f172a', borderRadius: '20px', border: '1px solid #334155' }}
            >
                {/* SVG edges layer — reads livePos for real-time drag tracking */}
                <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
                    <defs>
                        <marker id="kg-arrow" markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto">
                            <polygon points="0 0, 7 2.5, 0 5" fill="rgba(45,212,191,0.4)" />
                        </marker>
                    </defs>
                    {(data.edges || []).map((edge, i) => {
                        const fp = livePos.current[edge.from] || positions[edge.from];
                        const tp = livePos.current[edge.to] || positions[edge.to];
                        if (!fp || !tp) return null;
                        const mx = (fp.x + tp.x) / 2;
                        const my = (fp.y + tp.y) / 2;
                        return (
                            <g key={i}>
                                <line
                                    x1={fp.x} y1={fp.y} x2={tp.x} y2={tp.y}
                                    stroke="rgba(45,212,191,0.25)" strokeWidth="1.5"
                                    markerEnd="url(#kg-arrow)"
                                />
                                {edge.label && (
                                    <text x={mx} y={my - 7} textAnchor="middle" fill="rgba(148,163,184,0.75)" fontSize="10" style={{ userSelect: 'none' }}>
                                        {edge.label.length > 24 ? edge.label.slice(0, 24) + '…' : edge.label}
                                    </text>
                                )}
                            </g>
                        );
                    })}
                </svg>

                {/* Draggable node chips */}
                {(data.nodes || []).map((node) => {
                    const pos = positions[node.id];
                    if (!pos) return null;
                    const color = getColor(node.type);
                    return (
                        <motion.div
                            key={node.id}
                            whileHover={{ scale: 1.08 }}
                            drag
                            dragMomentum={false}
                            dragConstraints={containerRef}
                            onDrag={(e, info) => {
                                livePos.current[node.id] = {
                                    x: Math.max(60, Math.min(size.w - 60, pos.x + info.offset.x)),
                                    y: Math.max(30, Math.min(size.h - 30, pos.y + info.offset.y)),
                                };
                                forceUpdate(n => n + 1);
                            }}
                            onDragEnd={(e, info) => {
                                const next = {
                                    x: Math.max(60, Math.min(size.w - 60, pos.x + info.offset.x)),
                                    y: Math.max(30, Math.min(size.h - 30, pos.y + info.offset.y)),
                                };
                                livePos.current[node.id] = next;
                                setPositions(prev => ({ ...prev, [node.id]: next }));
                            }}
                            style={{
                                position: 'absolute',
                                left: pos.x,
                                top: pos.y,
                                transform: 'translate(-50%, -50%)',
                                padding: '10px 16px',
                                background: '#1a2744',
                                borderRadius: '14px',
                                border: `1.5px solid ${color}`,
                                color: '#fff',
                                fontSize: '0.82rem',
                                fontWeight: 600,
                                cursor: 'grab',
                                boxShadow: `0 4px 18px rgba(0,0,0,0.35), 0 0 12px ${color}40`,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '3px',
                                zIndex: 10,
                                userSelect: 'none',
                                maxWidth: '140px',
                                textAlign: 'center',
                                alignItems: 'center',
                            }}
                        >
                            <span style={{ fontSize: '0.6rem', color, textTransform: 'uppercase', letterSpacing: '0.07em', opacity: 0.9 }}>
                                {node.type || 'concept'}
                            </span>
                            <span style={{ wordBreak: 'break-word', lineHeight: 1.3 }}>{node.label}</span>
                        </motion.div>
                    );
                })}
            </div>
            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
                {[
                    { label: 'Concept', color: '#2dd4bf' },
                    { label: 'Theory / Model', color: '#a78bfa' },
                    { label: 'Method', color: '#f59e0b' },
                    { label: 'Entity', color: '#0ea5e9' },
                    { label: 'Result', color: '#84cc16' },
                ].map(({ label, color }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#94a3b8' }}>
                        <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: color }} />{label}
                    </div>
                ))}
                <div style={{ marginLeft: 'auto', fontSize: '0.78rem', color: '#475569' }}>Drag nodes to rearrange</div>
            </div>
        </motion.div>
    );
};

const TrendChart = ({ data }) => {
    if (!data || !data.yearly_volume) return null;
    const maxVal = Math.max(...data.yearly_volume.map(v => v.count), 1);

    return (
        <div style={{ background: '#0f172a', borderRadius: '20px', padding: '1.5rem', border: '1px solid #1e293b', marginTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ padding: '8px', background: 'rgba(45, 212, 191, 0.1)', borderRadius: '10px' }}>
                        <TrendingUp size={20} color="#2dd4bf" />
                    </div>
                    <div>
                        <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}>Research Market Momentum</div>
                        <div style={{ color: '#64748b', fontSize: '0.75rem' }}>{data.market_status}</div>
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#2dd4bf', fontWeight: 700, fontSize: '1.2rem' }}>{data.trend_score}%</div>
                    <div style={{ color: '#64748b', fontSize: '0.65rem', textTransform: 'uppercase' }}>Interest Score</div>
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '100px', marginBottom: '1rem' }}>
                {data.yearly_volume.map((v, i) => (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${(v.count / maxVal) * 100}%` }}
                            style={{ width: '100%', background: 'linear-gradient(to top, #0ea5e9, #2dd4bf)', borderRadius: '4px 4px 0 0', minHeight: '4px' }}
                        />
                        <span style={{ fontSize: '0.65rem', color: '#64748b' }}>{v.year}</span>
                    </div>
                ))}
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.8rem', lineHeight: 1.5, borderTop: '1px solid #1e293b', paddingTop: '1rem' }}>{data.analysis}</p>
        </div>
    );
};

const FundingList = ({ opportunities }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '1rem' }}>
        <div style={{ color: '#2dd4bf', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <DollarSign size={16} /> Active Grants & Funding
        </div>
        {opportunities.map((op, i) => (
            <motion.a
                key={i} href={op.source} target="_blank" rel="noreferrer"
                whileHover={{ x: 5, background: 'rgba(255,255,255,0.03)' }}
                style={{ padding: '12px', background: '#1e293b', borderRadius: '12px', border: '1px solid #334155', textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: '4px' }}
            >
                <div style={{ color: '#e2e8f0', fontSize: '0.85rem', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {op.title} <ExternalLink size={12} color="#64748b" />
                </div>
                <div style={{ color: '#64748b', fontSize: '0.75rem', lineHeight: 1.4 }}>{op.snippet}</div>
            </motion.a>
        ))}
    </div>
);

const JournalList = ({ journals }) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginTop: '1rem' }}>
        {journals.map((j, i) => (
            <div key={i} style={{ padding: '12px', background: 'rgba(15, 23, 42, 0.5)', borderRadius: '16px', border: '1px solid #1e293b', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{j.name}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Impact Factor</span>
                    <span style={{ fontSize: '0.75rem', color: '#2dd4bf', fontWeight: 600 }}>{j.impact}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Fit Prob.</span>
                    <span style={{ fontSize: '0.7rem', color: j.prob === 'High' ? '#10b981' : '#f59e0b', fontWeight: 600, padding: '2px 6px', background: 'rgba(0,0,0,0.2)', borderRadius: '4px' }}>{j.prob}</span>
                </div>
            </div>
        ))}
    </div>
);

const IEEEResult = ({ result }) => (
    <div style={{ background: '#0f172a', borderRadius: '24px', padding: '1.5rem', border: `1px solid ${result.is_eligible ? '#10b981' : '#f59e0b'}`, marginTop: '1rem', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ padding: '8px', background: result.is_eligible ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)', borderRadius: '12px' }}>
                    {result.is_eligible ? <CheckCircle size={20} color="#10b981" /> : <AlertCircle size={20} color="#f59e0b" />}
                </div>
                <div>
                    <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem' }}>IEEE Formatting Audit</div>
                    <div style={{ color: '#64748b', fontSize: '0.8rem' }}>Compliance Score: {result.score}%</div>
                </div>
            </div>
            <div style={{ padding: '4px 12px', background: result.is_eligible ? '#10b981' : '#f59e0b', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, color: '#fff' }}>
                {result.is_eligible ? "ELIGIBLE" : "ACTION REQUIRED"}
            </div>
        </div>

        <p style={{ color: '#cbd5e1', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '1.25rem' }}>{result.feedback}</p>

        {result.required_changes?.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Changes Needed</div>
                {result.required_changes.map((ch, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: '#94a3b8', fontSize: '0.8rem', background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: '8px' }}>
                        <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#f59e0b', marginTop: '6px' }}></div>
                        {ch}
                    </div>
                ))}
            </div>
        )}
    </div>
);

const LiteratureGrid = ({ data }) => (
    <div style={{ background: '#0f172a', borderRadius: '24px', padding: '1.5rem', border: '1px solid rgba(45, 212, 191, 0.2)', marginTop: '1rem', width: '100%', overflowX: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
            <div style={{ padding: '8px', background: 'rgba(45, 212, 191, 0.1)', borderRadius: '12px' }}>
                <BarChart2 size={20} color="#2dd4bf" />
            </div>
            <div>
                <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem' }}>Comparative Literature Synthesis</div>
                <div style={{ color: '#64748b', fontSize: '0.8rem' }}>Multi-Paper Analysis Grid</div>
            </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', color: '#cbd5e1', minWidth: '600px' }}>
            <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <th style={{ textAlign: 'left', padding: '12px', color: '#94a3b8', fontWeight: 600 }}>Paper</th>
                    <th style={{ textAlign: 'left', padding: '12px', color: '#94a3b8', fontWeight: 600 }}>Objective</th>
                    <th style={{ textAlign: 'left', padding: '12px', color: '#94a3b8', fontWeight: 600 }}>Methodology</th>
                    <th style={{ textAlign: 'left', padding: '12px', color: '#94a3b8', fontWeight: 600 }}>Findings</th>
                    <th style={{ textAlign: 'left', padding: '12px', color: '#94a3b8', fontWeight: 600 }}>Novelty</th>
                </tr>
            </thead>
            <tbody>
                {data.map((item, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                        <td style={{ padding: '12px', color: '#2dd4bf', fontWeight: 600 }}>{item.paper}</td>
                        <td style={{ padding: '12px' }}>{item.objective}</td>
                        <td style={{ padding: '12px' }}>{item.methodology}</td>
                        <td style={{ padding: '12px' }}>{item.findings}</td>
                        <td style={{ padding: '12px', color: '#f59e0b' }}>{item.novelty}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const CollaborationRoom = ({ roomData, onSendMessage, currentUsername }) => {
    const [msgInput, setMsgInput] = useState('');

    return (
        <div style={{ background: '#0f172a', borderRadius: '24px', padding: '1.5rem', border: '1px solid rgba(14, 165, 233, 0.2)', marginTop: '1rem', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ padding: '8px', background: 'rgba(14, 165, 233, 0.1)', borderRadius: '12px' }}>
                        <Users size={20} color="#0ea5e9" />
                    </div>
                    <div>
                        <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem' }}>{roomData.name}</div>
                        <div style={{ color: '#64748b', fontSize: '0.8rem' }}>Collaborative Research Room</div>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '-8px' }}>
                    {[1, 2, 3].map(i => (
                        <div key={i} style={{ width: '28px', height: '28px', borderRadius: '50%', border: '2px solid #0f172a', background: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', color: '#fff' }}>U{i}</div>
                    ))}
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: '2px solid #0f172a', background: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', color: '#fff', marginLeft: '4px' }}>+</div>
                </div>
            </div>

            <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '1.5rem', paddingRight: '12px' }}>
                {roomData.messages.map((m, i) => (
                    <div key={i} style={{ alignSelf: m.user === currentUsername ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                        <div style={{ fontSize: '0.65rem', color: '#64748b', marginBottom: '2px', textAlign: m.user === currentUsername ? 'right' : 'left' }}>{m.user} • {m.timestamp}</div>
                        <div style={{ background: m.user === currentUsername ? 'linear-gradient(135deg, #0ea5e9, #0284c7)' : '#1e293b', padding: '10px 14px', borderRadius: '16px', color: '#fff', fontSize: '0.85rem', boxShadow: m.user === currentUsername ? '0 4px 12px rgba(14, 165, 233, 0.2)' : 'none' }}>{m.content}</div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
                <input
                    type="text"
                    value={msgInput}
                    onChange={(e) => setMsgInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && msgInput && (onSendMessage(msgInput), setMsgInput(''))}
                    placeholder="Message team..."
                    style={{ flex: 1, background: '#1e293b', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '10px 15px', color: '#fff', fontSize: '0.85rem', outline: 'none' }}
                />
                <button
                    onClick={() => { if (msgInput) { onSendMessage(msgInput); setMsgInput(''); } }}
                    style={{ background: '#0ea5e9', border: 'none', borderRadius: '12px', width: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer' }}
                >
                    <Send size={16} />
                </button>
            </div>
        </div>
    );
};

const FormattedText = ({ text }) => {
    if (!text) return null;

    // Helper to process bold, italic, and inline code
    const processInline = (str) => {
        let parts = [str];

        // Code: `code`
        parts = parts.flatMap(p => typeof p === 'string' ? p.split(/(`[^`]+`)/g) : p);
        parts = parts.map(p => {
            if (typeof p === 'string' && p.startsWith('`') && p.endsWith('`')) {
                return <code key={Math.random()} style={{ background: 'rgba(255,255,255,0.08)', padding: '2px 6px', borderRadius: '6px', fontFamily: '"JetBrains Mono", monospace', color: '#2dd4bf', fontSize: '0.9em', border: '1px solid rgba(255,255,255,0.05)' }}>{p.slice(1, -1)}</code>;
            }
            return p;
        });

        // Bold: **bold**
        parts = parts.flatMap(p => typeof p === 'string' ? p.split(/(\*\*[^*]+\*\*)/g) : p);
        parts = parts.map(p => {
            if (typeof p === 'string' && p.startsWith('**') && p.endsWith('**')) {
                return <strong key={Math.random()} style={{ color: '#fff', fontWeight: '700', letterSpacing: '0.01em' }}>{p.slice(2, -2)}</strong>;
            }
            return p;
        });

        // Italic: *italic*
        parts = parts.flatMap(p => typeof p === 'string' ? p.split(/(\*[^*]+\*)/g) : p);
        parts = parts.map(p => {
            if (typeof p === 'string' && p.startsWith('*') && p.endsWith('*') && !p.startsWith('**')) {
                return <em key={Math.random()} style={{ color: '#94a3b8', fontStyle: 'italic' }}>{p.slice(1, -1)}</em>;
            }
            return p;
        });

        return parts;
    };

    // Split by blocks: Code blocks, Lists, etc.
    const blocks = text.split(/(```[\s\S]*?```|\n)/g);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {blocks.map((block, i) => {
                if (!block || block === '\n') return <div key={i} style={{ height: '2px' }} />;

                // Multi-line Code Block
                if (block.startsWith('```')) {
                    let content = block.replace(/```[a-z]*\n?|```/g, '');

                    // Simple syntax highlights for "professional" look
                    const highlighted = content.split(/(".*?"|'.*?'|\b(const|let|var|function|def|import|from|return|class|if|else|for|while|await|async)\b)/g).map((part, index) => {
                        if (!part) return null;
                        if (part.startsWith('"') || part.startsWith("'")) return <span key={index} style={{ color: '#fed7aa' }}>{part}</span>;
                        if (['const', 'let', 'var', 'function', 'def', 'import', 'from', 'return', 'class', 'if', 'else', 'for', 'while', 'await', 'async'].includes(part)) {
                            return <span key={index} style={{ color: '#2dd4bf', fontWeight: 'bold' }}>{part}</span>;
                        }
                        return part;
                    });

                    return (
                        <div key={i} style={{ margin: '14px 0', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', overflow: 'hidden' }}>
                            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '6px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.7rem', color: '#64748b', fontFamily: 'monospace', display: 'flex', justifyContent: 'space-between' }}>
                                <span>CODE ANALYTICS</span>
                                <span style={{ color: '#2dd4bf', opacity: 0.6 }}>READ-ONLY</span>
                            </div>
                            <pre style={{
                                background: '#0b0c10',
                                padding: '1.25rem',
                                margin: 0,
                                overflowX: 'auto',
                                fontFamily: '"JetBrains Mono", monospace'
                            }}>
                                <code style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.6' }}>{highlighted}</code>
                            </pre>
                        </div>
                    );
                }

                // Unordered List
                if (block.trim().startsWith('- ') || block.trim().startsWith('* ')) {
                    return (
                        <div key={i} style={{ display: 'flex', gap: '12px', paddingLeft: '12px', margin: '2px 0' }}>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'linear-gradient(135deg, #2dd4bf, #0ea5e9)', marginTop: '10px', flexShrink: 0, boxShadow: '0 0 10px rgba(45, 212, 191, 0.4)' }} />
                            <div style={{ flex: 1, color: '#cbd5e1' }}>{processInline(block.trim().substring(2))}</div>
                        </div>
                    );
                }

                // Ordered List
                if (/^\d+\.\s/.test(block.trim())) {
                    const match = block.trim().match(/^(\d+)\.\s(.*)/);
                    if (match) {
                        return (
                            <div key={i} style={{ display: 'flex', gap: '12px', paddingLeft: '12px', margin: '2px 0' }}>
                                <div style={{ color: '#2dd4bf', fontWeight: 'bold', fontSize: '0.9rem', flexShrink: 0, minWidth: '18px' }}>{match[1]}.</div>
                                <div style={{ flex: 1, color: '#cbd5e1' }}>{processInline(match[2])}</div>
                            </div>
                        );
                    }
                }

                // Headers
                if (block.trim().startsWith('### ')) {
                    return <h3 key={i} style={{ color: '#fff', fontSize: '1.15rem', margin: '1rem 0 0.25rem 0', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '12px', height: '3px', borderRadius: '2px', background: '#2dd4bf' }} />
                        {processInline(block.trim().substring(4))}
                    </h3>;
                }

                if (block.trim().startsWith('## ')) {
                    return <h2 key={i} style={{ color: '#fff', fontSize: '1.3rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px', margin: '1.5rem 0 0.5rem 0', fontWeight: '700' }}>{processInline(block.trim().substring(3))}</h2>;
                }

                return <div key={i} style={{ color: '#cbd5e1', lineHeight: '1.7' }}>{processInline(block)}</div>;
            })}
        </div>
    );
};

const Typewriter = ({ text, onComplete }) => {
    const [displayedText, setDisplayedText] = useState('');
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        if (!text) return;

        setDisplayedText('');
        setIsComplete(false);

        let index = 0;
        const speed = 8; // Slightly faster for professional feel

        const interval = setInterval(() => {
            if (index < text.length) {
                const charsToAdd = text.slice(index, index + 3);
                setDisplayedText((prev) => prev + charsToAdd);
                index += 3;
            } else {
                clearInterval(interval);
                setIsComplete(true);
                if (onComplete) onComplete();
            }
        }, speed);

        return () => clearInterval(interval);
    }, [text]);

    return (
        <div style={{ position: 'relative' }}>
            <FormattedText text={displayedText} />
            {!isComplete && (
                <span style={{ display: 'inline-block', width: '2px', height: '14px', backgroundColor: '#2dd4bf', marginLeft: '4px', animation: 'blink 1s infinite', verticalAlign: 'text-bottom' }} />
            )}
            <style>{`@keyframes blink { 50% { opacity: 0; } }`}</style>
        </div>
    );
};

const WelcomeScreen = ({ username, onSuggestionClick }) => {
    const suggestions = [
        { icon: <BarChart2 size={18} />, text: "Synthesize multi-paper grid", delay: 0.1 },
        { icon: <Users size={18} />, text: "Start collaborative room", delay: 0.2 },
        { icon: <FileCheck size={18} />, text: "Check IEEE Compliance", delay: 0.3 },
        { icon: <PenTool size={18} />, text: "Draft a Literature Survey", delay: 0.4 },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.2 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                padding: '2rem',
                textAlign: 'center',
                color: '#e2e8f0'
            }}
        >
            <motion.div variants={itemVariants}>
                <div style={{
                    marginBottom: '2rem',
                    background: 'linear-gradient(135deg, rgba(45, 212, 191, 0.15) 0%, rgba(14, 165, 233, 0.15) 100%)',
                    padding: '1.5rem',
                    borderRadius: '24px',
                    display: 'inline-flex',
                    border: '1px solid rgba(45, 212, 191, 0.3)',
                    boxShadow: '0 0 40px rgba(45, 212, 191, 0.1)'
                }}>
                    <Bot size={48} color="#2dd4bf" />
                </div>
            </motion.div>

            <motion.h1
                variants={itemVariants}
                style={{
                    fontSize: '3rem',
                    fontWeight: 700,
                    marginBottom: '0.5rem',
                    background: 'linear-gradient(to right, #2dd4bf, #0ea5e9)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '-0.02em'
                }}
            >
                Hello, {username || 'Human'}
            </motion.h1>

            <motion.h2
                variants={itemVariants}
                style={{ fontSize: '1.5rem', color: '#94a3b8', fontWeight: 500, marginBottom: '3rem' }}
            >
                Ready to assist you.
            </motion.h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', width: '100%', maxWidth: '800px' }}>
                {suggestions.map((s, i) => (
                    <motion.button
                        key={i}
                        variants={itemVariants}
                        onClick={() => onSuggestionClick(s.text)}
                        whileHover={{ scale: 1.02, backgroundColor: '#1e293b', borderColor: '#2dd4bf' }}
                        whileTap={{ scale: 0.98 }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '1rem',
                            background: '#0f172a',
                            border: '1px solid #1e293b',
                            borderRadius: '16px',
                            cursor: 'pointer',
                            textAlign: 'left',
                            color: '#cbd5e1',
                            fontSize: '0.95rem',
                            transition: 'all 0.2s',
                        }}
                    >
                        <div style={{
                            padding: '8px',
                            background: 'rgba(45, 212, 191, 0.1)',
                            borderRadius: '50%',
                            color: '#2dd4bf'
                        }}>
                            {s.icon}
                        </div>
                        <span style={{ fontWeight: 500 }}>{s.text}</span>
                    </motion.button>
                ))}
            </div>
        </motion.div>
    );
};

const Sidebar = ({ isOpen, toggleSidebar, onHistorySelect, onPaperSelect }) => {
    const [history, setHistory] = useState([]);
    const [papers, setPapers] = useState([]);
    const [activeTab, setActiveTab] = useState('history'); // 'history' or 'knowledge'

    useEffect(() => {
        if (isOpen) {
            getDashboardData().then(res => {
                const activity = res.data.recent_activity || [];
                setHistory(activity);
            }).catch(err => console.error("History fetch error:", err));

            getPapers().then(res => {
                setPapers(res.data.papers || []);
            }).catch(err => console.error("Papers fetch error:", err));
        }
    }, [isOpen]);

    return (
        <motion.div
            initial={{ x: -300 }}
            animate={{ x: isOpen ? 0 : -300 }}
            transition={{ type: 'spring', damping: 20 }}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                height: '100%',
                width: '280px',
                background: '#0f172a',
                borderRight: '1px solid #1e293b',
                zIndex: 50,
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {activeTab === 'history' ? <History size={20} color="#2dd4bf" /> : <FileText size={20} color="#2dd4bf" />}
                    {activeTab === 'history' ? 'Activity' : 'Knowledge'}
                </h2>
                <button onClick={toggleSidebar} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                    <X size={20} />
                </button>
            </div>

            <div style={{ display: 'flex', background: '#1e293b', borderRadius: '12px', padding: '4px', marginBottom: '1.5rem' }}>
                <button
                    onClick={() => setActiveTab('history')}
                    style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: activeTab === 'history' ? '#334155' : 'transparent', color: activeTab === 'history' ? '#fff' : '#64748b', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
                >History</button>
                <button
                    onClick={() => setActiveTab('knowledge')}
                    style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: activeTab === 'knowledge' ? '#334155' : 'transparent', color: activeTab === 'knowledge' ? '#fff' : '#64748b', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
                >Papers</button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {activeTab === 'history' ? (
                    history.length === 0 ? (
                        <div style={{ color: '#64748b', fontSize: '0.9rem', textAlign: 'center', padding: '1rem' }}>No recent history</div>
                    ) : (
                        history.map((item, idx) => (
                            <motion.button
                                key={idx}
                                whileHover={{ scale: 1.02, backgroundColor: '#1e293b' }}
                                onClick={() => onHistorySelect(item)}
                                style={{
                                    background: 'transparent',
                                    border: '1px solid #334155',
                                    borderRadius: '12px',
                                    padding: '12px',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    color: '#e2e8f0'
                                }}
                            >
                                <div style={{ fontSize: '0.9rem', fontWeight: 500, marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {item.item || "Untitled Chat"}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                    {item.action} • {item.time ? item.time.split(' ')[0] : 'Just now'}
                                </div>
                            </motion.button>
                        ))
                    )
                ) : (
                    papers.length === 0 ? (
                        <div style={{ color: '#64748b', fontSize: '0.9rem', textAlign: 'center', padding: '1rem' }}>No papers uploaded</div>
                    ) : (
                        papers.map((paper, idx) => (
                            <motion.button
                                key={idx}
                                whileHover={{ scale: 1.02, backgroundColor: '#1e293b', borderColor: '#2dd4bf' }}
                                onClick={() => onPaperSelect(paper)}
                                style={{
                                    background: 'transparent',
                                    border: '1px solid #334155',
                                    borderRadius: '12px',
                                    padding: '12px',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    color: '#e2e8f0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px'
                                }}
                            >
                                <FileText size={16} color="#2dd4bf" />
                                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.9rem' }}>
                                    {paper}
                                </div>
                            </motion.button>
                        ))
                    )
                )}
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #1e293b', fontSize: '0.8rem', color: '#475569', textAlign: 'center' }}>
                Zencoders AI © 2026
            </div>
        </motion.div>
    );
};

export default function Chat({ toggleMainSidebar }) {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeDocument, setActiveDocument] = useState(null); // { filename, content }
    const [isReading, setIsReading] = useState(false);
    const [webSearchEnabled, setWebSearchEnabled] = useState(false);
    const [graphData, setGraphData] = useState(null);
    const [isSearchingWeb, setIsSearchingWeb] = useState(false);

    const fileInputRef = useRef(null);
    const messagesEndRef = useRef(null);
    const speechInstance = useRef(null);
    const readingRef = useRef(false);

    useEffect(() => {
        const handleRetry = (e) => {
            handleVisualize(e.detail.content, e.detail.filename);
        };
        window.addEventListener('retry-vis', handleRetry);
        return () => window.removeEventListener('retry-vis', handleRetry);
    }, []);

    useEffect(() => {
        if (location.state && location.state.historyItem) {
            const item = location.state.historyItem;
            // Try to parse content as a full messages JSON array (new format)
            let restored = null;
            try {
                if (item.content && item.content.startsWith('[')) {
                    const parsed = JSON.parse(item.content);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        restored = parsed;
                    }
                }
            } catch (_) { /* not JSON, fall back */ }

            if (restored) {
                // Full conversation: all user + AI messages
                setMessages(restored);
            } else if (item.item || item.content) {
                // Legacy: single Q&A pair
                setMessages([
                    { role: 'user', content: item.item || '' },
                    { role: 'assistant', content: item.content || '' },
                ]);
            }
            // Clear state so it doesn't reload on every render
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state, navigate]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleReadAloud = (text) => {
        if (readingRef.current) {
            window.speechSynthesis.cancel();
            setIsReading(false);
            readingRef.current = false;
            return;
        }

        if (!text) return;

        // Better chunking: split by sentences more reliably
        const textToProcess = text.replace(/\s+/g, ' ').trim();
        // Regex splits on punctuation followed by space, or just chunks of 200 chars if no punctuation
        const sentences = textToProcess.match(/[^.!?]+[.!?]+(?=\s|$)|.{1,200}/g) || [textToProcess];

        let chunks = [];
        let currentChunk = "";

        sentences.forEach(s => {
            if ((currentChunk + s).length < 250) {
                currentChunk += s + " ";
            } else {
                if (currentChunk) chunks.push(currentChunk.trim());
                currentChunk = s + " ";
            }
        });
        if (currentChunk) chunks.push(currentChunk.trim());

        let chunkIndex = 0;
        setIsReading(true);
        readingRef.current = true;

        const speakNext = () => {
            if (!readingRef.current) return;

            if (chunkIndex >= chunks.length) {
                setIsReading(false);
                readingRef.current = false;
                return;
            }

            const utterance = new SpeechSynthesisUtterance(chunks[chunkIndex]);
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            utterance.lang = 'en-US';

            utterance.onend = () => {
                if (readingRef.current) {
                    chunkIndex++;
                    setTimeout(() => speakNext(), 50);
                }
            };

            utterance.onerror = (e) => {
                console.error("Speech Error:", e);
                if (e.error !== 'interrupted' && e.error !== 'canceled') {
                    chunkIndex++;
                    speakNext();
                } else {
                    setIsReading(false);
                    readingRef.current = false;
                }
            };

            window.speechSynthesis.speak(utterance);
        };

        window.speechSynthesis.cancel();
        setTimeout(() => speakNext(), 150);
    };

    useEffect(() => {
        return () => {
            window.speechSynthesis.cancel();
            readingRef.current = false;
        };
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    const handleVisualize = async (content, filename) => {
        const visualMsg = { role: 'assistant', type: 'visual_abstract_loading', content: 'Generating...' };
        setMessages(prev => [...prev, visualMsg]);

        try {
            const res = await visualizePaper({ content, filename });
            setMessages(prev => {
                const filtered = prev.filter(m => m.type !== 'visual_abstract_loading');
                return [...filtered, {
                    role: 'assistant',
                    type: 'visual_abstract',
                    content: res.data.prompt,
                    image: res.data.image_url,
                    original_content: content,
                    original_filename: filename
                }];
            });
        } catch (error) {
            setMessages(prev => prev.filter(m => m.type !== 'visual_abstract_loading'));
            setMessages(prev => [...prev, {
                role: 'assistant',
                type: 'visual_abstract_error',
                content: 'Visualization timed out or failed.',
                original_content: content,
                original_filename: filename
            }]);
        }
    };

    const handleStreamingResponse = async (prompt, conversationHistory = []) => {
        setLoading(true);
        const token = localStorage.getItem('token');
        const endpoint = '/api/qa-stream';

        // Prepare history for API (filter out complex types like visual_abstract, but keep summaries)
        let messagesToSend = conversationHistory.length > 0
            ? conversationHistory
            : [{ role: 'user', content: prompt }];

        // Inject active document knowledge into the conversation start if not already present
        if (activeDocument && !messagesToSend.some(m => m.role === 'system' && m.content.includes(activeDocument.filename))) {
            messagesToSend.unshift({
                role: 'system',
                content: `KNOWLEDGE UPDATE: The user has uploaded a document named "${activeDocument.filename}". \n\nYou must use the following content for reference when answering questions about this document:\n\nDOCUMENT CONTENT:\n${activeDocument.content.substring(0, 6000)}`
            });
        }

        const body = JSON.stringify({
            question: prompt,
            messages: messagesToSend
        });

        try {
            const response = await fetch(`http://localhost:5000${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: body
            });

            if (!response.ok) throw new Error("Stream connection failed");

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let aiMessageContent = "";

            // Add placeholder message
            setMessages(prev => [...prev, { role: 'assistant', content: "" }]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                aiMessageContent += chunk;

                // Update the last message
                setMessages(prev => {
                    const newMsgs = [...prev];
                    const lastMsg = newMsgs[newMsgs.length - 1];
                    lastMsg.content = aiMessageContent;
                    return newMsgs;
                });
            }

            // ── Save full conversation to history ──────────────────────────
            if (aiMessageContent) {
                // Build the conversation: only user/assistant messages (no system prompts)
                const userAssistantMsgs = messagesToSend.filter(m => m.role !== 'system');
                const fullConversation = [
                    ...userAssistantMsgs,
                    { role: 'assistant', content: aiMessageContent }
                ];
                saveChatHistory(fullConversation).catch(() => {/* non-critical */ });
            }
        } catch (error) {
            console.error("Streaming error:", error);
            setMessages(prev => [...prev, { role: 'assistant', content: "Error: Could not retrieve response." }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKnowledgeGraph = async (content, filename) => {
        setLoading(true);
        try {
            const res = await getKnowledgeGraph({ content, filename });
            setGraphData(res.data);
        } catch (error) {
            console.error("Graph error:", error);
            setMessages(prev => [...prev, { role: 'assistant', content: "Failed to generate knowledge map." }]);
        } finally {
            setLoading(false);
        }
    };

    const handleJournalMatch = async (content) => {
        setLoading(true);
        try {
            const res = await matchJournals({ abstract: content });
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "Based on my analysis of your research, here are the top matching journals for your publication strategist:",
                type: 'journal_match_result',
                journals: res.data
            }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: "Failed to find journal matches." }]);
        } finally {
            setLoading(false);
        }
    };

    const handleResearchTrends = async (content) => {
        setLoading(true);
        try {
            // Extract topic/keywords first (simplified)
            const topic = content.substring(0, 100);
            const res = await getResearchTrends({ topic });
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "I've analyzed the global research market momentum for your topic:",
                type: 'research_trends_result',
                trends: res.data
            }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: "Failed to analyze research trends." }]);
        } finally {
            setLoading(false);
        }
    };

    const handleFundingScout = async (content) => {
        setLoading(true);
        try {
            const keywords = content.substring(0, 100);
            const res = await scoutFunding({ keywords });
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "Here are active funding and grant opportunities related to your work:",
                type: 'funding_scout_result',
                opportunities: res.data
            }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: "Failed to scout funding opportunities." }]);
        } finally {
            setLoading(false);
        }
    };

    const handleSynthesize = async () => {
        setLoading(true);
        try {
            const papersRes = await getPapers();
            if (papersRes.data.length < 2) {
                setMessages(prev => [...prev, { role: 'assistant', content: "Please upload at least two papers to generate a comparative synthesis." }]);
                return;
            }

            // Fetch top 3 papers for synthesis to keep it snappy
            const subset = papersRes.data.slice(0, 3);
            const paperData = await Promise.all(subset.map(async p => {
                const contentRes = await getPaperContent(p.filename);
                return { filename: p.filename, content: contentRes.data.content };
            }));

            const res = await synthesizePapers({ papers: paperData });
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "I've synthesized your uploaded research into a comparative literature grid:",
                type: 'literature_grid',
                grid_data: res.data
            }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: "Synthesis failed." }]);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateRoom = async () => {
        setLoading(true);
        try {
            const res = await createRoom({ name: `Collaboration Room: ${activeDocument?.filename || 'Project Alpha'}` });
            const roomRes = await getRoom(res.data.room_id);

            // Add initial welcome message if empty
            if (roomRes.data.messages.length === 0) {
                roomRes.data.messages = [{ user: 'System', content: 'Welcome to your collaborative research room!', timestamp: new Date().toLocaleTimeString() }];
            }

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `Created a new collaborative workspace for your team.`,
                type: 'collaboration_room',
                room_data: { ...roomRes.data, room_id: res.data.room_id }
            }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: "Failed to create collaborative room." }]);
        } finally {
            setLoading(false);
        }
    };

    const handleRoomMessage = async (roomId, text) => {
        try {
            const res = await addRoomMessage({ room_id: roomId, content: text, user: user?.username || "Researcher" });
            setMessages(prev => prev.map(m => {
                if (m.type === 'collaboration_room' && m.room_data.room_id === roomId) {
                    return { ...m, room_data: { ...m.room_data, messages: [...m.room_data.messages, res.data] } };
                }
                return m;
            }));
        } catch (error) {
            console.error("Collaboration error:", error);
        }
    };

    const handleIEEECheck = async (content) => {
        setLoading(true);
        try {
            const res = await checkIEEEFormat({ content });
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: res.data.is_eligible
                    ? "Great news! Your paper follows the standard IEEE structural format and is eligible for submission."
                    : "I've audited your paper against IEEE standards. There are some structural discrepancies that need attention:",
                type: 'ieee_check_result',
                ieee_data: res.data
            }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: "Format audit failed." }]);
        } finally {
            setLoading(false);
        }
    };

    const handleDraftSection = async (sectionType) => {
        setLoading(true);
        const activeContent = activeDocument ? activeDocument.content : messages.map(m => m.content).join("\n");
        const topic = activeDocument ? activeDocument.filename : "this research";

        try {
            const res = await draftAcademicSection({
                topic,
                section_type: sectionType,
                context: activeContent.substring(0, 3000)
            });
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `Here is a professional draft for your **${sectionType}**:\n\n${res.data.draft}`
            }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: `Failed to draft ${sectionType}.` }]);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async (text = input) => {
        if (!text.trim()) return;

        // Specific suggestion intercepts
        if (text === "Check IEEE Compliance" && activeDocument) {
            handleIEEECheck(activeDocument.content);
            return;
        }
        if (text === "Draft a Literature Survey") {
            handleDraftSection("Literature Survey");
            return;
        }
        if (text === "Synthesize multi-paper grid") {
            handleSynthesize();
            return;
        }
        if (text === "Start collaborative room") {
            handleCreateRoom();
            return;
        }

        const userContent = text;
        const userMessage = { role: 'user', content: userContent };

        const combinedMessages = [...messages, userMessage];
        setMessages(combinedMessages);
        setInput('');

        if (webSearchEnabled) {
            setIsSearchingWeb(true);
            setLoading(true);
            try {
                const context = activeDocument ? activeDocument.content : "";
                const res = await deepWebResearch({ query: userContent, context });

                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: res.data.answer,
                    type: 'web_research_result',
                    sources: res.data.sources
                }]);
            } catch (error) {
                console.error("Web search error:", error);
                setMessages(prev => [...prev, { role: 'assistant', content: "Web research failed. Please try a standard query." }]);
            } finally {
                setIsSearchingWeb(false);
                setLoading(false);
            }
            return;
        }

        // Prepare history for API (filter out complex types like visual_abstract, but keep summaries)
        const historyForApi = combinedMessages
            .filter(m => m.role === 'user' || (m.role === 'assistant' && (!m.type || m.type === 'document_summary')))
            .map(m => ({ role: m.role, content: m.content }));

        await handleStreamingResponse(text, historyForApi);
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setMessages(prev => [...prev, { role: 'system', content: `Uploading ${file.name}...` }]);
        try {
            const res = await uploadPaper(file);
            const docContent = res.data.content;

            // Set as active document for session knowledge
            setActiveDocument({
                filename: file.name,
                content: docContent
            });

            setMessages(prev => [...prev, {
                role: 'system',
                type: 'upload_success',
                filename: file.name,
                content: docContent,
                content_preview: docContent
            }]);

            // Automatically summarize the document using the already extracted content
            setMessages(prev => [...prev, { role: 'assistant', content: `Document "${file.name}" uploaded successfully. Analyzing knowledge...` }]);

            try {
                // Pass content directly to avoid re-extraction issues
                const summaryRes = await summarizePaper({ content: docContent });
                const summary = summaryRes.data.summary;

                setMessages(prev => [
                    ...prev.filter(m => !m.content.includes("Analyzing knowledge...")),
                    {
                        role: 'assistant',
                        content: `**Knowledge Update: Summary of ${file.name}**\n\n${summary}`,
                        type: 'document_summary'
                    }
                ]);
            } catch (sumErr) {
                console.error("Summary error:", sumErr);
                setMessages(prev => [...prev, { role: 'assistant', content: "I've processed the document but couldn't generate a summary. You can still ask me questions about it!" }]);
            }

        } catch (error) {
            setMessages(prev => [...prev, { role: 'system', content: `Error: Failed to upload ${file.name}.` }]);
        } finally {
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div style={{
            height: '100vh',
            maxHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            background: '#0b0c10',
            position: 'relative',
            overflow: 'hidden'
        }}>

            {/* Background Gradients */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
                <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(45, 212, 191, 0.06) 0%, rgba(11, 12, 16, 0) 70%)', borderRadius: '50%', filter: 'blur(60px)' }}></div>
                <div style={{ position: 'absolute', bottom: '10%', left: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(14, 165, 233, 0.06) 0%, rgba(11, 12, 16, 0) 70%)', borderRadius: '50%', filter: 'blur(60px)' }}></div>
            </div>

            <AnimatePresence>
                {graphData && <KnowledgeMap data={graphData} onClose={() => setGraphData(null)} />}
            </AnimatePresence>

            <Sidebar
                isOpen={sidebarOpen}
                toggleSidebar={() => setSidebarOpen(false)}
                onHistorySelect={(item) => {
                    setMessages([
                        { role: 'user', content: item.item },
                        { role: 'assistant', content: item.content }
                    ]);
                    setActiveDocument(null);
                    setSidebarOpen(false);
                }}
                onPaperSelect={async (filename) => {
                    setLoading(true);
                    setSidebarOpen(false);
                    try {
                        const res = await getPaperContent(filename);
                        const doc = res.data;
                        setActiveDocument({
                            filename: doc.filename,
                            content: doc.content
                        });
                        setMessages(prev => [...prev, {
                            role: 'system',
                            type: 'upload_success',
                            filename: doc.filename,
                            content: doc.content,
                            content_preview: `Knowledge Linked: ${doc.filename}`
                        }]);
                    } catch (err) {
                        console.error("Paper load error:", err);
                        setMessages(prev => [...prev, { role: 'assistant', content: `Failed to link paper ${filename}.` }]);
                    } finally {
                        setLoading(false);
                    }
                }}
            />

            {/* Top Navigation / Controls */}
            <div style={{
                position: 'absolute',
                top: '1.5rem',
                left: '1.5rem',
                display: 'flex',
                gap: '1rem',
                zIndex: 20,
                pointerEvents: 'auto'
            }}>
                <motion.button
                    whileHover={{ scale: 1.05, backgroundColor: '#1e293b' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSidebarOpen(true)}
                    style={{
                        background: 'rgba(30, 41, 59, 0.7)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(51, 65, 85, 0.5)',
                        borderRadius: '12px',
                        padding: '10px',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    title="View History"
                >
                    <History size={20} />
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.05, backgroundColor: '#1e293b' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { setMessages([]); setActiveDocument(null); }}
                    style={{
                        background: 'rgba(30, 41, 59, 0.7)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(51, 65, 85, 0.5)',
                        borderRadius: '12px',
                        padding: '10px 16px',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '0.9rem',
                        fontWeight: 600
                    }}
                >
                    <MessageSquare size={18} color="#2dd4bf" />
                    <span>New Chat</span>
                </motion.button>
            </div>

            {/* Chat Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 0 2rem 0', zIndex: 1, scrollBehavior: 'smooth' }}>
                {messages.length === 0 ? (
                    <WelcomeScreen username={user?.username?.split(' ')[0]} onSuggestionClick={(txt) => handleSend(txt)} />
                ) : (
                    <div style={{ maxWidth: '850px', margin: '0 auto', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <AnimatePresence>
                            {messages.map((msg, idx) => {
                                const isUser = msg.role === 'user';
                                const isSystem = msg.role === 'system';
                                const isLast = idx === messages.length - 1;

                                if (isSystem) {
                                    return (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            style={{ textAlign: 'center', margin: '1rem 0', alignSelf: 'center', width: 'fit-content' }}
                                        >
                                            {msg.type === 'upload_success' ? (
                                                <div style={{ background: '#1e293b', padding: '1rem', borderRadius: '16px', border: '1px solid #2dd4bf', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                    <div style={{ color: '#2dd4bf', fontSize: '0.9rem', fontWeight: 600 }}>Successfully uploaded {msg.filename}</div>
                                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                                                        <button
                                                            onClick={() => handleVisualize(msg.content, msg.filename)}
                                                            style={{ background: 'linear-gradient(135deg, #2dd4bf, #0ea5e9)', border: 'none', borderRadius: '8px', padding: '6px 12px', color: '#fff', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                                                        >
                                                            <Sparkles size={14} /> Visualize
                                                        </button>
                                                        <button
                                                            onClick={() => handleKnowledgeGraph(msg.content, msg.filename)}
                                                            style={{ background: '#1e293b', border: '1px solid #2dd4bf', borderRadius: '8px', padding: '6px 12px', color: '#2dd4bf', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                                                        >
                                                            <Network size={14} /> Map
                                                        </button>
                                                        <button
                                                            onClick={() => handleJournalMatch(msg.content)}
                                                            style={{ background: '#1e293b', border: '1px solid #0ea5e9', borderRadius: '8px', padding: '6px 12px', color: '#0ea5e9', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                                                        >
                                                            <Award size={14} /> Match Journal
                                                        </button>
                                                        <button
                                                            onClick={() => handleResearchTrends(msg.filename)}
                                                            style={{ background: '#1e293b', border: '1px solid #8b5cf6', borderRadius: '8px', padding: '6px 12px', color: '#8b5cf6', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                                                        >
                                                            <TrendingUp size={14} /> Trends
                                                        </button>
                                                        <button
                                                            onClick={() => handleFundingScout(msg.content)}
                                                            style={{ background: '#1e293b', border: '1px solid #f59e0b', borderRadius: '8px', padding: '6px 12px', color: '#f59e0b', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                                                        >
                                                            <DollarSign size={14} /> Grants
                                                        </button>
                                                        <button
                                                            onClick={() => handleIEEECheck(msg.content)}
                                                            style={{ background: '#1e293b', border: '1px solid #10b981', borderRadius: '8px', padding: '6px 12px', color: '#10b981', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                                                        >
                                                            <FileCheck size={14} /> Check IEEE
                                                        </button>
                                                        <button
                                                            onClick={() => handleDraftSection('Abstract')}
                                                            style={{ background: '#1e293b', border: '1px solid #c084fc', borderRadius: '8px', padding: '6px 12px', color: '#c084fc', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                                                        >
                                                            <PenTool size={14} /> Draft Abstract
                                                        </button>
                                                        <button
                                                            onClick={() => handleReadAloud(msg.content)}
                                                            style={{ background: isReading ? '#ef4444' : '#334155', border: 'none', borderRadius: '8px', padding: '6px 12px', color: '#fff', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                                                        >
                                                            {isReading ? <VolumeX size={14} /> : <Volume2 size={14} />}
                                                            {isReading ? "Stop" : "Speak"}
                                                        </button>
                                                    </div>
                                                    {isReading && <ReadingAnimation />}
                                                </div>
                                            ) : (
                                                <div style={{ fontSize: '0.8rem', color: '#64748b', background: '#1e293b', padding: '0.5rem 1rem', borderRadius: '12px' }}>{msg.content}</div>
                                            )}
                                        </motion.div>
                                    );
                                }

                                if (msg.type === 'visual_abstract_loading') {
                                    return <ImageGenerationAnimation key={idx} />;
                                }

                                if (msg.type === 'visual_abstract_error') {
                                    return (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            style={{ textAlign: 'center', margin: '1rem 0', alignSelf: 'center', width: 'fit-content' }}
                                        >
                                            <div style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '16px', border: '1px solid #ef4444', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
                                                <div style={{ color: '#ef4444', fontSize: '0.9rem', fontWeight: 600 }}>{msg.content}</div>
                                                <button
                                                    onClick={() => handleVisualize(msg.original_content, msg.original_filename)}
                                                    style={{ background: '#334155', border: 'none', borderRadius: '8px', padding: '8px 16px', color: '#fff', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                                                >
                                                    <Zap size={16} /> Retry Synthesis
                                                </button>
                                            </div>
                                        </motion.div>
                                    );
                                }

                                if (msg.type === 'visual_abstract') {
                                    return (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.5rem', background: '#0f172a', borderRadius: '24px', border: '1px solid #1e293b', overflow: 'hidden', width: '100%', maxWidth: '100%' }}
                                        >
                                            <div style={{ color: '#2dd4bf', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', fontWeight: 700 }}>
                                                <Sparkles size={20} /> ResearchAI Visual Abstract
                                            </div>
                                            <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', background: '#1e293b', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                                <img
                                                    src={msg.image}
                                                    alt="Visual Abstract"
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.parentNode.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;color:#64748b;font-size:0.9rem;text-align:center;padding:1rem;gap:1rem;">
                                                            <div>Image synth timed out. The free engine is busy.</div>
                                                            <button 
                                                                onclick="this.innerText='Retrying...'; window.dispatchEvent(new CustomEvent('retry-vis', {detail: {content: ${JSON.stringify(msg.original_content)}, filename: ${JSON.stringify(msg.original_filename)}}}));" 
                                                                style="background:#334155;border:none;border-radius:8px;padding:8px 16px;color:#fff;font-weight:600;cursor:pointer;"
                                                            >Retry</button>
                                                        </div>`;
                                                    }}
                                                />
                                            </div>
                                            <p style={{ fontSize: '0.9rem', color: '#94a3b8', fontStyle: 'italic', lineHeight: 1.6 }}>"{msg.content}"</p>
                                        </motion.div>
                                    );
                                }

                                return (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 20, scale: 0.98 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        transition={{ duration: 0.4, ease: "easeOut" }}
                                        style={{
                                            display: 'flex',
                                            gap: '1.25rem',
                                            flexDirection: isUser ? 'row-reverse' : 'row',
                                            alignItems: 'flex-start'
                                        }}
                                    >
                                        {/* Avatar */}
                                        <motion.div
                                            whileHover={{ scale: 1.1 }}
                                            style={{
                                                width: '38px',
                                                height: '38px',
                                                borderRadius: '50%',
                                                background: isUser ? '#334155' : 'linear-gradient(135deg, #2dd4bf 0%, #0ea5e9 100%)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexShrink: 0,
                                                boxShadow: isUser ? 'none' : '0 4px 15px rgba(45, 212, 191, 0.3)'
                                            }}
                                        >
                                            {isUser ? <User size={20} color="#e2e8f0" /> : <Bot size={22} color="#fff" />}
                                        </motion.div>

                                        {/* Message Content */}
                                        <div style={{
                                            flex: 1,
                                            maxWidth: '85%',
                                            background: isUser ? '#1e293b' : 'transparent',
                                            padding: isUser ? '1rem 1.5rem' : '0.5rem 0',
                                            borderRadius: isUser ? '20px 20px 4px 20px' : '0',
                                            fontSize: '1rem',
                                            lineHeight: '1.7',
                                            color: '#e2e8f0',
                                            boxShadow: isUser ? '0 2px 10px rgba(0,0,0,0.1)' : 'none'
                                        }}>
                                            {isUser ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                    {msg.image && (
                                                        <img src={msg.image} alt="Upload" style={{ maxWidth: '200px', borderRadius: '12px', marginBottom: '8px' }} />
                                                    )}
                                                    <FormattedText text={msg.content} />
                                                </div>
                                            ) : (
                                                <div style={{ color: '#cbd5e1' }}>
                                                    {isLast && loading && !msg.content ? (
                                                        <ThinkingAnimation />
                                                    ) : (
                                                        <FormattedText text={msg.content} />
                                                    )}

                                                    {msg.type === 'web_research_result' && msg.sources && (
                                                        <div style={{ marginTop: '1.25rem', padding: '1rem', background: 'rgba(14, 165, 233, 0.1)', borderRadius: '16px', border: '1px solid rgba(14, 165, 233, 0.2)' }}>
                                                            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0ea5e9', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                <ExternalLink size={14} /> Global Citations
                                                            </div>
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                                {msg.sources.map((src, i) => (
                                                                    <a key={i} href={src.url} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', color: '#94a3b8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', hover: { color: '#0ea5e9' } }}>
                                                                        <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#0ea5e9' }}></div>
                                                                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{src.title || src.url}</span>
                                                                    </a>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {msg.type === 'journal_match_result' && <JournalList journals={msg.journals} />}
                                                    {msg.type === 'research_trends_result' && <TrendChart data={msg.trends} />}
                                                    {msg.type === 'funding_scout_result' && <FundingList opportunities={msg.opportunities} />}
                                                    {msg.type === 'ieee_check_result' && <IEEEResult result={msg.ieee_data} />}
                                                    {msg.type === 'literature_grid' && <LiteratureGrid data={msg.grid_data} />}
                                                    {msg.type === 'collaboration_room' && (
                                                        <CollaborationRoom
                                                            roomData={msg.room_data}
                                                            onSendMessage={(text) => handleRoomMessage(msg.room_data.room_id, text)}
                                                            currentUsername={user?.username || "Researcher"}
                                                        />
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>

                        {isSearchingWeb && <SearchAnimation />}

                        {loading && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}
                            >
                                <div style={{
                                    width: '38px',
                                    height: '38px',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #2dd4bf 0%, #0ea5e9 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    <Bot size={22} color="#fff" />
                                </div>
                                <ThinkingAnimation />
                            </motion.div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div style={{
                width: '100%',
                padding: '1.5rem 2rem 2.5rem 2rem',
                background: 'linear-gradient(to top, #0b0c10 80%, transparent 100%)',
                display: 'flex',
                justifyContent: 'center',
                zIndex: 10,
                flexShrink: 0
            }}>
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                    style={{
                        width: '100%',
                        maxWidth: '850px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem'
                    }}
                >
                    {/* Active Context Indicator */}
                    {activeDocument && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                background: 'rgba(45, 212, 191, 0.08)',
                                border: '1px solid rgba(45, 212, 191, 0.2)',
                                padding: '6px 12px',
                                borderRadius: '10px',
                                color: '#2dd4bf',
                                fontSize: '0.75rem',
                                fontWeight: 500,
                                width: 'fit-content',
                                alignSelf: 'center',
                                backdropFilter: 'blur(4px)'
                            }}
                        >
                            <FileText size={14} />
                            <span>Active Knowledge: <strong>{activeDocument.filename}</strong></span>
                            <button
                                onClick={() => setActiveDocument(null)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', marginLeft: '4px', display: 'flex', hover: { color: '#ef4444' } }}
                            >
                                <X size={14} />
                            </button>
                        </motion.div>
                    )}

                    <div
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            background: 'rgba(23, 23, 27, 0.7)',
                            backdropFilter: 'blur(20px)',
                            padding: '0.75rem 1.25rem',
                            borderRadius: '24px',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.05)',
                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            style={{ display: 'none' }}
                            accept=".pdf,.txt"
                        />

                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            onClick={() => fileInputRef.current.click()}
                            style={{
                                width: '40px', height: '40px', borderRadius: '50%', border: 'none',
                                background: 'transparent', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', cursor: 'pointer', color: '#94a3b8', flexShrink: 0
                            }}
                            title="Upload Document"
                        >
                            <Paperclip size={20} />
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            onClick={() => setWebSearchEnabled(!webSearchEnabled)}
                            style={{
                                width: '40px', height: '40px', borderRadius: '50%', border: 'none',
                                background: webSearchEnabled ? 'rgba(14, 165, 233, 0.2)' : 'transparent',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', color: webSearchEnabled ? '#0ea5e9' : '#94a3b8', flexShrink: 0,
                                border: webSearchEnabled ? '1px solid rgba(14, 165, 233, 0.4)' : 'none'
                            }}
                            title={webSearchEnabled ? "Deep Web Research Enabled" : "Enable Deep Web Research"}
                        >
                            <Globe size={20} className={webSearchEnabled ? "pulse" : ""} />
                        </motion.button>

                        <input
                            type="text"
                            placeholder="Ask Zencoders AI..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            disabled={loading}
                            style={{
                                flex: 1,
                                border: 'none',
                                background: 'transparent',
                                outline: 'none',
                                fontSize: '1rem',
                                color: '#f1f5f9',
                                padding: '0 0.25rem',
                                minWidth: 0
                            }}
                        />

                        {input.trim() ? (
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                onClick={handleSend}
                                disabled={loading}
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    border: 'none',
                                    background: '#f1f5f9',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    color: '#0f172a',
                                    flexShrink: 0
                                }}
                            >
                                <ArrowUp size={20} strokeWidth={2.5} />
                            </motion.button>
                        ) : (
                            <motion.button
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    border: 'none',
                                    background: 'transparent',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'not-allowed',
                                    color: '#334155',
                                    flexShrink: 0
                                }}
                            >
                                <ArrowUp size={20} />
                            </motion.button>
                        )}
                    </div>

                </motion.div>
            </div>

            <div style={{
                position: 'absolute',
                bottom: '0.5rem',
                width: '100%',
                textAlign: 'center',
                fontSize: '0.75rem',
                color: '#475569',
                paddingBottom: '0.5rem',
                pointerEvents: 'none',
                zIndex: 20
            }}>
                Developed by Zencoders Team BEC
            </div>
        </div>
    );
}
