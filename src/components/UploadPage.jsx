import React, { useState, useRef, useCallback, useEffect } from 'react';
import API from '../api';
import ResultCard from './ResultCard.jsx';
import styles from './UploadPage.module.css';

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_UPLOADS = 1;
const SESSION_KEY = 'qrelay_upload_results';

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function UploadPage() {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [sizeError, setSizeError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [error, setError] = useState('');
  const [showUploadZone, setShowUploadZone] = useState(true);
  const fileInputRef = useRef(null);

  // Restore results from sessionStorage on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Filter out those that were already expired when we last looked
        // (though individual cards handle their own expiration timers)
        const valid = parsed.filter(p => p.expiresAt > Date.now());
        setResults(valid);
        if (valid.length > 0) {
          setShowUploadZone(valid.length < MAX_UPLOADS);
          setExpandedId(valid[valid.length - 1].code);
        }
      }
    } catch {
      sessionStorage.removeItem(SESSION_KEY);
    }
  }, []);

  const saveToSession = (newResults) => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(newResults));
  };

  const handleFile = (f) => {
    setSizeError('');
    setError('');
    if (f.size > MAX_SIZE) {
      setSizeError(`"${f.name}" is ${formatBytes(f.size)} — exceeds the 10 MB limit.`);
      setFile(null);
      return;
    }
    setFile(f);
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, []);

  const onDragOver = useCallback((e) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const onDragLeave = useCallback(() => setDragging(false), []);

  const onFileChange = (e) => {
    const f = e.target.files[0];
    if (f) handleFile(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const form = new FormData();
      form.append('file', file);
      const { data } = await API.post('/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const newResult = { ...data, expiresAt: Date.now() + data.expiresIn * 1000 };
      const updatedResults = [...results, newResult];

      setResults(updatedResults);
      setExpandedId(newResult.code);
      saveToSession(updatedResults);

      setFile(null);
      setShowUploadZone(updatedResults.filter(r => r.expiresAt > Date.now()).length < MAX_UPLOADS);

      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setError(err?.response?.data?.error || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const activeCount = results.filter(r => r.expiresAt > Date.now()).length;
  const canUploadMore = activeCount < MAX_UPLOADS;

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const onExpire = (id) => {
    // When a file expires, we just keep it but the card will show "EXPIRED"
    // The clickable limit "activeCount" will automatically update because it uses Date.now()
  };

  return (
    <div className={styles.page} style={{ gap: '30px' }}>
      {results.map((res) => (
        <ResultCard
          key={res.code}
          result={res}
          collapsed={expandedId !== res.code}
          onToggle={() => toggleExpand(res.code)}
          onExpire={() => onExpire(res.code)}
        />
      ))}

      {showUploadZone && canUploadMore && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {results.length > 0 && (
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '10px' }}>
                Upload a new file
              </p>
            </div>
          )}

          <div
            className={`${styles.dropZone} ${dragging ? styles.dragging : ''} ${file ? styles.hasFile : ''}`}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              hidden
              onChange={onFileChange}
            />
            {file ? (
              <div className={styles.filePreview}>
                <div className={styles.fileIcon}>📄</div>
                <div className={styles.fileInfo}>
                  <span className={styles.fileName}>{file.name}</span>
                  <span className={styles.fileSize}>{formatBytes(file.size)}</span>
                </div>
              </div>
            ) : (
              <>
                <div className={styles.dropIcon}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
                <p className={styles.dropTitle}>Drag & drop your file here</p>
                <p className={styles.dropSub}>or click to browse &nbsp;·&nbsp; max 10 MB</p>
              </>
            )}
          </div>

          {sizeError && <p className={styles.sizeError}>⚠ {sizeError}</p>}
          {error && <p className={styles.sizeError}>⚠ {error}</p>}

          <button
            className={styles.uploadBtn}
            onClick={handleUpload}
            disabled={!file || uploading}
          >
            {uploading ? (
              <span className={styles.spinner} />
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                Upload &amp; Generate Link
              </>
            )}
          </button>
        </div>
      )}

      {results.length > 0 && !showUploadZone && canUploadMore && (
        <button
          className={styles.uploadBtn}
          style={{ background: 'transparent', border: '1px dashed var(--border)', color: 'var(--text-muted)' }}
          onClick={() => setShowUploadZone(true)}
        >
          + Upload New File
        </button>
      )}


    </div>
  );
}

