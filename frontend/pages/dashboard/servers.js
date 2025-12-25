import { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../../components/Layout';
import ServerCard from '../../components/ServerCard';
import withAuth from '../../utils/withAuth';
import { FiServer, FiAlertCircle } from 'react-icons/fi';
import api from '../../utils/api';

function Servers() {
    const [servers, setServers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchServers();
    }, []);

    const fetchServers = async () => {
        try {
            const response = await api.get('/servers');
            setServers(response.data.servers);
        } catch (err) {
            setError('Failed to fetch servers');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <Head>
                <title>My Servers - Minecraft Hosting</title>
            </Head>

            <div className="container">
                <div style={styles.header}>
                    <div>
                        <h1 style={styles.title}>My Servers</h1>
                        <p style={styles.subtitle}>Manage your Minecraft servers</p>
                    </div>
                    <a href="/#pricing" className="btn btn-primary">
                        Order New Server
                    </a>
                </div>

                {error && (
                    <div className="alert alert-error">
                        <FiAlertCircle />
                        {error}
                    </div>
                )}

                {loading ? (
                    <div style={styles.loading}>
                        <div className="loading-spinner"></div>
                    </div>
                ) : servers.length === 0 ? (
                    <div className="card" style={styles.empty}>
                        <FiServer size={64} style={styles.emptyIcon} />
                        <h2 style={styles.emptyTitle}>No Servers Yet</h2>
                        <p style={styles.emptyText}>
                            You don't have any servers yet. Order your first server to get started!
                        </p>
                        <a href="/#pricing" className="btn btn-primary" style={styles.emptyButton}>
                            Browse Packages
                        </a>
                    </div>
                ) : (
                    <div className="grid grid-3">
                        {servers.map((server) => (
                            <ServerCard key={server.id} server={server} />
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
}

const styles = {
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px',
        flexWrap: 'wrap',
        gap: '16px',
    },
    title: {
        fontSize: '36px',
        fontWeight: '800',
        color: 'var(--text)',
        marginBottom: '8px',
    },
    subtitle: {
        fontSize: '16px',
        color: 'var(--text-muted)',
    },
    loading: {
        display: 'flex',
        justifyContent: 'center',
        padding: '60px 0',
    },
    empty: {
        textAlign: 'center',
        padding: '80px 40px',
    },
    emptyIcon: {
        color: 'var(--gray)',
        marginBottom: '24px',
    },
    emptyTitle: {
        fontSize: '24px',
        fontWeight: '700',
        color: 'var(--text)',
        marginBottom: '12px',
    },
    emptyText: {
        color: 'var(--text-muted)',
        marginBottom: '24px',
        fontSize: '16px',
    },
    emptyButton: {
        padding: '12px 32px',
    },
};

export default withAuth(Servers);
