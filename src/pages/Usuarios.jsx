import React, { useState, useEffect } from 'react';
import UsuariosList from '../components/usuarios/UsuariosList';
import { usuarioService, departamentoService, permisoService } from '../services';

export default function Usuarios() {
  const [usuarios,     setUsuarios]     = useState([]);
  const [departamentos,setDepartamentos]= useState([]);
  const [permisos,     setPermisos]     = useState([]);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [uRes, dRes, pRes] = await Promise.all([
        usuarioService.getAll(),
        departamentoService.getAll(),
        permisoService.getAll(),
      ]);

      const toArray = (res) =>
        Array.isArray(res.data) ? res.data : res.data?.data || [];

      setUsuarios(toArray(uRes));
      setDepartamentos(toArray(dRes));
      setPermisos(toArray(pRes));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
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
          onRefresh={fetchAll}
          departamentos={departamentos}
          permisos={permisos}
        />
      </div>
    </div>
  );
}