import React, { useState, useEffect } from 'react';
import UsuariosList from '../components/usuarios/UsuariosList';
import { usuarioService } from '../services';

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const res = await usuarioService.getAll();
      const data = Array.isArray(res.data) ? res.data : res.data.data || [];
      setUsuarios(data);
    } catch (error) {
      console.error('Error fetching usuarios:', error);
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
        <UsuariosList usuarios={usuarios} loading={loading} onRefresh={fetchUsuarios} />
      </div>
    </div>
  );
}
