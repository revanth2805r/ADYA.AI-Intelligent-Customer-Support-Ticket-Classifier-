import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import TicketList from './pages/TicketList';
import TicketDetails from './pages/TicketDetails';
import TicketCreation from './pages/TicketCreation';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/tickets/new" element={<TicketCreation />} />
      <Route path="/tickets" element={<TicketList />} />
      <Route path="/tickets/:ticketId" element={<TicketDetails />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}

export default App;
