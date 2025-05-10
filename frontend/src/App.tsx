import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './pages/Dashboard';
import TicketList from './components/ticket/TicketList';
import TicketDetail from './components/ticket/TicketDetail';
import TicketCreate from './components/ticket/TicketCreate';
import AdminTickets from './components/admin/AdminTickets';
import Profile from './pages/Profile';
import { AuthProvider, useAuth } from './context/AuthContext';

const AppRoutes = () => {
    const { isAuthenticated, isAdmin } = useAuth();

    const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
        return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
    };

    const AdminRoute = ({ children }: { children: React.ReactNode }) => {
        return isAuthenticated && isAdmin ? <>{children}</> : <Navigate to="/tickets" />;
    };

    return (
        <Routes>
            <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
            <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />
            
            <Route element={
                <PrivateRoute>
                    <Layout />
                </PrivateRoute>
            }>
                <Route path="/" element={isAdmin ? <Navigate to="/dashboard" /> : <Navigate to="/tickets" />} />
                <Route path="/dashboard" element={
                    <AdminRoute>
                        <Dashboard />
                    </AdminRoute>
                } />
                <Route path="/tickets" element={<TicketList />} />
                <Route path="/tickets/create" element={<TicketCreate />} />
                <Route path="/tickets/:id" element={<TicketDetail />} />
                <Route path="/admin/tickets" element={
                    <AdminRoute>
                        <AdminTickets />
                    </AdminRoute>
                } />
                <Route path="/profile" element={<Profile />} />
            </Route>
        </Routes>
    );
};

const App = () => {
    return (
        <AuthProvider>
            <Router>
                <AppRoutes />
            </Router>
        </AuthProvider>
    );
};

export default App;
