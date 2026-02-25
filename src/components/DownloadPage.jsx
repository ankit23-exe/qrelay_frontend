import React, { useState, useEffect, useRef } from 'react';
import API from '../api';
import { useSearchParams } from 'react-router-dom';
import styles from './DownloadPage.module.css';

function formatBytes(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function CountdownBadge({ expiresAt }) {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
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

  if (timeLeft === 0) {
    return (
      <div className={styles.expiredBadge}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        File has expired
      </div>
    );
  }

  return (
    <div className={styles.timerSection}>
      <div className={styles.timerTop}>
        <span className={styles.timerIcon}>⏱</span>
        <span className={styles.timerText}>Expires in</span>
        <span className={styles.timerDigits} style={{ color }}>{mins}:{secs}</span>
      </div>
      <div className={styles.timerBar}>
        <div className={styles.timerBarFill} style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

export default function DownloadPage() {
  const [searchParams] = useSearchParams();
  const [code, setCode] = useState(searchParams.get('code')?.toUpperCase() || '');
  const [fileInfo, setFileInfo] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [checked, setChecked] = useState(false);
  const inputRef = useRef(null);

  // Auto-check if code provided via URL query
  useEffect(() => {
    const urlCode = searchParams.get('code');
    if (urlCode) {
      fetchInfo(urlCode.toUpperCase());
    }
  }, []);

  const fetchInfo = async (c) => {
    const target = (c || code).toUpperCase().trim();
    if (!target || target.length !== 6) {
      setError('Please enter a valid 6-character code.');
      return;
    }
    setLoading(true);
    setError('');
    setFileInfo(null);
    try {
      const { data } = await API.get(`/file-info/${target}`);
      setFileInfo(data);
      setChecked(true);
    } catch (err) {
      const msg = err?.response?.data?.error;
      if (err?.response?.status === 410) {
        setError('This file has expired and been deleted.');
      } else {
        setError(msg || 'Invalid code. File not found.');
      }
      setChecked(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    const target = code.toUpperCase().trim();
    setDownloading(true);
    setError('');
    try {
      const response = await API.get(`/download/${target}`, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data]);
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'download';
      if (contentDisposition) {
        const match = contentDisposition.match(/filename\*?=(?:UTF-8'')?["']?([^;"'\n]+)["']?/i);
        if (match) filename = decodeURIComponent(match[1]);
      } else if (fileInfo?.originalName) {
        filename = fileInfo.originalName;
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      if (err?.response?.status === 410) {
        setError('File has expired. It has been automatically deleted.');
        setFileInfo(null);
        setChecked(false);
      } else {
        setError(err?.response?.data?.error || 'Download failed. Please try again.');
      }
    } finally {
      setDownloading(false);
    }
  };

  const handleCodeInput = (e) => {
    const v = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    setCode(v);
    setError('');
    if (checked) {
      setChecked(false);
      setFileInfo(null);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.headerIcon}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </div>
          <div>
            <h2 className={styles.cardTitle}>Retrieve File</h2>
            <p className={styles.cardSub}>Enter the 6-character share code</p>
          </div>
        </div>

        <div className={styles.inputRow}>
          <input
            ref={inputRef}
            className={styles.codeInput}
            value={code}
            onChange={handleCodeInput}
            onKeyDown={(e) => e.key === 'Enter' && !checked && fetchInfo()}
            placeholder="A1B2C3"
            maxLength={6}
            spellCheck={false}
            autoComplete="off"
          />
          {!checked ? (
            <button
              className={styles.checkBtn}
              onClick={() => fetchInfo()}
              disabled={loading || code.length !== 6}
            >
              {loading ? <span className={styles.spinner} /> : 'Find File'}
            </button>
          ) : (
            <button
              className={styles.checkBtn}
              style={{ background: 'var(--surface2)', color: 'var(--text-muted)', cursor: 'default' }}
              disabled
            >
              Found ✓
            </button>
          )}
        </div>

        {error && (
          <div className={styles.errorBox}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </div>
        )}

        {fileInfo && (
          <div className={styles.fileCard}>
            <div className={styles.fileRow}>
              <div className={styles.fileIconLg}>📄</div>
              <div className={styles.fileMeta}>
                <span className={styles.fileNameDisplay}>{fileInfo.originalName}</span>
              </div>
            </div>

            <CountdownBadge expiresAt={fileInfo.expiresAt} />

            <button
              className={styles.downloadBtn}
              onClick={handleDownload}
              disabled={downloading}
            >
              {downloading ? (
                <>
                  <span className={styles.spinner} />
                  Downloading…
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  Download File
                </>
              )}
            </button>
          </div>
        )}
      </div>

      <p className={styles.hint}>
        Files are automatically deleted after <strong>10 minutes</strong> from upload.
      </p>
    </div>
  );
}
