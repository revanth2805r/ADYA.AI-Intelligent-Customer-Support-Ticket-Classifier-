// src/controllers/ticketController.js
import Ticket from '../models/Ticket.js';
import User from '../models/User.js';
import { processTicket } from '../services/ticketService.js';

// Create a new ticket (for customers only)
export const createTicket = async (req, res) => {
    if (req.user.role !== 'customer') {
        return res.status(403).json({ message: 'Only customers can create tickets' });
    }

    const { message, subject } = req.body;

    if (!message || !subject) {
        return res.status(400).json({ message: 'Subject and message are required' });
    }

    try {
        const ticket = new Ticket({
            customerName: req.user.username,
            subject: subject,
            message: message,
            user: req.user._id
        });

        // Process the ticket using the ML model to determine type, sentiment, and priority
        const { type, sentiment, priority } = await processTicket(message);
        ticket.type = type;
        ticket.sentiment = sentiment;
        ticket.priority = priority;

        // Initial message is saved in the ticket
        ticket.messages.push({
            sender: 'customer',
            text: message,
            timestamp: new Date(),
        });

        // Add to ticket history
        ticket.history.push({ 
            action: `Ticket created with priority ${priority} and type ${type}`,
            date: new Date()
        });

        // Assign to support user
        const supportUsers = await User.find({ role: 'support' });
        if (supportUsers.length > 0) {
            const randomSupportUser = supportUsers[Math.floor(Math.random() * supportUsers.length)];
            ticket.assignedTo = randomSupportUser._id;
            ticket.history.push({ 
                action: `Assigned to support user ${randomSupportUser.username}`,
                date: new Date()
            });
        } else {
            ticket.history.push({ 
                action: `No support users available for assignment`,
                date: new Date()
            });
        }

        await ticket.save();

        const populatedTicket = await Ticket.findById(ticket._id).populate('assignedTo');
        res.status(201).json(populatedTicket);
    } catch (error) {
        console.error('Error creating ticket:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get all tickets (accessible based on user role)
export const getTickets = async (req, res) => {
    try {
        let tickets;

        if (req.user.role === 'admin') {
            tickets = await Ticket.find().populate('assignedTo');
        } else if (req.user.role === 'support') {
            tickets = await Ticket.find({
                $or: [
                    { assignedTo: req.user._id },
                    { customerName: req.user.username }
                ]
            }).populate('assignedTo');
        } else if (req.user.role === 'customer') {
            tickets = await Ticket.find({ customerName: req.user.username }).populate('assignedTo');
        } else {
            return res.status(403).json({ message: 'Access forbidden' });
        }

        res.json(tickets);
    } catch (error) {
        console.error('Error fetching tickets:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Add a message to a ticket (customer/support)
export const addMessageToTicket = async (req, res) => {
    const { ticketId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
        return res.status(400).json({ message: 'Message text cannot be empty' });
    }

    try {
        const sender = req.user.role === 'customer' ? 'customer' : 'support';
        
        // For customer messages, potentially update ticket sentiment
        let updateData = {
            $push: {
                messages: {
                    sender: sender,
                    text: text,
                    timestamp: new Date()
                },
                history: { 
                    action: `${sender} sent a message`,
                    date: new Date()
                }
            }
        };
        
        // If message is from customer, analyze sentiment and update ticket metrics
        if (sender === 'customer') {
            const { sentiment, priority } = await processTicket(text);
            
            // Only update if sentiment is more extreme or priority is higher
            const existingTicket = await Ticket.findById(ticketId);
            if (!existingTicket) {
                return res.status(404).json({ message: 'Ticket not found' });
            }
            
            // Update sentiment if it changed to positive or negative (from neutral)
            if ((existingTicket.sentiment === 'neutral' && sentiment !== 'neutral') || 
                sentiment === 'negative') {
                updateData.sentiment = sentiment;
                updateData.$push.history.action += ` (Sentiment updated to ${sentiment})`;
            }
            
            // Update priority if higher than current (lower number = higher priority)
            if (priority < existingTicket.priority) {
                updateData.priority = priority;
                updateData.$push.history.action += ` (Priority updated to ${priority})`;
            }
        }
        
        const updatedTicket = await Ticket.findByIdAndUpdate(
            ticketId,
            updateData,
            { new: true }
        ).populate('assignedTo');

        if (!updatedTicket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        res.status(201).json(updatedTicket);
    } catch (error) {
        console.error('Error adding message:', error);
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
        const updatedTicket = await Ticket.findByIdAndUpdate(
            ticketId,
            { 
                status: status, 
                $push: { 
                    history: { 
                        action: `Status updated to ${status}`,
                        date: new Date()
                    } 
                }
            },
            { new: true }
        );

        if (!updatedTicket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        res.json(updatedTicket);
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
        const updatedTicket = await Ticket.findByIdAndUpdate(
            ticketId,
            { 
                assignedTo: userId, 
                $push: { 
                    history: { 
                        action: `Assigned to support agent`,
                        date: new Date()
                    } 
                }
            },
            { new: true }
        ).populate('assignedTo');
        
        if (!updatedTicket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        res.json(updatedTicket);
    } catch (error) {
        console.error('Error assigning ticket:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Submit a rating for a ticket (customers only)
export const submitTicketRating = async (req, res) => {
    if (req.user.role !== 'customer') {
        return res.status(403).json({ message: 'Only customers can rate tickets' });
    }

    const { ticketId } = req.params;
    const { rating } = req.body;

    // Validate the rating
    if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    try {
        // Verify this ticket belongs to the current user
        const existingTicket = await Ticket.findById(ticketId);
        if (!existingTicket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }
        
        if (existingTicket.customerName !== req.user.username) {
            return res.status(403).json({ message: 'You can only rate your own tickets' });
        }
        
        const updatedTicket = await Ticket.findByIdAndUpdate(
            ticketId,
            { 
                rating: rating,
                $push: { 
                    history: { 
                        action: `Customer submitted rating: ${rating}/5`,
                        date: new Date()
                    } 
                }
            },
            { new: true }
        ).populate('assignedTo');

        res.json(updatedTicket);
    } catch (error) {
        console.error('Error submitting rating:', error);
        res.status(500).json({ message: 'Server error' });
    }
};