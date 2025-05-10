import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Bar, Doughnut } from 'react-chartjs-2';
import { useAuth } from '../context/AuthContext';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

interface TicketStats {
    open: number;
    in_progress: number;
    resolved: number;
    averageResolutionTime: number;
}

const Dashboard = () => {
    const [stats, setStats] = useState<TicketStats>({
        open: 0,
        in_progress: 0,
        resolved: 0,
        averageResolutionTime: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { isAdmin, logout } = useAuth();

    useEffect(() => {
        const fetchStats = async () => {
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

                const response = await axios.get(`${process.env.REACT_APP_API_URL}/tickets/stats`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data) {
                    setStats(response.data);
                    setError(null);
                } else {
                    setError('Data dashboard tidak tersedia');
                }
            } catch (error) {
                console.error('Error fetching stats:', error);
                if (axios.isAxiosError(error)) {
                    if (error.response?.status === 401) {
                        logout();
                        navigate('/login');
                    } else if (error.response?.status === 403) {
                        navigate('/tickets');
                    } else {
                        setError('Gagal memuat data dashboard. Silakan coba lagi.');
                    }
                } else {
                    setError('Terjadi kesalahan. Silakan coba lagi nanti.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [navigate, isAdmin, logout]);

    const statusData = {
        labels: ['Tiket Baru', 'Sedang Diproses', 'Selesai'],
        datasets: [
            {
                data: [stats.open, stats.in_progress, stats.resolved],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(75, 192, 192, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };

    const resolutionTimeData = {
        labels: ['< 24 jam', '1-3 hari', '> 3 hari'],
        datasets: [
            {
                label: 'Waktu Penyelesaian',
                data: [
                    stats.averageResolutionTime < 24 ? stats.resolved : 0,
                    stats.averageResolutionTime >= 24 && stats.averageResolutionTime <= 72 ? stats.resolved : 0,
                    stats.averageResolutionTime > 72 ? stats.resolved : 0,
                ],
                backgroundColor: 'rgba(75, 192, 192, 0.8)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            },
        ],
    };

    const handleCardClick = (status: string) => {
        navigate(`/admin/tickets?status=${status}`);
    };

    if (!isAdmin) {
        return null;
    }

    return (
        <div className="container-fluid py-4">
            <h1 className="h3 mb-4">Dashboard</h1>
            
            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Memuat...</span>
                    </div>
                </div>
            ) : error ? (
                <div className="alert alert-danger" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {error}
                </div>
            ) : (
                <>
                    <div className="row g-4 mb-4">
                        <div className="col-md-4" onClick={() => handleCardClick('open')}>
                            <div className="card h-100 cursor-pointer hover-shadow">
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h6 className="card-subtitle mb-2 text-muted">Tiket Baru</h6>
                                            <h2 className="card-title mb-0 text-danger">{stats.open}</h2>
                                        </div>
                                        <div className="bg-danger bg-opacity-10 rounded-circle p-3">
                                            <i className="bi bi-exclamation-circle text-danger fs-4"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-4" onClick={() => handleCardClick('in_progress')}>
                            <div className="card h-100 cursor-pointer hover-shadow">
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h6 className="card-subtitle mb-2 text-muted">Sedang Diproses</h6>
                                            <h2 className="card-title mb-0 text-primary">{stats.in_progress}</h2>
                                        </div>
                                        <div className="bg-primary bg-opacity-10 rounded-circle p-3">
                                            <i className="bi bi-gear text-primary fs-4"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-4" onClick={() => handleCardClick('resolved')}>
                            <div className="card h-100 cursor-pointer hover-shadow">
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h6 className="card-subtitle mb-2 text-muted">Terselesaikan</h6>
                                            <h2 className="card-title mb-0 text-success">{stats.resolved}</h2>
                                        </div>
                                        <div className="bg-success bg-opacity-10 rounded-circle p-3">
                                            <i className="bi bi-check-circle text-success fs-4"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row g-4">
                        <div className="col-md-6">
                            <div className="card h-100">
                                <div className="card-body">
                                    <h5 className="card-title mb-4">Status Tiket</h5>
                                    <div style={{ height: '300px' }}>
                                        <Doughnut 
                                            data={statusData}
                                            options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                plugins: {
                                                    legend: {
                                                        position: 'bottom'
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-6">
                            <div className="card h-100">
                                <div className="card-body">
                                    <h5 className="card-title mb-4">Estimasi Penyelesaian</h5>
                                    <div style={{ height: '300px' }}>
                                        <Bar
                                            data={resolutionTimeData}
                                            options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                plugins: {
                                                    legend: {
                                                        display: false
                                                    }
                                                },
                                                scales: {
                                                    y: {
                                                        beginAtZero: true,
                                                        ticks: {
                                                            stepSize: 1
                                                        }
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Dashboard;
