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
      setRating(ticket.rating); // Set the rating from the database
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

  // Function to generate stars based on rating
  const renderStars = (value) => {
    return `${value}/5 stars`;
  };

  // Check if user can submit rating (must be customer, ticket must be closed, no existing rating)
  const canSubmitRating = user?.role === 'customer' && status === 'closed' && ticket?.rating === undefined;

  return (
    <div className="p-6 max-w-xl mx-auto">
      <button
        onClick={() => navigate(-1)} 
        className="mb-4 text-blue-600 hover:text-blue-800"
      >
        &#8592; Back
      </button>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && ticket && (
        <>
          <h2 className="text-2xl font-bold mb-4">Ticket Details</h2>
          <p><strong>Message:</strong> {ticket.message}</p>

          {/* Display ticket creation and assignment info */}
          <p><strong>Created At:</strong> {new Date(ticket.createdAt).toLocaleString()}</p>
          {ticket.assignedTo && (
            <p><strong>Assigned To:</strong> {ticket.assignedTo.username}</p>
          )}
          {ticket.updatedAt && (
            <p><strong>Last Updated:</strong> {new Date(ticket.updatedAt).toLocaleString()}</p>
          )}

          <p><strong>Status:</strong>
            {user?.role === 'customer' || status === 'closed' ? (
              <span className="ml-2">{status}</span>
            ) : (
              <select value={status} onChange={(e) => handleStatusChange(e.target.value)} className="ml-2 p-2 border rounded">
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            )}
          </p>

          {/* Display messages */}
          <div className="mt-4">
            <h3 className="font-semibold">Messages</h3>
            <div className="bg-gray-100 p-4 rounded max-h-64 overflow-y-auto">
              {ticket.messages?.map((msg, i) => (
                <div key={i} className={`mb-2 p-2 rounded ${msg.sender === 'customer' ? 'bg-blue-100' : 'bg-green-100'}`}>
                  <p className="text-sm"><strong>{msg.sender}</strong>:</p>
                  <p>{msg.text}</p>
                </div>
              ))}
            </div>

            <div className="mt-2 flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 border p-2 rounded"
                placeholder="Type your message"
              />
              <button
                onClick={handleSendMessage}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Send
              </button>
            </div>
          </div>

          {/* Rating UI - Only show if user is customer and ticket is closed */}
          {user?.role === 'customer' && (
            <div className="mt-6 border-t pt-4">
              <h3 className="font-semibold mb-2">Customer Review</h3>

              {ticket.rating ? (
                // Show submitted rating
                <div className="flex items-center space-x-1 text-yellow-500">
                  <span className="text-gray-700">{renderStars(ticket.rating)}</span>
                </div>
              ) : status !== 'closed' ? (
                // Show message if ticket is not closed yet
                <p className="text-gray-600 italic">Rating can be submitted once the ticket is closed.</p>
              ) : (
                // Show rating form if ticket is closed and no rating submitted yet
                <>
                  <div className="flex items-center mb-2">
                    <label htmlFor="rating" className="mr-2 text-gray-700">Select Rating: </label>
                    <input
                      id="rating"
                      type="number"
                      value={rating || ''}
                      onChange={(e) => setRating(Number(e.target.value))}
                      min="1"
                      max="5"
                      className="w-12 p-2 border rounded text-center bg-white"
                      placeholder="Rate"
                    />
                    {rating !== null && (
                      <span className="ml-3 text-gray-700">
                        {renderStars(rating)}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={handleRatingSubmit}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    disabled={!rating || rating < 1 || rating > 5}
                  >
                    Submit Rating
                  </button>
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}