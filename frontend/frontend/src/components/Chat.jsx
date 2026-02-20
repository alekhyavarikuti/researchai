import { useState, useRef, useEffect } from 'react';
import { askQuestion, uploadPaper, getDashboardData, visualizePaper } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Paperclip, Sparkles, Send, Mic, User, ArrowUp, Bot, FileText, Zap, Image as ImageIcon, X, Menu, History, MessageSquare, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Customized Animation Components ---

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

const Typewriter = ({ text, onComplete }) => {
    const [displayedText, setDisplayedText] = useState('');
    const [isComplete, setIsComplete] = useState(false);

    // Safety check for empty text
    useEffect(() => {
        if (!text) {
            setDisplayedText('');
            setIsComplete(true);
            if (onComplete) onComplete();
            return;
        }

        // Clean text - remove "airstrikes" (markdown bold/italic markers)
        const cleanText = text.replace(/(\*\*|__)(.*?)\1/g, '$2').replace(/(\*)(.*?)\1/g, '$2');

        setDisplayedText('');
        setIsComplete(false);

        let index = 0;
        const speed = 10;

        const interval = setInterval(() => {
            if (index < cleanText.length) {
                const charsToAdd = cleanText.slice(index, index + 2);
                setDisplayedText((prev) => prev + charsToAdd);
                index += 2;
            } else {
                clearInterval(interval);
                setIsComplete(true);
                if (onComplete) onComplete();
            }
        }, speed);

        return () => clearInterval(interval);
    }, [text]);

    return (
        <span>
            {displayedText}
            {!isComplete && (
                <span style={{ display: 'inline-block', width: '2px', height: '14px', backgroundColor: '#2dd4bf', marginLeft: '2px', animation: 'blink 1s infinite', verticalAlign: 'text-bottom' }} />
            )}
            <style>{`@keyframes blink { 50% { opacity: 0; } }`}</style>
        </span>
    );
};

