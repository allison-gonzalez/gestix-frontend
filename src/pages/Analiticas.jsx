import React, { useEffect, useState, useCallback } from 'react';
import {
  FaBrain, FaLayerGroup, FaExclamationTriangle, FaSpinner, FaSyncAlt, FaCheckCircle,
  FaChartLine, FaLightbulb, FaShieldAlt, FaTools, FaArrowUp, FaArrowDown, FaMinus,
  FaClipboardCheck,
} from 'react-icons/fa';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend,
} from 'chart.js';
import api from '../services/api';
import '../styles/Analiticas.css';
import '../styles/Reportes.css';
import '../styles/TicketList.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const CHART_COLORS = { navy: '#1B3A5C', yellow: '#FFD100', cyan: '#2DC4D4' };

const PRIORIDAD_LABEL = { baja: 'Baja', media: 'Media', alta: 'Alta', critica: 'Crítica' };
const PRIORIDAD_BADGE = {
  baja: { bg: '#e8f4fd', text: '#2980b9' },
  media: { bg: '#fef0e6', text: '#e67e22' },
  alta: { bg: '#fde8e8', text: '#c0392b' },
  critica: { bg: '#fde8e8', text: '#c0392b' },
};

// Cada grupo de K-Means se etiqueta con la dimensión de decisión de negocio
// a la que aporta, para que el cliente vea de inmediato qué hacer con él.
const DIMENSION_INFO = {
  oportunidad: { label: 'Oportunidad', icon: FaLightbulb, bg: '#e8f8f0', text: '#27ae60', grad: 'linear-gradient(180deg, #4fce7a, #27ae60)' },
  riesgo: { label: 'Riesgo', icon: FaShieldAlt, bg: '#fde8e8', text: '#c0392b', grad: 'linear-gradient(180deg, #f28b82, #c0392b)' },
  optimizacion: { label: 'Optimización de proceso', icon: FaTools, bg: '#fef0e6', text: '#e67e22', grad: 'linear-gradient(180deg, #f5a556, #e67e22)' },
  tendencia: { label: 'Tendencia estable', icon: FaChartLine, bg: '#e8f4fd', text: '#2980b9', grad: 'linear-gradient(180deg, #5ee0ee, #2980b9)' },
};

const TENDENCIA_INFO = {
  creciente: { label: 'Creciente', icon: FaArrowUp, color: '#c0392b' },
  decreciente: { label: 'Decreciente', icon: FaArrowDown, color: '#27ae60' },
  estable: { label: 'Estable', icon: FaMinus, color: '#2980b9' },
};

