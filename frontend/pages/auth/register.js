import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { register } from '../../utils/auth';
import { FiMail, FiLock, FiUser, FiAlertCircle } from 'react-icons/fi';

export default function Register() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        full_name: '',
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

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            await register(formData.email, formData.password, formData.full_name);
            router.push('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <Head>
                <title>Register - Minecraft Hosting</title>
            </Head>

            <div style={styles.container}>
                <div className="card" style={styles.card}>
                    <div style={styles.header}>
                        <h1 style={styles.title}>Create Account</h1>
                        <p style={styles.subtitle}>Start hosting your Minecraft server today</p>
                    </div>

                    {error && (
                        <div className="alert alert-error">
                            <FiAlertCircle />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label htmlFor="full_name">
                                <FiUser style={styles.icon} /> Full Name
                            </label>
                            <input
                                type="text"
                                id="full_name"
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleChange}
                                required
                                placeholder="John Doe"
                            />
                        </div>

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
                                minLength="6"
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="confirmPassword">
                                <FiLock style={styles.icon} /> Confirm Password
                            </label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
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
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>

                    <div style={styles.footer}>
                        <p style={styles.footerText}>
                            Already have an account?{' '}
                            <Link href="/auth/login" style={styles.link}>
                                Login here
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
