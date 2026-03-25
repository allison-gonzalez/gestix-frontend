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
} from 'react-icons/fa';
import { backupService } from '../services';
import DataTable from '../components/common/DataTable';
import '../styles/Administracion.css';
import '../styles/TicketList.css';

export default function Administracion() {
  const [info, setInfo]       = useState(null);
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [restoring, setRestoring] = useState(null);
  const [deleting, setDeleting]   = useState(null);
  const [alert, setAlert]               = useState(null);
  const [showCollections, setShowCollections] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [infoRes, listRes] = await Promise.all([
        backupService.getInfo(),
        backupService.getList(),
      ]);
      setInfo(infoRes.data);
      setBackups(Array.isArray(listRes.data) ? listRes.data : []);
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

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Administración</h1>
        <p className="page-subtitle">Respaldo y restauración de base de datos</p>
      </div>

      <div className="page-content">
        {/* Alert */}
        {alert && (
          <div className={`admin-alert ${alert.type}`}>
            {alert.type === 'success' ? <FaCheckCircle /> : <FaExclamationTriangle />}
            <span>{alert.message}</span>
          </div>
        )}

        {loading ? (
          <div className="admin-loading">Cargando información...</div>
        ) : (
          <>
            {/* Info Cards */}
            <div className="admin-info-grid">
              <div className="admin-info-card">
                <div className="admin-info-icon"><FaServer /></div>
                <div className="admin-info-content">
                  <span className="admin-info-label">Base de Datos</span>
                  <span className="admin-info-value">{info?.database || '-'}</span>
                </div>
              </div>
              <div className="admin-info-card">
                <div className="admin-info-icon"><FaTable /></div>
                <div className="admin-info-content">
                  <span className="admin-info-label">Colecciones</span>
                  <span className="admin-info-value">{info?.collections?.length || 0}</span>
                </div>
              </div>
              <div className="admin-info-card">
                <div className="admin-info-icon"><FaDatabase /></div>
                <div className="admin-info-content">
                  <span className="admin-info-label">Total Documentos</span>
                  <span className="admin-info-value">{info?.total_docs || 0}</span>
                </div>
              </div>
              <div className="admin-info-card">
                <div className="admin-info-icon"><FaDownload /></div>
                <div className="admin-info-content">
                  <span className="admin-info-label">Backups Guardados</span>
                  <span className="admin-info-value">{info?.backups_count || 0}</span>
                </div>
              </div>
            </div>

            {/* Collections Table */}
            {info?.collections?.length > 0 && (
              <div className="admin-section">
                <div className="admin-section-header">
                  <h2 className="admin-section-title">Colecciones</h2>
                  <button
                    className="btn-secondary"
                    onClick={() => setShowCollections(v => !v)}
                    title={showCollections ? 'Ocultar' : 'Mostrar'}
                  >
                    {showCollections ? <FaChevronUp /> : <FaChevronDown />}
                    {showCollections ? 'Ocultar' : 'Mostrar'}
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
                <div className="admin-actions">
                  <button className="btn-secondary" onClick={fetchData} title="Actualizar">
                    <FaSync /> Actualizar
                  </button>
                  <button className="btn-primary" onClick={handleCreate} disabled={creating}>
                    <FaPlus /> {creating ? 'Creando...' : 'Nuevo Backup'}
                  </button>
                </div>
              </div>

              <DataTable
                keyField="filename"
                rows={backups}
                emptyText="No hay backups disponibles. Crea el primero."
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
            </div>
          </>
        )}
      </div>
    </div>
  );
}
