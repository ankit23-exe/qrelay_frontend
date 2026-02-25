import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Nav.module.css';

function Logo() {
    return (
        <div className={styles.logo}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <defs>
                    <linearGradient id="zg" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#7c3aed" />
                        <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                </defs>
                <path d="M13 2L4.5 13H12L11 22L19.5 11H12L13 2Z" fill="url(#zg)" strokeLinejoin="round" />
            </svg>
            <span className={styles.logoText}>QRelay</span>
        </div>
    );
}

export default function Nav() {
    return (
        <header className={styles.header}>
            <div className={styles.headerInner}>
                <Logo />
                <nav className={styles.nav}>
                    <NavLink
                        to="/"
                        end
                        className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        Upload
                    </NavLink>
                    <NavLink
                        to="/download"
                        className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        Download
                    </NavLink>
                </nav>
            </div>
        </header>
    );
}
