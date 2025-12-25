import Navbar from './Navbar';

export default function Layout({ children }) {
    return (
        <div style={styles.layout}>
            <Navbar />
            <main style={styles.main}>
                {children}
            </main>
            <footer style={styles.footer}>
                <div className="container">
                    <p style={styles.footerText}>
                        © 2025 Minecraft Hosting Platform. Built for learning purposes.
                    </p>
                </div>
            </footer>
        </div>
    );
}

const styles = {
    layout: {
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
    },
    main: {
        flex: 1,
        paddingTop: '40px',
        paddingBottom: '40px',
    },
    footer: {
        background: 'rgba(15, 23, 42, 0.8)',
        borderTop: '1px solid rgba(100, 116, 139, 0.2)',
        padding: '24px 0',
        marginTop: 'auto',
    },
    footerText: {
        textAlign: 'center',
        color: 'var(--gray-light)',
        fontSize: '14px',
    },
};
