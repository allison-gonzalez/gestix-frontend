import React, { useState, useEffect } from 'react';
import TicketList from '../components/TicketList';
import TicketModal from '../components/TicketModal';
import { ticketService, usuarioService } from '../services';
import { emitNotification } from '../services/notificationBus';

// Datos mock para desarrollo
const MOCK_TICKETS = [
  {
    _id: '1',
    titulo: 'Sistema no responde',
    descripcion: 'El sitio web está lento y no responde correctamente',
    prioridad: 'alta',
    estado: 'abierto',
    asignados: [],
    asignado_a: 'Sin asignar',
    fecha_creacion: new Date('2024-03-20'),
    usuario_autor_id: 1,
    categoria_id: 1
  },
  {
    _id: '2',
    titulo: 'Error en login',
    descripcion: 'Los usuarios no pueden iniciar sesión correctamente',
    prioridad: 'alta',
    estado: 'pendiente',
    asignados: [],
    asignado_a: 'Sin asignar',
    fecha_creacion: new Date('2024-03-21'),
    usuario_autor_id: 2,
    categoria_id: 2
  },
  {
    _id: '3',
    titulo: 'Mejorar interfaz de usuario',
    descripcion: 'Actualizar el diseño de la página principal',
    prioridad: 'media',
    estado: 'abierto',
    asignados: [],
    asignado_a: 'Sin asignar',
    fecha_creacion: new Date('2024-03-19'),
    usuario_autor_id: 3,
    categoria_id: 3
  },
  {
    _id: '4',
    titulo: 'Base de datos lenta',
    descripcion: 'Las queries tardan demasiado tiempo',
    prioridad: 'alta',
    estado: 'resuelto',
    asignados: [],
    asignado_a: 'Sin asignar',
    fecha_creacion: new Date('2024-03-15'),
    usuario_autor_id: 1,
    categoria_id: 1
  },
];

const MOCK_USUARIOS = [
  {
    _id: 'u1',
    nombre: 'Juan Pérez',
    correo: 'juan@example.com',
    departamento: 'Soporte Técnico'
  },
  {
    _id: 'u2',
    nombre: 'María García',
    correo: 'maria@example.com',
    departamento: 'Desarrollo'
  },
  {
    _id: 'u3',
    nombre: 'Carlos López',
    correo: 'carlos@example.com',
    departamento: 'Base de Datos'
  },
  {
    _id: 'u4',
    nombre: 'Ana Martínez',
    correo: 'ana@example.com',
    departamento: 'Diseño'
  },
  {
    _id: 'u5',
    nombre: 'Roberto Silva',
    correo: 'roberto@example.com',
    departamento: 'Seguridad'
  },
];

const TICKETS_STORAGE_KEY = 'gestix_tickets';

const loadStoredTickets = () => {
  try {
    const stored = localStorage.getItem(TICKETS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.warn('No se pudo leer tickets de localStorage', error);
    return null;
  }
};

const saveTicketsToStorage = (tickets) => {
  try {
    localStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(tickets));
  } catch (error) {
    console.warn('No se pudo guardar tickets en localStorage', error);
  }
};

const mergeStoredTickets = (apiTickets = [], storedTickets = []) => {
  const apiIds = new Set(apiTickets.map((ticket) => ticket._id));
  const preserved = storedTickets.filter((ticket) => !apiIds.has(ticket._id));
  return [...apiTickets, ...preserved];
};

