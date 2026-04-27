import React, { useState } from 'react';
import api from '../api';
import { Upload, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const InvoiceForm = ({ onInvoiceAdded }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        contact_number: '',
        participation_date: '',
        emirate: '',
        marketing_consent: false
    });
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('email', formData.email);
            data.append('contact_number', formData.contact_number);
            data.append('participation_date', formData.participation_date);
            data.append('emirate', formData.emirate);
            data.append('marketing_consent', formData.marketing_consent);
            if (file) {
                data.append('invoice_image', file);
            }

            await api.post('/invoices', data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setMessage({ type: 'success', text: 'Participation submitted successfully!' });
            setFormData({
                name: '',
                email: '',
                contact_number: '',
                participation_date: '',
                emirate: '',
                marketing_consent: false
            });
            setFile(null);
            setPreview(null);
            if (onInvoiceAdded) {
                setTimeout(() => {
                    onInvoiceAdded();
                }, 1500);
            }
        } catch (error) {
            console.error('Error submitting participation:', error);
            setMessage({
                type: 'error',
                text: error.response?.data?.error || 'Failed to submit. Please try again.'
            });
        } finally {
            setLoading(false);
        }
    };

    const emirates = [
        'Abu Dhabi',
        'Dubai',
        'Sharjah',
        'Ajman',
        'Umm Al Quwain',
        'Ras Al Khaimah',
        'Fujairah'
    ];

    return (
        <form onSubmit={handleSubmit} className="invoice-form">
            <div className="form-group-grid">
                <div className="form-group">
                    <label>Full Name</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g. John Doe"
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Mobile Number</label>
                    <input
                        type="text"
                        name="contact_number"
                        value={formData.contact_number}
                        onChange={handleChange}
                        placeholder="e.g. +971 50 123 4567"
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Email Address</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="e.g. john@example.com"
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Date & Time of Participation</label>
                    <input
                        type="datetime-local"
                        name="participation_date"
                        value={formData.participation_date}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Participating Emirate</label>
                    <select
                        name="emirate"
                        value={formData.emirate}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select Emirate</option>
                        {emirates.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                </div>
            </div>

            <div className="form-group">
                <label>Proof of Purchase (Invoice Receipt)</label>
                <div className={`file-upload-zone ${preview ? 'has-file' : ''}`}>
                    <input
                        type="file"
                        id="invoice_image"
                        onChange={handleFileChange}
                        accept="image/*"
                        className="file-input"
                    />
                    <label htmlFor="invoice_image" className="file-label">
                        {preview ? (
                            <img src={preview} alt="Preview" className="upload-preview" />
                        ) : (
                            <div className="upload-placeholder">
                                <Upload size={32} />
                                <span>Click to upload or drag and drop</span>
                                <small>JPG, PNG or PDF (Max 5MB)</small>
                            </div>
                        )}
                    </label>
                </div>
                {preview && (
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <button
                            type="button"
                            className="remove-file"
                            onClick={() => { setFile(null); setPreview(null); }}
                        >
                            Change Image
                        </button>
                    </div>
                )}
            </div>

            <div className="form-group checkbox-group">
                <input
                    type="checkbox"
                    id="marketing_consent"
                    name="marketing_consent"
                    checked={formData.marketing_consent}
                    onChange={handleChange}
                    style={{ width: 'auto' }}
                />
                <label htmlFor="marketing_consent" style={{ marginBottom: 0 }}>
                    I agree to receive marketing communications and updates.
                </label>
            </div>

            {message.text && (
                <div className={`form-message ${message.type}`}>
                    {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                    {message.text}
                </div>
            )}

            <div className="form-actions" style={{ marginTop: '10px' }}>
                <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%' }}>
                    {loading ? (
                        <>
                            <Loader2 size={18} className="animate-spin" />
                            Submitting...
                        </>
                    ) : (
                        'Submit Invoice'
                    )}
                </button>
            </div>
        </form>
    );
};

export default InvoiceForm;
