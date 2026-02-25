import React from 'react';
import styles from './Hero.module.css';

export default function Hero() {
    return (
        <div className={styles.hero}>
            <div className={styles.heroBadge}>
                <span className={styles.heroDot} />
                Free &bull; No login &bull; Auto-delete in 10 min
            </div>
            <h1 className={styles.heroTitle}>
                Share files <span className={styles.heroAccent}>instantly</span>
            </h1>
            <p className={styles.heroSub}>
                Drop a file, get a QR code. Scan and download.
            </p>
        </div>
    );
}
