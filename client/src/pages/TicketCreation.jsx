import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createTicket } from '../features/tickets/ticketThunks';
import { useNavigate } from 'react-router-dom';

const TicketCreation = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticket, setTicket] = useState({
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTicket({ ...ticket, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!ticket.message.trim() || !ticket.subject.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      // Keep the structure consistent - don't change field names
      const newTicket = {
        subject: ticket.subject,
        message: ticket.message,
      };

      await dispatch(createTicket(newTicket));
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to create ticket:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-indigo-50 border-b border-indigo-100 px-6 py-5">
          <h2 className="text-2xl font-bold text-indigo-900">Create New Support Ticket</h2>
          <p className="text-indigo-700 mt-1">Our system will automatically categorize your ticket</p>
        </div>
        
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={ticket.subject}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                placeholder="Brief description of your issue"
                required
              />
            </div>
            
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                value={ticket.message}
                onChange={handleChange}
                rows="6"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                placeholder="Please provide detailed information about your issue"
                required
              ></textarea>
            </div>
            
            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 shadow-sm transition-colors"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </div>
                ) : (
                  'Submit Ticket'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TicketCreation;