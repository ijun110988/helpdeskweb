import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { User } from '../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const register = async (req: Request, res: Response) => {
    try {
        const { email, password, firstName, lastName, role } = req.body;
        const userRepository = getRepository(User);

        // Cek apakah email sudah terdaftar
        const existingUser = await userRepository.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'Email sudah terdaftar' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Buat user baru
        const user = userRepository.create({
            email,
            password: hashedPassword,
            firstName,
            lastName,
            role: role || 'user'
        });

        await userRepository.save(user);

        // Generate token
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, {
            expiresIn: process.env.JWT_EXPIRES_IN
        });

        res.status(201).json({
            message: 'Registrasi berhasil',
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role
            },
            token
        });
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan saat registrasi' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const userRepository = getRepository(User);

        // Cek user
        const user = await userRepository.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: 'Email atau password salah' });
        }

        // Verifikasi password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Email atau password salah' });
        }

        // Generate token
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, {
            expiresIn: process.env.JWT_EXPIRES_IN
        });

        res.json({
            message: 'Login berhasil',
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role
            },
            token
        });
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan saat login' });
    }
};
