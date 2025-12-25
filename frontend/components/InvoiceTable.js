import { FiFileText, FiClock, FiDollarSign } from 'react-icons/fi';

export default function InvoiceTable({ invoices, onPayClick }) {
    const formatPrice = (price) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            paid: { class: 'badge-success', text: 'Paid' },
            pending: { class: 'badge-warning', text: 'Pending' },
            cancelled: { class: 'badge-danger', text: 'Cancelled' },
            expired: { class: 'badge-danger', text: 'Expired' },
        };

        const statusInfo = statusMap[status] || { class: 'badge-primary', text: status };

        return <span className={`badge ${statusInfo.class}`}>{statusInfo.text}</span>;
    };

    if (!invoices || invoices.length === 0) {
        return (
            <div style={styles.empty}>
                <FiFileText size={48} style={styles.emptyIcon} />
                <p>No invoices found</p>
            </div>
        );
    }

    return (
        <div style={styles.tableContainer}>
            <table style={styles.table}>
                <thead>
                    <tr>
                        <th style={styles.th}>Invoice #</th>
                        <th style={styles.th}>Server</th>
                        <th style={styles.th}>Amount</th>
                        <th style={styles.th}>Status</th>
                        <th style={styles.th}>Date</th>
                        <th style={styles.th}>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {invoices.map((invoice) => (
                        <tr key={invoice.id} style={styles.tr}>
                            <td style={styles.td}>
                                <div style={styles.invoiceNumber}>
                                    <FiFileText style={styles.icon} />
                                    {invoice.invoice_number}
                                </div>
                            </td>
                            <td style={styles.td}>{invoice.server_name}</td>
                            <td style={styles.td}>
                                <strong>{formatPrice(invoice.amount)}</strong>
                            </td>
                            <td style={styles.td}>{getStatusBadge(invoice.status)}</td>
                            <td style={styles.td}>
                                <div style={styles.date}>
                                    <FiClock style={styles.icon} />
                                    {formatDate(invoice.created_at)}
                                </div>
                            </td>
                            <td style={styles.td}>
                                {invoice.status === 'pending' && (
                                    <button
                                        onClick={() => onPayClick(invoice)}
                                        className="btn btn-primary"
                                        style={styles.payButton}
                                    >
                                        <FiDollarSign /> Pay Now
                                    </button>
                                )}
                                {invoice.status === 'paid' && (
                                    <span style={styles.paidText}>✓ Paid</span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

const styles = {
    tableContainer: {
        overflowX: 'auto',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
    },
    th: {
        padding: '16px',
        textAlign: 'left',
        borderBottom: '2px solid var(--dark-lighter)',
        color: 'var(--text)',
        fontWeight: '600',
        fontSize: '14px',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
    },
    tr: {
        borderBottom: '1px solid var(--dark-lighter)',
        transition: 'background 0.3s ease',
    },
    td: {
        padding: '16px',
        color: 'var(--text-muted)',
        fontSize: '14px',
    },
    invoiceNumber: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontFamily: 'monospace',
        color: 'var(--primary-light)',
    },
    date: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    icon: {
        color: 'var(--gray)',
        fontSize: '16px',
    },
    payButton: {
        padding: '8px 16px',
        fontSize: '12px',
    },
    paidText: {
        color: 'var(--success)',
        fontWeight: '600',
    },
    empty: {
        textAlign: 'center',
        padding: '60px 20px',
        color: 'var(--gray-light)',
    },
    emptyIcon: {
        color: 'var(--gray)',
        marginBottom: '16px',
    },
};
