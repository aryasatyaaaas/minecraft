import Link from 'next/link';
import { FiServer, FiActivity, FiExternalLink } from 'react-icons/fi';

export default function ServerCard({ server }) {
    const getStatusBadge = (status) => {
        const statusMap = {
            active: { class: 'badge-success', text: 'Active' },
            provisioning: { class: 'badge-warning', text: 'Provisioning' },
            suspended: { class: 'badge-danger', text: 'Suspended' },
            failed: { class: 'badge-danger', text: 'Failed' },
        };

        const statusInfo = statusMap[status] || { class: 'badge-primary', text: status };

        return <span className={`badge ${statusInfo.class}`}>{statusInfo.text}</span>;
    };

    return (
        <div className="card" style={styles.card}>
            <div style={styles.header}>
                <div style={styles.titleRow}>
                    <FiServer style={styles.icon} />
                    <h3 style={styles.name}>{server.server_name}</h3>
                </div>
                {getStatusBadge(server.status)}
            </div>

            <div style={styles.info}>
                <div style={styles.infoItem}>
                    <span style={styles.label}>Package:</span>
                    <span style={styles.value}>{server.package_name}</span>
                </div>
                <div style={styles.infoItem}>
                    <span style={styles.label}>RAM:</span>
                    <span style={styles.value}>{server.ram_mb / 1024} GB</span>
                </div>
                <div style={styles.infoItem}>
                    <span style={styles.label}>CPU:</span>
                    <span style={styles.value}>{server.cpu_limit}%</span>
                </div>
                <div style={styles.infoItem}>
                    <span style={styles.label}>Storage:</span>
                    <span style={styles.value}>{server.disk_mb / 1024} GB</span>
                </div>
            </div>

            {server.server_identifier && (
                <div style={styles.identifier}>
                    <span style={styles.label}>ID:</span>
                    <code style={styles.code}>{server.server_identifier}</code>
                </div>
            )}

            <div style={styles.actions}>
                <Link href={`/dashboard/servers/${server.id}`} className="btn btn-primary" style={styles.button}>
                    <FiActivity /> Manage
                </Link>
                {server.server_identifier && (
                    <Link
                        href={`${process.env.NEXT_PUBLIC_PTERODACTYL_URL || 'https://panel.yourdomain.com'}/server/${server.server_identifier}`}
                        target="_blank"
                        className="btn btn-secondary"
                        style={styles.button}
                    >
                        <FiExternalLink /> Panel
                    </Link>
                )}
            </div>
        </div>
    );
}

const styles = {
    card: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    titleRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    icon: {
        color: 'var(--primary)',
        fontSize: '24px',
    },
    name: {
        fontSize: '20px',
        fontWeight: '700',
        color: 'var(--text)',
        margin: 0,
    },
    info: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '12px',
    },
    infoItem: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
    },
    label: {
        fontSize: '12px',
        color: 'var(--gray-light)',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
    },
    value: {
        fontSize: '16px',
        fontWeight: '600',
        color: 'var(--text)',
    },
    identifier: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px',
        background: 'rgba(15, 23, 42, 0.6)',
        borderRadius: '6px',
    },
    code: {
        fontSize: '12px',
        color: 'var(--primary-light)',
        fontFamily: 'monospace',
    },
    actions: {
        display: 'flex',
        gap: '12px',
        marginTop: '8px',
    },
    button: {
        flex: 1,
        justifyContent: 'center',
    },
};
