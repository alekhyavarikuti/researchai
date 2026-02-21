import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { createRoom, getRoom, addRoomMessage, getMessages, listRooms } from '../services/api';
import { Users, MessageSquare, Send, Plus, Search, LogOut, Hash, User, History } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Collaboration() {
    const { user } = useAuth();
    const [roomId, setRoomId] = useState('');
    const [roomName, setRoomName] = useState('');
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [username, setUsername] = useState(user?.username || 'Researcher');
    const [isInRoom, setIsInRoom] = useState(false);
    const [joinInput, setJoinInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [existingRooms, setExistingRooms] = useState([]);

    useEffect(() => {
        if (!isInRoom) {
            fetchRooms();
        }
    }, [isInRoom]);

    const fetchRooms = async () => {
        try {
            const res = await listRooms();
            setExistingRooms(res.data.rooms);
        } catch (error) {
            console.error("Error fetching rooms:", error);
        }
    };

    useEffect(() => {
        let interval;
        if (isInRoom && roomId) {
            fetchMessages();
            interval = setInterval(fetchMessages, 3000); // Poll every 3s
        }
        return () => clearInterval(interval);
    }, [isInRoom, roomId]);

    const fetchMessages = async () => {
        try {
            const res = await getMessages(roomId);
            setMessages(res.data.messages);
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    };

    const handleCreateRoom = async () => {
        if (!roomName.trim()) return;
        setLoading(true);
        try {
            const res = await createRoom({ name: roomName });
            setRoomId(res.data.room_id);
            setIsInRoom(true);
            setMessages([]);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleJoinRoom = async () => {
        if (!joinInput.trim()) return;
        setLoading(true);
        try {
            const res = await getRoom(joinInput);
            if (res.data) {
                setRoomId(joinInput);
                setRoomName(res.data.name);
                setIsInRoom(true);
                fetchMessages();
            }
        } catch (error) {
            alert("Room not found. Please check the ID.");
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;
        try {
            const currentMsg = newMessage;
            setNewMessage('');
            // Optimistic update
            setMessages(prev => [...prev, { content: currentMsg, user: username, timestamp: new Date().toISOString() }]);
            await addRoomMessage({ room_id: roomId, content: currentMsg, user: username });
            fetchMessages();
        } catch (error) {
            console.error(error);
        }
    };

    if (!isInRoom) {
        return (
            <div style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#0b0c10',
                position: 'relative',
                overflow: 'hidden',
                padding: '2rem'
            }}>
                {/* Background Glows */}
                <div style={{ position: 'absolute', top: '10%', right: '10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(45, 212, 191, 0.08) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }}></div>
                <div style={{ position: 'absolute', bottom: '10%', left: '10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(168, 85, 247, 0.08) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }}></div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{
                        width: '100%',
                        maxWidth: '900px',
                        zIndex: 1,
                        display: 'grid',
                        gridTemplateColumns: window.innerWidth > 768 ? '1fr 1fr' : '1fr',
                        gap: '2rem'
                    }}
                >
                    <div style={{ gridColumn: window.innerWidth > 768 ? 'span 2' : 'span 1', textAlign: 'center', marginBottom: '1rem' }}>
                        <div style={{ display: 'inline-flex', padding: '12px', background: 'rgba(45, 212, 191, 0.1)', borderRadius: '20px', marginBottom: '1.5rem', border: '1px solid rgba(45, 212, 191, 0.2)' }}>
                            <Users size={32} color="#2dd4bf" />
                        </div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
                            Team Space
                        </h1>
                        <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>Collaborate with your research team in real-time.</p>
                    </div>

                    {/* Create Room Card */}
                    <motion.div
                        whileHover={{ y: -5 }}
                        style={{
                            background: 'rgba(30, 41, 59, 0.5)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            borderRadius: '24px',
                            padding: '2.5rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1.5rem',
                            boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ background: '#2dd4bf', padding: '8px', borderRadius: '10px' }}>
                                <Plus size={20} color="#000" />
                            </div>
                            <h2 style={{ fontSize: '1.25rem', color: '#fff', margin: 0 }}>Create Room</h2>
                        </div>
                        <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>Start a new workspace for your project.</p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <input
                                type="text"
                                placeholder="Room Project Name"
                                value={roomName}
                                onChange={(e) => setRoomName(e.target.value)}
                                style={{
                                    background: '#0f172a',
                                    border: '1px solid #1e293b',
                                    borderRadius: '12px',
                                    padding: '1rem',
                                    color: '#fff',
                                    outline: 'none',
                                    transition: 'border-color 0.2s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#2dd4bf'}
                                onBlur={(e) => e.target.style.borderColor = '#1e293b'}
                            />
                            <motion.button
                                whileTap={{ scale: 0.98 }}
                                onClick={handleCreateRoom}
                                disabled={loading}
                                style={{
                                    background: 'linear-gradient(135deg, #2dd4bf, #0ea5e9)',
                                    border: 'none',
                                    borderRadius: '12px',
                                    padding: '1rem',
                                    color: '#fff',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    marginTop: '0.5rem',
                                    boxShadow: '0 4px 15px rgba(45, 212, 191, 0.3)'
                                }}
                            >
                                {loading ? 'Creating...' : 'Launch Workspace'}
                            </motion.button>
                        </div>
                    </motion.div>

                    {/* Join Room Card */}
                    <motion.div
                        whileHover={{ y: -5 }}
                        style={{
                            background: 'rgba(30, 41, 59, 0.5)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            borderRadius: '24px',
                            padding: '2.5rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1.5rem',
                            boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ background: '#a855f7', padding: '8px', borderRadius: '10px' }}>
                                <Search size={20} color="#fff" />
                            </div>
                            <h2 style={{ fontSize: '1.25rem', color: '#fff', margin: 0 }}>Join Room</h2>
                        </div>
                        <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>Enter a room ID to collaborate.</p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <input
                                type="text"
                                placeholder="Workspace ID"
                                value={joinInput}
                                onChange={(e) => setJoinInput(e.target.value)}
                                style={{
                                    background: '#0f172a',
                                    border: '1px solid #1e293b',
                                    borderRadius: '12px',
                                    padding: '1rem',
                                    color: '#fff',
                                    outline: 'none',
                                    transition: 'border-color 0.2s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#a855f7'}
                                onBlur={(e) => e.target.style.borderColor = '#1e293b'}
                            />
                            <motion.button
                                whileTap={{ scale: 0.98 }}
                                onClick={handleJoinRoom}
                                disabled={loading}
                                style={{
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '12px',
                                    padding: '1rem',
                                    color: '#fff',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    marginTop: '0.5rem',
                                    transition: 'background 0.2s'
                                }}
                                onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
                                onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.05)'}
                            >
                                {loading ? 'Joining...' : 'Connect to Room'}
                            </motion.button>
                        </div>
                    </motion.div>

                    {/* Previous Workspaces List */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{ gridColumn: window.innerWidth > 768 ? 'span 2' : 'span 1', marginTop: '1rem' }}
                    >
                        <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <History size={18} color="#2dd4bf" /> Previous Workspaces
                        </h3>
                        {existingRooms.length === 0 ? (
                            <div style={{ padding: '2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.1)', textAlign: 'center', color: '#64748b' }}>
                                No previous workspaces found. Create one to get started!
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                                {existingRooms.map(room => (
                                    <motion.div
                                        key={room.id}
                                        whileHover={{ scale: 1.02, backgroundColor: 'rgba(45, 212, 191, 0.05)' }}
                                        onClick={() => {
                                            setJoinInput(room.id);
                                            // Trigger join automatically
                                            setLoading(true);
                                            getRoom(room.id).then(res => {
                                                setRoomId(room.id);
                                                setRoomName(res.data.name);
                                                setIsInRoom(true);
                                                setLoading(false);
                                            }).catch(() => setLoading(false));
                                        }}
                                        style={{
                                            background: 'rgba(30, 41, 59, 0.4)',
                                            border: '1px solid rgba(255, 255, 255, 0.05)',
                                            borderRadius: '16px',
                                            padding: '1.25rem',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '8px'
                                        }}
                                    >
                                        <div style={{ color: '#fff', fontWeight: 600, fontSize: '1rem' }}>{room.name}</div>
                                        <div style={{ color: '#64748b', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Hash size={12} /> {room.id.substring(0, 8)}...
                                        </div>
                                        <div style={{ color: '#2dd4bf', fontSize: '0.7rem', marginTop: '4px' }}>
                                            {room.created_at ? new Date(room.created_at).toLocaleDateString() : 'Active Workspace'}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            </div>
        );
    }

    return (
        <div style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            background: '#0b0c10',
            color: '#fff'
        }}>
            {/* Header */}
            <header style={{
                padding: '1rem 2rem',
                borderBottom: '1px solid #1e293b',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(11, 12, 16, 0.8)',
                backdropFilter: 'blur(10px)',
                zIndex: 10
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ background: 'linear-gradient(135deg, #2dd4bf, #0ea5e9)', padding: '10px', borderRadius: '12px' }}>
                        <Users size={20} color="#fff" />
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>{roomName}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Hash size={12} color="#64748b" />
                            <span style={{ fontSize: '0.75rem', color: '#64748b', letterSpacing: '0.05em' }}>{roomId}</span>
                        </div>
                    </div>
                </div>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsInRoom(false)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        padding: '0.6rem 1rem',
                        borderRadius: '10px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                    }}
                >
                    <LogOut size={16} /> Leave Room
                </motion.button>
            </header>

            {/* Chat Messages */}
            <div style={{
                flex: 1,
                padding: '2rem',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
                scrollBehavior: 'smooth'
            }}>
                <AnimatePresence initial={false}>
                    {messages.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', opacity: 0.5 }}
                        >
                            <MessageSquare size={48} color="#334155" />
                            <p>No messages yet. Start the conversation!</p>
                        </motion.div>
                    ) : (
                        messages.map((msg, idx) => {
                            const isMe = msg.user === username;
                            return (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    style={{
                                        alignSelf: isMe ? 'flex-end' : 'flex-start',
                                        maxWidth: '75%',
                                        display: 'flex',
                                        flexDirection: isMe ? 'row-reverse' : 'row',
                                        gap: '12px'
                                    }}
                                >
                                    <div style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '50%',
                                        background: isMe ? '#2dd4bf' : '#334155',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0
                                    }}>
                                        <User size={16} color={isMe ? '#000' : '#fff'} />
                                    </div>

                                    <div style={{
                                        background: isMe ? 'linear-gradient(135deg, #2dd4bf, #0ea5e9)' : '#1e293b',
                                        padding: '0.75rem 1.25rem',
                                        borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                        position: 'relative'
                                    }}>
                                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: isMe ? 'rgba(255,255,255,0.7)' : '#94a3b8', marginBottom: '4px' }}>{msg.user}</div>
                                        <div style={{
                                            fontSize: '0.95rem',
                                            color: isMe ? '#fff' : '#e2e8f0',
                                            lineHeight: 1.5,
                                            fontWeight: isMe ? 500 : 400
                                        }}>
                                            {msg.content}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </AnimatePresence>
            </div>

            {/* Input Bar */}
            <div style={{
                padding: '1.5rem 2rem 2rem 2rem',
                borderTop: '1px solid #1e293b',
                background: 'rgba(11, 12, 16, 0.8)',
                backdropFilter: 'blur(10px)'
            }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <div style={{ position: 'relative', width: '150px' }}>
                            <User size={14} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                                type="text"
                                placeholder="Your Name"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                style={{
                                    padding: '0.75rem 0.75rem 0.75rem 2.25rem',
                                    fontSize: '0.85rem',
                                    width: '100%',
                                    background: '#0f172a',
                                    border: '1px solid #1e293b',
                                    borderRadius: '12px',
                                    color: '#fff',
                                    outline: 'none'
                                }}
                            />
                        </div>

                        <div style={{ flex: 1, position: 'relative' }}>
                            <input
                                type="text"
                                placeholder="Type a message to the team..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem',
                                    background: '#1e293b',
                                    border: '1px solid #334155',
                                    borderRadius: '12px',
                                    color: '#fff',
                                    outline: 'none',
                                    fontSize: '0.95rem'
                                }}
                            />
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleSendMessage}
                                style={{
                                    position: 'absolute',
                                    right: '6px',
                                    top: '6px',
                                    bottom: '6px',
                                    background: '#2dd4bf',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: '#000',
                                    width: '40px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer'
                                }}
                            >
                                <Send size={18} />
                            </motion.button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

