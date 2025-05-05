import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth';

export const getProfile = async (req: AuthRequest, res: Response) => {
    try {
        const userRepository = getRepository(User);
        const user = await userRepository.findOne({ 
            where: { id: req.user?.id },
            select: ['id', 'email', 'firstName', 'lastName', 'role', 'createdAt', 'updatedAt']
        });

        if (!user) {
            return res.status(404).json({ message: 'User tidak ditemukan' });
        }

        res.json(user);
    } catch (error) {
        console.error('Error getting profile:', error);
        res.status(500).json({ message: 'Terjadi kesalahan saat mengambil profil' });
    }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
    try {
        const { firstName, lastName } = req.body;
        const userRepository = getRepository(User);
        
        const user = await userRepository.findOne({ where: { id: req.user?.id } });
        if (!user) {
            return res.status(404).json({ message: 'User tidak ditemukan' });
        }

        user.firstName = firstName;
        user.lastName = lastName;
        
        await userRepository.save(user);
        
        res.json({
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Terjadi kesalahan saat memperbarui profil' });
    }
};
