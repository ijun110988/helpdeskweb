import { Router } from 'express';
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware';
import {
    createTicket,
    getTickets,
    getTicketById,
    updateTicket,
    deleteTicket,
    getAllTickets,
    getTicketStats,
    assignTicket,
    updateTicketStatus,
    addComment,
    getTicketComments
} from '../controllers/ticket.controller';

const router = Router();

// Middleware autentikasi untuk semua rute
router.use(authMiddleware);

// Routes untuk user biasa
const userRouter = Router();
userRouter.post('/', createTicket as any);
userRouter.get('/tickets', getTickets as any);
userRouter.get('/:id', getTicketById as any);
userRouter.put('/:id', updateTicket as any);
userRouter.delete('/:id', deleteTicket as any);
userRouter.post('/:id/comments', addComment as any);
userRouter.get('/:id/comments', getTicketComments as any);

// Routes untuk stats yang bisa diakses oleh admin
router.get('/stats', adminMiddleware as any, getTicketStats as any);

// Routes untuk admin tickets
router.get('/admin', adminMiddleware as any, getAllTickets as any);

// Route untuk update status tiket
router.put('/:id/status', adminMiddleware as any, updateTicketStatus as any);

// Routes khusus admin
const adminRouter = Router();
adminRouter.use(adminMiddleware);
adminRouter.post('/:id/assign', assignTicket as any);

// Gabungkan semua rute
router.use('/', userRouter);
router.use('/admin', adminRouter);

export default router;
