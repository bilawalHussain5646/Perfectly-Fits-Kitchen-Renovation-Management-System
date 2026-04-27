import React, { useState, useEffect } from 'react';
import api from '../api';
import AppLayout from '../layouts/AppLayout';
import { Users, UserPlus, Trash2, ShieldCheck, Mail, ShieldAlert } from 'lucide-react';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState({ username: '', password: '', is_super_admin: false });
    const [message, setMessage] = useState({ type: '', text: '' });

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users');
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleAddUser = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        try {
            await api.post('/users', formData);
            setMessage({ type: 'success', text: 'User added successfully' });
            setFormData({ username: '', password: '', is_super_admin: false });
            setShowAddForm(false);
            fetchUsers();
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to add user' });
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            await api.delete(`/users/${id}`);
            fetchUsers();
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to delete user');
        }
    };

    return (
        <AppLayout title="User Management" subtitle="Manage administrator accounts">
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
                    <UserPlus size={18} />
                    {showAddForm ? 'Cancel' : 'Add New User'}
                </button>
            </div>

            {showAddForm && (
                <div className="card" style={{ marginBottom: '24px', animation: 'slideInDown 0.3s ease' }}>
                    <div className="card-header">
                        <h3>Create User</h3>
                    </div>
                    <form onSubmit={handleAddUser} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                        <div>
                            <label>Username</label>
                            <input 
                                type="text" 
                                value={formData.username} 
                                onChange={(e) => setFormData({...formData, username: e.target.value})} 
                                required 
                            />
                        </div>
                        <div>
                            <label>Password</label>
                            <input 
                                type="password" 
                                value={formData.password} 
                                onChange={(e) => setFormData({...formData, password: e.target.value})} 
                                required 
                            />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '30px' }}>
                            <input 
                                type="checkbox" 
                                checked={formData.is_super_admin} 
                                onChange={(e) => setFormData({...formData, is_super_admin: e.target.checked})}
                                style={{ width: '18px', height: '18px' }}
                            />
                            <label style={{ marginBottom: 0 }}>Super Admin</label>
                        </div>
                        <div style={{ paddingTop: '25px' }}>
                            <button type="submit" className="btn-primary" style={{ width: '100%' }}>Create Account</button>
                        </div>
                    </form>
                </div>
            )}

            {message.text && (
                <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: '20px' }}>
                    {message.text}
                </div>
            )}

            <div className="card">
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Username</th>
                                <th>Role</th>
                                <th>Created At</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '32px', height: '32px', background: 'var(--primary-10)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                                                <Users size={16} />
                                            </div>
                                            {user.username}
                                        </div>
                                    </td>
                                    <td>
                                        {user.is_super_admin ? (
                                            <span className="badge" style={{ background: '#fef3c7', color: '#92400e', fontWeight: '800' }}>
                                                <ShieldCheck size={12} style={{ marginRight: '4px' }} />
                                                Super Admin
                                            </span>
                                        ) : (
                                            <span className="badge">Admin</span>
                                        )}
                                    </td>
                                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </td>
                                    <td>
                                        <button 
                                            className="btn-danger-sm" 
                                            onClick={() => handleDeleteUser(user.id)}
                                            disabled={user.is_super_admin}
                                        >
                                            <Trash2 size={14} />
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
};

export default UserManagement;
