import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import 'bootstrap-icons/font/bootstrap-icons.css';

interface Ticket {
    id: number;
    title: string;
    status: string;
    priority: string;
    createdAt: string;
    user: {
        firstName: string;
        lastName: string;
    };
    lastComment?: {
        comment: string;
        createdAt: string;
        user: {
            firstName: string;
            lastName: string;
        };
    };
}

const TicketList = () => {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [searchParams] = useSearchParams();
    const [filter, setFilter] = useState({
        status: searchParams.get('status') || '',
        priority: '',
        search: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { logout } = useAuth();

    useEffect(() => {
            const fetchAllTickets = async () => {
                try {
                   
                    const token = localStorage.getItem('token');
                    if (!token) {
                        logout();
                        navigate('/login');
                        return;
                    }
    
                    const params = new URLSearchParams();
                    if (filter.status) params.append('status', filter.status);
                    if (filter.priority) params.append('priority', filter.priority);
                    if (filter.search) params.append('search', filter.search);
    
                    const response = await axios.get(`${process.env.REACT_APP_API_URL}/tickets/tickets?${params.toString()}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
    
                    if (Array.isArray(response.data)) {
                        setTickets(response.data);
                        setError(null);
                    } else {
                        setError('Format data tidak valid');
                    }
                } catch (error) {
                    console.error('Error fetching tickets:', error);
                    if (axios.isAxiosError(error)) {
                        if (error.response?.status === 401) {
                            logout();
                            navigate('/login');
                        } else if (error.response?.status === 403) {
                            navigate('/tickets');
                        } else {
                            setError('Gagal mengambil data tiket. Silakan coba lagi.');
                        }
                    } else {
                        setError('Terjadi kesalahan. Silakan coba lagi nanti.');
                    }
                } finally {
                    setLoading(false);
                }
            };
    
            fetchAllTickets();
        }, [navigate, logout, filter]);
    

    const getPriorityBadgeClass = (priority: string) => {
        const baseClass = 'badge';
        switch (priority) {
            case 'high':
                return `${baseClass} bg-danger`;
            case 'medium':
                return `${baseClass} bg-warning text-dark`;
            case 'low':
                return `${baseClass} bg-info text-dark`;
            default:
                return baseClass;
        }
    };

    const getStatusBadgeClass = (status: string) => {
        const baseClass = 'badge';
        switch (status) {
            case 'open':
                return `${baseClass} bg-danger`;
            case 'in_progress':
                return `${baseClass} bg-primary`;
            case 'resolved':
                return `${baseClass} bg-success`;
            default:
                return baseClass;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'open':
                return 'Tiket Baru';
            case 'in_progress':
                return 'Sedang Diproses';
            case 'resolved':
                return 'Selesai';
            default:
                return status;
        }
    };

    const getPriorityText = (priority: string) => {
        switch (priority) {
            case 'high':
                return 'Tinggi';
            case 'medium':
                return 'Sedang';
            case 'low':
                return 'Rendah';
            default:
                return priority;
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Memuat...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid">
            <div className="row mb-4">
                <div className="col">
                    <h2>Daftar Tiket</h2>
                </div>
                <div className="col-auto">
                    <Link to="/tickets/create" className="btn btn-primary">
                        <i className="bi bi-plus-circle me-2"></i>
                        Buat Tiket Baru
                    </Link>
                </div>
            </div>

            {error && (
                <div className="alert alert-danger mb-4" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {error}
                </div>
            )}

            <div className="card mb-4">
                <div className="card-body">
                    <div className="row g-3">
                        <div className="col-md-6">
                            <div className="input-group">
                                <span className="input-group-text">
                                    <i className="bi bi-search"></i>
                                </span>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Cari tiket..."
                                    value={filter.search}
                                    onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="col-md-3">
                            <select
                                className="form-select"
                                value={filter.status}
                                onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                            >
                                <option value="">Semua Status</option>
                                <option value="open">Dibuka</option>
                                <option value="in_progress">Sedang Diproses</option>
                                <option value="resolved">Selesai</option>
                            </select>
                        </div>
                        <div className="col-md-3">
                            <select
                                className="form-select"
                                value={filter.priority}
                                onChange={(e) => setFilter({ ...filter, priority: e.target.value })}
                            >
                                <option value="">Semua Prioritas</option>
                                <option value="low">Rendah</option>
                                <option value="medium">Sedang</option>
                                <option value="high">Tinggi</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
            
            {tickets.length === 0 ? (
                <div className="text-center py-5">
                    <i className="bi bi-inbox fs-1 text-muted"></i>
                    <h4>Tidak ada tiket</h4>
                    <p className="text-muted">Belum ada tiket yang dibuat atau sesuai dengan filter</p>
                </div>
            ) : (
                <div className="row">
                    {tickets.map(ticket => (
                        <div key={ticket.id} className="col-12 col-md-6 col-lg-4 mb-4">
                            <div className="card ticket-card h-100 hover-shadow">
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                        <h5 className="card-title mb-0">
                                            <Link to={`/tickets/${ticket.id}`} className="text-decoration-none">
                                                {ticket.title}
                                            </Link>
                                        </h5>
                                        <span className={getPriorityBadgeClass(ticket.priority)}>
                                            {getPriorityText(ticket.priority)}
                                        </span>
                                    </div>
                                    <div className="mb-3">
                                        <span className={getStatusBadgeClass(ticket.status)}>
                                            {getStatusText(ticket.status)}
                                        </span>
                                    </div>
                                    <p className="text-muted small mb-2">
                                        <i className="bi bi-person me-1"></i>
                                        {ticket.user.firstName} {ticket.user.lastName}
                                    </p>
                                    <p className="text-muted small mb-2">
                                        <i className="bi bi-calendar me-1"></i>
                                        {formatDate(ticket.createdAt)}
                                    </p>
                                    {ticket.lastComment && (
                                        <div className="mt-3 p-2 bg-light rounded">
                                            <small className="d-block text-muted mb-1">
                                                <i className="bi bi-chat-left-text me-1"></i>
                                                Komentar terakhir dari {ticket.lastComment.user.firstName}:
                                            </small>
                                            <p className="small mb-0">{ticket.lastComment.comment}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TicketList;
