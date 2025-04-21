import Ticket from '../models/Ticket.js';
import User from '../models/User.js';

// Helper function to process ticket
const processTicket = async (message) => {
  // This is a simple implementation - in a real app, you might use ML/NLP here
  let type = 'general';
  let sentiment = 'neutral';
  let priority = 3;

  // Basic classification logic
  if (message.toLowerCase().includes('urgent') || message.toLowerCase().includes('emergency')) {
    priority = 1;
    type = 'urgent';
  } else if (message.toLowerCase().includes('bug') || message.toLowerCase().includes('error')) {
    priority = 2;
    type = 'technical';
  }

  // Basic sentiment analysis
  if (message.toLowerCase().includes('thank') || message.toLowerCase().includes('appreciate')) {
    sentiment = 'positive';
  } else if (message.toLowerCase().includes('disappointed') || message.toLowerCase().includes('unhappy')) {
    sentiment = 'negative';
  }

  return { type, sentiment, priority };
};

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

        // Process the ticket to determine type, sentiment, and priority
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

        const supportUsers = await User.find({ role: 'support' });
        if (supportUsers.length > 0) {
            const randomSupportUser = supportUsers[Math.floor(Math.random() * supportUsers.length)];
            ticket.assignedTo = randomSupportUser._id;
            ticket.history.push({ action: `Assigned to support user ${randomSupportUser.username}` });
        } else {
            ticket.history.push({ action: `No support users available for assignment` });
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
        const ticket = await Ticket.findById(ticketId);
        if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

        const sender = req.user.role === 'customer' ? 'customer' : 'support';

        ticket.messages.push({
            sender,
            text,
            timestamp: new Date(),
        });

        // Add history of message action
        ticket.history.push({ action: `${sender} sent a message` });

        await ticket.save();

        const populatedTicket = await Ticket.findById(ticket._id).populate('assignedTo');
        res.status(201).json(populatedTicket);
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
        const ticket = await Ticket.findById(ticketId);
        if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

        // Verify this ticket belongs to the current user
        if (ticket.customerName !== req.user.username) {
            return res.status(403).json({ message: 'You can only rate your own tickets' });
        }

        ticket.rating = rating;
        ticket.history.push({ action: `Customer submitted rating: ${rating}/5` });

        await ticket.save();
        res.json(ticket);
    } catch (error) {
        console.error('Error submitting rating:', error);
        res.status(500).json({ message: 'Server error' });
    }
};