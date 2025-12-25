import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { login } from '../../utils/auth';
import { FiMail, FiLock, FiAlertCircle } from 'react-icons/fi';

export default function Login() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(formData.email, formData.password);
            router.push('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <Head>
                <title>Login - Minecraft Hosting</title>
            </Head>

            <div style={styles.container}>
                <div className="card" style={styles.card}>
                    <div style={styles.header}>
                        <h1 style={styles.title}>Welcome Back</h1>
                        <p style={styles.subtitle}>Login to manage your servers</p>
                    </div>

                    {error && (
                        <div className="alert alert-error">
                            <FiAlertCircle />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label htmlFor="email">
                                <FiMail style={styles.icon} /> Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="your@email.com"
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="password">
                                <FiLock style={styles.icon} /> Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={styles.submitButton}
                            disabled={loading}
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>

                    <div style={styles.footer}>
                        <p style={styles.footerText}>
                            Don't have an account?{' '}
                            <Link href="/auth/register" style={styles.link}>
                                Register here
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </Layout>
    );
}

const styles = {
    container: {
        maxWidth: '450px',
        margin: '0 auto',
        padding: '40px 20px',
    },
    card: {
        padding: '40px',
    },
    header: {
        textAlign: 'center',
        marginBottom: '32px',
    },
    title: {
        fontSize: '32px',
        fontWeight: '800',
        marginBottom: '8px',
        color: 'var(--text)',
    },
    subtitle: {
        color: 'var(--text-muted)',
        fontSize: '16px',
    },
    icon: {
        display: 'inline',
        marginRight: '8px',
        verticalAlign: 'middle',
    },
    submitButton: {
        width: '100%',
        justifyContent: 'center',
        marginTop: '8px',
    },
    footer: {
        marginTop: '24px',
        textAlign: 'center',
    },
    footerText: {
        color: 'var(--text-muted)',
        fontSize: '14px',
    },
    link: {
        color: 'var(--primary-light)',
        textDecoration: 'none',
        fontWeight: '600',
    },
};
