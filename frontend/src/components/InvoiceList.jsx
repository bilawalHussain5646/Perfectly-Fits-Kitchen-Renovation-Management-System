import React, { useState } from 'react';
import api from '../api';
import { Eye, Download, Trash2, Gift, ChevronLeft, ChevronRight } from 'lucide-react';

const PAGE_SIZE = 50;

const InvoiceList = ({ invoices, onInvoiceClick, onDelete, onGiveawayToggle, showGiveaway = false, showDelete = false }) => {
    const [deletingId, setDeletingId] = useState(null);
    const [togglingId, setTogglingId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.max(1, Math.ceil((invoices?.length || 0) / PAGE_SIZE));
    const paginatedInvoices = Array.isArray(invoices)
        ? invoices.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
        : [];

    const handleExport = async () => {
        try {
            const response = await api.get('/export', { responseType: 'blob' });
            const contentDisposition = response.headers['content-disposition'];
            let filename = 'invoices_export.zip';
            if (contentDisposition) {
                const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                if (match && match[1]) filename = match[1].replace(/['"]/g, '');
            }
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Export failed', error);
            alert('Export failed. Please try again.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this entry?')) return;
        setDeletingId(id);
        try {
            await api.delete(`/invoices/${id}`);
            if (onDelete) onDelete(id);
        } catch (error) {
            console.error('Delete failed', error);
            alert('Delete failed. Please try again.');
        } finally {
            setDeletingId(null);
        }
    };

    const handleGiveawayToggle = async (id) => {
        setTogglingId(id);
        try {
            const response = await api.put(`/invoices/${id}/giveaway`);
            if (onGiveawayToggle) onGiveawayToggle(id, response.data.invoice);
        } catch (error) {
            console.error('Toggle failed', error);
            alert('Failed to update giveaway status.');
        } finally {
            setTogglingId(null);
        }
    };

    const colCount = 7 + (showGiveaway ? 1 : 0) + (showDelete ? 1 : 0);

    return (
        <div>
            {/* Toolbar — export only, filters hidden */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                <button className="btn-success" onClick={handleExport}>
                    <Download size={16} /> Export
                </button>
            </div>

            <div className="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>S.No</th>
                            <th>Full Name</th>
                            <th>Email</th>
                            <th>Mobile</th>
                            <th>Emirate</th>
                            <th>Participation Date</th>
                            <th>Proof</th>
                            {showGiveaway && <th>Giveaway</th>}
                            {showDelete && <th>Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedInvoices.length > 0 ? (
                            paginatedInvoices.map((invoice, idx) => (
                                <tr key={invoice.id}>
                                    <td style={{ color: 'var(--text-muted)', fontWeight: '600' }}>
                                        {(currentPage - 1) * PAGE_SIZE + idx + 1}
                                    </td>
                                    <td style={{ fontWeight: '500' }}>{invoice.name}</td>
                                    <td>{invoice.email}</td>
                                    <td>{invoice.contact_number}</td>
                                    <td>{invoice.emirate}</td>
                                    <td>{new Date(invoice.participation_date).toLocaleString()}</td>
                                    <td>
                                        {invoice.invoice_image ? (
                                            <button className="btn-icon" onClick={() => onInvoiceClick(invoice.id)}>
                                                <Eye size={14} /> View
                                            </button>
                                        ) : (
                                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>—</span>
                                        )}
                                    </td>
                                    {showGiveaway && (
                                        <td>
                                            <button
                                                className={invoice.is_giveaway_eligible ? 'btn-giveaway active' : 'btn-giveaway'}
                                                onClick={() => handleGiveawayToggle(invoice.id)}
                                                disabled={togglingId === invoice.id}
                                                title={invoice.is_giveaway_eligible ? 'Remove from giveaway' : 'Add to giveaway'}
                                            >
                                                <Gift size={14} />
                                                {togglingId === invoice.id ? '...' : (invoice.is_giveaway_eligible ? 'Eligible' : 'Mark')}
                                            </button>
                                        </td>
                                    )}
                                    {showDelete && (
                                        <td>
                                            <button
                                                className="btn-danger-sm"
                                                onClick={() => handleDelete(invoice.id)}
                                                disabled={deletingId === invoice.id}
                                                title="Delete entry"
                                            >
                                                <Trash2 size={14} />
                                                {deletingId === invoice.id ? '...' : 'Delete'}
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={colCount} style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                                    No entries found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {invoices && invoices.length > PAGE_SIZE && (
                <div className="pagination">
                    <span className="pagination-info">
                        Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, invoices.length)} of {invoices.length} entries
                    </span>
                    <div className="pagination-controls">
                        <button
                            className="pagination-btn"
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft size={16} />
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
                            .reduce((acc, p, idx, arr) => {
                                if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
                                acc.push(p);
                                return acc;
                            }, [])
                            .map((item, idx) =>
                                item === '...' ? (
                                    <span key={`ellipsis-${idx}`} className="pagination-ellipsis">…</span>
                                ) : (
                                    <button
                                        key={item}
                                        className={`pagination-btn ${currentPage === item ? 'active' : ''}`}
                                        onClick={() => setCurrentPage(item)}
                                    >
                                        {item}
                                    </button>
                                )
                            )}
                        <button
                            className="pagination-btn"
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InvoiceList;
