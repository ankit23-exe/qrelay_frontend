import React from 'react';
import styles from './Footer.module.css';

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <p>Files auto-deleted after 10 minutes &bull; All file types supported</p>
        </footer>
    );
}
