import { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../../components/Layout';
import InvoiceTable from '../../components/InvoiceTable';
import withAuth from '../../utils/withAuth';
import { FiFileText, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import api from '../../utils/api';

function Billing() {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        try {
            const response = await api.get('/billing/invoices');
            setInvoices(response.data.invoices);
        } catch (err) {
            setError('Failed to fetch invoices');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handlePayClick = async (invoice) => {
        try {
            setError('');
            setSuccess('');

            const response = await api.post('/billing/payment/simulate', {
                invoice_id: invoice.id,
            });

            setSuccess('Payment successful! Your server is being provisioned.');

            setTimeout(() => {
                fetchInvoices();
            }, 1000);
        } catch (err) {
            setError(err.response?.data?.error || 'Payment failed');
        }
    };

    return (
        <Layout>
            <Head>
                <title>Billing - Minecraft Hosting</title>
            </Head>

            <div className="container">
                <div style={styles.header}>
                    <div>
                        <h1 style={styles.title}>Billing & Invoices</h1>
                        <p style={styles.subtitle}>Manage your payments and invoices</p>
                    </div>
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

                <div className="card">
                    <div style={styles.cardHeader}>
                        <h2 style={styles.cardTitle}>
                            <FiFileText style={styles.icon} /> Invoice History
                        </h2>
                    </div>

                    {loading ? (
                        <div style={styles.loading}>
                            <div className="loading-spinner"></div>
                        </div>
                    ) : (
                        <InvoiceTable invoices={invoices} onPayClick={handlePayClick} />
                    )}
                </div>

                <div className="card" style={styles.infoCard}>
                    <h3 style={styles.infoTitle}>Payment Information</h3>
                    <div style={styles.infoContent}>
                        <p style={styles.infoText}>
                            <strong>Note:</strong> This is a demo environment. Click "Pay Now" to simulate payment.
                            In production, you'll be redirected to the actual payment gateway.
                        </p>
                        <p style={styles.infoText}>
                            After successful payment, your server will be automatically provisioned within minutes.
                        </p>
                    </div>
                </div>
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
    cardHeader: {
        marginBottom: '24px',
    },
    cardTitle: {
        fontSize: '20px',
        fontWeight: '700',
        color: 'var(--text)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    icon: {
        color: 'var(--primary)',
    },
    loading: {
        display: 'flex',
        justifyContent: 'center',
        padding: '60px 0',
    },
    infoCard: {
        marginTop: '24px',
        background: 'rgba(99, 102, 241, 0.1)',
        border: '1px solid rgba(99, 102, 241, 0.3)',
    },
    infoTitle: {
        fontSize: '18px',
        fontWeight: '700',
        color: 'var(--text)',
        marginBottom: '16px',
    },
    infoContent: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },
    infoText: {
        color: 'var(--text-muted)',
        fontSize: '14px',
        lineHeight: '1.6',
    },
};

export default withAuth(Billing);
