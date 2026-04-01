import React, { useState, useEffect } from 'react';
import UsuariosList from '../components/usuarios/UsuariosList';
import { usuarioService, departamentoService, permisoService } from '../services';

export default function Usuarios() {
  const [usuarios,      setUsuarios]      = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [permisosCat,   setPermisosCat]   = useState([]);   // catálogo de permisos de BD
  const [loading,       setLoading]       = useState(true);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [uRes, dRes, pRes] = await Promise.all([
        usuarioService.getAll(),
        departamentoService.getAll(),
        permisoService.getAll(),
      ]);
      const toArr = (r) => Array.isArray(r.data) ? r.data : r.data?.data || [];
      setUsuarios(toArr(uRes));
      setDepartamentos(toArr(dRes));
      setPermisosCat(toArr(pRes));
    } catch (err) {
      console.error('Error cargando datos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id, formData) => {
    const payload = { ...formData };
    if (!payload.contrasena) delete payload.contrasena;
    await usuarioService.update(id, payload);
  };

  const handleCreate = async (formData) => {
    await usuarioService.create(formData);
  };

  const handleDelete = async (id) => {
    await usuarioService.delete(id);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Usuarios</h1>
      </div>
      <div className="page-content">
        <UsuariosList
          usuarios={usuarios}
          loading={loading}
          departamentos={departamentos}
          permisosCatalogo={permisosCat}
          onRefresh={fetchAll}
          onUpdate={handleUpdate}
          onCreate={handleCreate}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}