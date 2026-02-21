import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Mail, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { useRef } from 'react';


const AIBackground = ({ mouseX, mouseY }) => {
    const x = useTransform(mouseX, [0, window.innerWidth], [-20, 20]);
    const y = useTransform(mouseY, [0, window.innerHeight], [-20, 20]);

    return (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden', zIndex: 0 }}>
            <motion.div style={{ x, y, width: '100%', height: '100%' }}>
                {[...Array(5)].map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{
                            x: Math.random() * 100 + "%",
                            y: Math.random() * 100 + "%",
                            scale: 0.5 + Math.random() * 0.5
                        }}
                        animate={{
                            x: [Math.random() * 100 + "%", Math.random() * 100 + "%", Math.random() * 100 + "%"],
                            y: [Math.random() * 100 + "%", Math.random() * 100 + "%", Math.random() * 100 + "%"],
                            rotate: [0, 180, 360],
                        }}
                        transition={{
                            duration: 20 + Math.random() * 10,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                        style={{
                            position: 'absolute',
                            width: '500px',
                            height: '500px',
                            borderRadius: '50%',
                            background: i % 2 === 0
                                ? 'radial-gradient(circle, rgba(56, 189, 248, 0.15) 0%, rgba(56, 189, 248, 0) 70%)'
                                : 'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, rgba(168, 85, 247, 0) 70%)',
                            filter: 'blur(40px)',
                        }}
                    />
                ))}
                {[...Array(30)].map((_, i) => (
                    <motion.div
                        key={`p-${i}`}
                        initial={{ opacity: 0, y: '110%', x: `${Math.random() * 100}%` }}
                        animate={{ opacity: [0, 0.9, 0], y: '-10%' }}
                        transition={{
                            duration: 6 + Math.random() * 12,
                            delay: Math.random() * 8,
                            repeat: Infinity,
                            ease: 'linear'
                        }}
                        style={{
                            position: 'absolute',
                            width: i % 5 === 0 ? '4px' : '2px',
                            height: i % 5 === 0 ? '4px' : '2px',
                            background: i % 3 === 0 ? '#38bdf8' : i % 3 === 1 ? '#a855f7' : '#fff',
                            borderRadius: '50%',
                            boxShadow: i % 5 === 0 ? '0 0 6px rgba(56,189,248,0.8)' : 'none',
                        }}
                    />
                ))}
            </motion.div>
        </div>
    );
};

// Animated dot-grid with scanning sweep line
const AnimatedGrid = () => {
    return (
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, overflow: 'hidden', opacity: 0.35 }}>
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <circle cx="1" cy="1" r="1" fill="rgba(56,189,248,0.5)" />
                    </pattern>
                    <linearGradient id="scanGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgba(56,189,248,0)" />
                        <stop offset="50%" stopColor="rgba(56,189,248,0.15)" />
                        <stop offset="100%" stopColor="rgba(56,189,248,0)" />
                    </linearGradient>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
            <motion.div
                animate={{ y: ['-100%', '200%'] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear', repeatDelay: 1 }}
                style={{
                    position: 'absolute', left: 0, right: 0,
                    height: '30%',
                    background: 'linear-gradient(to bottom, rgba(56,189,248,0) 0%, rgba(56,189,248,0.08) 50%, rgba(56,189,248,0) 100%)',
                    pointerEvents: 'none'
                }}
            />
        </div>
    );
};

// Floating connected nodes
const nodePositions = [
    { x: 15, y: 20 }, { x: 35, y: 10 }, { x: 65, y: 18 },
    { x: 80, y: 35 }, { x: 55, y: 45 }, { x: 25, y: 55 },
    { x: 70, y: 65 }, { x: 40, y: 75 }, { x: 15, y: 80 },
];
const connections = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [4, 6], [6, 7], [7, 8], [5, 8], [0, 5], [2, 4]];

const FloatingNodes = () => (
    <div style={{ position: 'absolute', inset: 0, zIndex: 2, overflow: 'hidden', pointerEvents: 'none' }}>
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
            {connections.map(([a, b], i) => (
                <motion.line
                    key={i}
                    x1={nodePositions[a].x} y1={nodePositions[a].y}
                    x2={nodePositions[b].x} y2={nodePositions[b].y}
                    stroke="rgba(56,189,248,0.2)" strokeWidth="0.3"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: [0, 1, 1, 0], opacity: [0, 0.6, 0.6, 0] }}
                    transition={{ duration: 4, delay: i * 0.3, repeat: Infinity, repeatDelay: 1 }}
                />
            ))}
            {nodePositions.map((pos, i) => (
                <motion.g key={i}>
                    <motion.circle
                        cx={pos.x} cy={pos.y} r="1.2"
                        fill="rgba(56,189,248,0.15)"
                        stroke="rgba(56,189,248,0.7)" strokeWidth="0.3"
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2.5 + i * 0.3, repeat: Infinity, delay: i * 0.2 }}
                        style={{ transformOrigin: `${pos.x}px ${pos.y}px` }}
                    />
                    <motion.circle
                        cx={pos.x} cy={pos.y} r="2.5"
                        fill="none"
                        stroke="rgba(56,189,248,0.2)" strokeWidth="0.2"
                        animate={{ r: [2.5, 4.5], opacity: [0.5, 0] }}
                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
                    />
                </motion.g>
            ))}
        </svg>
    </div>
);


