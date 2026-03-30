import React, { useState, useEffect } from 'react';
import { FaTicketAlt, FaClock, FaCheckCircle, FaLightbulb } from 'react-icons/fa';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { ticketService } from '../services';
import '../styles/Home.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Home() {
  const [stats, setStats] = useState({
    totalTickets: 0,
    ticketsAbiertos: 0,
    ticketsPendientes: 0,
    ticketsResueltos: 0,
    ticketsCerrados: 0,
    tiempoPromedio: 0,
    ticketsPorEstado: {},
  });
  const [loading, setLoading] = useState(true);

  const TICKETS_STORAGE_KEY = 'gestix_tickets';

  const loadStoredTickets = () => {
    try {
      const stored = localStorage.getItem(TICKETS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.warn('No se pudieron cargar tickets locales', error);
      return null;
    }
  };

  const mergeStoredTickets = (apiTickets = [], storedTickets = []) => {
    const apiIds = new Set(apiTickets.map((ticket) => ticket._id));
    const preserved = storedTickets.filter((ticket) => !apiIds.has(ticket._id));
    return [...apiTickets, ...preserved];
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const storedTickets = loadStoredTickets();
    try {
      setLoading(true);
      const ticketsRes = await ticketService.getAll();
      let tickets = Array.isArray(ticketsRes.data) ? ticketsRes.data : ticketsRes.data.data || [];
      if (storedTickets?.length) {
        tickets = mergeStoredTickets(tickets, storedTickets);
      }

      const totalTickets = tickets.length;
      const ticketsAbiertos = tickets.filter((t) => t.estado === 'abierto').length;
      const ticketsResueltos = tickets.filter((t) => t.estado === 'resuelto').length;
      const ticketsPendientes = tickets.filter((t) => t.estado === 'pendiente').length;
      const ticketsCerrados = tickets.filter((t) => t.estado === 'cerrado').length;

      const ticketsConResolucion = tickets.filter((t) => t.fecha_resolucion && t.fecha_creacion);
      let tiempoPromedio = 0;
      if (ticketsConResolucion.length > 0) {
        const totalDias = ticketsConResolucion.reduce((sum, t) => {
          const fechaCreacion = new Date(t.fecha_creacion);
          const fechaResolucion = new Date(t.fecha_resolucion);
          const dias = Math.ceil((fechaResolucion - fechaCreacion) / (1000 * 60 * 60 * 24));
          return sum + dias;
        }, 0);
        tiempoPromedio = Math.round(totalDias / ticketsConResolucion.length);
      }

      setStats({
        totalTickets,
        ticketsAbiertos,
        ticketsPendientes,
        ticketsResueltos,
        ticketsCerrados,
        tiempoPromedio,
        ticketsPorEstado: {
          abierto: ticketsAbiertos,
          pendiente: ticketsPendientes,
          resuelto: ticketsResueltos,
          cerrado: ticketsCerrados,
        },
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      if (storedTickets?.length) {
        const tickets = storedTickets;
        const totalTickets = tickets.length;
        const ticketsAbiertos = tickets.filter((t) => t.estado === 'abierto').length;
        const ticketsResueltos = tickets.filter((t) => t.estado === 'resuelto').length;
        const ticketsPendientes = tickets.filter((t) => t.estado === 'pendiente').length;
        const ticketsCerrados = tickets.filter((t) => t.estado === 'cerrado').length;
        const ticketsConResolucion = tickets.filter((t) => t.fecha_resolucion && t.fecha_creacion);
        let tiempoPromedio = 0;
        if (ticketsConResolucion.length > 0) {
          const totalDias = ticketsConResolucion.reduce((sum, t) => {
            const fechaCreacion = new Date(t.fecha_creacion);
            const fechaResolucion = new Date(t.fecha_resolucion);
            const dias = Math.ceil((fechaResolucion - fechaCreacion) / (1000 * 60 * 60 * 24));
            return sum + dias;
          }, 0);
          tiempoPromedio = Math.round(totalDias / ticketsConResolucion.length);
        }
        setStats({
          totalTickets,
          ticketsAbiertos,
          ticketsPendientes,
          ticketsResueltos,
          ticketsCerrados,
          tiempoPromedio,
          ticketsPorEstado: {
            abierto: ticketsAbiertos,
            pendiente: ticketsPendientes,
            resuelto: ticketsResueltos,
            cerrado: ticketsCerrados,
          },
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: ['Abiertos', 'Pendientes', 'Resueltos', 'Cerrados'],
    datasets: [
      {
        label: 'Cantidad de Tickets',
        data: [
          stats.ticketsPorEstado.abierto || 0,
          stats.ticketsPorEstado.pendiente || 0,
          stats.ticketsPorEstado.resuelto || 0,
          stats.ticketsPorEstado.cerrado || 0,
        ],
        backgroundColor: ['#5DADE2', '#F4D03F', '#58D68D', '#7F8C8D'],
        borderColor: ['#5DADE2', '#F4D03F', '#58D68D', '#7F8C8D'],
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'top' },
      title: { display: false },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
      </div>
      <div className="page-content">
        <div className="template-section">
          <h2 className="section-title">Plantillas de Ticket</h2>
          <div className="dashboard-grid">
            <div className="stat-card">
              <div className="stat-icon stat-icon-blue"><FaTicketAlt /></div>
              <div className="stat-content">
                <h3>TOTAL</h3>
                <p className="stat-number">{loading ? '-' : stats.totalTickets}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon stat-icon-yellow"><FaClock /></div>
              <div className="stat-content">
                <h3>ABIERTOS</h3>
                <p className="stat-number">{loading ? '-' : stats.ticketsAbiertos}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon stat-icon-purple"><FaLightbulb /></div>
              <div className="stat-content">
                <h3>PENDIENTES</h3>
                <p className="stat-number">{loading ? '-' : stats.ticketsPendientes}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon stat-icon-green"><FaCheckCircle /></div>
              <div className="stat-content">
                <h3>RESUELTOS</h3>
                <p className="stat-number">{loading ? '-' : stats.ticketsResueltos}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon stat-icon-gray"><FaTicketAlt /></div>
              <div className="stat-content">
                <h3>CERRADOS</h3>
                <p className="stat-number">{loading ? '-' : stats.ticketsCerrados}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="chart-section">
          <h2 className="chart-title">Tickets por Estado</h2>
          <div className="chart-container">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}
