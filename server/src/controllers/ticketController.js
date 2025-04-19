import Ticket from '../models/Ticket.js';
import User from '../models/User.js';
import { processTicket } from '../services/ticketService.js';

// Create a new ticket (for customers only)
export const createTicket = async (req, res) => {
    if (req.user.role !== 'customer') {
        return res.status(403).json({ message: 'Only customers can create tickets' });
    }

    const { message } = req.body;

    try {
        const ticket = new Ticket({
            customerName: req.user.username,  // Automatically set from JWT
            message,
            user: req.user.userId             // Reference to user ID
        });

        // Run message through ML model
        const { type, sentiment, priority } = await processTicket(message);
        ticket.type = type;
        ticket.sentiment = sentiment;
        ticket.priority = priority;

        // Fetch a random user with role 'support'
        const supportUsers = await User.find({ role: 'support' });
        const randomSupportUser = supportUsers[Math.floor(Math.random() * supportUsers.length)];

        if (randomSupportUser) {
            ticket.assignedTo = randomSupportUser._id;
            ticket.history.push({ action: `Assigned to support user ${randomSupportUser.username}` });
        } else {
            return res.status(404).json({ message: 'No support users available' });
        }

        await ticket.save();

        // Populate the 'assignedTo' field with the user data before sending response
        const populatedTicket = await Ticket.findById(ticket._id).populate('assignedTo');
        
        res.status(201).json(populatedTicket); // Send the ticket with assigned user populated
    } catch (error) {
        console.error('Error creating ticket:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all tickets (support and admin roles only)
export const getTickets = async (req, res) => {
    if (req.user.role === 'customer') {
        return res.status(403).json({ message: 'Customers are not allowed to view all tickets' });
    }

    try {
        const tickets = await Ticket.find().populate('assignedTo');
        res.json(tickets);
    } catch (error) {
        console.error('Error fetching tickets:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update ticket status (support/admin only)
export const updateTicket = async (req, res) => {
    if (req.user.role === 'customer') {
        return res.status(403).json({ message: 'Customers cannot update tickets' });
    }

    const { ticketId } = req.params;
    const { status } = req.body;

    try {
        const ticket = await Ticket.findById(ticketId);
        if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

        ticket.status = status;
        ticket.history.push({ action: `Status updated to ${status}` });

        await ticket.save();
        res.json(ticket);
    } catch (error) {
        console.error('Error updating ticket:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Assign ticket to agent (admin/support only)
export const assignTicket = async (req, res) => {
    if (req.user.role === 'customer') {
        return res.status(403).json({ message: 'Customers cannot assign tickets' });
    }

    const { ticketId } = req.params;
    const { userId } = req.body;

    try {
        const ticket = await Ticket.findById(ticketId);
        if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

        ticket.assignedTo = userId;
        ticket.history.push({ action: `Assigned to user ${userId}` });

        await ticket.save();
        res.json(ticket);
    } catch (error) {
        console.error('Error assigning ticket:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
