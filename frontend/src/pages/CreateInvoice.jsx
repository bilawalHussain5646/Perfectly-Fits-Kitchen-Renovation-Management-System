import React from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import InvoiceForm from '../components/InvoiceForm';

const CreateInvoice = () => {
    const navigate = useNavigate();

    const handleInvoiceAdded = () => {
        navigate('/invoices');
    };

    return (
        <AppLayout title="Create Invoice" subtitle="Submit a new invoice record">
            <div className="card" style={{ maxWidth: '800px' }}>
                <div className="card-header">
                    <h3>Invoice Details</h3>
                </div>
                <InvoiceForm onInvoiceAdded={handleInvoiceAdded} />
            </div>
        </AppLayout>
    );
};

export default CreateInvoice;
