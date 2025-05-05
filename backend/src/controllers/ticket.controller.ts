import { Response } from 'express';
import { getRepository } from 'typeorm';
import { Ticket } from '../models/Ticket';
import { TicketComment } from '../models/TicketComment';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth.middleware';

export const createTicket = async (req: AuthRequest, res: Response) => {
    try {
        const { title, description, priority } = req.body;
        const ticketRepository = getRepository(Ticket);

        const ticket = ticketRepository.create({
            title,
            description,
            priority,
            user: req.user
        });

        await ticketRepository.save(ticket);
        res.status(201).json({ message: 'Tiket berhasil dibuat', ticket });
    } catch (error) {
        console.error('Error creating ticket:', error);
        res.status(500).json({ message: 'Terjadi kesalahan saat membuat tiket' });
    }
};

export const getAllTickets = async (req: AuthRequest, res: Response) => {
    try {
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ message: 'Akses ditolak' });
        }

        const { status, priority, search } = req.query;
        const ticketRepository = getRepository(Ticket);
        
        // Membuat query builder
        const queryBuilder = ticketRepository
            .createQueryBuilder('ticket')
            .leftJoinAndSelect('ticket.user', 'user')
            .leftJoinAndSelect('ticket.assignedTo', 'assignedTo')
            .orderBy('ticket.createdAt', 'DESC');

        // Menambahkan filter status jika ada
        if (status) {
            queryBuilder.andWhere('ticket.status = :status', { status });
        }

        // Menambahkan filter prioritas jika ada
        if (priority) {
            queryBuilder.andWhere('ticket.priority = :priority', { priority });
        }

        // Menambahkan pencarian jika ada
        if (search) {
            const searchTerm = `%${search}%`;
            queryBuilder.andWhere(
                '(ticket.title LIKE :searchTerm OR user.firstName LIKE :searchTerm OR user.lastName LIKE :searchTerm OR CONCAT(user.firstName, " ", user.lastName) LIKE :searchTerm)',
                { searchTerm }
            );
        }

        const tickets = await queryBuilder.getMany();

        // Format response untuk menghindari circular JSON
        const formattedTickets = tickets.map(ticket => ({
            id: ticket.id,
            title: ticket.title,
            description: ticket.description,
            status: ticket.status,
            priority: ticket.priority,
            createdAt: ticket.createdAt,
            updatedAt: ticket.updatedAt,
            user: ticket.user ? {
                id: ticket.user.id,
                firstName: ticket.user.firstName,
                lastName: ticket.user.lastName,
                email: ticket.user.email
            } : null,
            assignedTo: ticket.assignedTo ? {
                id: ticket.assignedTo.id,
                firstName: ticket.assignedTo.firstName,
                lastName: ticket.assignedTo.lastName,
                email: ticket.assignedTo.email
            } : null,
            lastComment: ticket.lastComment // Menambahkan lastComment ke response
        }));


        res.json(formattedTickets);
    } catch (error) {
        console.error('Error getting all tickets:', error);
        res.status(500).json({ 
            message: 'Terjadi kesalahan saat mengambil tiket',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

export const getTickets = async (req: AuthRequest, res: Response) => {
    try {
        const ticketRepository = getRepository(Ticket);
        const tickets = await ticketRepository.find({
            where: { user: { id: req.user?.id } },
            relations: ['user', 'assignedTo'],
            order: { createdAt: 'DESC' }
        });
        res.json(tickets);
    } catch (error) {
        console.error('Error getting tickets:', error);
        res.status(500).json({ message: 'Terjadi kesalahan saat mengambil tiket' });
    }
};

export const getTicketById = async (req: AuthRequest, res: Response) => {
    try {
        const ticketRepository = getRepository(Ticket);
        const ticket = await ticketRepository.findOne({
            where: { id: parseInt(req.params.id) },
            relations: ['user', 'assignedTo']
        });

        if (!ticket) {
            return res.status(404).json({ message: 'Tiket tidak ditemukan' });
        }

        // Pastikan user hanya bisa melihat tiketnya sendiri
        if (!req.user?.isAdmin && ticket.user.id !== req.user?.id) {
            return res.status(403).json({ message: 'Tidak diizinkan melihat tiket ini' });
        }

        res.json(ticket);
    } catch (error) {
        console.error('Error getting ticket:', error);
        res.status(500).json({ message: 'Terjadi kesalahan saat mengambil tiket' });
    }
};

export const updateTicket = async (req: AuthRequest, res: Response) => {
    try {
        const { title, description, priority } = req.body;
        const ticketRepository = getRepository(Ticket);
        
        const ticket = await ticketRepository.findOne({
            where: { id: parseInt(req.params.id) },
            relations: ['user']
        });

        if (!ticket) {
            return res.status(404).json({ message: 'Tiket tidak ditemukan' });
        }

        // Pastikan user hanya bisa update tiketnya sendiri
        if (!req.user?.isAdmin && ticket.user.id !== req.user?.id) {
            return res.status(403).json({ message: 'Tidak diizinkan mengubah tiket ini' });
        }

        ticket.title = title;
        ticket.description = description;
        ticket.priority = priority;

        await ticketRepository.save(ticket);
        res.json(ticket);
    } catch (error) {
        console.error('Error updating ticket:', error);
        res.status(500).json({ message: 'Terjadi kesalahan saat memperbarui tiket' });
    }
};

export const deleteTicket = async (req: AuthRequest, res: Response) => {
    try {
        const ticketRepository = getRepository(Ticket);
        const ticket = await ticketRepository.findOne({
            where: { id: parseInt(req.params.id) },
            relations: ['user']
        });

        if (!ticket) {
            return res.status(404).json({ message: 'Tiket tidak ditemukan' });
        }

        // Pastikan user hanya bisa hapus tiketnya sendiri
        if (!req.user?.isAdmin && ticket.user.id !== req.user?.id) {
            return res.status(403).json({ message: 'Tidak diizinkan menghapus tiket ini' });
        }

        await ticketRepository.remove(ticket);
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting ticket:', error);
        res.status(500).json({ message: 'Terjadi kesalahan saat menghapus tiket' });
    }
};

export const assignTicket = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user?.isAdmin) {
            return res.status(403).json({ message: 'Akses ditolak' });
        }

        const { agentId } = req.body;
        const ticketRepository = getRepository(Ticket);
        const userRepository = getRepository(User);

        const ticket = await ticketRepository.findOne({
            where: { id: parseInt(req.params.id) },
            relations: ['assignedTo']
        });

        if (!ticket) {
            return res.status(404).json({ message: 'Tiket tidak ditemukan' });
        }

        const agent = await userRepository.findOne({ where: { id: agentId } });
        if (!agent) {
            return res.status(404).json({ message: 'Agent tidak ditemukan' });
        }

        ticket.assignedTo = agent;
        await ticketRepository.save(ticket);
        res.json(ticket);
    } catch (error) {
        console.error('Error assigning ticket:', error);
        res.status(500).json({ message: 'Terjadi kesalahan saat mengassign tiket' });
    }
};

