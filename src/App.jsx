import React from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import UploadPage from './components/UploadPage.jsx';
import DownloadPage from './components/DownloadPage.jsx';
import styles from './App.module.css';

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

export default function App() {
  return (
    // <BrowserRouter>
    //   <div className={styles.shell}>
    //     {/* ── Header ── */}
    //     <header className={styles.header}>
    //       <div className={styles.headerInner}>
    //         <Logo />
    //         <nav className={styles.nav}>
    //           <NavLink
    //             to="/"
    //             end
    //             className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
    //           >
    //             <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    //               <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    //               <polyline points="17 8 12 3 7 8" />
    //               <line x1="12" y1="3" x2="12" y2="15" />
    //             </svg>
    //             Upload
    //           </NavLink>
    //           <NavLink
    //             to="/download"
    //             className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
    //           >
    //             <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    //               <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    //               <polyline points="7 10 12 15 17 10" />
    //               <line x1="12" y1="15" x2="12" y2="3" />
    //             </svg>
    //             Download
    //           </NavLink>
    //         </nav>
    //       </div>
    //     </header>

    //     {/* ── Hero ── */}
    //     <div className={styles.hero}>
    //       <div className={styles.heroBadge}>
    //         <span className={styles.heroDot} />
    //         Free &bull; No login &bull; Auto-delete in 10 min
    //       </div>
    //       <h1 className={styles.heroTitle}>
    //         Share files <span className={styles.heroAccent}>instantly</span>
    //       </h1>
    //       <p className={styles.heroSub}>
    //         Drop a file, get a QR code &amp; short code. No sign-up needed.
    //       </p>
    //     </div>

    //     {/* ── Main content ── */}
    //     <main className={styles.main}>
    //       <Routes>
    //         <Route path="/" element={<UploadPage />} />
    //         <Route path="/download" element={<DownloadPage />} />
    //       </Routes>
    //     </main>

    //     {/* ── Footer ── */}
    //     <footer className={styles.footer}>
    //       <p>Files auto-deleted after 10 minutes &bull; Max 10 MB &bull; All file types supported</p>
    //     </footer>

    //     {/* Background orbs */}
    //     <div className={styles.orb1} />
    //     <div className={styles.orb2} />
    //   </div>
    // </BrowserRouter>
    <UploadPage />
  );
}