export default function Analiticas() {
  const [segmentacion, setSegmentacion] = useState(null);
  const [riesgo, setRiesgo] = useState(null);
  const [tendencia, setTendencia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalitica = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [segRes, riesgoRes, tendenciaRes] = await Promise.all([
        api.get('/analiticas/segmentacion?k=3'),
        api.get('/analiticas/riesgo'),
        api.get('/analiticas/tendencia'),
      ]);
      setSegmentacion(segRes.data.data);
      setRiesgo(riesgoRes.data.data);
      setTendencia(tendenciaRes.data.data);
    } catch (err) {
      setError('No se pudieron cargar los modelos de análisis de datos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAnalitica(); }, [fetchAnalitica]);

  if (loading) {
    return (
      <div className="page-container">
        <div className="ul-state ul-state--loading" style={{ padding: '80px 20px' }}>
          <FaSpinner className="spin" />
          <span>Entrenando modelos con los tickets reales…</span>
        </div>
      </div>
    );
  }

  const grupos = segmentacion?.grupos ?? [];
  const barClustersData = {
    labels: grupos.map((g) => `Grupo ${g.id + 1}`),
    datasets: [{
      label: 'Tickets',
      data: grupos.map((g) => g.cantidad),
      backgroundColor: [CHART_COLORS.navy, CHART_COLORS.cyan, CHART_COLORS.yellow, '#28a745', '#6f42c1'],
      borderRadius: 6,
    }],
  };

  const barClustersOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx) => ` ${ctx.parsed.y} tickets` } },
    },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1, color: '#6c757d' }, grid: { color: '#f0f0f0' } },
      x: { ticks: { color: '#1B3A5C', font: { weight: '600' } }, grid: { display: false } },
    },
  };

  const historico = tendencia?.historico ?? [];
  const pronostico = tendencia?.pronostico ?? [];
  const barTendenciaData = {
    labels: [...historico.map((h) => h.semana), ...pronostico.map((p) => p.semana)],
    datasets: [
      {
        label: 'Histórico',
        data: [...historico.map((h) => h.cantidad), ...pronostico.map(() => null)],
        backgroundColor: CHART_COLORS.navy,
        borderRadius: 5,
      },
      {
        label: 'Pronóstico',
        data: [...historico.map(() => null), ...pronostico.map((p) => p.cantidad)],
        backgroundColor: CHART_COLORS.yellow,
        borderRadius: 5,
      },
    ],
  };

  const barTendenciaOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { color: '#1B3A5C', font: { size: 12 }, padding: 14 } },
      tooltip: { callbacks: { label: (ctx) => ` ${ctx.dataset.label}: ${ctx.parsed.y ?? 0} tickets` } },
    },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 5, color: '#6c757d' }, grid: { color: '#f0f0f0' } },
      x: { ticks: { color: '#6c757d', font: { size: 10 } }, grid: { display: false } },
    },
  };

  const tInfo = tendencia?.tendencia ? TENDENCIA_INFO[tendencia.tendencia] : null;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title"><FaBrain /> Analítica Avanzada</h1>
        <button className="rpt-export-btn" onClick={fetchAnalitica} disabled={loading}>
          <FaSyncAlt /> Recalcular
        </button>
      </div>

      <div className="page-content rpt-content">
        {error && <div className="rpt-error">{error}</div>}

        {/* ── Marco ejecutivo: para qué sirve esta página ──────── */}
        <div className="an-intro-card">
          <p>
            Esta página traduce el historial de tickets en decisiones concretas: qué tan ocupados
            estaremos, dónde estamos funcionando bien, dónde hay que mejorar y qué atender primero.
          </p>
          <div className="an-intro-pillars">
            {Object.entries(DIMENSION_INFO).map(([key, info]) => (
              <span key={key} className="an-pillar" style={{ color: info.text }}>
                <info.icon /> {info.label}
              </span>
            ))}
          </div>
        </div>

        {/* ── Resumen ejecutivo: qué hacer, en 3 frases ─────────── */}
        {!tendencia?.insuficiente && !segmentacion?.insuficiente && !riesgo?.insuficiente && (
          <div className="an-resumen-card">
            <h3 className="an-resumen-title"><FaClipboardCheck /> Qué hacer con esta información</h3>
            <ul className="an-resumen-lista">
              {tendencia?.mensajePrincipal && <li>{tendencia.mensajePrincipal}</li>}
              {segmentacion?.mensajePrincipal && <li>{segmentacion.mensajePrincipal}</li>}
              {riesgo?.mensajePrincipal && <li>{riesgo.mensajePrincipal}</li>}
            </ul>
          </div>
        )}

        {/* ── Predicción de resultados futuros ──────────────────── */}
        <div className="an-section-card">
          <h3 className="rpt-chart-title">
            <FaChartLine /> ¿Qué tan ocupados estaremos las próximas semanas?
          </h3>
          <p className="an-section-desc">
            Proyecta cuántos tickets se esperan a partir del histórico reciente, para anticipar
            necesidades de personal y evitar cuellos de botella antes de que ocurran.
          </p>

          {tendencia?.insuficiente ? (
            <div className="an-insuficiente">
              Aún no hay suficiente historial para proyectar una tendencia
              (se necesitan al menos {tendencia.minimoRequerido} tickets, hay {tendencia.disponibles}).
            </div>
          ) : (
            <>
              {tendencia?.mensajePrincipal && (
                <div className="an-callout">
                  <FaLightbulb /> {tendencia.mensajePrincipal}
                </div>
              )}
              <div className="an-riesgo-kpis">
                <div className="an-riesgo-kpi">
                  <span className="an-riesgo-kpi-value" style={{ color: tInfo?.color }}>
                    {tInfo && <tInfo.icon style={{ marginRight: 6 }} />}
                    {tInfo?.label}
                  </span>
                  <span className="an-riesgo-kpi-label">Tendencia de demanda</span>
                </div>
                <div className="an-riesgo-kpi">
                  <span className="an-riesgo-kpi-value">{tendencia.cambioPorcentualSemanal > 0 ? '+' : ''}{tendencia.cambioPorcentualSemanal}%</span>
                  <span className="an-riesgo-kpi-label">Cambio semanal estimado</span>
                </div>
                <div className="an-riesgo-kpi">
                  <span className="an-riesgo-kpi-value">{tendencia.promedioSemanal}</span>
                  <span className="an-riesgo-kpi-label">Promedio de tickets/semana</span>
                </div>
              </div>
              <div className="rpt-chart-body tall">
                <Bar data={barTendenciaData} options={barTendenciaOptions} />
              </div>
              <p className="an-technical-note">Basado en un modelo de regresión lineal sobre el volumen semanal de tickets.</p>
            </>
          )}
        </div>

        {/* ── Dónde funcionamos bien y dónde no ─────────────────── */}
        <div className="an-section-card">
          <h3 className="rpt-chart-title">
            <FaLayerGroup /> ¿Dónde estamos funcionando bien y dónde no?
          </h3>
          <p className="an-section-desc">
            Agrupa los tickets ya resueltos según su prioridad y el tiempo real que tomaron en
            atenderse. Cada grupo se etiqueta como oportunidad a replicar, riesgo a vigilar o
            proceso a optimizar.
          </p>

          {!segmentacion?.insuficiente && segmentacion?.mensajePrincipal && (
            <div className="an-callout">
              <FaLightbulb /> {segmentacion.mensajePrincipal}
            </div>
          )}

          {segmentacion?.insuficiente ? (
            <div className="an-insuficiente">
              Aún no hay suficientes tickets resueltos para segmentar
              (se necesitan al menos {segmentacion.minimoRequerido}, hay {segmentacion.disponibles}).
            </div>
          ) : (
            <div className="an-cluster-layout">
              <div className="rpt-chart-body">
                <Bar data={barClustersData} options={barClustersOptions} />
              </div>
              <div className="an-cluster-cards">
                {grupos.map((g) => {
                  const dInfo = DIMENSION_INFO[g.dimension] ?? DIMENSION_INFO.tendencia;
                  return (
                    <div key={g.id} className="an-cluster-card" style={{ '--dim-grad': dInfo.grad }}>
                      <div className="an-cluster-head">
                        <span
                          className="an-badge an-dimension-badge"
                          style={{ background: dInfo.bg, color: dInfo.text }}
                        >
                          <dInfo.icon /> {dInfo.label}
                        </span>
                        <span className="an-cluster-count">{g.cantidad} tickets</span>
                      </div>
                      <div className="an-cluster-stat">
                        Prioridad dominante:{' '}
                        <span
                          className="an-badge"
                          style={{
                            background: PRIORIDAD_BADGE[g.prioridadDominante]?.bg,
                            color: PRIORIDAD_BADGE[g.prioridadDominante]?.text,
                          }}
                        >
                          {PRIORIDAD_LABEL[g.prioridadDominante] ?? g.prioridadDominante}
                        </span>
                      </div>
                      <div className="an-cluster-stat">
                        Tiempo promedio de resolución: <b>{g.tiempoPromedioHoras}h</b>
                      </div>
                      <div className="an-cluster-stat">
                        Categoría más común: <b>{g.categoriaDominante}</b>
                      </div>
                      <div className="an-cluster-stat">
                        Departamento más común: <b>{g.departamentoDominante}</b>
                      </div>
                      <p className="an-cluster-insight">{g.insight}</p>
                      <p className="an-cluster-recomendacion">{g.recomendacion}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {!segmentacion?.insuficiente && (
            <p className="an-technical-note">Basado en un modelo de agrupamiento (K-Means) sobre prioridad y tiempo de resolución.</p>
          )}
        </div>

        {/* ── Qué atender primero ──────────────────────────────── */}
        <div className="an-section-card">
          <h3 className="rpt-chart-title">
            <FaExclamationTriangle /> ¿Qué tickets debemos atender primero?
          </h3>
          <p className="an-section-desc">
            Aprende del historial resuelto qué combinación de prioridad, departamento, categoría y
            momento de creación tiende a tardar más de lo normal, y lo aplica a los tickets
            abiertos actuales para decidir a quién atender primero.
          </p>

          {riesgo?.insuficiente ? (
            <div className="an-insuficiente">
              Aún no hay suficiente historial resuelto para entrenar este modelo
              (se necesitan al menos {riesgo.minimoRequerido}, hay {riesgo.disponibles}).
            </div>
          ) : (
            <>
              {riesgo?.mensajePrincipal && (
                <div className="an-callout">
                  <FaLightbulb /> {riesgo.mensajePrincipal}
                </div>
              )}
              <div className="an-riesgo-kpis">
                <div className="an-riesgo-kpi">
                  <span className="an-riesgo-kpi-value">{riesgo.precisionModelo ?? '—'}%</span>
                  <span className="an-riesgo-kpi-label">Precisión del modelo</span>
                </div>
                <div className="an-riesgo-kpi">
                  <span className="an-riesgo-kpi-value">{riesgo.umbralHoras}h</span>
                  <span className="an-riesgo-kpi-label">Umbral de retraso</span>
                </div>
                <div className="an-riesgo-kpi">
                  <span className="an-riesgo-kpi-value">{riesgo.ticketsEnRiesgo.length}</span>
                  <span className="an-riesgo-kpi-label">de {riesgo.totalAbiertos} abiertos en riesgo</span>
                </div>
              </div>

              {riesgo.ticketsEnRiesgo.length === 0 ? (
                <div className="an-sin-riesgo">
                  <FaCheckCircle /> Ningún ticket abierto muestra riesgo de retraso actualmente.
                </div>
              ) : (
                <div className="an-riesgo-table-wrap">
                  <table className="an-riesgo-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Título</th>
                        <th>Prioridad</th>
                        <th>Categoría</th>
                        <th>Departamento</th>
                        <th>Antigüedad</th>
                      </tr>
                    </thead>
                    <tbody>
                      {riesgo.ticketsEnRiesgo.map((t) => (
                        <tr key={t.id}>
                          <td>#{t.id}</td>
                          <td>{t.titulo}</td>
                          <td>
                            <span
                              className="an-badge"
                              style={{
                                background: PRIORIDAD_BADGE[t.prioridad]?.bg,
                                color: PRIORIDAD_BADGE[t.prioridad]?.text,
                              }}
                            >
                              {PRIORIDAD_LABEL[t.prioridad] ?? t.prioridad}
                            </span>
                          </td>
                          <td>{t.categoria}</td>
                          <td>{t.departamento}</td>
                          <td>{t.antiguedadHoras}h</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <p className="an-technical-note">Basado en un modelo de bosque aleatorio (Random Forest) entrenado con el historial resuelto.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
