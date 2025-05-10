import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap-icons/font/bootstrap-icons.css';

interface Comment {
    id: number;
    comment: string;
    createdAt: string;
    user: {
        firstName: string;
        lastName: string;
    };
}

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
    };
}

const TicketDetail = () => {
    const { id } = useParams<{ id: string }>();
    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [showResolveForm, setShowResolveForm] = useState(false);
    const [resolveComment, setResolveComment] = useState('');
    const [hasUpdatedStatus, setHasUpdatedStatus] = useState(false)
    

    const fetchTicket = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/tickets/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setTicket(response.data);
            setLoading(false);
            
            return response.data;
        } catch (error) {
            console.error('Error fetching ticket:', error);
            alert('Gagal mengambil data tiket');
            setLoading(false);
            throw error;
        }
    }, [id]);

    const updateTicketStatus = useCallback(async (status: string, comment?: string) => {
        // debugger;
        try {
            const token = localStorage.getItem('token');
            // console.log('Updating ticket status to:', status);
            
            // Update status tiket
            await axios.put(
                `${process.env.REACT_APP_API_URL}/tickets/${id}/status`,
                { status },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Jika ada komentar, tambahkan komentar
            if (comment && !hasUpdatedStatus && !showResolveForm) {
                await axios.post(
                    `${process.env.REACT_APP_API_URL}/tickets/${id}/comments`,
                    { comment },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                
                // Refresh komentar setelah menambahkan komentar baru
                const commentsResponse = await axios.get(`${process.env.REACT_APP_API_URL}/tickets/${id}/comments`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setComments(commentsResponse.data);
            }
            
            // Refresh data tiket
            const updatedTicket = await fetchTicket();
            setHasUpdatedStatus(true);
            return updatedTicket;
        } catch (error) {
            console.error('Error updating ticket:', error);
            alert('Gagal mengubah status tiket');
            throw error;
        }
    }, [id, fetchTicket]);

    const fetchComments = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/tickets/${id}/comments`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setComments(response.data);
        } catch (error) {
            console.error('Error fetching comments:', error);
            alert('Gagal mengambil komentar');
        }
    }, [id]);

    // 
    
    useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userIsAdmin = user.role === 'admin';
    setIsAdmin(userIsAdmin);

    let didUpdate = false;

    const fetchData = async () => {
        try {
            const ticketData = await fetchTicket();
            await fetchComments();

            // Cek status tiket dan update jika admin
            if (userIsAdmin && ticketData.status === 'open' && !didUpdate && !hasUpdatedStatus) {
                didUpdate = true; // Local flag to prevent multiple updates
                await updateTicketStatus('in_progress', 'Tiket sedang ditangani oleh admin');
                setHasUpdatedStatus(true);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            setLoading(false);
        }
    };

    fetchData();
}, [fetchTicket, fetchComments, hasUpdatedStatus]);


    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `${process.env.REACT_APP_API_URL}/tickets/${id}/comments`,
                { comment: newComment },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setNewComment('');
            fetchComments();
        } catch (error) {
            console.error('Error adding comment:', error);
            alert('Gagal menambahkan komentar');
        }
    };



    const handleResolveTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!resolveComment.trim()) {
            alert('Mohon isi komentar resolusi');
            return;
        }

        await updateTicketStatus('resolved', resolveComment);
        setShowResolveForm(false);
        setResolveComment('');
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

    const canComment = () => {
        if (!ticket) return false;
        if (isAdmin) return true; // Admin selalu bisa komen
        return ticket.status !== 'resolved'; // User biasa tidak bisa komen jika resolved
    };

    const handleReopen = async () => {
        if (window.confirm('Apakah Anda yakin ingin membuka kembali tiket ini?')) {
            await updateTicketStatus('in_progress', 'Tiket dibuka kembali oleh admin untuk ditinjau ulang');
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

    if (!ticket) {
        return <div>Tiket tidak ditemukan</div>;
    }

    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-md-8">
                    <div className="card mb-4">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-start mb-3">
                                <h2 className="card-title">{ticket.title}</h2>
                                <div className="d-flex align-items-center gap-2">
                                    <span className={`badge bg-${ticket.priority === 'high' ? 'danger' : 
                                        ticket.priority === 'medium' ? 'warning' : 'info'}`}>
                                        {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                                    </span>
                                    <span className={`badge bg-${ticket.status === 'open' ? 'success' : 
                                        ticket.status === 'in_progress' ? 'primary' : 'secondary'}`}>
                                        {ticket.status === 'in_progress' ? 'In Progress' : 
                                         ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                                    </span>
                                    {isAdmin && ticket.status === 'resolved' && (
                                        <button 
                                            className="btn btn-warning btn-sm ms-2"
                                            onClick={handleReopen}
                                        >
                                            <i className="bi bi-arrow-counterclockwise me-1"></i>
                                            Buka Kembali
                                        </button>
                                    )}
                                </div>
                            </div>
                            <p className="text-muted">
                                <i className="bi bi-person me-2"></i>
                                {ticket.user.firstName} {ticket.user.lastName}
                                <span className="mx-2">•</span>
                                <i className="bi bi-calendar me-2"></i>
                                {formatDate(ticket.createdAt)}
                            </p>
                            <p className="card-text">{ticket.description}</p>
                            
                            {isAdmin && ticket.status === 'in_progress' && (
                                <div className="mt-4 border-top pt-3">
                                    {!showResolveForm ? (
                                        <button 
                                            className="btn btn-success"
                                            onClick={() => setShowResolveForm(true)}
                                        >
                                            <i className="bi bi-check-circle me-2"></i>
                                            Resolve Tiket
                                        </button>
                                    ) : (
                                        <form onSubmit={handleResolveTicket} className="resolve-form">
                                            <h5>Resolve Tiket</h5>
                                            <div className="form-group mb-3">
                                                <label className="form-label">Komentar Resolusi:</label>
                                                <textarea
                                                    className="form-control"
                                                    rows={3}
                                                    value={resolveComment}
                                                    onChange={(e) => setResolveComment(e.target.value)}
                                                    placeholder="Jelaskan bagaimana tiket ini diselesaikan..."
                                                    required
                                                />
                                            </div>
                                            <div className="d-flex gap-2">
                                                <button type="submit" className="btn btn-success">
                                                    <i className="bi bi-check-circle me-2"></i>
                                                    Konfirmasi Resolve
                                                </button>
                                                <button 
                                                    type="button" 
                                                    className="btn btn-secondary"
                                                    onClick={() => setShowResolveForm(false)}
                                                >
                                                    Batal
                                                </button>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-body">
                            <h5 className="card-title mb-4">
                                <i className="bi bi-chat-left-text me-2"></i>
                                Komentar
                            </h5>
                            {canComment() ? (
                                <form onSubmit={handleAddComment} className="mb-4">
                                    <div className="form-group">
                                        <textarea
                                            className="form-control"
                                            rows={3}
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            placeholder="Tulis komentar..."
                                            required
                                        />
                                    </div>
                                    <button type="submit" className="btn btn-primary mt-2">
                                        <i className="bi bi-send me-2"></i>
                                        Kirim Komentar
                                    </button>
                                </form>
                            ) : (
                                <div className="alert alert-info">
                                    <i className="bi bi-info-circle me-2"></i>
                                    Tiket ini telah diselesaikan. Tidak dapat menambahkan komentar baru.
                                </div>
                            )}
                            <div className="comment-list">
                                {comments.map(comment => (
                                    <div key={comment.id} className="comment-item border-bottom mb-3 pb-3">
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <div>
                                                <i className="bi bi-person-circle me-2"></i>
                                                <strong>{comment.user.firstName} {comment.user.lastName}</strong>
                                            </div>
                                            <small className="text-muted">
                                                <i className="bi bi-clock me-1"></i>
                                                {formatDate(comment.createdAt)}
                                            </small>
                                        </div>
                                        <p className="mb-0">{comment.comment}</p>
                                    </div>
                                ))}
                                {comments.length === 0 && (
                                    <div className="text-center text-muted py-4">
                                        <i className="bi bi-chat-left me-2"></i>
                                        Belum ada komentar
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="col-md-4">
                    <div className="card">
                        <div className="card-body">
                            <h5 className="card-title">
                                <i className="bi bi-info-circle me-2"></i>
                                Informasi Tiket
                            </h5>
                            <ul className="list-unstyled">
                                <li className="mb-2">
                                    <strong>Status:</strong>
                                    <span className={`badge bg-${ticket.status === 'open' ? 'success' : 
                                        ticket.status === 'in_progress' ? 'primary' : 'secondary'} ms-2`}>
                                        {ticket.status === 'in_progress' ? 'In Progress' : 
                                         ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                                    </span>
                                </li>
                                <li className="mb-2">
                                    <strong>Prioritas:</strong>
                                    <span className={`badge bg-${ticket.priority === 'high' ? 'danger' : 
                                        ticket.priority === 'medium' ? 'warning' : 'info'} ms-2`}>
                                        {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                                    </span>
                                </li>
                                <li className="mb-2">
                                    <strong>Dibuat oleh:</strong>
                                    <br />
                                    <i className="bi bi-person me-2"></i>
                                    {ticket.user.firstName} {ticket.user.lastName}
                                </li>
                                <li>
                                    <strong>Tanggal dibuat:</strong>
                                    <br />
                                    <i className="bi bi-calendar me-2"></i>
                                    {formatDate(ticket.createdAt)}
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TicketDetail;
