import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';
import PricingCard from '../components/PricingCard';
import { FiServer, FiZap, FiShield, FiClock } from 'react-icons/fi';
import api from '../utils/api';

export default function Home() {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPackages();
    }, []);

    const fetchPackages = async () => {
        try {
            const response = await api.get('/packages');
            setPackages(response.data.packages);
        } catch (error) {
            console.error('Failed to fetch packages:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <Head>
                <title>Minecraft Hosting - Premium Game Server Hosting</title>
                <meta name="description" content="Professional Minecraft server hosting with automated provisioning" />
            </Head>

            <section style={styles.hero}>
                <div className="container">
                    <div style={styles.heroContent} className="fade-in">
                        <h1 style={styles.heroTitle}>
                            Premium <span className="gradient-text">Minecraft</span> Server Hosting
                        </h1>
                        <p style={styles.heroSubtitle}>
                            Automated provisioning, powerful performance, and 24/7 support.
                            Get your server online in minutes with our Pterodactyl-powered infrastructure.
                        </p>
                        <div style={styles.heroButtons}>
                            <Link href="/#pricing" className="btn btn-primary" style={styles.heroButton}>
                                View Pricing
                            </Link>
                            <Link href="/auth/register" className="btn btn-secondary" style={styles.heroButton}>
                                Get Started Free
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <section style={styles.features}>
                <div className="container">
                    <h2 style={styles.sectionTitle}>Why Choose Us?</h2>
                    <div className="grid grid-4" style={styles.featuresGrid}>
                        <div className="card" style={styles.featureCard}>
                            <FiZap style={styles.featureIcon} />
                            <h3 style={styles.featureTitle}>Instant Setup</h3>
                            <p style={styles.featureText}>
                                Automated server provisioning. Your Minecraft server is ready in minutes after payment.
                            </p>
                        </div>

                        <div className="card" style={styles.featureCard}>
                            <FiServer style={styles.featureIcon} />
                            <h3 style={styles.featureTitle}>Powerful Hardware</h3>
                            <p style={styles.featureText}>
                                High-performance servers with dedicated resources for smooth gameplay.
                            </p>
                        </div>

                        <div className="card" style={styles.featureCard}>
                            <FiShield style={styles.featureIcon} />
                            <h3 style={styles.featureTitle}>DDoS Protection</h3>
                            <p style={styles.featureText}>
                                Enterprise-grade DDoS protection keeps your server online 24/7.
                            </p>
                        </div>

                        <div className="card" style={styles.featureCard}>
                            <FiClock style={styles.featureIcon} />
                            <h3 style={styles.featureTitle}>24/7 Support</h3>
                            <p style={styles.featureText}>
                                Our team is always ready to help you with any issues or questions.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section id="pricing" style={styles.pricing}>
                <div className="container">
                    <h2 style={styles.sectionTitle}>Choose Your Plan</h2>
                    <p style={styles.sectionSubtitle}>
                        All plans include automated setup, DDoS protection, and 24/7 support
                    </p>

                    {loading ? (
                        <div style={styles.loading}>
                            <div className="loading-spinner"></div>
                        </div>
                    ) : (
                        <div className="grid grid-4" style={styles.pricingGrid}>
                            {packages.map((pkg) => (
                                <PricingCard key={pkg.id} package={pkg} />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            <section style={styles.cta}>
                <div className="container">
                    <div className="card" style={styles.ctaCard}>
                        <h2 style={styles.ctaTitle}>Ready to Start Your Server?</h2>
                        <p style={styles.ctaText}>
                            Join thousands of players enjoying lag-free Minecraft hosting
                        </p>
                        <Link href="/auth/register" className="btn btn-primary" style={styles.ctaButton}>
                            Get Started Now
                        </Link>
                    </div>
                </div>
            </section>
        </Layout>
    );
}

const styles = {
    hero: {
        padding: '80px 0',
        textAlign: 'center',
    },
    heroContent: {
        maxWidth: '800px',
        margin: '0 auto',
    },
    heroTitle: {
        fontSize: '56px',
        fontWeight: '800',
        lineHeight: '1.2',
        marginBottom: '24px',
        color: 'var(--text)',
    },
    heroSubtitle: {
        fontSize: '20px',
        color: 'var(--text-muted)',
        marginBottom: '40px',
        lineHeight: '1.6',
    },
    heroButtons: {
        display: 'flex',
        gap: '16px',
        justifyContent: 'center',
        flexWrap: 'wrap',
    },
    heroButton: {
        padding: '16px 32px',
        fontSize: '16px',
    },
    features: {
        padding: '80px 0',
        background: 'rgba(15, 23, 42, 0.4)',
    },
    sectionTitle: {
        fontSize: '40px',
        fontWeight: '800',
        textAlign: 'center',
        marginBottom: '16px',
        color: 'var(--text)',
    },
    sectionSubtitle: {
        fontSize: '18px',
        color: 'var(--text-muted)',
        textAlign: 'center',
        marginBottom: '48px',
    },
    featuresGrid: {
        marginTop: '48px',
    },
    featureCard: {
        textAlign: 'center',
    },
    featureIcon: {
        fontSize: '48px',
        color: 'var(--primary)',
        marginBottom: '16px',
    },
    featureTitle: {
        fontSize: '20px',
        fontWeight: '700',
        marginBottom: '12px',
        color: 'var(--text)',
    },
    featureText: {
        color: 'var(--text-muted)',
        fontSize: '14px',
        lineHeight: '1.6',
    },
    pricing: {
        padding: '80px 0',
    },
    pricingGrid: {
        marginTop: '48px',
    },
    loading: {
        display: 'flex',
        justifyContent: 'center',
        padding: '60px 0',
    },
    cta: {
        padding: '80px 0',
    },
    ctaCard: {
        textAlign: 'center',
        padding: '60px 40px',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
        border: '2px solid rgba(99, 102, 241, 0.3)',
    },
    ctaTitle: {
        fontSize: '36px',
        fontWeight: '800',
        marginBottom: '16px',
        color: 'var(--text)',
    },
    ctaText: {
        fontSize: '18px',
        color: 'var(--text-muted)',
        marginBottom: '32px',
    },
    ctaButton: {
        padding: '16px 48px',
        fontSize: '16px',
    },
};
