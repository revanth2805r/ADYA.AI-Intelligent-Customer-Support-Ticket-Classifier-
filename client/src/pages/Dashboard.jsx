import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTickets } from '../features/tickets/ticketThunks';
import { login } from '../features/auth/authSlice';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { tickets, loading, error } = useSelector((state) => state.tickets);
  const { user } = useSelector((state) => state.auth);

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedUser !== 'undefined') {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser && storedToken) {
          dispatch(login({ user: parsedUser, token: storedToken }));
        }
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
      }
    }
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchTickets());
  }, [dispatch]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    dispatch(login({ user: null, token: null }));
    navigate('/');
  };

  // Filter tickets based on search term and active tab
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.status.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    return matchesSearch && ticket.status === activeTab;
  });

  // Group tickets by status
  const ticketsByStatus = {
    open: tickets.filter(ticket => ticket.status === 'open'),
    'in-progress': tickets.filter(ticket => ticket.status === 'in-progress'),
    resolved: tickets.filter(ticket => ticket.status === 'resolved'),
    closed: tickets.filter(ticket => ticket.status === 'closed')
  };

  // Count tickets by status
  const ticketCounts = {
    all: tickets.length,
    open: ticketsByStatus.open.length,
    'in-progress': ticketsByStatus['in-progress'].length,
    resolved: ticketsByStatus.resolved.length,
    closed: ticketsByStatus.closed.length
  };

  // Render a single ticket
  const renderTicket = (ticket) => (
    <li
      key={ticket._id}
      onClick={() => navigate(`/tickets/${ticket._id}`)}
      className="border-b pb-2 cursor-pointer hover:bg-gray-100 p-2 rounded transition"
    >
      <p><strong>{ticket.customerName}</strong> - {ticket.message}</p>
      <div className="flex justify-between mt-1">
        <span className={`px-2 py-1 rounded text-sm ${getStatusColor(ticket.status)}`}>
          {ticket.status}
        </span>
        <span>Priority: {ticket.priority || 'Not set'}</span>
      </div>
      <p className="text-sm text-gray-600">Assigned to: {ticket.assignedTo ? ticket.assignedTo.username : 'Unassigned'}</p>
      {ticket.rating && <p className="text-sm text-yellow-600">Rating: {ticket.rating}/5</p>}
    </li>
  );

  // Get color class based on status
  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <button
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          onClick={handleLogout}
        >
          Log Out
        </button>
      </div>

      {user?.role === 'customer' ? (
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={() => navigate('/tickets/new')}
        >
          Create Ticket
        </button>
      ) : (
        <p>You are not authorized to create a ticket.</p>
      )}

      <input
        type="text"
        placeholder="Search tickets by message or status..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full p-2 border rounded mt-4"
      />

      {loading && <p>Loading tickets...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
        <>
          {/* Status tabs */}
          <div className="flex border-b">
            <button 
              className={`py-2 px-4 ${activeTab === 'all' ? 'border-b-2 border-blue-500 font-medium' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All ({ticketCounts.all})
            </button>
            <button 
              className={`py-2 px-4 ${activeTab === 'open' ? 'border-b-2 border-blue-500 font-medium' : ''}`}
              onClick={() => setActiveTab('open')}
            >
              Open ({ticketCounts.open})
            </button>
            <button 
              className={`py-2 px-4 ${activeTab === 'in-progress' ? 'border-b-2 border-blue-500 font-medium' : ''}`}
              onClick={() => setActiveTab('in-progress')}
            >
              In Progress ({ticketCounts['in-progress']})
            </button>
            <button 
              className={`py-2 px-4 ${activeTab === 'resolved' ? 'border-b-2 border-blue-500 font-medium' : ''}`}
              onClick={() => setActiveTab('resolved')}
            >
              Resolved ({ticketCounts.resolved})
            </button>
            <button 
              className={`py-2 px-4 ${activeTab === 'closed' ? 'border-b-2 border-blue-500 font-medium' : ''}`}
              onClick={() => setActiveTab('closed')}
            >
              Closed ({ticketCounts.closed})
            </button>
          </div>

          {/* Ticket list */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h3 className="text-xl font-semibold mb-4">
              {activeTab === 'all' ? 'All Tickets' : `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Tickets`}
            </h3>
            
            {/* Display filtered tickets based on active tab */}
            {filteredTickets.length > 0 ? (
              <ul className="space-y-2">
                {filteredTickets.map(ticket => renderTicket(ticket))}
              </ul>
            ) : (
              <p>No {activeTab !== 'all' ? activeTab : ''} tickets found.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}