import express from 'express';
import { createTicket, getTickets, updateTicket, assignTicket } from '../controllers/ticketController.js';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', authenticate, createTicket);  // Only customers can create tickets
router.get('/', authenticate, authorize(['admin', 'support']), getTickets);  // Only admin/support can view all tickets
router.put('/:ticketId', authenticate, authorize(['admin', 'support']), updateTicket);  // Only admin/support can update
router.put('/:ticketId/assign', authenticate, authorize(['admin', 'support']), assignTicket);  // Only admin/support can assign tickets

export default router;
