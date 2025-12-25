import Link from 'next/link';
import { FiCheck } from 'react-icons/fi';

export default function PricingCard({ package: pkg }) {
    const formatPrice = (price) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    return (
        <div className="card" style={styles.card}>
            <div style={styles.header}>
                <h3 style={styles.name}>{pkg.name}</h3>
                <div style={styles.price}>
                    <span style={styles.amount}>{formatPrice(pkg.price)}</span>
                    <span style={styles.period}>/{pkg.billing_cycle}</span>
                </div>
            </div>

            <p style={styles.description}>{pkg.description}</p>

            <div style={styles.features}>
                <div style={styles.feature}>
                    <FiCheck style={styles.checkIcon} />
                    <span>{pkg.ram_mb / 1024} GB RAM</span>
                </div>
                <div style={styles.feature}>
                    <FiCheck style={styles.checkIcon} />
                    <span>{pkg.cpu_limit}% CPU</span>
                </div>
                <div style={styles.feature}>
                    <FiCheck style={styles.checkIcon} />
                    <span>{pkg.disk_mb / 1024} GB Storage</span>
                </div>
                {pkg.backup_slots > 0 && (
                    <div style={styles.feature}>
                        <FiCheck style={styles.checkIcon} />
                        <span>{pkg.backup_slots} Backup Slots</span>
                    </div>
                )}
                {pkg.database_limit > 0 && (
                    <div style={styles.feature}>
                        <FiCheck style={styles.checkIcon} />
                        <span>{pkg.database_limit} Databases</span>
                    </div>
                )}
                <div style={styles.feature}>
                    <FiCheck style={styles.checkIcon} />
                    <span>24/7 Support</span>
                </div>
                <div style={styles.feature}>
                    <FiCheck style={styles.checkIcon} />
                    <span>DDoS Protection</span>
                </div>
            </div>

            <Link href={`/order/${pkg.id}`} className="btn btn-primary" style={styles.button}>
                Choose Plan
            </Link>
        </div>
    );
}

const styles = {
    card: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
    },
    header: {
        marginBottom: '16px',
    },
    name: {
        fontSize: '24px',
        fontWeight: '700',
        marginBottom: '8px',
        color: 'var(--text)',
    },
    price: {
        display: 'flex',
        alignItems: 'baseline',
        gap: '4px',
    },
    amount: {
        fontSize: '32px',
        fontWeight: '800',
        background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
    },
    period: {
        fontSize: '14px',
        color: 'var(--gray-light)',
    },
    description: {
        color: 'var(--text-muted)',
        marginBottom: '24px',
        fontSize: '14px',
    },
    features: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        marginBottom: '24px',
        flex: 1,
    },
    feature: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        fontSize: '14px',
        color: 'var(--text)',
    },
    checkIcon: {
        color: 'var(--success)',
        fontSize: '18px',
        flexShrink: 0,
    },
    button: {
        width: '100%',
        justifyContent: 'center',
    },
};