export const updateTicketStatus = async (req: AuthRequest, res: Response) => {
    try {
        
        const ticketRepository = getRepository(Ticket);
        
        if (!req.body.status) {
            return res.status(400).json({ message: 'Status tidak boleh kosong' });
        }

        const ticket = await ticketRepository.findOne({
            where: { id: parseInt(req.params.id) }
        });

        if (!ticket) {
            return res.status(404).json({ message: 'Tiket tidak ditemukan' });
        }

        ticket.status = req.body.status;
        await ticketRepository.save(ticket);
        debugger;
        console.log('Ticket saved:', ticket);
        res.json(ticket);
    } catch (error) {
        console.error('Error updating ticket status:', error);
        res.status(500).json({ message: 'Terjadi kesalahan saat memperbarui status tiket' });
    }
};

export const addComment = async (req: AuthRequest, res: Response) => {
    try {
        const ticketId = parseInt(req.params.id);
        const { comment } = req.body;
        const ticketRepository = getRepository(Ticket);
        const commentRepository = getRepository(TicketComment);
        const userRepository = getRepository(User);

        // Cari tiket beserta relasinya
        const ticket = await ticketRepository.findOne({ 
            where: { id: ticketId },
            relations: ['user', 'assignedTo']
        });
        
        if (!ticket) {
            return res.status(404).json({ message: 'Tiket tidak ditemukan' });
        }

        // Pastikan req.user ada
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // Dapatkan user yang akan membuat komentar
        const user = await userRepository.findOne({ where: { id: req.user.id } });
        if (!user) {
            return res.status(404).json({ message: 'User tidak ditemukan' });
        }

        // Cek apakah komentar ini berasal dari update status
        const isFromStatusUpdate = req.headers['x-comment-source'] === 'update-status';
        
        // Jika komentar dari update status, cek dulu apakah sudah ada komentar yang sama
        if (isFromStatusUpdate) {
            const existingComment = await commentRepository.findOne({
                where: {
                    ticket: { id: ticketId },
                    comment: comment,
                    user: { id: req.user.id }
                },
                order: { createdAt: 'DESC' }
            });

            if (existingComment) {
                console.log('Komentar duplikat dari update status, melewatkan penyimpanan');
                return res.status(200).json({ 
                    message: 'Komentar sudah ada', 
                    comment: existingComment,
                    isDuplicate: true
                });
            }
        }

        // Buat komentar baru
        const newComment = new TicketComment();
        newComment.comment = comment;
        newComment.ticket = ticket;
        newComment.user = user;
        newComment.createdAt = new Date();

        // Simpan komentar
        await commentRepository.save(newComment);
        
        // Load relasi user untuk response
        await commentRepository
            .createQueryBuilder()
            .relation(TicketComment, 'user')
            .of(newComment)
            .loadOne();
        
        console.log('Komentar baru disimpan:', { 
            id: newComment.id, 
            comment: newComment.comment,
            source: isFromStatusUpdate ? 'update-status' : 'regular'
        });
        
        res.status(201).json({ 
            message: 'Komentar berhasil ditambahkan', 
            comment: newComment,
            isDuplicate: false
        });
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ message: 'Terjadi kesalahan saat menambahkan komentar' });
    }
};