const WelcomeScreen = ({ username, onSuggestionClick }) => {
    const suggestions = [
        { icon: <Zap size={18} />, text: "Explain quantum computing", delay: 0.1 },
        { icon: <FileText size={18} />, text: "Summarize this paper", delay: 0.2 },
        { icon: <ImageIcon size={18} />, text: "Analyze this image", delay: 0.3 },
        { icon: <Sparkles size={18} />, text: "Creative writing ideas", delay: 0.4 },
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

const Sidebar = ({ isOpen, toggleSidebar, onHistorySelect }) => {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        if (isOpen) {
            getDashboardData().then(res => {
                const activity = res.data.recent_activity || [];
                setHistory(activity);
            }).catch(err => console.error("History fetch error:", err));
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <History size={20} color="#2dd4bf" /> History
                </h2>
                <button onClick={toggleSidebar} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                    <X size={20} />
                </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {history.length === 0 ? (
                    <div style={{ color: '#64748b', fontSize: '0.9rem', textAlign: 'center', padding: '1rem' }}>No recent history</div>
                ) : (
                    history.map((item, idx) => (
                        <motion.button
                            key={idx}
                            whileHover={{ scale: 1.02, backgroundColor: '#1e293b' }}
                            onClick={() => onHistorySelect(item.item)}
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
                )}
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #1e293b', fontSize: '0.8rem', color: '#475569', textAlign: 'center' }}>
                Zencoders AI © 2026
            </div>
        </motion.div>
    );
};

export default function Chat({ toggleMainSidebar }) {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const fileInputRef = useRef(null);
    const imageInputRef = useRef(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const handleRetry = (e) => {
            handleVisualize(e.detail.content, e.detail.filename);
        };
        window.addEventListener('retry-vis', handleRetry);
        return () => window.removeEventListener('retry-vis', handleRetry);
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

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

    const handleStreamingResponse = async (prompt, imageData = null) => {
        setLoading(true);
        const token = localStorage.getItem('token');
        const endpoint = imageData ? '/api/analyze-image' : '/api/qa-stream';
        const body = imageData
            ? JSON.stringify({ prompt, image: imageData })
            : JSON.stringify({ question: prompt });

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
        } catch (error) {
            console.error("Streaming error:", error);
            setMessages(prev => [...prev, { role: 'assistant', content: "Error: Could not retrieve response." }]);
        } finally {
            setLoading(false);
            setSelectedImage(null);
            setImagePreview(null);
        }
    };

    const handleSend = async (text = input) => {
        if (!text.trim() && !selectedImage) return;

        const userContent = text;
        const userMessage = { role: 'user', content: userContent };
        if (selectedImage) {
            userMessage.image = imagePreview; // Store preview for UI
        }

        setMessages(prev => [...prev, userMessage]);
        setInput('');

        await handleStreamingResponse(text || "Describe this image", selectedImage);
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setMessages(prev => [...prev, { role: 'system', content: `Uploading ${file.name}...` }]);
        try {
            const res = await uploadPaper(file);
            setMessages(prev => [...prev, {
                role: 'system',
                type: 'upload_success',
                filename: file.name,
                content: res.data.content, // Assume backend returns content or filename
                content_preview: res.data.content // passed to visualizer
            }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'system', content: `Error: Failed to upload ${file.name}.` }]);
        } finally {
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result; // Data URL
                // We need to send base64 data to backend. Backend expects either URL or base64. 
                // The Data URL format is "data:image/jpeg;base64,....." which works for our backend logic.
                setSelectedImage(base64String);
                setImagePreview(base64String);
            };
            reader.readAsDataURL(file);
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

            {/* Chat Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 0 120px 0', zIndex: 1, scrollBehavior: 'smooth' }}>
                {messages.length === 0 ? (
                    <WelcomeScreen username={user?.username?.split(' ')[0]} onSuggestionClick={(txt) => handleSend(txt)} />
                ) : (
                    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
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
                                                    <button
                                                        onClick={() => handleVisualize(msg.content, msg.filename)}
                                                        style={{ background: 'linear-gradient(135deg, #2dd4bf, #0ea5e9)', border: 'none', borderRadius: '8px', padding: '8px 16px', color: '#fff', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}
                                                    >
                                                        <Sparkles size={16} /> Visualize Paper with AI
                                                    </button>
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
                                                    {msg.content}
                                                </div>
                                            ) : (
                                                <div style={{ color: '#cbd5e1' }}>
                                                    {/* Clean text for display */}
                                                    {(() => {
                                                        const cleanContent = msg.content.replace(/(\*\*|__)(.*?)\1/g, '$2').replace(/(\*)(.*?)\1/g, '$2');
                                                        return isLast && loading ? (
                                                            /* If loading, assume it's streaming, so show raw content as it comes, or Typewriter if needed but usually stream is chunked. 
                                                               Since we update state chunk by chunk, standard render is fine. Typewriter is for simulation. 
                                                               Let's just render the text directly for streaming feeling.
                                                            */
                                                            <div style={{ whiteSpace: 'pre-wrap' }}>{cleanContent}<span style={{ inlineBlock: true, width: '6px', height: '14px', background: '#2dd4bf', animation: 'blink 1s infinite' }}>|</span></div>
                                                        ) : (
                                                            <div style={{ whiteSpace: 'pre-wrap' }}>{cleanContent}</div>
                                                        );
                                                    })()}
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>

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
                position: 'fixed',
                bottom: 0,
                left: 0,
                width: '100%',
                padding: '1.5rem 2rem 2rem 2rem',
                background: 'linear-gradient(to top, #0b0c10 85%, transparent 100%)',
                display: 'flex',
                justifyContent: 'center',
                zIndex: 10,
                pointerEvents: 'none'
            }}>
                <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5, type: 'spring' }}
                    style={{
                        width: '100%',
                        maxWidth: '850px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        pointerEvents: 'auto',
                        flexDirection: 'column',
                        gap: '0.5rem'
                    }}
                >
                    {/* Image Preview Area */}
                    {imagePreview && (
                        <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '8px', borderBottom: '1px solid #334155' }}>
                            <img src={imagePreview} alt="Preview" style={{ height: '50px', borderRadius: '8px' }} />
                            <span style={{ fontSize: '0.8rem', color: '#94a3b8', flex: 1 }}>Image attached</span>
                            <button onClick={() => { setImagePreview(null); setSelectedImage(null); }} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><X size={16} /></button>
                        </div>
                    )}

                    <div
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            background: '#1e293b',
                            padding: '0.5rem 0.75rem',
                            borderRadius: '999px',
                            border: '1px solid #334155'
                        }}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            style={{ display: 'none' }}
                            accept=".pdf,.txt"
                        />

                        <input
                            type="file"
                            ref={imageInputRef}
                            onChange={handleImageSelect}
                            style={{ display: 'none' }}
                            accept="image/*"
                        />

                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            onClick={() => fileInputRef.current.click()}
                            style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                border: 'none',
                                background: 'transparent',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                color: '#94a3b8',
                                flexShrink: 0
                            }}
                            title="Upload Document"
                        >
                            <Paperclip size={20} />
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            onClick={() => imageInputRef.current.click()}
                            style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                border: 'none',
                                background: 'transparent',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                color: '#94a3b8',
                                flexShrink: 0
                            }}
                            title="Upload Image"
                        >
                            <ImageIcon size={20} />
                        </motion.button>

                        <input
                            type="text"
                            placeholder={selectedImage ? "Asking about this image..." : "Ask Zencoders AI..."}
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

                        {input.trim() || selectedImage ? (
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
                                    color: '#64748b',
                                    flexShrink: 0
                                }}
                            >
                                <Mic size={20} />
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
                AI can make mistakes. Verify important information.
            </div>
        </div>
    );
}
