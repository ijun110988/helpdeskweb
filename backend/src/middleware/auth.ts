import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getRepository } from 'typeorm';
import { User } from '../models/User';

export interface AuthRequest extends Request {
    user?: User;
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Token tidak ditemukan' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { id: number };
        const userRepository = getRepository(User);
        const user = await userRepository.findOne({ where: { id: decoded.id } });

        if (!user) {
            return res.status(401).json({ message: 'User tidak valid' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Auth error:', error);
        return res.status(401).json({ message: 'Token tidak valid' });
    }
};

export const isAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const userRepository = getRepository(User);
        const user = await userRepository.findOne({ where: { id: req.user.id } });

        if (!user || user.role !== 'admin') {
            console.log('Access denied for user:', {
                id: req.user.id,
                role: req.user.role,
                requiredRole: 'admin'
            });
            return res.status(403).json({ message: 'Forbidden: Admin access required' });
        }

        console.log('Admin access granted for user:', {
            id: user.id,
            email: user.email,
            role: user.role
        });

        next();
    } catch (error) {
        console.error('Admin check error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
