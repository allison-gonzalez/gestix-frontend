import React, { useState, useEffect } from 'react';
import {
  FaBuilding,
  FaKey,
  FaTags,
  FaPlus,
  FaPencilAlt,
  FaTrash,
  FaSearch,
  FaTimes,
  FaCheck,
  FaSave,
} from 'react-icons/fa';
import { departamentoService, permisoService, categoriaService } from '../services';
import DataTable from '../components/common/DataTable';
import '../styles/Administracion.css';
import '../styles/TicketList.css';
import '../styles/AdminModule.css';

export default function AdminModule() {
  const [activeTab, setActiveTab] = useState(() => {
    const saved = localStorage.getItem('adminActiveTab');
    return saved || 'departamentos';
  });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  // Departamentos
  const [departamentos, setDepartamentos] = useState([]);
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [deptForm, setDeptForm] = useState({ nombre: '', estatus: 1 });
  const [deptSearch, setDeptSearch] = useState('');
  const [editingDept, setEditingDept] = useState(null);

  // Permisos
  const [permisos, setPermisos] = useState([]);
  const [showPermModal, setShowPermModal] = useState(false);
  const [permForm, setPermForm] = useState({ nombre: '', descripcion: '', estatus: 1 });
  const [permSearch, setPermSearch] = useState('');
  const [editingPerm, setEditingPerm] = useState(null);

  // Categorías
  const [categorias, setCategorias] = useState([]);
  const [showCatModal, setShowCatModal] = useState(false);
  const [catForm, setCatForm] = useState({ nombre: '', departamento_id: '', estatus: 1 });
  const [catSearch, setCatSearch] = useState('');
  const [editingCat, setEditingCat] = useState(null);

  useEffect(() => {
    loadDepartamentos();
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('adminActiveTab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('adminActiveTab', activeTab);
  }, [activeTab]);

  const loadDepartamentos = async () => {
    try {
      const res = await departamentoService.getAll();
      setDepartamentos(res.data?.data || []);
    } catch (err) {
      console.error('Error al cargar departamentos:', err);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'departamentos') {
        const res = await departamentoService.getAll();
        setDepartamentos(res.data?.data || []);
      } else if (activeTab === 'permisos') {
        const res = await permisoService.getAll();
        setPermisos(res.data?.data || []);
      } else if (activeTab === 'categorias') {
        const [deptRes, catRes] = await Promise.all([
          departamentoService.getAll(),
          categoriaService.getAll(),
        ]);
        setDepartamentos(deptRes.data?.data || []);
        setCategorias(catRes.data?.data || []);
      }
    } catch (err) {
      showAlert('error', 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 3000);
  };

  // DEPARTAMENTOS
  const handleSaveDept = async () => {
    if (!deptForm.nombre.trim()) { showAlert('error', 'El nombre es requerido'); return; }
    try {
      if (editingDept) {
        await departamentoService.update(editingDept._id, deptForm);
        showAlert('success', 'Departamento actualizado');
      } else {
        await departamentoService.create(deptForm);
        showAlert('success', 'Departamento creado');
      }
      setShowDeptModal(false);
      setDeptForm({ nombre: '', estatus: 1 });
      setEditingDept(null);
      await loadData();
    } catch (err) {
      showAlert('error', err.response?.data?.error || 'Error al guardar');
    }
  };

  const handleEditDept = (dept) => {
    setEditingDept(dept);
    setDeptForm({ nombre: dept.nombre, estatus: dept.estatus });
    setShowDeptModal(true);
  };

  const handleDeleteDept = async (id) => {
    if (!window.confirm('¿Eliminar este departamento?')) return;
    try {
      await departamentoService.delete(id);
      showAlert('success', 'Departamento eliminado');
      await loadData();
    } catch (err) { showAlert('error', 'Error al eliminar'); }
  };

  // PERMISOS
  const handleSavePerm = async () => {
    if (!permForm.nombre.trim()) { showAlert('error', 'El nombre es requerido'); return; }
    try {
      if (editingPerm) {
        await permisoService.update(editingPerm._id, permForm);
        showAlert('success', 'Permiso actualizado');
      } else {
        await permisoService.create(permForm);
        showAlert('success', 'Permiso creado');
      }
      setShowPermModal(false);
      setPermForm({ nombre: '', descripcion: '', estatus: 1 });
      setEditingPerm(null);
      await loadData();
    } catch (err) {
      showAlert('error', err.response?.data?.error || 'Error al guardar');
    }
  };

  const handleEditPerm = (perm) => {
    setEditingPerm(perm);
    setPermForm({ nombre: perm.nombre, descripcion: perm.descripcion || '', estatus: perm.estatus });
    setShowPermModal(true);
  };

  const handleDeletePerm = async (id) => {
    if (!window.confirm('¿Eliminar este permiso?')) return;
    try {
      await permisoService.delete(id);
      showAlert('success', 'Permiso eliminado');
      await loadData();
    } catch (err) { showAlert('error', 'Error al eliminar'); }
  };

  // CATEGORIAS
  const handleSaveCat = async () => {
    if (!catForm.nombre.trim() || !catForm.departamento_id) {
      showAlert('error', 'Nombre y departamento son requeridos');
      return;
    }
    try {
      const payload = { ...catForm, departamento_id: parseInt(catForm.departamento_id) || catForm.departamento_id };
      if (editingCat) {
        await categoriaService.update(editingCat._id, payload);
        showAlert('success', 'Categoría actualizada');
      } else {
        await categoriaService.create(payload);
        showAlert('success', 'Categoría creada');
      }
      setShowCatModal(false);
      setCatForm({ nombre: '', departamento_id: '', estatus: 1 });
      setEditingCat(null);
      await loadData();
    } catch (err) {
      showAlert('error', err.response?.data?.error || 'Error al guardar');
    }
  };

  const handleEditCat = (cat) => {
    setEditingCat(cat);
    setCatForm({ nombre: cat.nombre, departamento_id: cat.departamento_id, estatus: cat.estatus });
    setShowCatModal(true);
  };

  const handleDeleteCat = async (id) => {
    if (!window.confirm('¿Eliminar esta categoría?')) return;
    try {
      await categoriaService.delete(id);
      showAlert('success', 'Categoría eliminada');
      await loadData();
    } catch (err) { showAlert('error', 'Error al eliminar'); }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Administración de Datos</h1>
          <p className="page-subtitle">Gestión de departamentos, permisos y categorías</p>
        </div>
      </div>

      <div className="page-content">
        {alert && (
          <div className={`admin-alert ${alert.type}`}>
            {alert.type === 'success' ? <FaCheck /> : <FaTimes />}
            <span>{alert.message}</span>
            <button className="alert-close" onClick={() => setAlert(null)}>✕</button>
          </div>
        )}

        {/* Tabs and Content Panel */}
        <div className="admin-panel">
          <div className="admin-tabs">
            <button className={`admin-tab ${activeTab === 'departamentos' ? 'active' : ''}`} onClick={() => setActiveTab('departamentos')}>
              <FaBuilding /> Departamentos
            </button>
            <button className={`admin-tab ${activeTab === 'permisos' ? 'active' : ''}`} onClick={() => setActiveTab('permisos')}>
              <FaKey /> Permisos
            </button>
            <button className={`admin-tab ${activeTab === 'categorias' ? 'active' : ''}`} onClick={() => setActiveTab('categorias')}>
              <FaTags /> Categorías
            </button>
          </div>

          {/* DEPARTAMENTOS */}
          {activeTab === 'departamentos' && (
            <div className="admin-section">
            <div className="admin-section-header">
              <div className="admin-section-toolbar">
                <div className="search-box">
                  <FaSearch className="search-icon" />
                  <input type="text" placeholder="Buscar departamento..." value={deptSearch} onChange={(e) => setDeptSearch(e.target.value)} />
                </div>
                <button className="btn-primary" onClick={() => { setEditingDept(null); setDeptForm({ nombre: '', estatus: 1 }); setShowDeptModal(true); }}>
                  <FaPlus /> Nuevo
                </button>
              </div>
            </div>
            <DataTable
              keyField="_id"
              rows={departamentos.filter(d => d.nombre?.toLowerCase().includes(deptSearch.toLowerCase()))}
              emptyText="No hay departamentos registrados"
              columns={[
                { label: 'NOMBRE', key: 'nombre' },
                { label: 'ESTADO', render: (d) => <span className={`badge ${d.estatus ? 'badge-green' : 'badge-red'}`}>{d.estatus ? 'Activo' : 'Inactivo'}</span> },
                { label: 'ACCIONES', render: (d) => (
                  <div className="admin-actions">
                    <button className="backup-btn download" onClick={() => handleEditDept(d)} title="Editar"><FaPencilAlt /></button>
                    <button className="backup-btn delete" onClick={() => handleDeleteDept(d._id)} title="Eliminar"><FaTrash /></button>
                  </div>
                )},
              ]}
            />
          </div>
        )}

        {/* PERMISOS */}
        {activeTab === 'permisos' && (
          <div className="admin-section">
            <div className="admin-section-header">
              <div className="admin-section-toolbar">
                <div className="search-box">
                  <FaSearch className="search-icon" />
                  <input type="text" placeholder="Buscar permiso..." value={permSearch} onChange={(e) => setPermSearch(e.target.value)} />
                </div>
                <button className="btn-primary" onClick={() => { setEditingPerm(null); setPermForm({ nombre: '', descripcion: '', estatus: 1 }); setShowPermModal(true); }}>
                  <FaPlus /> Nuevo
                </button>
              </div>
            </div>
            <DataTable
              keyField="_id"
              rows={permisos.filter(p => p.nombre?.toLowerCase().includes(permSearch.toLowerCase()))}
              emptyText="No hay permisos registrados"
              columns={[
                { label: 'NOMBRE', key: 'nombre' },
                { label: 'DESCRIPCION', key: 'descripcion' },
                { label: 'ESTADO', render: (p) => <span className={`badge ${p.estatus ? 'badge-green' : 'badge-red'}`}>{p.estatus ? 'Activo' : 'Inactivo'}</span> },
                { label: 'ACCIONES', render: (p) => (
                  <div className="admin-actions">
                    <button className="backup-btn download" onClick={() => handleEditPerm(p)} title="Editar"><FaPencilAlt /></button>
                    <button className="backup-btn delete" onClick={() => handleDeletePerm(p._id)} title="Eliminar"><FaTrash /></button>
                  </div>
                )},
              ]}
            />
          </div>
        )}

        {/* CATEGORÍAS */}
        {activeTab === 'categorias' && (
          <div className="admin-section">
            <div className="admin-section-header">
              <div className="admin-section-toolbar">
                <div className="search-box">
                  <FaSearch className="search-icon" />
                  <input type="text" placeholder="Buscar categoría..." value={catSearch} onChange={(e) => setCatSearch(e.target.value)} />
                </div>
                <button className="btn-primary" onClick={() => { setEditingCat(null); setCatForm({ nombre: '', departamento_id: '', estatus: 1 }); setShowCatModal(true); }}>
                  <FaPlus /> Nuevo
                </button>
              </div>
            </div>
            <DataTable
              keyField="_id"
              rows={categorias.filter(c => c.nombre?.toLowerCase().includes(catSearch.toLowerCase()))}
              emptyText="No hay categorías registradas"
              columns={[
                { label: 'NOMBRE', key: 'nombre' },
                { label: 'DEPARTAMENTO', render: (c) => departamentos.find(d => d.id === c.departamento_id || d._id === c.departamento_id)?.nombre || '-' },
                { label: 'ESTADO', render: (c) => <span className={`badge ${c.estatus ? 'badge-green' : 'badge-red'}`}>{c.estatus ? 'Activo' : 'Inactivo'}</span> },
                { label: 'ACCIONES', render: (c) => (
                  <div className="admin-actions">
                    <button className="backup-btn download" onClick={() => handleEditCat(c)} title="Editar"><FaPencilAlt /></button>
                    <button className="backup-btn delete" onClick={() => handleDeleteCat(c._id)} title="Eliminar"><FaTrash /></button>
                  </div>
                )},
              ]}
            />
          </div>
        )}
        </div>
      </div>

      {/* MODAL DEPARTAMENTO */}
      {showDeptModal && (
        <div className="modal-overlay" onClick={() => setShowDeptModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title"><FaBuilding /> {editingDept ? 'Editar Departamento' : 'Nuevo Departamento'}</h3>
              <button className="modal-close" onClick={() => setShowDeptModal(false)}><FaTimes /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Nombre</label>
                <input type="text" value={deptForm.nombre} onChange={(e) => setDeptForm({ ...deptForm, nombre: e.target.value })} placeholder="Nombre del departamento" autoFocus />
              </div>
              <div className="form-group">
                <label>Estado</label>
                <select value={deptForm.estatus} onChange={(e) => setDeptForm({ ...deptForm, estatus: parseInt(e.target.value) })}>
                  <option value={1}>Activo</option>
                  <option value={0}>Inactivo</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowDeptModal(false)}>Cancelar</button>
              <button className="btn-primary" onClick={handleSaveDept}><FaSave /> Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PERMISO */}
      {showPermModal && (
        <div className="modal-overlay" onClick={() => setShowPermModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title"><FaKey /> {editingPerm ? 'Editar Permiso' : 'Nuevo Permiso'}</h3>
              <button className="modal-close" onClick={() => setShowPermModal(false)}><FaTimes /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Nombre</label>
                <input type="text" value={permForm.nombre} onChange={(e) => setPermForm({ ...permForm, nombre: e.target.value })} placeholder="Nombre del permiso" autoFocus />
              </div>
              <div className="form-group">
                <label>Descripción</label>
                <textarea value={permForm.descripcion} onChange={(e) => setPermForm({ ...permForm, descripcion: e.target.value })} placeholder="Descripción del permiso" />
              </div>
              <div className="form-group">
                <label>Estado</label>
                <select value={permForm.estatus} onChange={(e) => setPermForm({ ...permForm, estatus: parseInt(e.target.value) })}>
                  <option value={1}>Activo</option>
                  <option value={0}>Inactivo</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowPermModal(false)}>Cancelar</button>
              <button className="btn-primary" onClick={handleSavePerm}><FaSave /> Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CATEGORIA */}
      {showCatModal && (
        <div className="modal-overlay" onClick={() => setShowCatModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title"><FaTags /> {editingCat ? 'Editar Categoría' : 'Nueva Categoría'}</h3>
              <button className="modal-close" onClick={() => setShowCatModal(false)}><FaTimes /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Nombre</label>
                <input type="text" value={catForm.nombre} onChange={(e) => setCatForm({ ...catForm, nombre: e.target.value })} placeholder="Nombre de la categoría" autoFocus />
              </div>
              <div className="form-group">
                <label>Departamento</label>
                <select value={catForm.departamento_id} onChange={(e) => setCatForm({ ...catForm, departamento_id: e.target.value })}>
                  <option value="">Seleccionar...</option>
                  {departamentos.map(d => (
                    <option key={d._id || d.id} value={d.id || d._id}>{d.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Estado</label>
                <select value={catForm.estatus} onChange={(e) => setCatForm({ ...catForm, estatus: parseInt(e.target.value) })}>
                  <option value={1}>Activo</option>
                  <option value={0}>Inactivo</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowCatModal(false)}>Cancelar</button>
              <button className="btn-primary" onClick={handleSaveCat}><FaSave /> Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}