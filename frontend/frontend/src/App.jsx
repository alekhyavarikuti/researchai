import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import HistoryPage from './components/HistoryPage';
import PlagiarismChecker from './components/PlagiarismChecker';
import {
  BarChart2,
  BookOpen,
  MessageSquare,
  Users,
  Newspaper,
  Menu,
  X,
  User,
  LogOut,
  Settings,
  Bell,
  Search,
  History,
  ShieldAlert
} from 'lucide-react';
import LibraryComponent from './components/Library';
import Chat from './components/Chat';
import News from './components/News';
import Collaboration from './components/Collaboration';
import Login from './components/Login';
import Register from './components/Register';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';

// Professional Sidebar
function Sidebar({ isOpen, toggleSidebar }) {
  const location = useLocation();

  const menuItems = [
    { path: '/library', label: 'Knowledge Base', icon: <BookOpen size={18} /> },
    { path: '/chat', label: 'AI Assistant', icon: <MessageSquare size={18} /> },
    { path: '/news', label: 'Market Intelligence', icon: <Newspaper size={18} /> },
    { path: '/collab', label: 'Team Space', icon: <Users size={18} /> },
    { path: '/plagiarism', label: 'Plagiarism Check', icon: <ShieldAlert size={18} /> },
    { path: '/history', label: 'Chat History', icon: <History size={18} /> },
  ];

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`} style={{
      width: '260px',
      position: 'fixed',
      left: 0, top: 0, bottom: 0,
      zIndex: 100,
      background: '#0f1014',
      borderRight: '1px solid #1e1f24',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Inter, sans-serif'
    }}>
      {/* Brand Header */}
      <div style={{ padding: '2rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #4c8bfa, #a855f7)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '1.2rem' }}>R</span>
        </div>
        <span style={{ fontWeight: 700, fontSize: '1.25rem', color: '#fff' }}>ResearchAI</span>
        <button className="mobile-only" onClick={toggleSidebar} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', display: window.innerWidth < 768 ? 'block' : 'none' }}>
          <X size={20} color="#9ca3af" />
        </button>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '0 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563', padding: '0.75rem 0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Menu</p>

        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => window.innerWidth < 768 && toggleSidebar()}
              style={{
                textDecoration: 'none',
                color: isActive ? '#fff' : '#9ca3af',
                background: isActive ? '#1e1f24' : 'transparent',
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '0.95rem',
                fontWeight: isActive ? 600 : 400,
                transition: 'all 0.2s ease',
                border: isActive ? '1px solid #2d2e36' : '1px solid transparent'
              }}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User Footer */}
      <UserFooter />
    </div>
  );
}

function UserFooter() {
  const { user, logout } = useAuth();
  if (!user) return null;

  return (
    <div style={{ padding: '1.5rem', borderTop: '1px solid #1e1f24' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0.75rem', borderRadius: '12px', cursor: 'pointer', transition: 'background 0.1s', background: '#131418' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #1e293b, #334155)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', border: '1px solid #374151' }}>
          <User size={18} />
        </div>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.username}</p>
          <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>User</p>
        </div>
        <button onClick={logout} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '4px' }} title="Logout">
          <LogOut size={18} color="#64748b" />
        </button>
      </div>
    </div>
  );
}

const AuthenticatedLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate('/login');
  }, [user, loading, navigate]);

  useEffect(() => {
    const handleResize = () => setSidebarOpen(window.innerWidth > 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f1014', color: '#fff' }}>Loading...</div>;
  if (!user) return null;

  return (
    <div className="app-container" style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#0f1014' }}>
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="main-content" style={{
        marginLeft: sidebarOpen && window.innerWidth > 768 ? '260px' : '0',
        width: sidebarOpen && window.innerWidth > 768 ? 'calc(100% - 260px)' : '100%',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
        background: '#0f1014'
      }}>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            position: 'absolute',
            top: '1rem',
            left: '1rem',
            zIndex: 200,
            background: '#1e1f24',
            border: '1px solid #2d2e36',
            borderRadius: '8px',
            padding: '8px',
            cursor: 'pointer',
            display: window.innerWidth < 768 ? 'block' : 'none',
            color: '#fff'
          }}
        >
          <Menu size={20} />
        </button>

        <main style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          <Routes>
            <Route path="/library" element={<LibraryComponent />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/news" element={<News />} />
            <Route path="/collab" element={<Collaboration />} />
            <Route path="/plagiarism" element={<PlagiarismChecker />} />
            <Route path="/" element={<Chat />} /> {/* Default to Chat */}
          </Routes>
        </main>
      </div>
    </div>
  );
};

function MainLayout() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/*" element={<AuthenticatedLayout />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default MainLayout;
