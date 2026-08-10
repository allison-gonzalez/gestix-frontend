import React, { useState, useEffect } from 'react';
import { FaTicketAlt, FaClock, FaCheckCircle, FaLightbulb, FaFilter, FaExclamationCircle, FaTimes, FaHome } from 'react-icons/fa';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { ticketService } from '../services';
import '../styles/Home.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels);

// Degradado + resplandor de cada tarjeta KPI, a juego con su ícono (stat-icon-*)
const ACCENTS = {
  navy:   { '--accent-grad': 'linear-gradient(180deg, #2b5580, #1B3A5C)', '--accent-glow': 'rgba(27, 58, 92, 0.22)' },
  cyan:   { '--accent-grad': 'linear-gradient(180deg, #5ee0ee, #2DC4D4)', '--accent-glow': 'rgba(45, 196, 212, 0.28)' },
  orange: { '--accent-grad': 'linear-gradient(180deg, #f5a556, #e67e22)', '--accent-glow': 'rgba(230, 126, 34, 0.28)' },
  green:  { '--accent-grad': 'linear-gradient(180deg, #4fce7a, #28a745)', '--accent-glow': 'rgba(40, 167, 69, 0.28)' },
  purple: { '--accent-grad': 'linear-gradient(180deg, #9b7bd6, #6f42c1)', '--accent-glow': 'rgba(111, 66, 193, 0.28)' },
  yellow: { '--accent-grad': 'linear-gradient(180deg, #ffd75e, #e6ac00)', '--accent-glow': 'rgba(230, 172, 0, 0.28)' },
};

