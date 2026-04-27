import React, { useState, useEffect } from 'react';
import api from '../api';
import AppLayout from '../layouts/AppLayout';
import InvoiceList from '../components/InvoiceList';
import ImageModal from '../components/ImageModal';

const Invoices = () => {
    const [invoices, setInvoices] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [filters, setFilters] = useState({ name: '', email: '' });
    const [loading, setLoading] = useState(true);

    const fetchInvoices = async () => {
        try {
            const params = new URLSearchParams(filters).toString();
            const response = await api.get(`/invoices?${params}`);
            // Guard: ensure we always set an array
            setInvoices(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Error fetching invoices:', error);
            setInvoices([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoices();
    }, [filters]);

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
    };

    const handleInvoiceClick = async (invoiceId) => {
        try {
            const response = await api.get(`/invoices/${invoiceId}/image`, {
                responseType: 'blob'
            });
            const imageUrl = URL.createObjectURL(response.data);
            setSelectedImage(imageUrl);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCloseModal = () => {
        setSelectedImage(null);
    };

    const handleDelete = (id) => {
        setInvoices(invoices.filter(inv => inv.id !== id));
    };

    const handleGiveawayToggle = (id, updatedInvoice) => {
        setInvoices(invoices.map(inv =>
            inv.id === id ? { ...inv, is_giveaway_eligible: updatedInvoice.is_giveaway_eligible } : inv
        ));
    };

    return (
        <AppLayout title="Entries" subtitle="View and manage all entries">
            <div className="card">
                <div className="table-wrapper">
                    <InvoiceList
                        invoices={invoices}
                        onInvoiceClick={handleInvoiceClick}
                        onFilterChange={handleFilterChange}
                        onDelete={handleDelete}
                        onGiveawayToggle={handleGiveawayToggle}
                        showGiveaway={true}
                        showDelete={true}
                    />
                </div>
            </div>

            {selectedImage && (
                <ImageModal
                    imageUrl={selectedImage}
                    onClose={handleCloseModal}
                />
            )}
        </AppLayout>
    );
};

export default Invoices;