// Orbit ring around AI core
const OrbitRing = () => (
    <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
        style={{
            position: 'absolute', bottom: '2.5rem', right: '2.5rem',
            width: '140px', height: '140px',
            zIndex: 5, pointerEvents: 'none'
        }}
    >
        {/* Core */}
        <motion.div
            animate={{ boxShadow: ['0 0 15px rgba(56,189,248,0.5)', '0 0 35px rgba(56,189,248,0.9)', '0 0 15px rgba(56,189,248,0.5)'] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%,-50%)',
                width: '32px', height: '32px',
                background: 'linear-gradient(135deg, #38bdf8, #3b82f6)',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.8rem', fontWeight: 700, color: '#fff'
            }}
        >
            AI
        </motion.div>
        {/* Ring 1 */}
        {[60, 90, 120].map((size, ri) => (
            <motion.div
                key={ri}
                animate={{ rotate: ri % 2 === 0 ? 360 : -360 }}
                transition={{ duration: 5 + ri * 2, repeat: Infinity, ease: 'linear' }}
                style={{
                    position: 'absolute',
                    top: '50%', left: '50%',
                    width: `${size}px`, height: `${size}px`,
                    marginLeft: `-${size / 2}px`, marginTop: `-${size / 2}px`,
                    borderRadius: '50%',
                    border: `1px solid rgba(${ri === 0 ? '56,189,248' : ri === 1 ? '168,85,247' : '45,212,191'},${0.5 - ri * 0.1})`,
                }}
            >
                {/* Dot on ring */}
                <motion.div
                    style={{
                        position: 'absolute', top: '-3px', left: '50%',
                        width: '6px', height: '6px',
                        borderRadius: '50%',
                        background: ri === 0 ? '#38bdf8' : ri === 1 ? '#a855f7' : '#2dd4bf',
                        boxShadow: `0 0 8px ${ri === 0 ? '#38bdf8' : ri === 1 ? '#a855f7' : '#2dd4bf'}`,
                        transform: 'translateX(-50%)'
                    }}
                />
            </motion.div>
        ))}
    </motion.div>
);

// Typing Effect Component
const TypingText = ({ text, delay = 0 }) => {
    const [displayedText, setDisplayedText] = useState('');

    useEffect(() => {
        setDisplayedText(''); // Reset when text changes

        let i = 0;
        const typing = setInterval(() => {
            if (i < text.length) {
                setDisplayedText(prev => prev + text.charAt(i));
                i++;
            } else {
                clearInterval(typing);
            }
        }, 80); // Typing speed

        return () => clearInterval(typing);
    }, [text]);

    return (
        <motion.span
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
        >
            {displayedText}
            <motion.span
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                style={{ display: 'inline-block', width: '2px', height: '1em', background: '#3b82f6', marginLeft: '4px', verticalAlign: 'middle' }}
            />
        </motion.span>
    );
};

