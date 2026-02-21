import { useState, useEffect } from 'react';
import { getNews, getConferences } from '../services/api';
import { Newspaper, ExternalLink, Calendar, MapPin, Search, Loader, Image as ImageIcon, Sparkles, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export default function News() {
    const [news, setNews] = useState([]);
    const [conferences, setConferences] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('news');
    const [searchTopic, setSearchTopic] = useState('Artificial Intelligence');

    const fetchData = async (topic) => {
        setLoading(true);
        try {
            const [newsRes, confRes] = await Promise.all([
                getNews(topic),
                getConferences(topic)
            ]);
            setNews(newsRes.data.articles || []);
            setConferences(confRes.data.conferences || []);
        } catch (error) {
            console.error("Fetch Error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(searchTopic);
    }, []);

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            fetchData(searchTopic);
        }
    };

    return (
        <div style={{ padding: '2rem', height: '100vh', background: '#0b0c10', color: '#e2e8f0', overflowY: 'auto' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, background: 'linear-gradient(to right, #2dd4bf, #0ea5e9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
                            Research Pulse
                        </h1>
                        <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>Stay updated with the frontier of science and upcoming opportunities.</p>
                    </div>

                    <div style={{ position: 'relative', width: '300px' }}>
                        <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} size={18} />
                        <input
                            type="text"
                            placeholder="Search topics (e.g. Robotics)..."
                            value={searchTopic}
                            onChange={(e) => setSearchTopic(e.target.value)}
                            onKeyDown={handleSearch}
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem 0.75rem 2.5rem',
                                borderRadius: '12px',
                                background: '#1e293b',
                                border: '1px solid #334155',
                                color: '#f1f5f9',
                                outline: 'none',
                                fontSize: '0.9rem'
                            }}
                        />
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', borderBottom: '1px solid #1e293b' }}>
                    <button
                        onClick={() => setActiveTab('news')}
                        style={{
                            padding: '1rem 0.5rem',
                            background: 'none',
                            border: 'none',
                            color: activeTab === 'news' ? '#2dd4bf' : '#64748b',
                            fontSize: '1rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            borderBottom: activeTab === 'news' ? '2px solid #2dd4bf' : '2px solid transparent',
                            transition: 'all 0.3s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <Newspaper size={18} /> News Articles
                    </button>
                    <button
                        onClick={() => setActiveTab('conferences')}
                        style={{
                            padding: '1rem 0.5rem',
                            background: 'none',
                            border: 'none',
                            color: activeTab === 'conferences' ? '#2dd4bf' : '#64748b',
                            fontSize: '1rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            borderBottom: activeTab === 'conferences' ? '2px solid #2dd4bf' : '2px solid transparent',
                            transition: 'all 0.3s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <Calendar size={18} /> Call for Papers
                    </button>
                </div>

                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '400px', color: '#64748b' }}>
                        <Loader className="spin" size={48} color="#2dd4bf" />
                        <p style={{ marginTop: '1rem', fontSize: '1.1rem' }}>Gathering cross-web intelligence...</p>
                    </div>
                ) : (
                    <div>
                        {(news.some(n => n.is_trending) || conferences.some(c => c.is_trending)) ? (
                            <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px', color: '#2dd4bf', fontSize: '0.95rem', background: 'rgba(45, 212, 191, 0.05)', padding: '12px 20px', borderRadius: '12px', border: '1px solid rgba(45, 212, 191, 0.2)' }}>
                                <TrendingUp size={20} />
                                <span>No direct results for "<strong>{searchTopic}</strong>". Auto-pivoting to <strong>Global Trending Research</strong> instead.</span>
                            </div>
                        ) : (news.length > 0 || conferences.length > 0) && (
                            <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px', color: '#64748b', fontSize: '0.9rem' }}>
                                <Sparkles size={16} color="#2dd4bf" />
                                <span>Showing relevant research results for <strong>{searchTopic}</strong>.</span>
                            </div>
                        )}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem', paddingBottom: '3rem' }}
                        >
                            {activeTab === 'news' ? (
                                news.length > 0 ? (
                                    news.map((item, index) => (
                                        <NewsCard key={index} item={item} type="news" />
                                    ))
                                ) : (
                                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', background: '#1e293b', borderRadius: '24px', border: '1px solid #334155' }}>
                                        <Newspaper size={48} color="#64748b" style={{ margin: '0 auto 1rem' }} />
                                        <h3>Connecting to Research Hub...</h3>
                                        <p style={{ color: '#94a3b8' }}>Pulling trending academic insights for you.</p>
                                    </div>
                                )
                            ) : (
                                conferences.length > 0 ? (
                                    conferences.map((item, index) => (
                                        <NewsCard key={index} item={item} type="conference" />
                                    ))
                                ) : (
                                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', background: '#1e293b', borderRadius: '24px', border: '1px solid #334155' }}>
                                        <Calendar size={48} color="#64748b" style={{ margin: '0 auto 1rem' }} />
                                        <h3>Discovering Global Events...</h3>
                                        <p style={{ color: '#94a3b8' }}>Fetching upcoming high-impact conferences.</p>
                                    </div>
                                )
                            )}
                        </motion.div>
                    </div>
                )}
            </div>
            <style>{`.spin { animation: spin 1.5s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop";

function NewsCard({ item, type }) {
    const handleImageError = (e) => {
        e.target.src = DEFAULT_IMAGE;
    };

    return (
        <motion.div
            whileHover={{ y: -5 }}
            style={{
                background: '#1e293b',
                borderRadius: '20px',
                overflow: 'hidden',
                border: '1px solid #334155',
                display: 'flex',
                flexDirection: 'column',
                transition: 'box-shadow 0.3s',
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
            }}
        >
            <div style={{ height: '180px', width: '100%', position: 'relative', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img
                    src={item.image || DEFAULT_IMAGE}
                    alt={item.title}
                    onError={handleImageError}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(15, 23, 42, 0.8)', padding: '4px 12px', borderRadius: '12px', fontSize: '0.75rem', color: item.is_trending ? '#0ea5e9' : '#2dd4bf', border: item.is_trending ? '1px solid #0ea5e9' : '1px solid #334155', display: 'flex', alignItems: 'center', gap: '5px', backdropFilter: 'blur(4px)' }}>
                    {item.is_trending ? <TrendingUp size={12} /> : <Sparkles size={12} />}
                    {item.is_trending ? 'Trending' : (type === 'news' ? 'Article' : 'Event')}
                </div>
            </div>

            <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, lineHeight: 1.4, marginBottom: '1rem', color: '#f1f5f9' }}>
                    {item.title}
                </h3>

                <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.6, flex: 1, marginBottom: '1.5rem' }}>
                    {item.content ? item.content.substring(0, 150) + '...' : 'Details available at the source.'}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', borderTop: '1px solid #334155', paddingTop: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.85rem' }}>
                        {type === 'news' ? (
                            <span>{item.published_date}</span>
                        ) : (
                            <span style={{ color: '#2dd4bf', fontWeight: 600 }}>Call for Papers Open</span>
                        )}
                    </div>
                    <a
                        href={item.url} target="_blank" rel="noreferrer"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            color: '#0ea5e9',
                            textDecoration: 'none',
                            fontSize: '0.9rem',
                            fontWeight: 600
                        }}
                    >
                        View Source <ExternalLink size={14} />
                    </a>
                </div>
            </div>
        </motion.div>
    );
}
