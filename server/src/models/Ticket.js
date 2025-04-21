import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: { type: String, required: true }, // "customer" or "support"
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const ticketSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  subject: { type: String, required: true }, // Added subject field
  message: { type: String, required: true },
  type: { type: String, default: 'general' },
  priority: { type: Number, default: 3 },
  sentiment: { type: String, default: 'neutral' },
  status: { type: String, default: 'open' },
  rating: { type: Number },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  history: [{ action: String, date: { type: Date, default: Date.now } }],
  messages: [messageSchema],
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const Ticket = mongoose.model('Ticket', ticketSchema);

export default Ticket;