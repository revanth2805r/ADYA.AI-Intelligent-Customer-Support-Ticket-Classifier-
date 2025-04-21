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
  const [activeFilter, setActiveFilter] = useState('status'); // 'status', 'type', 'priority'

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

  // Helper function to sort tickets - closed tickets last, others maintain current order
  const sortTicketsByStatus = (ticketsArray) => {
    return [...ticketsArray].sort((a, b) => {
      // If a is closed and b is not, a comes after b
      if (a.status === 'closed' && b.status !== 'closed') return 1;
      // If b is closed and a is not, b comes after a
      if (b.status === 'closed' && a.status !== 'closed') return -1;
      // Otherwise maintain current order
      return 0;
    });
  };

  // Filter tickets based on search term and active tab/filter
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      (ticket.subject && ticket.subject.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (ticket.status && ticket.status.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (ticket.type && ticket.type.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (activeFilter === 'status') {
      if (activeTab === 'all') return matchesSearch;
      return matchesSearch && ticket.status === activeTab;
    } 
    else if (activeFilter === 'type') {
      if (activeTab === 'all') return matchesSearch;
      return matchesSearch && ticket.type === activeTab;
    }
    else if (activeFilter === 'priority') {
      if (activeTab === 'all') return matchesSearch;
      // Convert both to numbers for comparison when filtering by priority
      const ticketPriority = typeof ticket.priority === 'string' ? parseInt(ticket.priority, 10) : ticket.priority;
      const tabPriority = parseInt(activeTab, 10);
      
      // Special case for priority level 3 (should be treated the same as level 2)
      if (tabPriority === 2) {
        return matchesSearch && (ticketPriority === 2 || ticketPriority === 3);
      }
      
      return matchesSearch && ticketPriority === tabPriority;
    }
    
    return matchesSearch;
  });

  // Apply sorting to filtered tickets
  const sortedFilteredTickets = sortTicketsByStatus(filteredTickets);

  // Group tickets by status
  const ticketsByStatus = {
    open: tickets.filter(ticket => ticket.status === 'open'),
    'in-progress': tickets.filter(ticket => ticket.status === 'in-progress'),
    resolved: tickets.filter(ticket => ticket.status === 'resolved'),
    closed: tickets.filter(ticket => ticket.status === 'closed')
  };

  // Get unique ticket types and create groups
  const uniqueTypes = [...new Set(tickets.filter(t => t.type).map(t => t.type))];
  const ticketsByType = {};
  uniqueTypes.forEach(type => {
    ticketsByType[type] = tickets.filter(ticket => ticket.type === type);
  });

  // Group tickets by priority - updated to handle all levels correctly
  const ticketsByPriority = {
    '0': tickets.filter(ticket => {
      const priority = typeof ticket.priority === 'string' ? parseInt(ticket.priority, 10) : ticket.priority;
      return priority === 0;
    }),
    '1': tickets.filter(ticket => {
      const priority = typeof ticket.priority === 'string' ? parseInt(ticket.priority, 10) : ticket.priority;
      return priority === 1;
    }),
    '2': tickets.filter(ticket => {
      const priority = typeof ticket.priority === 'string' ? parseInt(ticket.priority, 10) : ticket.priority;
      return priority === 2 || priority === 3; // Group priority 3 with 2 (both are "High")
    })
  };

  // Count tickets by category
  const ticketCounts = {
    status: {
      all: tickets.length,
      open: ticketsByStatus.open.length,
      'in-progress': ticketsByStatus['in-progress'].length,
      resolved: ticketsByStatus.resolved.length,
      closed: ticketsByStatus.closed.length
    },
    type: {
      all: tickets.length,
      ...Object.fromEntries(uniqueTypes.map(type => [type, ticketsByType[type].length]))
    },
    priority: {
      all: tickets.length,
      '0': ticketsByPriority['0'].length,
      '1': ticketsByPriority['1'].length,
      '2': ticketsByPriority['2'].length
    }
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

  // Get type display and color
  const getTypeInfo = (type) => {
    if (!type) return { display: 'Unknown', color: 'bg-gray-200 text-gray-800' };
    
    switch (type.toLowerCase()) {
      case 'technical': return { display: 'Technical', color: 'bg-purple-200 text-purple-800' };
      case 'billing': return { display: 'Billing', color: 'bg-yellow-200 text-yellow-800' };
      case 'feature': return { display: 'Feature Request', color: 'bg-indigo-200 text-indigo-800' };
      case 'general': return { display: 'General', color: 'bg-teal-200 text-teal-800' };
      default: return { display: type, color: 'bg-gray-200 text-gray-800' };
    }
  };

  // Get priority display name and color - updated to match TicketDetails
  const getPriorityInfo = (priority) => {
    if (priority === undefined || priority === null) {
      return { display: 'Unknown', color: 'bg-gray-200 text-gray-800' };
    }
    
    // Convert to number if it's a string
    const priorityNum = typeof priority === 'string' ? parseInt(priority, 10) : priority;
    
    switch (priorityNum) {
      case 0: return { display: 'Low', color: 'bg-green-500 text-white' };
      case 1: return { display: 'Medium', color: 'bg-orange-500 text-white' };
      case 2:
      case 3: return { display: 'High', color: 'bg-red-600 text-white' }; // Handle case 3 consistently
      default: return { display: 'Unknown', color: 'bg-gray-200 text-gray-800' };
    }
  };

  // Render a single ticket - updated for consistent priority display
  const renderTicket = (ticket) => {
    const typeInfo = getTypeInfo(ticket.type);
    const priorityInfo = getPriorityInfo(ticket.priority);
    const showPriority = ticket.status !== 'closed';
    const isCustomer = user?.role === 'customer';
    
    return (
      <li
        key={ticket._id}
        onClick={() => navigate(`/tickets/${ticket._id}`)}
        className="border rounded-lg shadow-sm hover:shadow-md p-4 mb-3 cursor-pointer hover:bg-gray-50 transition duration-200"
      >
        <div className="flex justify-between items-start">
          <h3 className="font-medium text-lg">{ticket.subject || 'No Subject'}</h3>
          <div className="flex gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
              {ticket.status}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${typeInfo.color}`}>
              {typeInfo.display}
            </span>
          </div>
        </div>
        
        {/* Only show "From:" if the user is not a customer */}
        {!isCustomer && (
          <p className="text-gray-700 my-2 line-clamp-2">From: {ticket.customerName}</p>
        )}
        
        <div className="flex justify-between text-sm mt-3">
          <span className="text-gray-600">
            Assigned: {ticket.assignedTo ? ticket.assignedTo.username : 'Unassigned'}
          </span>
          <div className="flex items-center">
            {/* Only show priority if ticket is not closed, updated with consistent styling */}
            {showPriority && (
              <span className={`mr-3 px-2 py-1 rounded-full text-xs font-medium ${priorityInfo.color}`}>
                {priorityInfo.display}
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
  };

  // Get tabs based on active filter
  const getTabs = () => {
    if (activeFilter === 'status') {
      return ["all", "open", "in-progress", "resolved", "closed"];
    } else if (activeFilter === 'type') {
      return ["all", ...uniqueTypes];
    } else if (activeFilter === 'priority') {
      return ["all", "0", "1", "2"]; // Only show 3 priority levels in tabs (3 grouped with 2)
    }
    return ["all"];
  };

  // Get display name for tab
  const getTabDisplay = (tab) => {
    if (tab === "all") return "All";
    if (activeFilter === 'status') return tab.charAt(0).toUpperCase() + tab.slice(1);
    if (activeFilter === 'type') return getTypeInfo(tab).display;
    if (activeFilter === 'priority') return getPriorityInfo(tab).display;
    return tab;
  }

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
              placeholder="Search tickets..."
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
              {/* View filters */}
              <div className="flex mb-4 border-b pb-4">
                <span className="mr-3 text-gray-700 font-medium">View by:</span>
                {['status', 'type', 'priority'].map(filter => (
                  <button 
                    key={filter}
                    className={`mr-4 pb-1 px-1 font-medium transition ${
                      activeFilter === filter 
                        ? 'text-indigo-600 border-b-2 border-indigo-600' 
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                    onClick={() => {
                      setActiveFilter(filter);
                      setActiveTab('all');
                    }}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>

              {/* Filter tabs */}
              <div className="flex overflow-x-auto pb-2 mb-4">
                {getTabs().map(tab => (
                  <button 
                    key={tab}
                    className={`whitespace-nowrap py-2 px-4 mr-2 rounded-lg font-medium transition ${
                      activeTab === tab 
                        ? 'bg-indigo-100 text-indigo-800 border-indigo-300 border' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {getTabDisplay(tab)}
                    <span className="ml-1 bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                      {ticketCounts[activeFilter][tab] || 0}
                    </span>
                  </button>
                ))}
              </div>

              {/* Ticket list */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">
                  {activeTab === 'all' 
                    ? 'All Tickets' 
                    : `${getTabDisplay(activeTab)} ${activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)}`}
                </h3>
                
                {/* Display sorted and filtered tickets */}
                {sortedFilteredTickets.length > 0 ? (
                  <ul className="space-y-2">
                    {sortedFilteredTickets.map(ticket => renderTicket(ticket))}
                  </ul>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="mt-2 text-lg font-medium">No tickets found</h3>
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