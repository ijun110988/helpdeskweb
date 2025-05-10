import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate, useSearchParams} from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface Ticket {
    id: number;
    title: string;
    description: string;
    status: string;
    priority: string;
    createdAt: string;
    user: {
        firstName: string;
        lastName: string;
        email: string;
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

const AdminTickets = () => {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchParams] = useSearchParams();
    const [filters, setFilters] = useState({
        status:searchParams.get('status')|| '',
        priority: '',
        search: ''
    });
    const navigate = useNavigate();
    const { isAdmin, logout } = useAuth();

    useEffect(() => {
        const fetchAllTickets = async () => {
            try {
                if (!isAdmin) {
                    navigate('/tickets');
                    return;
                }

                const token = localStorage.getItem('token');
                if (!token) {
                    logout();
                    navigate('/login');
                    return;
                }

                const params = new URLSearchParams();
                if (filters.status) params.append('status', filters.status);
                if (filters.priority) params.append('priority', filters.priority);
                if (filters.search) params.append('search', filters.search);

                const response = await axios.get(`${process.env.REACT_APP_API_URL}/tickets/admin?${params.toString()}`, {
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
    }, [navigate, isAdmin, logout, filters]);

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

    if (!isAdmin) {
        return null;
    }

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
        <div className="container-fluid py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Semua Tiket</h2>
                <Link to="/dashboard" className="btn btn-outline-primary">
                    <i className="bi bi-speedometer2 me-2"></i>
                    Kembali ke Dashboard
                </Link>
            </div>

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
                                    value={filters.search}
                                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="col-md-3">
                            <select
                                className="form-select"
                                value={filters.status}
                                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            >
                                <option value="">Semua Status</option>
                                <option value="open">Tiket Baru</option>
                                <option value="in_progress">Sedang Diproses</option>
                                <option value="resolved">Selesai</option>
                            </select>
                        </div>
                        <div className="col-md-3">
                            <select
                                className="form-select"
                                value={filters.priority}
                                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
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

            {error && (
                <div className="alert alert-danger mb-4" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {error}
                </div>
            )}

            {tickets.length === 0 ? (
                <div className="text-center py-5">
                    <i className="bi bi-inbox fs-1 text-muted"></i>
                    <h4>Tidak ada tiket</h4>
                    <p className="text-muted">Belum ada tiket yang dibuat</p>
                </div>
            ) : (
                <div className="card">
                    <div className="card-body">
                        <div className="table-responsive">
                            <table className="table table-hover">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Judul</th>
                                        <th>Pengguna</th>
                                        <th>Status</th>
                                        <th>Prioritas</th>
                                        <th>Dibuat</th>
                                        <th>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tickets.map(ticket => (
                                        <tr key={ticket.id}>
                                            <td>#{ticket.id}</td>
                                            <td>
                                                <Link to={`/tickets/${ticket.id}`} className="text-decoration-none">
                                                    {ticket.title}
                                                </Link>
                                            </td>
                                            <td>
                                                <div>{ticket.user.firstName} {ticket.user.lastName}</div>
                                                <small className="text-muted">{ticket.user.email}</small>
                                            </td>
                                            <td>
                                                <span className={getStatusBadgeClass(ticket.status)}>
                                                    {getStatusText(ticket.status)}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={getPriorityBadgeClass(ticket.priority)}>
                                                    {getPriorityText(ticket.priority)}
                                                </span>
                                            </td>
                                            <td>
                                                <div>{formatDate(ticket.createdAt)}</div>
                                                {ticket.lastComment && (
                                                    <small className="text-muted">
                                                        Update terakhir: {formatDate(ticket.lastComment.createdAt)}
                                                    </small>
                                                )}
                                            </td>
                                            <td>
                                                <Link 
                                                    to={`/tickets/${ticket.id}`} 
                                                    className="btn btn-sm btn-outline-primary"
                                                >
                                                    <i className="bi bi-eye me-1"></i>
                                                    Lihat
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminTickets;
