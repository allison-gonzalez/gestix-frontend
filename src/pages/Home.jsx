import React, { useState, useEffect } from 'react';
import { FaTicketAlt, FaClock, FaCheckCircle, FaLightbulb, FaExclamationCircle, FaTimes } from 'react-icons/fa';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { ticketService } from '../services';
import '../styles/Home.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels);

export default function Home() {
  const [stats, setStats] = useState({
    totalTickets: 0,
    ticketsAbiertos: 0,
    ticketsResueltos: 0,
    tiempoPromedio: 0,
    ticketsPorEstado: {},
    cambioTotalMes: 0,
    ticketsHoy: 0,
    cambioResoltosMes: 0,
    cambioTiempoPromedio: 0,
  });

  const [loading, setLoading] = useState(true);

  const [filtros, setFiltros] = useState({
    rango: 'mes',
    prioridad: 'todas',
    estado: 'todos',
  });

  useEffect(() => {
    fetchStats();
  }, [filtros]);

  const getDateRange = () => {
    const ahora = new Date();
    let fechaInicio = new Date();

    switch (filtros.rango) {
      case 'semana':
        fechaInicio.setDate(ahora.getDate() - 7);
        break;
      case 'mes':
        fechaInicio.setMonth(ahora.getMonth() - 1);
        break;
      case 'trimestre':
        fechaInicio.setMonth(ahora.getMonth() - 3);
        break;
      case 'year':
        fechaInicio.setFullYear(ahora.getFullYear() - 1);
        break;
      default:
        fechaInicio.setMonth(ahora.getMonth() - 1);
    }

    return { fechaInicio, ahora };
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      const ticketsRes = await ticketService.getAll();
      let tickets = Array.isArray(ticketsRes.data) ? ticketsRes.data : ticketsRes.data.data || [];

      const { fechaInicio, ahora } = getDateRange();

      tickets = tickets.filter((t) => {
        const fechaCreacion = new Date(t.fecha_creacion);
        const estaEnRango = fechaCreacion >= fechaInicio && fechaCreacion <= ahora;
        const tienePrioridad = filtros.prioridad === 'todas' || t.prioridad === filtros.prioridad;
        const tieneEstado = filtros.estado === 'todos' || t.estado === filtros.estado;

        return estaEnRango && tienePrioridad && tieneEstado;
      });

      const totalTickets = tickets.length;
      const ticketsAbiertos = tickets.filter((t) => t.estado === 'abierto').length;
      const ticketsResueltos = tickets.filter((t) => t.estado === 'resuelto').length;
      const ticketsPendientes = tickets.filter((t) => t.estado === 'pendiente').length;

      const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());

      const ticketsHoy = tickets.filter((t) => {
        const fecha = new Date(t.fecha_creacion);
        const f = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
        return f.getTime() === hoy.getTime();
      }).length;

      const hace30 = new Date(ahora.getFullYear(), ahora.getMonth() - 1, ahora.getDate());
      const hace60 = new Date(ahora.getFullYear(), ahora.getMonth() - 2, ahora.getDate());

      const actuales = tickets.filter(t => new Date(t.fecha_creacion) >= hace30);
      const anteriores = tickets.filter(t => {
        const f = new Date(t.fecha_creacion);
        return f >= hace60 && f < hace30;
      });

      const cambioTotalMes = anteriores.length > 0
        ? Math.round(((actuales.length - anteriores.length) / anteriores.length) * 100)
        : 0;

      const resueltosActual = tickets.filter(t => t.estado === 'resuelto' && new Date(t.fecha_resolucion) >= hace30).length;
      const resueltosAnterior = tickets.filter(t => {
        const f = new Date(t.fecha_resolucion);
        return t.estado === 'resuelto' && f >= hace60 && f < hace30;
      }).length;

      const cambioResoltosMes = resueltosAnterior > 0
        ? Math.round(((resueltosActual - resueltosAnterior) / resueltosAnterior) * 100)
        : 0;

      const ticketsConResolucion = tickets.filter(t => t.fecha_creacion && t.fecha_resolucion);

      let tiempoPromedio = 0;
      if (ticketsConResolucion.length > 0) {
        const total = ticketsConResolucion.reduce((sum, t) => {
          return sum + Math.ceil((new Date(t.fecha_resolucion) - new Date(t.fecha_creacion)) / 86400000);
        }, 0);
        tiempoPromedio = Math.round(total / ticketsConResolucion.length);
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
        cambioTotalMes,
        ticketsHoy,
        cambioResoltosMes,
        cambioTiempoPromedio: 0,
      });

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getChangeText = (v) => {
    if (v > 0) return `↑ ${v}%`;
    if (v < 0) return `↓ ${Math.abs(v)}%`;
    return `→ 0%`;
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
      </div>

      <div className="page-content">

        {/* FILTROS */}
        <div className="filters-panel">
          <select value={filtros.rango} onChange={e => setFiltros({...filtros, rango: e.target.value})}>
            <option value="semana">Semana</option>
            <option value="mes">Mes</option>
            <option value="trimestre">3 meses</option>
            <option value="year">Año</option>
          </select>

          <select value={filtros.prioridad} onChange={e => setFiltros({...filtros, prioridad: e.target.value})}>
            <option value="todas">Prioridad</option>
            <option value="alta">Alta</option>
            <option value="media">Media</option>
          </select>

          <select value={filtros.estado} onChange={e => setFiltros({...filtros, estado: e.target.value})}>
            <option value="todos">Estado</option>
            <option value="abierto">Abierto</option>
            <option value="pendiente">Pendiente</option>
            <option value="resuelto">Resuelto</option>
          </select>

          <button onClick={() => setFiltros({ rango: 'mes', prioridad: 'todas', estado: 'todos' })}>
            <FaTimes />
          </button>
        </div>

        {/* STATS */}
        <div className="dashboard-grid">
          <div className="stat-card">
            <FaTicketAlt />
            <p>{loading ? '-' : stats.totalTickets}</p>
            <span>{getChangeText(stats.cambioTotalMes)}</span>
          </div>

          <div className="stat-card">
            <FaClock />
            <p>{loading ? '-' : stats.ticketsAbiertos}</p>
            <span>{`+${stats.ticketsHoy} hoy`}</span>
          </div>

          <div className="stat-card">
            <FaExclamationCircle />
            <p>{loading ? '-' : stats.ticketsPorEstado.pendiente}</p>
          </div>

          <div className="stat-card">
            <FaCheckCircle />
            <p>{loading ? '-' : stats.ticketsResueltos}</p>
          </div>

          <div className="stat-card">
            <FaLightbulb />
            <p>{loading ? '-' : `${stats.tiempoPromedio} días`}</p>
          </div>
        </div>

        {/* CHART */}
        <div className="chart-container">
          <Bar
            data={{
              labels: ['Abiertos', 'Pendientes', 'Resueltos'],
              datasets: [{
                data: [
                  stats.ticketsPorEstado.abierto || 0,
                  stats.ticketsPorEstado.pendiente || 0,
                  stats.ticketsPorEstado.resuelto || 0,
                ],
                backgroundColor: ['#3498db', '#f1c40f', '#2ecc71']
              }]
            }}
          />
        </div>

      </div>
    </div>
  );
}