import React, { useState, useEffect, useCallback } from 'react';
import {
  FaChartBar, FaTicketAlt, FaCheckCircle, FaClock, FaExclamationTriangle, FaFileExcel, FaSpinner,
} from 'react-icons/fa';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement,
  Title, Tooltip, Legend, ArcElement,
} from 'chart.js';
import * as XLSX from 'xlsx';
import api from '../services/api';
import '../styles/Reportes.css';
import '../styles/TicketList.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const FILTROS = [
  { value: 'semana',    label: 'Esta semana' },
  { value: 'mes',       label: 'Este mes' },
  { value: 'trimestre', label: 'Trimestre' },
  { value: 'anio',      label: 'Este año' },
];

const CHART_COLORS = {
  navy:   '#1B3A5C',
  yellow: '#FFD100',
  cyan:   '#2DC4D4',
  green:  '#28a745',
  orange: '#fd7e14',
  red:    '#dc3545',
  purple: '#6f42c1',
};

const defaultData = {
  kpis: { total: 0, abiertos: 0, pendientes: 0, resueltos: 0, tasa_resolucion: 0, tiempo_promedio_horas: 0 },
  por_estado: { abierto: 0, pendiente: 0, resuelto: 0 },
  por_prioridad: { baja: 0, media: 0, alta: 0, critica: 0 },
  por_categoria: {},
  por_mes: {},
};

