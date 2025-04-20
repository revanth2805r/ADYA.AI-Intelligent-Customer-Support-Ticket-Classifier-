import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: { type: String, required: true }, // "customer" or "support"
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const ticketSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String },
  priority: { type: Number },
  sentiment: { type: String },
  status: { type: String, default: 'open' },
  rating: { type: Number },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  history: [{ action: String, date: { type: Date, default: Date.now } }],
  messages: [messageSchema],
}, { timestamps: true });

const Ticket = mongoose.model('Ticket', ticketSchema);

export default Ticket;