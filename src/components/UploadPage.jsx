import React, { useState, useRef, useCallback } from 'react';
import API from '../api';
import styles from './UploadPage.module.css';

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function CountdownTimer({ expiresAt }) {
  const [timeLeft, setTimeLeft] = React.useState(0);

  React.useEffect(() => {
    const calc = () => Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
    setTimeLeft(calc());
    const id = setInterval(() => {
      const t = calc();
      setTimeLeft(t);
      if (t <= 0) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const secs = String(timeLeft % 60).padStart(2, '0');
  const pct = (timeLeft / 600) * 100;

  const color = timeLeft > 120 ? '#22c55e' : timeLeft > 60 ? '#f97316' : '#ef4444';

  return (
    <div className={styles.timerWrapper}>
      <div className={styles.timerLabel}>
        <span className={styles.timerIcon}>⏱</span>
        File expires in
      </div>
      <div className={styles.timerDigits} style={{ color }}>
        {mins}:{secs}
      </div>
      <div className={styles.timerBar}>
        <div
          className={styles.timerBarFill}
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      {timeLeft === 0 && (
        <p className={styles.expiredNote}>This file has expired and been deleted.</p>
      )}
    </div>
  );
}

export default function UploadPage() {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [sizeError, setSizeError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef(null);

  const handleFile = (f) => {
    setSizeError('');
    setError('');
    setResult(null);
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
      setResult({ ...data, expiresAt: Date.now() + data.expiresIn * 1000 });
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setError(err?.response?.data?.error || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const copyCode = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setResult(null);
    setFile(null);
    setSizeError('');
    setError('');
  };

  return (
    <div className={styles.page}>
      {!result ? (
        <>
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
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
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
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                Upload &amp; Generate Link
              </>
            )}
          </button>
        </>
      ) : (
        <div className={styles.resultCard}>
          <div className={styles.resultHeader}>
            <div className={styles.successBadge}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              File uploaded!
            </div>
            <p className={styles.resultFileName}>
              <span>📄</span> {result.originalName}
            </p>
          </div>

          <CountdownTimer expiresAt={result.expiresAt} />

          <div className={styles.resultBody}>
            <div className={styles.qrSection}>
              <p className={styles.sectionLabel}>Scan QR Code</p>
              <img src={result.qrCodeImage} alt="QR Code" className={styles.qrImage} />
            </div>

            <div className={styles.divider}>
              <span>or</span>
            </div>

            <div className={styles.codeSection}>
              <p className={styles.sectionLabel}>Share this code</p>
              <div className={styles.codeBox}>
                <span className={styles.code}>{result.code}</span>
                <button className={`${styles.copyBtn} ${copied ? styles.copied : ''}`} onClick={copyCode}>
                  {copied ? (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2"/>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                      </svg>
                      Copy
                    </>
                  )}
                </button>
              </div>
              <p className={styles.codeHint}>Recipient can enter this code on the Download page</p>
            </div>
          </div>

          <button className={styles.resetBtn} onClick={handleReset}>
            Upload another file
          </button>
        </div>
      )}
    </div>
  );
}
