import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
    customerName: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String },
    priority: { type: Number },
    sentiment: { type: String },
    status: { type: String, default: 'open' },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    history: [
        { action: String, date: { type: Date, default: Date.now } }
    ],
}, { timestamps: true });

const Ticket = mongoose.model('Ticket', ticketSchema);

export default Ticket;