export default function Home() {
  const [stats, setStats] = useState({
    totalTickets: 0,
    ticketsAbiertos: 0,
    ticketsPendientes: 0,
    ticketsResueltos: 0,
    ticketsCerrados: 0,
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

      // Aplicar filtros
      tickets = tickets.filter((t) => {
        const fechaCreacion = new Date(t.fecha_creacion);
        const estaEnRango = fechaCreacion >= fechaInicio && fechaCreacion <= ahora;
        const tienePrioridad = filtros.prioridad === 'todas' || t.prioridad === filtros.prioridad;
        const tieneEstado = filtros.estado === 'todos' || t.estado === filtros.estado;

        return estaEnRango && tienePrioridad && tieneEstado;
      });

      const totalTickets = tickets.length;
      const ticketsAbiertos = tickets.filter((t) => t.estado === 'abierto').length;
      const ticketsPendientes = tickets.filter((t) => t.estado === 'pendiente').length;
      const ticketsResueltos = tickets.filter((t) => t.estado === 'resuelto').length;
      const ticketsCerrados = tickets.filter((t) => t.estado === 'cerrado').length;

      // Cálculo de dinámicas
      const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
      const ticketsHoy = tickets.filter((t) => {
        const fechaCreacion = new Date(t.fecha_creacion);
        const ticketHoy = new Date(fechaCreacion.getFullYear(), fechaCreacion.getMonth(), fechaCreacion.getDate());
        return ticketHoy.getTime() === hoy.getTime();
      }).length;

      // Tickets en período actual y anterior
      const hace30Dias = new Date(ahora.getFullYear(), ahora.getMonth() - 1, ahora.getDate());
      const ticketsEstesMes = tickets.filter((t) => {
        const fecha = new Date(t.fecha_creacion);
        return fecha >= hace30Dias && fecha <= ahora;
      }).length;

      const ticketsMesAnterior = tickets.filter((t) => {
        const fecha = new Date(t.fecha_creacion);
        const hace60Dias = new Date(ahora.getFullYear(), ahora.getMonth() - 2, ahora.getDate());
        return fecha >= hace60Dias && fecha < hace30Dias;
      }).length;

      const cambioTotalMes = ticketsMesAnterior > 0 
        ? Math.round(((ticketsEstesMes - ticketsMesAnterior) / ticketsMesAnterior) * 100)
        : 0;

      // Cambio en resueltos
      const hace30Dias2 = new Date(ahora.getFullYear(), ahora.getMonth() - 1, ahora.getDate());
      const hace60Dias2 = new Date(ahora.getFullYear(), ahora.getMonth() - 2, ahora.getDate());
      
      const resueltosMesAnterior = tickets.filter((t) => {
        const fecha = new Date(t.fecha_resolucion);
        return fecha && fecha >= hace60Dias2 && fecha < hace30Dias2;
      }).length;

      const resueltosMesActual = tickets.filter((t) => {
        const fecha = new Date(t.fecha_resolucion);
        return fecha && fecha >= hace30Dias2 && fecha <= ahora;
      }).length;

      const cambioResoltosMes = resueltosMesAnterior > 0
        ? Math.round(((resueltosMesActual - resueltosMesAnterior) / resueltosMesAnterior) * 100)
        : 0;

      // Tiempo promedio
      const ticketsConResolucion = tickets.filter((t) => t.fecha_resolucion && t.fecha_creacion);
      let tiempoPromedio = 0;
      let tiempoPromedioAnterior = 0;

      if (ticketsConResolucion.length > 0) {
        const totalDias = ticketsConResolucion.reduce((sum, t) => {
          const fechaCreacion = new Date(t.fecha_creacion);
          const fechaResolucion = new Date(t.fecha_resolucion);
          const dias = Math.ceil((fechaResolucion - fechaCreacion) / (1000 * 60 * 60 * 24));
          return sum + dias;
        }, 0);
        tiempoPromedio = Math.round(totalDias / ticketsConResolucion.length);

        const ticketsConResolucionAnterior = ticketsConResolucion.filter((t) => {
          const fecha = new Date(t.fecha_resolucion);
          return fecha >= hace60Dias2 && fecha < hace30Dias2;
        });

        if (ticketsConResolucionAnterior.length > 0) {
          const totalDiasAnterior = ticketsConResolucionAnterior.reduce((sum, t) => {
            const fechaCreacion = new Date(t.fecha_creacion);
            const fechaResolucion = new Date(t.fecha_resolucion);
            const dias = Math.ceil((fechaResolucion - fechaCreacion) / (1000 * 60 * 60 * 24));
            return sum + dias;
          }, 0);
          tiempoPromedioAnterior = Math.round(totalDiasAnterior / ticketsConResolucionAnterior.length);
        }
      }

      const cambioTiempoPromedio = tiempoPromedioAnterior > 0
        ? Math.round(((tiempoPromedioAnterior - tiempoPromedio) / tiempoPromedioAnterior) * 100)
        : 0;

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
        cambioTotalMes,
        ticketsHoy,
        cambioResoltosMes,
        cambioTiempoPromedio,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
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
        backgroundColor: ['#2DC4D4', '#FFD100', '#28a745', '#6f42c1'],
        borderColor: ['#2DC4D4', '#FFD100', '#28a745', '#6f42c1'],
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'x',
    plugins: {
      legend: { 
        display: false, 
        position: 'top',
        labels: {
          font: { size: 12 },
          padding: 20,
        }
      },
      title: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        padding: 12,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        displayColors: true,
        callbacks: {
          label: function(context) {
            return `Cantidad: ${context.parsed.y} tickets`;
          }
        }
      },
      datalabels: {
        color: '#fff',
        font: {
          weight: 'bold',
          size: 16,
        },
      }
    },
    scales: {
      y: { 
        beginAtZero: true,
        ticks: {
          font: { size: 12 }
        }
      },
      x: {
        ticks: {
          font: { size: 12, weight: 'bold' }
        }
      }
    },
  };

  const getChangeText = (value) => {
    if (value > 0) return `↑ ${Math.abs(value)}% vs mes anterior`;
    if (value < 0) return `↓ ${Math.abs(value)}% vs mes anterior`;
    return `→ 0% vs mes anterior`;
  };

  const getChangeTextTiempo = (value) => {
    if (value > 0) return `↑ ${Math.abs(value)}% mejora`;
    if (value < 0) return `↓ ${Math.abs(value)}% aumento`;
    return `→ Sin cambio`;
  };

  const handleLimpiarFiltros = () => {
    setFiltros({
      rango: 'mes',
      prioridad: 'todas',
      estado: 'todos',
    });
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title"><FaHome /> Dashboard</h1>
      </div>

      <div className="page-content">
        <div className="filters-panel">
          <div className="filter-group">
            <label>Rango de Fechas</label>
            <select 
              value={filtros.rango}
              onChange={(e) => setFiltros({...filtros, rango: e.target.value})}
            >
              <option value="semana">Última Semana</option>
              <option value="mes">Último Mes</option>
              <option value="trimestre">Últimos 3 Meses</option>
              <option value="year">Último Año</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Prioridad</label>
            <select 
              value={filtros.prioridad}
              onChange={(e) => setFiltros({...filtros, prioridad: e.target.value})}
            >
              <option value="todas">Todas</option>
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
              <option value="critica">Crítica</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Estado</label>
            <select 
              value={filtros.estado}
              onChange={(e) => setFiltros({...filtros, estado: e.target.value})}
            >
              <option value="todos">Todos</option>
              <option value="abierto">Abierto</option>
              <option value="pendiente">Pendiente</option>
              <option value="resuelto">Resuelto</option>
            </select>
          </div>

          <button className="filter-clear-btn" onClick={handleLimpiarFiltros} title="Limpiar filtros">
            <FaTimes /> Limpiar
          </button>
        </div>

        <div className="dashboard-grid">
          <div className="stat-card" style={ACCENTS.navy}>
            <div className="stat-icon stat-icon-navy"><FaTicketAlt /></div>
            <div className="stat-content">
              <h3>TOTAL DE TICKETS</h3>
              <p className="stat-number">{loading ? '-' : stats.totalTickets}</p>
              <span className="stat-change">{loading ? '-' : getChangeText(stats.cambioTotalMes)}</span>
            </div>
          </div>
          <div className="stat-card" style={ACCENTS.cyan}>
            <div className="stat-icon stat-icon-cyan"><FaClock /></div>
            <div className="stat-content">
              <h3>TICKETS ABIERTOS</h3>
              <p className="stat-number">{loading ? '-' : stats.ticketsAbiertos}</p>
              <span className="stat-change">{loading ? '-' : `↑ ${stats.ticketsHoy} nuevos hoy`}</span>
            </div>
          </div>
          <div className="stat-card" style={ACCENTS.orange}>
            <div className="stat-icon stat-icon-orange"><FaExclamationCircle /></div>
            <div className="stat-content">
              <h3>TICKETS PENDIENTES</h3>
              <p className="stat-number">{loading ? '-' : stats.ticketsPendientes}</p>
              <span className="stat-change">{loading ? '-' : getChangeText(stats.cambioTotalMes)}</span>
            </div>
          </div>
          <div className="stat-card" style={ACCENTS.green}>
            <div className="stat-icon stat-icon-green"><FaCheckCircle /></div>
            <div className="stat-content">
              <h3>TICKETS RESUELTOS</h3>
              <p className="stat-number">{loading ? '-' : stats.ticketsResueltos}</p>
              <span className="stat-change">{loading ? '-' : getChangeText(stats.cambioResoltosMes)}</span>
            </div>
          </div>
          <div className="stat-card" style={ACCENTS.purple}>
            <div className="stat-icon stat-icon-purple"><FaLightbulb /></div>
            <div className="stat-content">
              <h3>TICKETS CERRADOS</h3>
              <p className="stat-number">{loading ? '-' : stats.ticketsCerrados}</p>
              <span className="stat-change">↑ 8% vs mes anterior</span>
            </div>
          </div>
          <div className="stat-card" style={ACCENTS.yellow}>
            <div className="stat-icon stat-icon-yellow"><FaLightbulb /></div>
            <div className="stat-content">
              <h3>TIEMPO PROMEDIO</h3>
              <p className="stat-number">{loading ? '-' : `${stats.tiempoPromedio} ${stats.tiempoPromedio === 1 ? 'día' : 'días'}`}</p>
              <span className="stat-change">{loading ? '-' : getChangeTextTiempo(stats.cambioTiempoPromedio)}</span>
            </div>
          </div>
        </div>

        <div className="chart-section">
          <div className="chart-header">
            <h2 className="chart-title">Tickets por Estado</h2>
          </div>

          <div className="chart-container">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}