import { useState, useRef } from 'react';
import { uploadPaper } from '../services/api';
import { UploadCloud, CheckCircle, AlertCircle } from 'lucide-react';

export default function Upload({ onUploadSuccess }) {
    const fileInput = useRef(null);
    const [status, setStatus] = useState('idle'); // idle, uploading, success, error

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setStatus('uploading');
        try {
            await uploadPaper(file);
            setStatus('success');
            if (onUploadSuccess) onUploadSuccess();
            setTimeout(() => setStatus('idle'), 3000);
        } catch (error) {
            console.error(error);
            setStatus('error');
        }
    };

    return (
        <div className="glass-card p-6" style={{ padding: '2rem', textAlign: 'center', cursor: 'pointer' }}
            onClick={() => fileInput.current.click()}>
            <input
                type="file"
                ref={fileInput}
                onChange={handleFileChange}
                style={{ display: 'none' }}
                accept=".pdf,.txt"
            />

            {status === 'idle' && (
                <>
                    <UploadCloud size={48} color="var(--accent-color)" />
                    <h3 style={{ marginTop: '1rem' }}>Click to Upload Paper</h3>
                    <p>Supported formats: PDF, TXT</p>
                </>
            )}

            {status === 'uploading' && (
                <>
                    <div className="spinner" style={{ border: '4px solid rgba(255,255,255,0.1)', borderTop: '4px solid var(--accent-color)', borderRadius: '50%', width: '48px', height: '48px', margin: '0 auto', animation: 'spin 1s linear infinite' }}></div>
                    <p style={{ marginTop: '1rem' }}>Uploading & Indexing...</p>
                    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                </>
            )}

            {status === 'success' && (
                <>
                    <CheckCircle size={48} color="#10b981" />
                    <h3 style={{ marginTop: '1rem', color: '#10b981' }}>Upload Successful!</h3>
                </>
            )}

            {status === 'error' && (
                <>
                    <AlertCircle size={48} color="#ef4444" />
                    <h3 style={{ marginTop: '1rem', color: '#ef4444' }}>Upload Failed</h3>
                    <p>Please try again.</p>
                </>
            )}
        </div>
    );
}
