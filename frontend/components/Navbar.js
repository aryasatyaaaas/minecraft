import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { FiMenu, FiX, FiUser, FiLogOut } from 'react-icons/fi';
import { getCurrentUser, logout, isAuthenticated } from '../utils/auth';

export default function Navbar() {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [authenticated, setAuthenticated] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        setAuthenticated(isAuthenticated());
        if (isAuthenticated()) {
            setUser(getCurrentUser());
        }

        // Handle responsive behavior on client-side only
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleLogout = async () => {
        await logout();
        setUser(null);
        setAuthenticated(false);
        router.push('/');
    };

    return (
        <nav style={styles.nav}>
            <div className="container" style={styles.container}>
                <Link href="/" style={styles.logo}>
                    <span className="gradient-text" style={styles.logoText}>⛏️ MineCraft Hosting</span>
                </Link>

                <div style={{ ...styles.desktop, display: isMobile ? 'none' : 'flex' }}>
                    {authenticated ? (
                        <>
                            <Link href="/dashboard" style={styles.link}>Dashboard</Link>
                            <Link href="/dashboard/servers" style={styles.link}>My Servers</Link>
                            <Link href="/dashboard/billing" style={styles.link}>Billing</Link>
                            <div style={styles.userMenu}>
                                <FiUser style={styles.icon} />
                                <span>{user?.full_name}</span>
                                <button onClick={handleLogout} className="btn btn-secondary" style={styles.logoutBtn}>
                                    <FiLogOut /> Logout
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <Link href="/#pricing" style={styles.link}>Pricing</Link>
                            <Link href="/auth/login" style={styles.link}>Login</Link>
                            <Link href="/auth/register" className="btn btn-primary">Get Started</Link>
                        </>
                    )}
                </div>

                <button style={{ ...styles.mobileToggle, display: isMobile ? 'block' : 'none' }} onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                </button>
            </div>

            {isOpen && (
                <div style={styles.mobileMenu}>
                    {authenticated ? (
                        <>
                            <Link href="/dashboard" style={styles.mobileLink}>Dashboard</Link>
                            <Link href="/dashboard/servers" style={styles.mobileLink}>My Servers</Link>
                            <Link href="/dashboard/billing" style={styles.mobileLink}>Billing</Link>
                            <button onClick={handleLogout} className="btn btn-secondary" style={{ width: '100%' }}>
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link href="/#pricing" style={styles.mobileLink}>Pricing</Link>
                            <Link href="/auth/login" style={styles.mobileLink}>Login</Link>
                            <Link href="/auth/register" className="btn btn-primary" style={{ width: '100%' }}>
                                Get Started
                            </Link>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
}

const styles = {
    nav: {
        background: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(100, 116, 139, 0.2)',
        padding: '16px 0',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
    },
    container: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    logo: {
        textDecoration: 'none',
    },
    logoText: {
        fontSize: '24px',
        fontWeight: '800',
    },
    desktop: {
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
    },
    link: {
        color: 'var(--text)',
        textDecoration: 'none',
        fontWeight: '500',
        transition: 'color 0.3s ease',
    },
    userMenu: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '8px 16px',
        background: 'rgba(30, 41, 59, 0.6)',
        borderRadius: '8px',
    },
    icon: {
        color: 'var(--primary)',
    },
    logoutBtn: {
        marginLeft: '8px',
    },
    mobileToggle: {
        display: 'none',
        background: 'none',
        border: 'none',
        color: 'var(--text)',
        cursor: 'pointer',
    },
    mobileMenu: {
        display: 'none',
        flexDirection: 'column',
        gap: '16px',
        padding: '20px',
        background: 'rgba(15, 23, 42, 0.95)',
    },
    mobileLink: {
        color: 'var(--text)',
        textDecoration: 'none',
        padding: '12px',
        borderRadius: '8px',
        background: 'rgba(30, 41, 59, 0.6)',
        textAlign: 'center',
    },
};
