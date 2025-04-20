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

  // Get color class based on status
  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-red-200 text-red-800';
      case 'in-progress': return 'bg-blue-200 text-blue-800';
      case 'resolved': return 'bg-green-200 text-green-800';
      case 'closed': return 'bg-gray-200 text-gray-800';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  // Fixed priority color function to handle non-string or missing priority
  const getPriorityColor = (priority) => {
    if (!priority) return 'text-gray-600';
    
    // Convert to string if it's not already
    const priorityStr = String(priority).toLowerCase();
    
    switch (priorityStr) {
      case 'high': return 'text-red-600 font-medium';
      case 'medium': return 'text-orange-500';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  // Render a single ticket
  const renderTicket = (ticket) => (
    <li
      key={ticket._id}
      onClick={() => navigate(`/tickets/${ticket._id}`)}
      className="border rounded-lg shadow-sm hover:shadow-md p-4 mb-3 cursor-pointer hover:bg-gray-50 transition duration-200"
    >
      <div className="flex justify-between items-start">
        <h3 className="font-medium text-lg">{ticket.customerName}</h3>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
          {ticket.status}
        </span>
      </div>
      <p className="text-gray-700 my-2 line-clamp-2">{ticket.message}</p>
      <div className="flex justify-between text-sm mt-3">
        <span className="text-gray-600">
          Assigned: {ticket.assignedTo ? ticket.assignedTo.username : 'Unassigned'}
        </span>
        <div className="flex items-center">
          {ticket.priority && (
            <span className={`mr-3 ${getPriorityColor(ticket.priority)}`}>
              {ticket.priority}
            </span>
          )}
          {ticket.rating && (
            <span className="flex items-center text-yellow-500">
              ★ {ticket.rating}
            </span>
          )}
        </div>
      </div>
    </li>
  );

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center p-6 border-b">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex gap-3">
            {user?.role === 'customer' && (
              <button
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center"
                onClick={() => navigate('/tickets/new')}
              >
                <span className="mr-1">+</span> New Ticket
              </button>
            )}
            <button
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
              onClick={handleLogout}
            >
              Log Out
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="relative mb-6">
            <input
              type="text"
              placeholder="Search tickets by message or status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 pl-10 border rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition"
            />
            <svg 
              className="w-5 h-5 text-gray-500 absolute left-3 top-3.5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>

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

          {!loading && !error && (
            <>
              {/* Status tabs */}
              <div className="flex overflow-x-auto pb-2 mb-4">
                {["all", "open", "in-progress", "resolved", "closed"].map(tab => (
                  <button 
                    key={tab}
                    className={`whitespace-nowrap py-2 px-4 mr-2 rounded-lg font-medium transition ${
                      activeTab === tab 
                        ? 'bg-indigo-100 text-indigo-800 border-indigo-300 border' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab === "all" ? "All" : tab.charAt(0).toUpperCase() + tab.slice(1)} 
                    <span className="ml-1 bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                      {ticketCounts[tab]}
                    </span>
                  </button>
                ))}
              </div>

              {/* Ticket list */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">
                  {activeTab === 'all' ? 'All Tickets' : `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Tickets`}
                </h3>
                
                {/* Display filtered tickets based on active tab */}
                {filteredTickets.length > 0 ? (
                  <ul className="space-y-2">
                    {filteredTickets.map(ticket => renderTicket(ticket))}
                  </ul>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="mt-2 text-lg font-medium">No {activeTab !== 'all' ? activeTab : ''} tickets found</h3>
                    <p className="mt-1">Try adjusting your search or filter criteria</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}