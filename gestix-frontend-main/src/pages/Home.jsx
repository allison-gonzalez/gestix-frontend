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
    ticketsResueltos: 0,
    tiempoPromedio: 0,
    ticketsPorEstado: {},
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const ticketsRes = await ticketService.getAll();
      const tickets = Array.isArray(ticketsRes.data) ? ticketsRes.data : ticketsRes.data.data || [];

      const totalTickets = tickets.length;
      const ticketsAbiertos = tickets.filter((t) => t.estado === 'abierto').length;
      const ticketsResueltos = tickets.filter((t) => t.estado === 'resuelto').length;
      const ticketsPendientes = tickets.filter((t) => t.estado === 'pendiente').length;

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
        ticketsResueltos,
        tiempoPromedio,
        ticketsPorEstado: {
          abierto: ticketsAbiertos,
          pendiente: ticketsPendientes,
          resuelto: ticketsResueltos,
        },
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: ['Abiertos', 'Pendientes', 'Resueltos'],
    datasets: [
      {
        label: 'Cantidad de Tickets',
        data: [
          stats.ticketsPorEstado.abierto || 0,
          stats.ticketsPorEstado.pendiente || 0,
          stats.ticketsPorEstado.resuelto || 0,
        ],
        backgroundColor: ['#5DADE2', '#F4D03F', '#58D68D'],
        borderColor: ['#5DADE2', '#F4D03F', '#58D68D'],
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
        <div className="dashboard-grid">
          <div className="stat-card">
            <div className="stat-icon stat-icon-blue"><FaTicketAlt /></div>
            <div className="stat-content">
              <h3>TOTAL DE TICKETS</h3>
              <p className="stat-number">{loading ? '-' : stats.totalTickets}</p>
              <span className="stat-change">↑ 12% vs mes anterior</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-yellow"><FaClock /></div>
            <div className="stat-content">
              <h3>TICKETS ABIERTOS</h3>
              <p className="stat-number">{loading ? '-' : stats.ticketsAbiertos}</p>
              <span className="stat-change">↑ 8 nuevos hoy</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-green"><FaCheckCircle /></div>
            <div className="stat-content">
              <h3>TICKETS RESUELTOS</h3>
              <p className="stat-number">{loading ? '-' : stats.ticketsResueltos}</p>
              <span className="stat-change">↑ 18% vs mes anterior</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-purple"><FaLightbulb /></div>
            <div className="stat-content">
              <h3>TIEMPO PROMEDIO</h3>
              <p className="stat-number">{loading ? '-' : stats.tiempoPromedio}</p>
              <span className="stat-change">↑ 15% mejora</span>
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
