import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import {
  fetchTickets,
  updateTicketStatus,
  addMessageToTicket,
  submitTicketRating,
} from '../features/tickets/ticketThunks';

export default function TicketDetails() {
  const { ticketId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { tickets, loading, error } = useSelector((state) => state.tickets);
  const { user } = useSelector((state) => state.auth);

  const [status, setStatus] = useState('');
  const [rating, setRating] = useState(null);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    dispatch(fetchTickets());
  }, [dispatch]);

  const ticket = tickets.find((ticket) => ticket._id === ticketId);

  useEffect(() => {
    if (ticket) {
      setStatus(ticket.status);
      setRating(ticket.rating);
    }
  }, [ticket]);

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    dispatch(updateTicketStatus(ticketId, newStatus));
  };

  const handleRatingSubmit = () => {
    if (rating !== null && rating >= 1 && rating <= 5) {
      dispatch(submitTicketRating(ticketId, rating));
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      dispatch(addMessageToTicket(ticketId, newMessage));
      setNewMessage('');
    }
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-red-200 text-red-800';
      case 'in-progress': return 'bg-blue-200 text-blue-800';
      case 'resolved': return 'bg-green-200 text-green-800';
      case 'closed': return 'bg-gray-200 text-gray-800';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  // Function to get priority label and color
  const getPriorityInfo = (priorityValue) => {
    // Handle string values by converting to number
    const priority = typeof priorityValue === 'string' ? parseInt(priorityValue, 10) : priorityValue;
    
    switch (priority) {
      case 0:
        return { label: 'Low', color: 'bg-green-500 text-white' };
      case 1:
        return { label: 'Medium', color: 'bg-orange-500 text-white' };
      case 2:
      case 3:
        return { label: 'High', color: 'bg-red-600 text-white' };
      default:
        return { label: 'Low', color: 'bg-green-500 text-white' };
    }
  };

  // Function to render stars for rating
  const renderStars = (value) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span 
          key={i} 
          className={`text-xl ${i <= value ? 'text-yellow-500' : 'text-gray-300'}`}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-indigo-600 hover:text-indigo-800 mb-6 transition"
      >
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Dashboard
      </button>

      {loading && (
        <div className="flex justify-center items-center p-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{error}</p>
        </div>
      )}

      {!loading && ticket && (
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          {/* Header with subject and status badges */}
          <div className="bg-indigo-50 border-b border-indigo-100 px-6 py-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h1 className="text-2xl font-bold text-indigo-900 break-words">
                {ticket.subject || "Ticket #" + ticket._id.substring(0, 8)}
              </h1>
              <div className="flex items-center gap-2 flex-shrink-0">
                {ticket.priority !== undefined && ticket.status !== 'closed' && (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityInfo(ticket.priority).color}`}>
                    {getPriorityInfo(ticket.priority).label}
                  </span>
                )}
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
                  {status}
                </span>
              </div>
            </div>
            <div className="mt-2 text-sm text-indigo-700">
              Ticket ID: {ticket._id}
            </div>
          </div>
          
          <div className="p-6">
            {/* Ticket Info */}
            <div className="space-y-4 mb-6">
              {/* <div className="border-b pb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Issue Details</h3>
                <p className="text-gray-700 whitespace-pre-line">{ticket.message}</p>
              </div> */}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Created</p>
                  <p className="font-medium">{new Date(ticket.createdAt).toLocaleString()}</p>
                </div>
                {ticket.assignedTo && (
                  <div>
                    <p className="text-gray-500">Assigned To</p>
                    <p className="font-medium">{ticket.assignedTo.username}</p>
                  </div>
                )}
                {ticket.updatedAt && (
                  <div>
                    <p className="text-gray-500">Last Updated</p>
                    <p className="font-medium">{new Date(ticket.updatedAt).toLocaleString()}</p>
                  </div>
                )}
                
                {/* Status selector for support/admin */}
                {user?.role !== 'customer' && status !== 'closed' && (
                  <div>
                    <p className="text-gray-500 mb-1">Update Status</p>
                    <select 
                      value={status} 
                      onChange={(e) => handleStatusChange(e.target.value)} 
                      className="w-full p-2 border rounded bg-white focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                    >
                      <option value="open">Open</option>
                      <option value="in-progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
            
            {/* Messages Section */}
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-3 text-indigo-800">Conversation</h3>
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 max-h-96 overflow-y-auto mb-4">
                {ticket.messages?.length > 0 ? (
                  ticket.messages.map((msg, i) => (
                    <div 
                      key={i} 
                      className={`mb-3 p-3 rounded-lg ${
                        msg.sender === 'customer' 
                          ? 'bg-indigo-50 border-l-4 border-indigo-400' 
                          : 'bg-green-50 border-l-4 border-green-400'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-xs font-medium text-gray-600">
                          {msg.sender === 'customer' ? 'You' : 'Support Team'}
                        </p>
                        {msg.timestamp && (
                          <p className="text-xs text-gray-500">
                            {new Date(msg.timestamp).toLocaleString()}
                          </p>
                        )}
                      </div>
                      <p className="text-gray-800 whitespace-pre-line">{msg.text}</p>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <svg className="w-12 h-12 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p className="text-gray-500">No messages yet</p>
                    <p className="text-sm text-gray-400">Start the conversation by typing below</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 border p-3 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500"
                  placeholder="Type your message"
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 flex items-center"
                  disabled={!newMessage.trim()}
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Send
                </button>
              </div>
            </div>

            {/* Rating Section - Only show if user is customer */}
            {user?.role === 'customer' && (
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h3 className="font-semibold text-lg mb-3 text-indigo-800">Customer Review</h3>

                {ticket.rating ? (
                  // Show submitted rating
                  <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                    <p className="text-sm text-indigo-600 mb-2">Your submitted rating:</p>
                    <div className="flex items-center space-x-1">
                      <div className="flex">{renderStars(ticket.rating)}</div>
                      <span className="ml-2 text-gray-600">({ticket.rating}/5)</span>
                    </div>
                    {ticket.ratingComment && (
                      <p className="mt-2 text-gray-700 italic">"{ticket.ratingComment}"</p>
                    )}
                  </div>
                ) : status !== 'closed' ? (
                  // Show message if ticket is not closed yet
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-indigo-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-gray-600 italic">Rating can be submitted once the ticket is closed.</p>
                    </div>
                  </div>
                ) : (
                  // Show rating form if ticket is closed and no rating submitted yet
                  <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-100">
                    <p className="mb-3 text-indigo-800">How would you rate our support?</p>
                    <div className="flex items-center mb-4">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className={`text-2xl focus:outline-none ${
                              rating && star <= rating ? 'text-yellow-500' : 'text-gray-300'
                            }`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                      {rating && <span className="ml-2 text-gray-600">({rating}/5)</span>}
                    </div>
                    <button
                      onClick={handleRatingSubmit}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                      disabled={!rating || rating < 1 || rating > 5}
                    >
                      Submit Rating
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}