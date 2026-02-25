import React, { useState, useRef, useCallback } from 'react';
import API from '../api';
import ResultCard from './ResultCard.jsx';
import styles from './UploadPage.module.css';

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

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
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
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
        </>
      ) : (
        <ResultCard result={result} onReset={handleReset} />
      )}
    </div>
  );
}
