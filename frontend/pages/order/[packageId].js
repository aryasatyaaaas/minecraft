import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '../../components/Layout';
import withAuth from '../../utils/withAuth';
import { FiServer, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import api from '../../utils/api';

function OrderPage() {
    const router = useRouter();
    const { packageId } = router.query;

    const [packageData, setPackageData] = useState(null);
    const [serverName, setServerName] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (packageId) {
            fetchPackage();
        }
    }, [packageId]);

    const fetchPackage = async () => {
        try {
            const response = await api.get(`/packages/${packageId}`);
            setPackageData(response.data.package);
        } catch (err) {
            setError('Failed to fetch package details');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setSubmitting(true);

        try {
            const response = await api.post('/orders', {
                package_id: parseInt(packageId),
                server_name: serverName,
            });

            setSuccess('Order created successfully! Redirecting to billing...');

            setTimeout(() => {
                router.push('/dashboard/billing');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create order');
            setSubmitting(false);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    if (loading) {
        return (
            <Layout>
                <div style={styles.loading}>
                    <div className="loading-spinner"></div>
                </div>
            </Layout>
        );
    }

    if (!packageData) {
        return (
            <Layout>
                <div className="container">
                    <div className="alert alert-error">
                        <FiAlertCircle />
                        Package not found
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <Head>
                <title>Order {packageData.name} - Minecraft Hosting</title>
            </Head>

            <div className="container" style={styles.container}>
                <div style={styles.header}>
                    <h1 style={styles.title}>Complete Your Order</h1>
                    <p style={styles.subtitle}>Configure your Minecraft server</p>
                </div>

                {error && (
                    <div className="alert alert-error">
                        <FiAlertCircle />
                        {error}
                    </div>
                )}

                {success && (
                    <div className="alert alert-success">
                        <FiCheckCircle />
                        {success}
                    </div>
                )}

                <div className="grid grid-2" style={styles.grid}>
                    <div className="card">
                        <h2 style={styles.cardTitle}>Server Configuration</h2>

                        <form onSubmit={handleSubmit}>
                            <div className="input-group">
                                <label htmlFor="serverName">
                                    <FiServer style={styles.icon} /> Server Name
                                </label>
                                <input
                                    type="text"
                                    id="serverName"
                                    value={serverName}
                                    onChange={(e) => setServerName(e.target.value)}
                                    required
                                    placeholder="My Awesome Server"
                                    minLength="3"
                                    maxLength="50"
                                />
                                <small style={styles.hint}>
                                    Choose a unique name for your server (3-50 characters)
                                </small>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary"
                                style={styles.submitButton}
                                disabled={submitting}
                            >
                                {submitting ? 'Creating Order...' : 'Proceed to Payment'}
                            </button>
                        </form>
                    </div>

                    <div className="card" style={styles.summaryCard}>
                        <h2 style={styles.cardTitle}>Order Summary</h2>

                        <div style={styles.packageInfo}>
                            <h3 style={styles.packageName}>{packageData.name}</h3>
                            <p style={styles.packageDescription}>{packageData.description}</p>
                        </div>

                        <div style={styles.specs}>
                            <div style={styles.spec}>
                                <span style={styles.specLabel}>RAM:</span>
                                <span style={styles.specValue}>{packageData.ram_mb / 1024} GB</span>
                            </div>
                            <div style={styles.spec}>
                                <span style={styles.specLabel}>CPU:</span>
                                <span style={styles.specValue}>{packageData.cpu_limit}%</span>
                            </div>
                            <div style={styles.spec}>
                                <span style={styles.specLabel}>Storage:</span>
                                <span style={styles.specValue}>{packageData.disk_mb / 1024} GB</span>
                            </div>
                            <div style={styles.spec}>
                                <span style={styles.specLabel}>Billing:</span>
                                <span style={styles.specValue}>{packageData.billing_cycle}</span>
                            </div>
                        </div>

                        <div style={styles.divider}></div>

                        <div style={styles.total}>
                            <span style={styles.totalLabel}>Total:</span>
                            <span style={styles.totalValue}>{formatPrice(packageData.price)}</span>
                        </div>

                        <div style={styles.note}>
                            <p style={styles.noteText}>
                                ✓ Instant automated provisioning<br />
                                ✓ 24/7 support included<br />
                                ✓ DDoS protection<br />
                                ✓ Full Pterodactyl panel access
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}

const styles = {
    container: {
        maxWidth: '1000px',
    },
    loading: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
    },
    header: {
        textAlign: 'center',
        marginBottom: '40px',
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
    grid: {
        alignItems: 'start',
    },
    cardTitle: {
        fontSize: '20px',
        fontWeight: '700',
        color: 'var(--text)',
        marginBottom: '24px',
    },
    icon: {
        display: 'inline',
        marginRight: '8px',
        verticalAlign: 'middle',
    },
    hint: {
        color: 'var(--gray-light)',
        fontSize: '12px',
        marginTop: '4px',
        display: 'block',
    },
    submitButton: {
        width: '100%',
        justifyContent: 'center',
        marginTop: '8px',
    },
    summaryCard: {
        position: 'sticky',
        top: '100px',
    },
    packageInfo: {
        marginBottom: '24px',
    },
    packageName: {
        fontSize: '24px',
        fontWeight: '800',
        color: 'var(--text)',
        marginBottom: '8px',
    },
    packageDescription: {
        color: 'var(--text-muted)',
        fontSize: '14px',
    },
    specs: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },
    spec: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    specLabel: {
        color: 'var(--gray-light)',
        fontSize: '14px',
    },
    specValue: {
        color: 'var(--text)',
        fontWeight: '600',
        fontSize: '14px',
    },
    divider: {
        height: '1px',
        background: 'var(--dark-lighter)',
        margin: '24px 0',
    },
    total: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
    },
    totalLabel: {
        fontSize: '18px',
        fontWeight: '700',
        color: 'var(--text)',
    },
    totalValue: {
        fontSize: '28px',
        fontWeight: '800',
        background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
    },
    note: {
        padding: '16px',
        background: 'rgba(99, 102, 241, 0.1)',
        borderRadius: '8px',
        border: '1px solid rgba(99, 102, 241, 0.2)',
    },
    noteText: {
        color: 'var(--text-muted)',
        fontSize: '13px',
        lineHeight: '1.8',
    },
};

export default withAuth(OrderPage);
