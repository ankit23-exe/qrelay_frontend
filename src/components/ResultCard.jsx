import React, { useState } from 'react';
import styles from './ResultCard.module.css';

/* ── Countdown Timer ── */
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

/* ── Mock data for previewing without backend ── */
export const MOCK_RESULT = {
    originalName: 'demo-file.pdf',
    code: 'ABC123',
    qrCodeImage: 'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=ABC123',
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes from now
};

/* ── Result Card Component ── */
export default function ResultCard({ result, onReset }) {
    const [copied, setCopied] = useState(false);

    const copyCode = () => {
        if (!result) return;
        navigator.clipboard.writeText(result.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!result) return null;

    return (
        <div className={styles.resultCard}>
            <div className={styles.resultHeader}>
                <div className={styles.successBadge}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
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
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                    Copied!
                                </>
                            ) : (
                                <>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="9" y="9" width="13" height="13" rx="2" />
                                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                    </svg>
                                    Copy
                                </>
                            )}
                        </button>
                    </div>
                    <p className={styles.codeHint}>Recipient can enter this code on the Download page</p>
                </div>
            </div>

            {onReset && (
                <button className={styles.resetBtn} onClick={onReset}>
                    Upload another file
                </button>
            )}
        </div>
    );
}
