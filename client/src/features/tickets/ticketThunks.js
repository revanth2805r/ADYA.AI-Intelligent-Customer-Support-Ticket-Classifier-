import API from '../..';
import { ticketStart, ticketSuccess, ticketCreated, ticketFail, ticketUpdated } from './ticketSlice';

// Fetch tickets
export const fetchTickets = () => async (dispatch) => {
  try {
    dispatch(ticketStart());
    const res = await API.get('/tickets');
    dispatch(ticketSuccess(res.data));
  } catch (err) {
    dispatch(ticketFail(err.response?.data?.message || 'Failed to fetch tickets'));
  }
};

// Create a new ticket
export const createTicket = (ticketData) => async (dispatch) => {
  try {
    dispatch(ticketStart());
    const res = await API.post('/tickets', ticketData);
    dispatch(ticketCreated(res.data));
  } catch (err) {
    dispatch(ticketFail(err.response?.data?.message || 'Failed to create ticket'));
  }
};

// Update ticket status
export const updateTicketStatus = (ticketId, status) => async (dispatch) => {
  try {
    dispatch(ticketStart());
    const res = await API.put(`/tickets/${ticketId}`, { status });
    dispatch(ticketUpdated(res.data)); // Only update the modified ticket
  } catch (err) {
    dispatch(ticketFail(err.response?.data?.message || 'Failed to update ticket status'));
  }
};

// Add a message to a ticket
export const addMessageToTicket = (ticketId, messageData) => async (dispatch) => {
  try {
    dispatch(ticketStart());
    const res = await API.post(`/tickets/${ticketId}/messages`, { text: messageData });
    dispatch(ticketUpdated(res.data)); // Update ticket with the new message
  } catch (err) {
    dispatch(ticketFail(err.response?.data?.message || 'Failed to send message'));
  }
};

// Submit ticket rating
export const submitTicketRating = (ticketId, rating) => async (dispatch) => {
  try {
    dispatch(ticketStart());
    const res = await API.put(`/tickets/${ticketId}/rating`, { rating });
    dispatch(ticketUpdated(res.data)); // Update ticket with the rating
  } catch (err) {
    dispatch(ticketFail(err.response?.data?.message || 'Failed to submit ticket rating'));
  }
};