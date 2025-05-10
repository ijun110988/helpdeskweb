import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface User {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    createdAt: string;
    updatedAt: string;
}

const Profile = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: ''
    });
    const { logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                logout();
                navigate('/login');
                return;
            }

            const response = await axios.get(`${process.env.REACT_APP_API_URL}/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser(response.data);
            setFormData({
                firstName: response.data.firstName,
                lastName: response.data.lastName
            });
            setError(null);
        } catch (error) {
            console.error('Error fetching profile:', error);
            if (axios.isAxiosError(error) && error.response?.status === 401) {
                logout();
                navigate('/login');
            } else {
                setError('Gagal memuat profil. Silakan coba lagi.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(`${process.env.REACT_APP_API_URL}/profile`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser(response.data);
            setIsEditing(false);
            setError(null);
        } catch (error) {
            console.error('Error updating profile:', error);
            if (axios.isAxiosError(error) && error.response?.status === 401) {
                logout();
                navigate('/login');
            } else {
                setError('Gagal memperbarui profil. Silakan coba lagi.');
            }
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-danger" role="alert">
                {error}
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="container-fluid py-4">
            <h1 className="h3 mb-4">Profil</h1>
            <div className="card">
                <div className="card-body">
                    <div className="text-center mb-4">
                        <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center" 
                             style={{ width: '100px', height: '100px' }}>
                            <i className="bi bi-person display-4"></i>
                        </div>
                        <h4 className="mt-3">{user.firstName} {user.lastName}</h4>
                        <span className={`badge bg-${user.role === 'admin' ? 'danger' : 'primary'}`}>
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                    </div>
                    
                    {isEditing ? (
                        <form onSubmit={handleSubmit}>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Nama Depan</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Nama Belakang</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="col-12 mb-3">
                                    <button type="submit" className="btn btn-primary me-2">
                                        Simpan
                                    </button>
                                    <button 
                                        type="button" 
                                        className="btn btn-secondary"
                                        onClick={() => {
                                            setIsEditing(false);
                                            setFormData({
                                                firstName: user.firstName,
                                                lastName: user.lastName
                                            });
                                        }}
                                    >
                                        Batal
                                    </button>
                                </div>
                            </div>
                        </form>
                    ) : (
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label text-muted">Nama Depan</label>
                                <p className="form-control-plaintext">{user.firstName}</p>
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label text-muted">Nama Belakang</label>
                                <p className="form-control-plaintext">{user.lastName}</p>
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label text-muted">Email</label>
                                <p className="form-control-plaintext">{user.email}</p>
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label text-muted">Role</label>
                                <p className="form-control-plaintext">
                                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                </p>
                            </div>
                            <div className="col-12">
                                <button 
                                    className="btn btn-primary"
                                    onClick={() => setIsEditing(true)}
                                >
                                    Edit Profil
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