const RotatingText = () => {
    const texts = [
        { title: "Accelerate Your Scientific Discovery", subtitle: "Harness the power of advanced AI to analyze papers, generate summaries, and uncover hidden insights in seconds." },
        { title: "Your Personal Research Assistant", subtitle: "Ask questions, get answers, and explore complex topics with an AI that understands context." },
        { title: "Stay Ahead of the Curve", subtitle: "Keep track of the latest developments in your field with automated summaries and recommendations." }
    ];
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % texts.length);
        }, 8000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div style={{ minHeight: '260px', position: 'relative', width: '100%' }}>
            <AnimatePresence mode='wait'>
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%' }}
                >
                    <h1 style={{
                        fontSize: 'clamp(1.8rem, 3vw, 2.8rem)',
                        fontWeight: 700,
                        lineHeight: 1.15,
                        marginBottom: '1.25rem',
                        background: 'linear-gradient(to right, #ffffff, #94a3b8)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        width: '100%',
                        display: 'block',
                        minHeight: '80px'
                    }}>
                        <TypingText text={texts[index].title} />
                    </h1>
                    <p style={{ fontSize: '1.05rem', color: '#94a3b8', lineHeight: 1.7, width: '100%', maxWidth: '520px' }}>
                        {texts[index].subtitle}
                    </p>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();


    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const handleMouseMove = (e) => {
        mouseX.set(e.clientX);
        mouseY.set(e.clientY);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(email, password);
            navigate('/chat');
        } catch (err) {
            // More specific error handling if possible
            if (err.response && err.response.status === 401) {
                setError('Invalid email or password.');
            } else {
                setError('Something went wrong. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            onMouseMove={handleMouseMove}
            style={{ position: 'fixed', top: 0, left: 0, display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: '#0f172a', margin: 0, padding: 0 }}
        >

            {/* Left Side - AI Visuals */}
            <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', padding: '4rem 5rem', color: '#fff', borderRight: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                <AIBackground mouseX={mouseX} mouseY={mouseY} />
                <AnimatedGrid />
                <FloatingNodes />
                <OrbitRing />

                <div style={{ position: 'relative', zIndex: 10, width: '100%' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                            <motion.div
                                animate={{ boxShadow: ['0 0 15px rgba(59,130,246,0.4)', '0 0 30px rgba(59,130,246,0.8)', '0 0 15px rgba(59,130,246,0.4)'] }}
                                transition={{ duration: 2.5, repeat: Infinity }}
                                style={{ width: '48px', height: '48px', background: 'linear-gradient(135deg, #38bdf8 0%, #3b82f6 100%)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff' }}>R</span>
                            </motion.div>
                            <motion.span
                                animate={{ opacity: [0.8, 1, 0.8] }}
                                transition={{ duration: 3, repeat: Infinity }}
                                style={{ fontSize: '1.5rem', fontWeight: 600, letterSpacing: '-0.02em' }}
                            >
                                ResearchAI
                            </motion.span>
                        </div>
                    </motion.div>

                    <RotatingText />
                </div>

                {/* Bottom glowing line */}
                <motion.div
                    animate={{ scaleX: [0, 1], opacity: [0, 1] }}
                    transition={{ duration: 1.2, delay: 0.8, ease: 'easeOut' }}
                    style={{
                        position: 'absolute', bottom: 0, left: 0, right: 0,
                        height: '1px',
                        background: 'linear-gradient(to right, transparent, #38bdf8, transparent)',
                        transformOrigin: 'left',
                        zIndex: 10
                    }}
                />
            </div>

            {/* Right Side - Login Form */}
            <motion.div
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                style={{ width: '600px', background: '#0b0c10', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '4rem', boxShadow: '-10px 0 40px rgba(0,0,0,0.5)', position: 'relative', zIndex: 20, borderLeft: '1px solid #1e293b' }}
            >
                <div style={{ width: '100%', maxWidth: '360px', margin: '0 auto' }}>
                    <h2 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>Welcome back</h2>
                    <p style={{ color: '#94a3b8', marginBottom: '2.5rem' }}>Please enter your details to sign in.</p>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.875rem' }}
                        >
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div style={{ position: 'relative' }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#e2e8f0', marginBottom: '0.5rem' }}>Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                                <input
                                    type="email"
                                    placeholder="yourname@gmail.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 1rem 0.75rem 2.5rem',
                                        background: '#0f172a',
                                        border: '1px solid #1e293b',
                                        borderRadius: '8px',
                                        fontSize: '0.875rem',
                                        transition: 'all 0.2s',
                                        outline: 'none',
                                        color: '#fff'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                                    onBlur={(e) => e.target.style.borderColor = '#1e293b'}
                                />
                            </div>
                        </div>

                        <div style={{ position: 'relative' }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#e2e8f0', marginBottom: '0.5rem' }}>Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 2.5rem 0.75rem 2.5rem',
                                        background: '#0f172a',
                                        border: '1px solid #1e293b',
                                        borderRadius: '8px',
                                        fontSize: '0.875rem',
                                        transition: 'all 0.2s',
                                        outline: 'none',
                                        color: '#fff'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                                    onBlur={(e) => e.target.style.borderColor = '#1e293b'}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            className="btn-primary"
                            disabled={loading}
                            style={{
                                marginTop: '0.5rem',
                                padding: '0.875rem',
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                background: 'linear-gradient(to right, #2dd4bf, #0ea5e9)',
                                border: 'none',
                                color: '#fff',
                                borderRadius: '8px',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                boxShadow: '0 4px 15px rgba(45, 212, 191, 0.3)'
                            }}
                        >
                            {loading ? 'Please wait...' : (
                                <>Sign In <ArrowRight size={16} /></>
                            )}
                        </motion.button>
                    </form>

                    <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                        <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
                            Don't have an account? <span onClick={() => navigate('/register')} style={{ color: '#3b82f6', fontWeight: 600, cursor: 'pointer' }}>Create free account</span>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
