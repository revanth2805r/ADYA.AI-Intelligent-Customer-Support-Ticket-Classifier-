// src/components/TicketList.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTickets } from '../features/tickets/ticketThunks';
import { useAuth } from '../context/AuthContext';

const TicketList = () => {
    const dispatch = useDispatch();
    const { user } = useAuth();  // Get user from the auth context
    const { tickets, loading, error } = useSelector((state) => state.tickets);

    useEffect(() => {
        if (user) {
            dispatch(fetchTickets());  // Fetch tickets based on the user's role
        }
    }, [dispatch, user]);

    if (loading) return <div>Loading tickets...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <h2>Ticket List</h2>
            {tickets.length > 0 ? (
                <ul>
                    {tickets.map((ticket) => (
                        <li key={ticket._id}>
                            <h3>{ticket.customerName}</h3>
                            <p>{ticket.message}</p>
                            <p>Status: {ticket.status}</p>
                            <p>Assigned to: {ticket.assignedTo?.username || 'Unassigned'}</p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No tickets available</p>
            )}
        </div>
    );
};

export default TicketList;
