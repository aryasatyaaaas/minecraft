import { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../../components/Layout';
import withAuth from '../../utils/withAuth';
import { getCurrentUser } from '../../utils/auth';
import { FiServer, FiDollarSign, FiClock, FiTrendingUp } from 'react-icons/fi';
import api from '../../utils/api';

function Dashboard() {
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({
        servers: 0,
        activeServers: 0,
        pendingInvoices: 0,
        totalSpent: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setUser(getCurrentUser());
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [serversRes, invoicesRes] = await Promise.all([
                api.get('/servers'),
                api.get('/billing/invoices'),
            ]);

            const servers = serversRes.data.servers;
            const invoices = invoicesRes.data.invoices;

            setStats({
                servers: servers.length,
                activeServers: servers.filter(s => s.status === 'active').length,
                pendingInvoices: invoices.filter(i => i.status === 'pending').length,
                totalSpent: invoices
                    .filter(i => i.status === 'paid')
                    .reduce((sum, i) => sum + parseFloat(i.amount), 0),
            });
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    return (
        <Layout>
            <Head>
                <title>Dashboard - Minecraft Hosting</title>
            </Head>

            <div className="container">
                <div style={styles.header}>
                    <div>
                        <h1 style={styles.title}>Dashboard</h1>
                        <p style={styles.subtitle}>Welcome back, {user?.full_name}!</p>
                    </div>
                </div>

                {loading ? (
                    <div style={styles.loading}>
                        <div className="loading-spinner"></div>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-4" style={styles.statsGrid}>
                            <div className="card" style={styles.statCard}>
                                <div style={styles.statIcon}>
                                    <FiServer />
                                </div>
                                <div style={styles.statContent}>
                                    <p style={styles.statLabel}>Total Servers</p>
                                    <p style={styles.statValue}>{stats.servers}</p>
                                </div>
                            </div>

                            <div className="card" style={styles.statCard}>
                                <div style={styles.statIcon}>
                                    <FiTrendingUp />
                                </div>
                                <div style={styles.statContent}>
                                    <p style={styles.statLabel}>Active Servers</p>
                                    <p style={styles.statValue}>{stats.activeServers}</p>
                                </div>
                            </div>

                            <div className="card" style={styles.statCard}>
                                <div style={styles.statIcon}>
                                    <FiClock />
                                </div>
                                <div style={styles.statContent}>
                                    <p style={styles.statLabel}>Pending Invoices</p>
                                    <p style={styles.statValue}>{stats.pendingInvoices}</p>
                                </div>
                            </div>

                            <div className="card" style={styles.statCard}>
                                <div style={styles.statIcon}>
                                    <FiDollarSign />
                                </div>
                                <div style={styles.statContent}>
                                    <p style={styles.statLabel}>Total Spent</p>
                                    <p style={styles.statValue}>{formatPrice(stats.totalSpent)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-2" style={styles.contentGrid}>
                            <div className="card">
                                <h2 style={styles.cardTitle}>Quick Actions</h2>
                                <div style={styles.actions}>
                                    <a href="/#pricing" className="btn btn-primary" style={styles.actionButton}>
                                        Order New Server
                                    </a>
                                    <a href="/dashboard/servers" className="btn btn-secondary" style={styles.actionButton}>
                                        Manage Servers
                                    </a>
                                    <a href="/dashboard/billing" className="btn btn-secondary" style={styles.actionButton}>
                                        View Invoices
                                    </a>
                                </div>
                            </div>

                            <div className="card">
                                <h2 style={styles.cardTitle}>Getting Started</h2>
                                <div style={styles.guide}>
                                    <div style={styles.guideStep}>
                                        <span style={styles.stepNumber}>1</span>
                                        <p style={styles.stepText}>Choose a hosting package</p>
                                    </div>
                                    <div style={styles.guideStep}>
                                        <span style={styles.stepNumber}>2</span>
                                        <p style={styles.stepText}>Complete payment</p>
                                    </div>
                                    <div style={styles.guideStep}>
                                        <span style={styles.stepNumber}>3</span>
                                        <p style={styles.stepText}>Server auto-provisioned</p>
                                    </div>
                                    <div style={styles.guideStep}>
                                        <span style={styles.stepNumber}>4</span>
                                        <p style={styles.stepText}>Start playing!</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
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
    statsGrid: {
        marginBottom: '32px',
    },
    statCard: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
    },
    statIcon: {
        width: '56px',
        height: '56px',
        borderRadius: '12px',
        background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px',
        color: 'white',
        flexShrink: 0,
    },
    statContent: {
        flex: 1,
    },
    statLabel: {
        fontSize: '12px',
        color: 'var(--gray-light)',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        marginBottom: '4px',
    },
    statValue: {
        fontSize: '24px',
        fontWeight: '800',
        color: 'var(--text)',
    },
    contentGrid: {
        marginTop: '32px',
    },
    cardTitle: {
        fontSize: '20px',
        fontWeight: '700',
        color: 'var(--text)',
        marginBottom: '20px',
    },
    actions: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },
    actionButton: {
        width: '100%',
        justifyContent: 'center',
    },
    guide: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
    },
    guideStep: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
    },
    stepNumber: {
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: '700',
        color: 'white',
        flexShrink: 0,
    },
    stepText: {
        color: 'var(--text)',
        fontSize: '14px',
    },
};

export default withAuth(Dashboard);
