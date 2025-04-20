import express from 'express';
import { 
    createTicket, 
    getTickets, 
    updateTicket, 
    assignTicket, 
    addMessageToTicket,
    submitTicketRating
} from '../controllers/ticketController.js';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Only customers can create tickets
router.post('/', authenticate, createTicket);

// Admin and support can view tickets, support can only see their tickets or those they created
router.get('/', authenticate, getTickets);

// Admin and support can update tickets
router.put('/:ticketId', authenticate, authorize(['admin', 'support']), updateTicket);

// Admin and support can assign tickets
router.put('/:ticketId/assign', authenticate, authorize(['admin', 'support']), assignTicket);

// Add a message to a ticket
router.post('/:ticketId/messages', authenticate, addMessageToTicket);

// Submit a rating for a ticket (customers only)
router.put('/:ticketId/rating', authenticate, submitTicketRating);

export default router;