export const getTicketComments = async (req: AuthRequest, res: Response) => {
    try {
        const commentRepository = getRepository(TicketComment);

        const comments = await commentRepository.find({
            where: { ticket: { id: parseInt(req.params.id) } },
            relations: ['user'],
            order: { createdAt: 'DESC' }
        });

        res.json(comments);
    } catch (error) {
        console.error('Error getting ticket comments:', error);
        res.status(500).json({ message: 'Terjadi kesalahan saat mengambil komentar' });
    }
};

interface TicketStats {
    open: number;
    in_progress: number;
    resolved: number;
    averageResolutionTime: number;
}

export const getTicketStats = async (req: AuthRequest, res: Response) => {
    try {
        const ticketRepository = getRepository(Ticket);

        // Inisialisasi statistik default
        const stats: TicketStats = {
            open: 0,
            in_progress: 0,
            resolved: 0,
            averageResolutionTime: 0
        };

        // Hitung jumlah tiket per status
        const statusCounts = await ticketRepository
            .createQueryBuilder('ticket')
            .select('ticket.status', 'status')
            .addSelect('COUNT(*)', 'count')
            .groupBy('ticket.status')
            .getRawMany();

        // Update statistik berdasarkan hasil query
        statusCounts.forEach((item: { status: string; count: string }) => {
            const statusKey = item.status as keyof TicketStats;
            if (statusKey in stats) {
                stats[statusKey] = parseInt(item.count, 10) || 0;
            }
        });

        // Hitung rata-rata waktu penyelesaian untuk tiket yang resolved
        const resolvedTickets = await ticketRepository
            .createQueryBuilder('ticket')
            .where('ticket.status = :status', { status: 'resolved' })
            .getMany();

        let totalResolutionTime = 0;
        let resolvedCount = 0;

        resolvedTickets.forEach(ticket => {
            try {
                if (ticket.createdAt && ticket.updatedAt) {
                    const createdAt = new Date(ticket.createdAt);
                    const updatedAt = new Date(ticket.updatedAt);
                    const resolutionTime = (updatedAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60); // dalam jam
                    totalResolutionTime += resolutionTime;
                    resolvedCount++;
                }
            } catch (error) {
                console.error('Error calculating resolution time for ticket:', ticket.id, error);
            }
        });

        stats.averageResolutionTime = resolvedCount > 0 ? parseFloat((totalResolutionTime / resolvedCount).toFixed(2)) : 0;

        res.json(stats);
    } catch (error) {
        console.error('Error getting ticket stats:', error);
        res.status(500).json({ 
            message: 'Terjadi kesalahan saat mengambil statistik tiket',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
