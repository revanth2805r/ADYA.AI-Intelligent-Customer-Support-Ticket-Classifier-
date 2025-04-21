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
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

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

  // Get type display - using status color instead of custom type colors
  const getTypeInfo = (type, status) => {
    if (!type) return { display: 'Unknown', color: 'bg-gray-200 text-gray-800' };
    
    // Use the status color for the type badge
    const colorClass = status ? getStatusColor(status) : 'bg-gray-200 text-gray-800';
    
    switch (type.toLowerCase()) {
      case 'technical': return { display: 'Technical', color: colorClass };
      case 'billing': return { display: 'Billing', color: colorClass };
      case 'feature': return { display: 'Feature Request', color: colorClass };
      case 'general': return { display: 'General', color: colorClass };
      default: return { display: type, color: colorClass };
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

  // Get color for user role
  const getUserRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-600 text-white';
      case 'agent':
        return 'bg-blue-600 text-white';
      case 'customer':
        return 'bg-green-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  // Get first letter of first and last name for avatar
  const getInitials = (username) => {
    if (!username) return 'U';
    
    const names = username.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  // Render a single ticket as a card for grid view
  const renderTicketCard = (ticket) => {
    const typeInfo = getTypeInfo(ticket.type, ticket.status);
    const priorityInfo = getPriorityInfo(ticket.priority);
    const showPriority = ticket.status !== 'closed';
    const isCustomer = user?.role === 'customer';
    
    return (
      <div
        key={ticket._id}
        onClick={() => navigate(`/tickets/${ticket._id}`)}
        className="flex flex-col h-full border rounded-xl shadow-sm hover:shadow-md overflow-hidden cursor-pointer hover:border-indigo-300 transition duration-200 bg-white"
      >
        {/* Colored status bar at top */}
        <div className={`h-2 w-full ${getStatusColor(ticket.status).split(' ')[0]}`}></div>
        
        <div className="p-5 flex-grow flex flex-col">
          {/* Header with type badge */}
          <div className="flex justify-between items-start mb-3">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${typeInfo.color}`}>
              {typeInfo.display}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
              {ticket.status}
            </span>
          </div>
          
          {/* Ticket subject */}
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 flex-grow">{ticket.subject || 'No Subject'}</h3>
          
          {/* Customer info - only for non-customers */}
          {!isCustomer && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-1">
              From: {ticket.customerName}
            </p>
          )}
          
          {/* Bottom section with assignment and priority */}
          <div className="flex justify-between items-center mt-auto pt-3 border-t border-gray-100">
            <span className="text-gray-600 text-xs">
              {ticket.assignedTo ? ticket.assignedTo.username : 'Unassigned'}
            </span>
            <div className="flex items-center">
              {/* Only show priority if ticket is not closed */}
              {showPriority && (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityInfo.color}`}>
                  {priorityInfo.display}
                </span>
              )}
              {ticket.rating && (
                <span className="flex items-center text-yellow-500 ml-2 text-sm">
                  ★ {ticket.rating}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render a single ticket as a list item 
  const renderTicketListItem = (ticket) => {
    const typeInfo = getTypeInfo(ticket.type, ticket.status);
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
      <div className="bg-white rounded-xl shadow border border-gray-100">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 border-b">
          <div className="flex items-center space-x-3 mb-4 sm:mb-0">
            <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path>
            </svg>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Ticket Dashboard</h1>
          </div>
          
          {/* Enhanced User profile section */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            {/* User profile card - improved UI */}
            {user && (
              <div className="flex items-center bg-white border border-gray-200 rounded-lg shadow-sm p-2 sm:p-3 w-full sm:w-auto">
                <div className="flex-shrink-0">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-lg font-semibold ${getUserRoleColor(user.role)}`}>
                    {getInitials(user.username)}
                  </div>
                </div>
                
                <div className="ml-3 sm:ml-4">
                  <div className="font-semibold text-gray-900 text-base sm:text-lg">{user.username}</div>
                  <div className="flex items-center">
                    <span className={`mt-1 px-3 py-1 rounded-full text-xs font-medium capitalize ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                      user.role === 'agent' ? 'bg-blue-100 text-blue-800' : 
                      'bg-green-100 text-green-800'
                    }`}>
                      {user.role}
                    </span>
                    
                    {/* Display online status */}
                    {/* <div className="flex items-center ml-2 text-xs text-green-600">
                      <div className="h-2 w-2 rounded-full bg-green-500 mr-1"></div>
                      Online
                    </div> */}
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex gap-3 sm:ml-4 w-full sm:w-auto justify-center sm:justify-start">
              {user?.role === 'customer' && (
                <button
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center shadow-sm"
                  onClick={() => navigate('/tickets/new')}
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                  </svg>
                  New Ticket
                </button>
              )}
              <button
                className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-200 transition flex items-center"
                onClick={handleLogout}
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                </svg>
                Log Out
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Search and view toggle */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
            <div className="relative w-full sm:max-w-md">
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
            
            {/* View toggle buttons */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                className={`px-3 py-1.5 rounded-md flex items-center ${viewMode === 'grid' 
                  ? 'bg-white shadow-sm text-indigo-600' 
                  : 'text-gray-600 hover:text-gray-900'}`}
                onClick={() => setViewMode('grid')}
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                Grid
              </button>
              <button
                className={`px-3 py-1.5 rounded-md flex items-center ${viewMode === 'list' 
                  ? 'bg-white shadow-sm text-indigo-600' 
                  : 'text-gray-600 hover:text-gray-900'}`}
                onClick={() => setViewMode('list')}
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                List
              </button>
            </div>
          </div>

          {loading && (
            <div className="flex justify-center items-center p-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          )}
          
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded" role="alert">
              <div className="flex">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p>{error}</p>
              </div>
            </div>
          )}

          {!loading && !error && (
            <>
              {/* View filters */}
              <div className="flex flex-wrap mb-4 border-b pb-4">
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
              <div className="flex flex-wrap overflow-x-auto pb-2 mb-6">
                {getTabs().map(tab => (
                  <button 
                    key={tab}
                    className={`whitespace-nowrap py-2 px-4 mr-2 mb-2 rounded-lg font-medium transition ${
                      activeTab === tab 
                        ? 'bg-indigo-100 text-indigo-800 border-indigo-300 border' 
                        : 'text-gray-600 hover:bg-gray-100 border border-transparent'
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

              {/* Ticket list/grid section */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-6 text-gray-800">
                  {activeTab === 'all' 
                    ? 'All Tickets' 
                    : `${getTabDisplay(activeTab)} ${activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)}`}
                </h3>
                
                {/* Display sorted and filtered tickets in grid or list */}
                {sortedFilteredTickets.length > 0 ? (
                  viewMode === 'grid' ? (
                    // Grid view
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {sortedFilteredTickets.map(ticket => renderTicketCard(ticket))}
                    </div>
                  ) : (
                    // List view
                    <ul className="space-y-3">
                      {sortedFilteredTickets.map(ticket => renderTicketListItem(ticket))}
                    </ul>
                  )
                ) : (
                  <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
                    <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">No tickets found</h3>
                    <p className="mt-2 text-gray-500 max-w-md mx-auto">
                      Try adjusting your search or filter criteria to find what you're looking for
                    </p>
                    <button 
                      className="mt-4 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition"
                      onClick={() => {
                        setSearchTerm('');
                        setActiveTab('all');
                      }}
                    >
                      Reset filters
                    </button>
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