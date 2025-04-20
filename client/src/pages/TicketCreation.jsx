// src/components/TicketCreation.jsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createTicket } from '../features/tickets/ticketThunks';
import { useNavigate } from 'react-router-dom';

const TicketCreation = () => {
  const { user } = useSelector((state) => state.auth);
  const [message, setMessage] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      alert('Message cannot be empty!');
      return;
    }

    const newTicket = {
      message,
      userId: user._id,
    };

    await dispatch(createTicket(newTicket));
    setMessage('');
    navigate('/dashboard');
  };

  return (
    <div className="p-6 max-w-xl mx-auto bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Create New Ticket</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          className="w-full border rounded p-2"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Describe your issue..."
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create Ticket
        </button>
      </form>
    </div>
  );
};

export default TicketCreation;