export default function Reportes() {
  const [rango, setRango] = useState('mes');
  const [datos, setDatos] = useState(defaultData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const rangoLabel = FILTROS.find(f => f.value === rango)?.label ?? rango;

  const exportExcel = () => {
    const wb = XLSX.utils.book_new();

    // Hoja 1 — KPIs
    const wsKpis = XLSX.utils.aoa_to_sheet([
      ['Indicador', 'Valor'],
      ['Total tickets', datos.kpis.total],
      ['Abiertos', datos.kpis.abiertos],
      ['Pendientes', datos.kpis.pendientes],
      ['Resueltos', datos.kpis.resueltos],
      ['Tasa de resolución (%)', datos.kpis.tasa_resolucion],
      ['Tiempo promedio de resolución (h)', datos.kpis.tiempo_promedio_horas],
    ]);
    wsKpis['!cols'] = [{ wch: 38 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(wb, wsKpis, 'KPIs');

    // Hoja 2 — Por estado
    const wsEstado = XLSX.utils.aoa_to_sheet([
      ['Estado', 'Cantidad'],
      ['Abierto', datos.por_estado.abierto],
      ['Pendiente', datos.por_estado.pendiente],
      ['Resuelto', datos.por_estado.resuelto],
    ]);
    wsEstado['!cols'] = [{ wch: 14 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(wb, wsEstado, 'Por Estado');

    // Hoja 3 — Por prioridad
    const wsPrioridad = XLSX.utils.aoa_to_sheet([
      ['Prioridad', 'Cantidad'],
      ['Baja', datos.por_prioridad.baja],
      ['Media', datos.por_prioridad.media],
      ['Alta', datos.por_prioridad.alta],
      ['Crítica', datos.por_prioridad.critica],
    ]);
    wsPrioridad['!cols'] = [{ wch: 14 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(wb, wsPrioridad, 'Por Prioridad');

    // Hoja 4 — Por categoría
    const catRows = Object.entries(datos.por_categoria).map(([cat, cnt]) => [cat, cnt]);
    const wsCat = XLSX.utils.aoa_to_sheet([['Categoría', 'Cantidad'], ...catRows]);
    wsCat['!cols'] = [{ wch: 26 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(wb, wsCat, 'Por Categoría');

    // Hoja 5 — Tendencia mensual
    const mesRows = Object.entries(datos.por_mes).map(([mes, cnt]) => [mes, cnt]);
    const wsMes = XLSX.utils.aoa_to_sheet([['Mes', 'Tickets'], ...mesRows]);
    wsMes['!cols'] = [{ wch: 14 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(wb, wsMes, 'Tendencia Mensual');

    XLSX.writeFile(wb, `Reporte_Gestix_${rangoLabel}_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  const fetchReportes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/reportes?rango=${rango}`);
      setDatos(response.data.data ?? defaultData);
    } catch (err) {
      setError('No se pudieron cargar los datos del reporte.');
    } finally {
      setLoading(false);
    }
  }, [rango]);

  useEffect(() => {
    fetchReportes();
  }, [fetchReportes]);

  /* ── Charts config ──────────────────────────── */
  const barMesData = {
    labels: Object.keys(datos.por_mes),
    datasets: [{
      label: 'Tickets',
      data: Object.values(datos.por_mes),
      backgroundColor: CHART_COLORS.cyan,
      borderRadius: 6,
      hoverBackgroundColor: CHART_COLORS.navy,
    }],
  };

  const barMesOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: ctx => ` ${ctx.parsed.y} tickets` } },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1, color: '#6c757d', font: { size: 11 } },
        grid: { color: '#f0f0f0' },
      },
      x: { ticks: { color: '#6c757d', font: { size: 11 } }, grid: { display: false } },
    },
  };

  const doughnutEstadoData = {
    labels: ['Abierto', 'Pendiente', 'Resuelto'],
    datasets: [{
      data: [datos.por_estado.abierto, datos.por_estado.pendiente, datos.por_estado.resuelto],
      backgroundColor: [CHART_COLORS.cyan, CHART_COLORS.yellow, CHART_COLORS.green],
      borderWidth: 2,
      borderColor: '#fff',
      hoverOffset: 6,
    }],
  };

  const doughnutEstadoOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#1B3A5C', font: { size: 12 }, padding: 14 },
      },
      tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${ctx.parsed} tickets` } },
    },
  };

  const catLabels = Object.keys(datos.por_categoria);
  const barCatData = {
    labels: catLabels,
    datasets: [{
      label: 'Tickets',
      data: Object.values(datos.por_categoria),
      backgroundColor: [
        CHART_COLORS.navy, CHART_COLORS.cyan, CHART_COLORS.yellow,
        CHART_COLORS.green, CHART_COLORS.purple, CHART_COLORS.orange,
      ],
      borderRadius: 5,
    }],
  };

  const barCatOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: ctx => ` ${ctx.parsed.x} tickets` } },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: { stepSize: 1, color: '#6c757d', font: { size: 11 } },
        grid: { color: '#f0f0f0' },
      },
      y: { ticks: { color: '#1B3A5C', font: { size: 12, weight: '500' } }, grid: { display: false } },
    },
  };

  const barPrioridadData = {
    labels: ['Baja', 'Media', 'Alta', 'Crítica'],
    datasets: [{
      label: 'Tickets',
      data: [
        datos.por_prioridad.baja,
        datos.por_prioridad.media,
        datos.por_prioridad.alta,
        datos.por_prioridad.critica,
      ],
      backgroundColor: [CHART_COLORS.green, CHART_COLORS.yellow, CHART_COLORS.orange, CHART_COLORS.red],
      borderRadius: 6,
    }],
  };

  const barPrioridadOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: ctx => ` ${ctx.parsed.y} tickets` } },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1, color: '#6c757d', font: { size: 11 } },
        grid: { color: '#f0f0f0' },
      },
      x: { ticks: { color: '#6c757d', font: { size: 12 } }, grid: { display: false } },
    },
  };

  /* ── Render ─────────────────────────────────── */
  if (loading) {
    return (
      <div className="page-container">
        <div className="ul-state ul-state--loading" style={{ padding: '80px 20px' }}>
          <FaSpinner className="spin" />
          <span>Cargando reportes…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">
           Reportes
        </h1>
        <div className="rpt-header-actions">
          <div className="rpt-filters">
            {FILTROS.map(f => (
              <button
                key={f.value}
                className={`rpt-filter-btn ${rango === f.value ? 'active' : ''}`}
                onClick={() => setRango(f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>
          <button className="rpt-export-btn" onClick={exportExcel} disabled={loading}>
            <FaFileExcel />
            Descargar Excel
          </button>
        </div>
      </div>

      <div className="page-content rpt-content">
        {error && <div className="rpt-error">{error}</div>}
        
        {/* KPIs */}
        <div className="rpt-kpis">
        <div className="rpt-kpi-card total">
          <div className="rpt-kpi-icon"><FaTicketAlt /></div>
          <div className="rpt-kpi-info">
            <div className="rpt-kpi-value">{datos.kpis.total}</div>
            <div className="rpt-kpi-label">Total tickets</div>
          </div>
        </div>

        <div className="rpt-kpi-card abiertos">
          <div className="rpt-kpi-icon"><FaExclamationTriangle /></div>
          <div className="rpt-kpi-info">
            <div className="rpt-kpi-value">{datos.kpis.abiertos}</div>
            <div className="rpt-kpi-label">Abiertos</div>
            <div className="rpt-kpi-sub" style={{ color: '#2DC4D4' }}>
              {datos.kpis.pendientes} pendientes
            </div>
          </div>
        </div>

        <div className="rpt-kpi-card resueltos">
          <div className="rpt-kpi-icon"><FaCheckCircle /></div>
          <div className="rpt-kpi-info">
            <div className="rpt-kpi-value">{datos.kpis.resueltos}</div>
            <div className="rpt-kpi-label">Resueltos</div>
            <div className="rpt-kpi-sub">{datos.kpis.tasa_resolucion}% tasa</div>
          </div>
        </div>

        <div className="rpt-kpi-card tiempo">
          <div className="rpt-kpi-icon"><FaClock /></div>
          <div className="rpt-kpi-info">
            <div className="rpt-kpi-value">{datos.kpis.tiempo_promedio_horas}h</div>
            <div className="rpt-kpi-label">Tiempo promedio</div>
            <div className="rpt-kpi-sub" style={{ color: '#e6ac00' }}>de resolución</div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="rpt-charts-grid">
        {/* Tendencia mensual — full width */}
        <div className="rpt-chart-card full-width">
          <h3 className="rpt-chart-title">
            <FaChartBar />
            Tendencia de tickets (últimos 6 meses)
          </h3>
          <div className="rpt-chart-body">
            <Bar data={barMesData} options={barMesOptions} />
          </div>
        </div>

        {/* Por estado */}
        <div className="rpt-chart-card">
          <h3 className="rpt-chart-title">
            <FaTicketAlt />
            Distribución por estado
          </h3>
          <div className="rpt-chart-body">
            <Doughnut data={doughnutEstadoData} options={doughnutEstadoOptions} />
          </div>
        </div>

        {/* Por prioridad */}
        <div className="rpt-chart-card">
          <h3 className="rpt-chart-title">
            <FaExclamationTriangle />
            Tickets por prioridad
          </h3>
          <div className="rpt-chart-body">
            <Bar data={barPrioridadData} options={barPrioridadOptions} />
          </div>
        </div>

        {/* Por categoría */}
        {catLabels.length > 0 && (
          <div className="rpt-chart-card full-width">
            <h3 className="rpt-chart-title">
              <FaChartBar />
              Tickets por categoría (top {catLabels.length})
            </h3>
            <div className="rpt-chart-body tall">
              <Bar data={barCatData} options={barCatOptions} />
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
