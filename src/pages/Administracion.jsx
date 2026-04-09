import React, { useState, useEffect } from 'react';
import {
  FaDatabase,
  FaDownload,
  FaTrash,
  FaUndo,
  FaPlus,
  FaSync,
  FaCheckCircle,
  FaExclamationTriangle,
  FaServer,
  FaTable,
  FaChevronDown,
  FaChevronUp,
  FaSearch,
  FaClock,
  FaShieldAlt,
  FaSave,
  FaToggleOn,
  FaToggleOff,
  FaQuestion,
} from 'react-icons/fa';
import { backupService } from '../services';
import DataTable from '../components/common/DataTable';
import '../styles/Administracion.css';
import '../styles/TicketList.css';

export default function Administracion() {
  const [info, setInfo]         = useState(null);
  const [backups, setBackups]   = useState([]);
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [creating, setCreating] = useState(false);
  const [restoring, setRestoring] = useState(null);
  const [deleting, setDeleting]   = useState(null);
  const [alert, setAlert]               = useState(null);
  const [showCollections, setShowCollections] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [backupSearch, setBackupSearch]       = useState('');
  const [scheduleForm, setScheduleForm] = useState(null);
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [serverTimezone, setServerTimezone] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [infoRes, listRes, scheduleRes] = await Promise.all([
        backupService.getInfo(),
        backupService.getList(),
        backupService.getSchedule(),
      ]);
      setInfo(infoRes.data);
      setBackups(Array.isArray(listRes.data) ? listRes.data : []);
      const s = scheduleRes.data;
      setSchedule(s);
      setServerTimezone(s.server_offset_hours || 0);

      // Convertir la hora del servidor a la zona horaria del cliente
      // NOTA: getTimezoneOffset() devuelve signo invertido (positivo para UTC-, negativo para UTC+)
      const clientOffset = -(new Date().getTimezoneOffset() / 60);
      const serverOffset = s.server_offset_hours || 0;
      const hourDiff = serverOffset - clientOffset;
      const [h, m] = s.time.split(':').map(Number);
      let displayHour = (h - hourDiff + 24) % 24;
      
      setScheduleForm({
        enabled:      s.enabled      ?? true,
        frequency:    s.frequency    ?? 'daily',
        time:         `${String(displayHour).padStart(2, '0')}:${String(m).padStart(2, '0')}`,
        day_of_week:  s.day_of_week  ?? 1,
        day_of_month: s.day_of_month ?? 1,
        retention:    s.retention    ?? 7,
      });
    } catch (err) {
      showAlert('error', 'No se pudo conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      setCreating(true);
      const res = await backupService.create();
      showAlert('success', `Backup creado: ${res.data.filename}`);
      fetchData();
    } catch (err) {
      showAlert('error', 'Error al crear el backup');
    } finally {
      setCreating(false);
    }
  };

  const handleDownload = async (filename) => {
    try {
      const res = await backupService.download(filename);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a   = document.createElement('a');
      a.href     = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      showAlert('error', 'Error al descargar el backup');
    }
  };

  const handleDelete = async (filename) => {
    if (!window.confirm(`¿Eliminar el backup "${filename}"?`)) return;
    try {
      setDeleting(filename);
      await backupService.delete(filename);
      showAlert('success', 'Backup eliminado');
      fetchData();
    } catch (err) {
      showAlert('error', 'Error al eliminar el backup');
    } finally {
      setDeleting(null);
    }
  };

  const handleRestore = async (filename) => {
    if (!window.confirm(`¿Restaurar la base de datos desde "${filename}"? Esta acción sobreescribirá los datos actuales.`)) return;
    try {
      setRestoring(filename);
      const res = await backupService.restore(filename);
      showAlert('success', `Restauración exitosa: ${res.data.documents_restored} documentos restaurados`);
    } catch (err) {
      showAlert('error', 'Error al restaurar el backup');
    } finally {
      setRestoring(null);
    }
  };

  const handleScheduleChange = (field, value) => {
    setScheduleForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveSchedule = async () => {
    try {
      setSavingSchedule(true);
      
      // Convertir la hora del cliente a la zona horaria del servidor
      // NOTA: getTimezoneOffset() devuelve signo invertido (positivo para UTC-, negativo para UTC+)
      const clientOffset = -(new Date().getTimezoneOffset() / 60);
      const hourDiff = serverTimezone - clientOffset;
      const [h, m] = scheduleForm.time.split(':').map(Number);
      let serverHour = (h + hourDiff + 24) % 24;

      const dataToSend = {
        ...scheduleForm,
        time: `${String(serverHour).padStart(2, '0')}:${String(m).padStart(2, '0')}`,
      };

      const res = await backupService.updateSchedule(dataToSend);
      
      // Convertir la respuesta de vuelta a la zona horaria del cliente
      const [sh, sm] = res.data.time.split(':').map(Number);
      const displayHour = (sh - hourDiff + 24) % 24;
      
      setSchedule(res.data);
      setScheduleForm({
        ...res.data,
        time: `${String(displayHour).padStart(2, '0')}:${String(sm).padStart(2, '0')}`,
      });
      
      showAlert('success', 'Configuración de respaldo automático guardada');
    } catch (err) {
      showAlert('error', 'Error al guardar la configuración');
    } finally {
      setSavingSchedule(false);
    }
  };

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Administración</h1>
          <p className="page-subtitle">Respaldo y restauración de base de datos</p>
        </div>
        <button className="btn-primary" onClick={handleCreate} disabled={creating || loading}>
          <FaPlus /> {creating ? 'Creando...' : 'Nuevo Backup'}
        </button>
      </div>

      <div className="page-content">
        {/* Alert */}
        {alert && (
          <div className={`admin-alert ${alert.type}`}>
            {alert.type === 'success' ? <FaCheckCircle /> : <FaExclamationTriangle />}
            <span>{alert.message}</span>
            <button className="alert-close" onClick={() => setAlert(null)}>✕</button>
          </div>
        )}

        {loading ? (
          <div className="admin-skeleton-grid">
            {[1,2,3,4].map(i => <div key={i} className="admin-skeleton-card" />)}
          </div>
        ) : (
          <>
            {/* Info Cards */}
            <div className="admin-info-grid">
              <div className="admin-info-card card-cyan">
                <div className="admin-info-icon">
                  <FaServer />
                </div>
                <div className="admin-info-content">
                  <span className="admin-info-label">Base de Datos</span>
                  <span className="admin-info-value">{info?.database || '-'}</span>
                </div>
              </div>
              <div className="admin-info-card card-navy">
                <div className="admin-info-icon">
                  <FaTable />
                </div>
                <div className="admin-info-content">
                  <span className="admin-info-label">Colecciones</span>
                  <span className="admin-info-value">{info?.collections?.length || 0}</span>
                </div>
              </div>
              <div className="admin-info-card card-yellow">
                <div className="admin-info-icon">
                  <FaDatabase />
                </div>
                <div className="admin-info-content">
                  <span className="admin-info-label">Total Documentos</span>
                  <span className="admin-info-value">{info?.total_docs || 0}</span>
                </div>
              </div>
              <div className="admin-info-card card-green">
                <div className="admin-info-icon">
                  <FaDownload />
                </div>
                <div className="admin-info-content">
                  <span className="admin-info-label">Backups Guardados</span>
                  <span className="admin-info-value">{info?.backups_count || 0}</span>
                </div>
              </div>
            </div>

            {/* Schedule Status Card */}
            {schedule && (
              <div className={`admin-schedule-card ${schedule.enabled ? '' : 'disabled'}`}>
                <div className="admin-schedule-icon"><FaShieldAlt /></div>
                <div className="admin-schedule-body">
                  <span className="admin-schedule-title">Respaldo Automático</span>
                  {schedule.enabled ? (
                    <>
                      <span className="admin-schedule-detail">
                        <FaClock />
                        {schedule.frequency === 'daily'   && `Diario a las ${schedule.time}`}
                        {schedule.frequency === 'weekly'  && `Semanal (${['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'][schedule.day_of_week]}) a las ${schedule.time}`}
                        {schedule.frequency === 'monthly' && `Mensual (día ${schedule.day_of_month}) a las ${schedule.time}`}
                        &nbsp;·&nbsp; Retención: {schedule.retention} backups
                      </span>
                      <span className="admin-schedule-next">
                        Próximo respaldo: <strong>{schedule.next_run}</strong>
                      </span>
                    </>
                  ) : (
                    <span className="admin-schedule-detail">Los respaldos automáticos están desactivados</span>
                  )}
                </div>
                <span className={`admin-schedule-badge ${schedule.enabled ? '' : 'off'}`}>
                  {schedule.enabled ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            )}

            {/* Schedule Config Form */}
            {scheduleForm && (
              <div className="admin-section">
                <div className="admin-section-header">
                  <h2 className="admin-section-title">
                    <FaClock /> Programar Respaldo Automático
                    <span className="help-tooltip" title="Configura cuándo y con qué frecuencia se crean respaldos automáticos. La retención indica cuántos backups guardar antes de eliminar los más antiguos.">
                      <FaQuestion />
                    </span>
                  </h2>
                  <button
                    className="btn-toggle"
                    onClick={() => setShowScheduleForm(v => !v)}
                  >
                    {showScheduleForm ? <FaChevronUp /> : <FaChevronDown />}
                  </button>
                </div>
                {showScheduleForm && (
                <div className="admin-schedule-form">
                  {/* Enable / Disable toggle */}
                  <div className="schedule-field schedule-field-toggle">
                    <label>Estado</label>
                    <button
                      className={`schedule-toggle ${scheduleForm.enabled ? 'on' : 'off'}`}
                      onClick={() => handleScheduleChange('enabled', !scheduleForm.enabled)}
                      type="button"
                    >
                      {scheduleForm.enabled ? <FaToggleOn /> : <FaToggleOff />}
                      <span>{scheduleForm.enabled ? 'Activado' : 'Desactivado'}</span>
                    </button>
                  </div>

                  {/* Frequency */}
                  <div className="schedule-field">
                    <label>Frecuencia</label>
                    <select value={scheduleForm.frequency} onChange={e => handleScheduleChange('frequency', e.target.value)}>
                      <option value="daily">Diario</option>
                      <option value="weekly">Semanal</option>
                      <option value="monthly">Mensual</option>
                    </select>
                  </div>

                  {/* Time */}
                  <div className="schedule-field">
                    <label>Hora </label>
                    <input
                      type="time"
                      value={scheduleForm.time}
                      onChange={e => handleScheduleChange('time', e.target.value)}
                    />
                  </div>

                  {/* Day of week (only for weekly) */}
                  {scheduleForm.frequency === 'weekly' && (
                    <div className="schedule-field">
                      <label>Día de la semana</label>
                      <select value={scheduleForm.day_of_week} onChange={e => handleScheduleChange('day_of_week', parseInt(e.target.value))}>
                        {['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'].map((d, i) => (
                          <option key={i} value={i}>{d}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Day of month (only for monthly) */}
                  {scheduleForm.frequency === 'monthly' && (
                    <div className="schedule-field">
                      <label>Día del mes</label>
                      <input
                        type="number"
                        min="1" max="28"
                        value={scheduleForm.day_of_month}
                        onChange={e => handleScheduleChange('day_of_month', parseInt(e.target.value))}
                      />
                    </div>
                  )}

                  {/* Retention */}
                  <div className="schedule-field">
                    <label>Retención (máx. backups)</label>
                    <input
                      type="number"
                      min="1" max="365"
                      value={scheduleForm.retention}
                      onChange={e => handleScheduleChange('retention', parseInt(e.target.value))}
                    />
                  </div>

                  <div className="schedule-field schedule-field-action">
                    <button className="btn-primary" onClick={handleSaveSchedule} disabled={savingSchedule}>
                      <FaSave /> {savingSchedule ? 'Guardando...' : 'Guardar configuración'}
                    </button>
                  </div>
                </div>
                )}
              </div>
            )}

            {/* Collections Table */}
            {info?.collections?.length > 0 && (
              <div className="admin-section">
                <div className="admin-section-header">
                  <h2 className="admin-section-title">Colecciones</h2>
                  <button
                    className="btn-toggle"
                    onClick={() => setShowCollections(v => !v)}
                  >
                    {showCollections ? <FaChevronUp /> : <FaChevronDown />}
                  </button>
                </div>
                {showCollections && (
                  <DataTable
                    keyField="name"
                    rows={info.collections}
                    emptyText="No hay colecciones"
                    columns={[
                      { label: 'COLECCIÓN', render: (col) => <span className="col-name"><FaTable /> {col.name}</span> },
                      { label: 'DOCUMENTOS', key: 'count' },
                      { label: 'ESTADO', render: () => <span className="badge badge-cyan">Activa</span> },
                    ]}
                  />
                )}
              </div>
            )}

            {/* Backup Section */}
            <div className="admin-section">
              <div className="admin-section-header">
                <h2 className="admin-section-title">Historial de Backups</h2>
                <div className="admin-section-toolbar">
                  <div className="search-box">
                    <FaSearch className="search-icon" />
                    <input
                      type="text"
                      placeholder="Buscar por nombre de archivo"
                      value={backupSearch}
                      onChange={(e) => setBackupSearch(e.target.value)}
                    />
                  </div>
                  <button className="btn-icon-only" onClick={fetchData} title="Actualizar">
                    <FaSync />
                  </button>
                </div>
              </div>

              {backups.length === 0 ? (
                <div className="admin-empty">
                  <div className="admin-empty-icon"><FaDatabase /></div>
                  <p className="admin-empty-title">Sin backups</p>
                  <p className="admin-empty-sub">Crea el primer backup para proteger tus datos.</p>
                  <button className="btn-primary" onClick={handleCreate} disabled={creating}>
                    <FaPlus /> {creating ? 'Creando...' : 'Crear primer backup'}
                  </button>
                </div>
              ) : (
                <DataTable
                  keyField="filename"
                  rows={backups.filter(b => b.filename.toLowerCase().includes(backupSearch.toLowerCase()))}
                  emptyText="No se encontraron backups."
                  columns={[
                    { label: 'ARCHIVO',  render: (b) => <span className="backup-filename">{b.filename}</span> },
                    { label: 'TAMAÑO',   key: 'size' },
                    { label: 'FECHA',    key: 'created_at' },
                    { label: 'ACCIONES', render: (b) => (
                      <div className="admin-actions">
                        <button className="backup-btn download" onClick={() => handleDownload(b.filename)} title="Descargar"><FaDownload /></button>
                        <button className="backup-btn restore"  onClick={() => handleRestore(b.filename)}  disabled={restoring === b.filename} title="Restaurar"><FaUndo /></button>
                        <button className="backup-btn delete"   onClick={() => handleDelete(b.filename)}   disabled={deleting  === b.filename} title="Eliminar"><FaTrash /></button>
                      </div>
                    )},
                  ]}
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
