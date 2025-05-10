import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
    onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onLogout }) => {
    const location = useLocation();
    const { isAdmin } = useAuth();

    return (
        <div className="d-flex flex-column h-100">
            <div className="p-3 border-bottom">
                <h5 className="mb-0">Help Desk</h5>
            </div>
            <nav className="nav flex-column p-3">
                {isAdmin && (
                    <>
                        <Link 
                            to="/dashboard" 
                            className={`nav-link mb-2 ${location.pathname === '/dashboard' ? 'active text-primary' : 'text-dark'}`}
                        >
                            <i className="bi bi-speedometer2 me-2"></i>
                            Dashboard
                        </Link>
                        <Link 
                            to="/admin/tickets" 
                            className={`nav-link mb-2 ${location.pathname === '/admin/tickets' ? 'active text-primary' : 'text-dark'}`}
                        >
                            <i className="bi bi-list-check me-2"></i>
                            Semua Tiket
                        </Link>
                    </>
                )}
                <Link 
                    to="/tickets" 
                    className={`nav-link mb-2 ${location.pathname === '/tickets' ? 'active text-primary' : 'text-dark'}`}
                >
                    <i className="bi bi-ticket-detailed me-2"></i>
                    Tiket Saya
                </Link>
                <Link 
                    to="/tickets/create" 
                    className={`nav-link mb-2 ${location.pathname === '/tickets/create' ? 'active text-primary' : 'text-dark'}`}
                >
                    <i className="bi bi-plus-circle me-2"></i>
                    Buat Tiket
                </Link>
                <Link 
                    to="/profile" 
                    className={`nav-link mb-2 ${location.pathname === '/profile' ? 'active text-primary' : 'text-dark'}`}
                >
                    <i className="bi bi-person me-2"></i>
                    Profil
                </Link>
            </nav>
            <div className="mt-auto p-3 border-top">
                <button 
                    onClick={onLogout}
                    className="btn btn-outline-danger w-100"
                >
                    <i className="bi bi-box-arrow-right me-2"></i>
                    Keluar
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
