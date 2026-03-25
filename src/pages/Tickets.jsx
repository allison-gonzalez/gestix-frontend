import React, { useState, useEffect } from 'react';
import TicketList from '../components/tickets/TicketList';
import { ticketService } from '../services';

export default function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await ticketService.getAll();
      const data = Array.isArray(res.data) ? res.data : res.data.data || [];
      setTickets(data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Tickets</h1>
      </div>
      <div className="page-content">
        <TicketList tickets={tickets} loading={loading} onRefresh={fetchTickets} />
      </div>
    </div>
  );
}