export default function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('edit');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const storedTickets = loadStoredTickets();
    try {
      setLoading(true);
      // Intentar obtener datos del API
      try {
        const res = await ticketService.getAll();
        const data = Array.isArray(res.data) ? res.data : res.data.data || [];
        const merged = mergeStoredTickets(data, storedTickets || []);
        setTickets(merged);
        saveTicketsToStorage(merged);
      } catch (err) {
        if (storedTickets?.length) {
          console.warn('No se pudo conectar al API de tickets, usando tickets almacenados localmente');
          setTickets(storedTickets);
        } else {
          console.warn('No se pudo conectar al API de tickets, usando datos mock');
          setTickets(MOCK_TICKETS);
          saveTicketsToStorage(MOCK_TICKETS);
        }
      }

      try {
        const res = await usuarioService.getAll();
        const data = Array.isArray(res.data) ? res.data : res.data.data || [];
        setUsuarios(data);
      } catch (err) {
        console.warn('No se pudo conectar al API de usuarios, usando datos mock');
        setUsuarios(MOCK_USUARIOS);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      const fallback = storedTickets?.length ? storedTickets : MOCK_TICKETS;
      setTickets(fallback);
      setUsuarios(MOCK_USUARIOS);
    } finally {
      setLoading(false);
    }
  };

  const handleNewTicket = () => {
    const newTicket = {
      _id: `new-${Date.now()}`,
      titulo: '',
      descripcion: '',
      prioridad: 'media',
      estado: 'abierto',
      fecha_creacion: new Date().toISOString().slice(0, 10),
      asignados: [],
    };
    setSelectedTicket(newTicket);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleEditTicket = (ticket) => {
    setSelectedTicket(ticket);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleViewTicket = (ticket) => {
    setSelectedTicket(ticket);
    setModalMode('view');
    setShowModal(true);
  };

  const notifyTicketChange = (updatedTicket, isNew) => {
    const assignedNames = (updatedTicket.asignados || [])
      .map((id) => usuarios.find((u) => u._id === id)?.nombre)
      .filter(Boolean)
      .join(', ');

    emitNotification({
      id: `notif-${Date.now()}`,
      title: isNew ? 'Nuevo ticket creado' : 'Ticket actualizado',
      time: new Date().toLocaleString(),
      unread: true,
      description: assignedNames
        ? `${updatedTicket.titulo} asignado a ${assignedNames}`
        : updatedTicket.titulo,
    });
  };

  const handleSaveTicket = async (updatedTicket) => {
    const isNew = String(updatedTicket._id).startsWith('new-');
    try {
      let ticketToSave = updatedTicket;

      if (isNew) {
        const result = await ticketService.create(updatedTicket);
        ticketToSave = result.data;
      } else {
        await ticketService.update(updatedTicket._id, updatedTicket);
      }

      const nombresAsignados = (ticketToSave.asignados || [])
        .map((id) => usuarios.find((u) => u._id === id)?.nombre)
        .filter(Boolean)
        .join(', ') || 'Sin asignar';

      const ticketConNombres = { ...ticketToSave, asignado_a: nombresAsignados };
      const nextTickets = tickets.some((t) => t._id === ticketConNombres._id)
        ? tickets.map((t) =>
            t._id === ticketConNombres._id ? ticketConNombres : t
          )
        : [...tickets, ticketConNombres];

      setTickets(nextTickets);
      saveTicketsToStorage(nextTickets);
      notifyTicketChange(ticketConNombres, isNew);
    } catch (error) {
      console.error('Error saving ticket:', error);
      const nombresAsignados = (updatedTicket.asignados || [])
        .map((id) => usuarios.find((u) => u._id === id)?.nombre)
        .filter(Boolean)
        .join(', ') || 'Sin asignar';
      const ticketConNombres = { ...updatedTicket, asignado_a: nombresAsignados };

      const nextTickets = tickets.some((t) => t._id === ticketConNombres._id)
        ? tickets.map((t) =>
            t._id === ticketConNombres._id ? ticketConNombres : t
          )
        : [...tickets, ticketConNombres];

      setTickets(nextTickets);
      saveTicketsToStorage(nextTickets);
      notifyTicketChange(ticketConNombres, isNew);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Tickets</h1>
        <button className="action-btn" onClick={handleNewTicket}>Crear ticket</button>
      </div>
      <div className="page-content">
        <TicketList
          tickets={tickets}
          loading={loading}
          onRefresh={fetchData}
          onEditTicket={handleEditTicket}
          onViewTicket={handleViewTicket}
        />
      </div>

      {showModal && (
        <TicketModal
          ticket={selectedTicket}
          usuarios={usuarios}
          mode={modalMode}
          onClose={() => {
            setShowModal(false);
            setSelectedTicket(null);
          }}
          onSave={handleSaveTicket}
        />
      )}
    </div>
  );
}
