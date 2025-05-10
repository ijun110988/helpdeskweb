import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface BottomNavigationProps {
    onLogout: () => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ onLogout }) => {
    const location = useLocation();
    const { isAdmin } = useAuth();

    return (
        <nav className="fixed-bottom bg-white border-top py-2">
            <div className="container">
                <div className="row text-center">
                    {isAdmin && (
                        <>
                            <div className="col">
                                <Link to="/dashboard" className={`text-decoration-none ${location.pathname === '/dashboard' ? 'text-primary' : 'text-muted'}`}>
                                    <i className="bi bi-speedometer2 d-block h4 mb-1"></i>
                                    <small>Dashboard</small>
                                </Link>
                            </div>
                            <div className="col">
                                <Link to="/admin/tickets" className={`text-decoration-none ${location.pathname === '/admin/tickets' ? 'text-primary' : 'text-muted'}`}>
                                    <i className="bi bi-list-check d-block h4 mb-1"></i>
                                    <small>Semua</small>
                                </Link>
                            </div>
                        </>
                    )}
                    <div className="col">
                        <Link to="/tickets" className={`text-decoration-none ${location.pathname === '/tickets' ? 'text-primary' : 'text-muted'}`}>
                            <i className="bi bi-ticket-detailed d-block h4 mb-1"></i>
                            <small>Tiket</small>
                        </Link>
                    </div>
                    <div className="col">
                        <Link to="/tickets/create" className={`text-decoration-none ${location.pathname === '/tickets/create' ? 'text-primary' : 'text-muted'}`}>
                            <i className="bi bi-plus-circle d-block h4 mb-1"></i>
                            <small>Buat</small>
                        </Link>
                    </div>
                    <div className="col">
                        <Link to="/profile" className={`text-decoration-none ${location.pathname === '/profile' ? 'text-primary' : 'text-muted'}`}>
                            <i className="bi bi-person d-block h4 mb-1"></i>
                            <small>Profil</small>
                        </Link>
                    </div>
                    <div className="col">
                        <button onClick={onLogout} className="btn btn-link text-decoration-none text-muted p-0">
                            <i className="bi bi-box-arrow-right d-block h4 mb-1"></i>
                            <small>Keluar</small>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default BottomNavigation;
