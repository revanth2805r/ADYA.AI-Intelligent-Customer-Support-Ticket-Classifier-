import { createSlice } from '@reduxjs/toolkit';

const ticketSlice = createSlice({
  name: 'tickets',
  initialState: {
    tickets: [],
    loading: false,
    error: null,
  },
  reducers: {
    ticketStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    ticketSuccess: (state, action) => {
      state.loading = false;
      state.tickets = action.payload;
    },
    ticketCreated: (state, action) => {
      state.loading = false;
      state.tickets.push(action.payload); // Add the new ticket to the state
    },
    ticketUpdated: (state, action) => {
      state.loading = false;
      // Update the ticket in the state with the modified data (e.g., new messages)
      const updatedTicket = action.payload;
      const index = state.tickets.findIndex(ticket => ticket._id === updatedTicket._id);
      if (index !== -1) {
        state.tickets[index] = updatedTicket;
      } else {
        // If the ticket wasn't found in the state, add it (this could happen if it's a new ticket)
        state.tickets.push(updatedTicket);
      }
    },
    ticketFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { ticketStart, ticketSuccess, ticketCreated, ticketUpdated, ticketFail } = ticketSlice.actions;

export default ticketSlice.reducer;
