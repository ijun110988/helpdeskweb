import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNavigation from './BottomNavigation';
import { useAuth } from '../../context/AuthContext';

const Layout = () => {
    const navigate = useNavigate();
    const { logout, isAdmin } = useAuth();
    
    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="app-container">
            <div className="d-flex flex-column flex-lg-row min-vh-100">
                <div className="sidebar-container d-none d-lg-block bg-light border-end" style={{ width: '250px', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }}>
                    <Sidebar onLogout={handleLogout} />
                </div>
                <div className="main-content flex-grow-1 p-3 p-lg-4 overflow-auto">
                    <Outlet />
                </div>
            </div>
            <div className="d-block d-lg-none">
                <BottomNavigation onLogout={handleLogout} />
            </div>
        </div>
    );
};

export default Layout;
