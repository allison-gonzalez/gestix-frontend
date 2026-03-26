import React from 'react';
import '../styles/TicketTemplates.css';

const ticketTemplates = [
  {
    id: 'incident',
    title: 'Incidente',
    description: 'Reporte rápido de un incidente crítico que requiere atención inmediata.',
    priority: 'alta',
    color: 'template-red',
  },
  {
    id: 'request',
    title: 'Solicitud',
    description: 'Solicitud de servicio para instalar, configurar o modificar un recurso.',
    priority: 'media',
    color: 'template-yellow',
  },
  {
    id: 'task',
    title: 'Tarea',
    description: 'Tarea operativa o de seguimiento que se asigna al equipo.',
    priority: 'baja',
    color: 'template-blue',
  },
  {
    id: 'improvement',
    title: 'Mejora',
    description: 'Idea o mejora continua para optimizar procesos o productos.',
    priority: 'media',
    color: 'template-green',
  },
];

export default function TicketTemplates({onSelectTemplate}) {
  return (
    <div className="ticket-templates-container">
      <div className="ticket-templates-header">
        <h2>Plantillas de Ticket</h2>
        <p>Elige una plantilla para crear un ticket con campos predeterminados.</p>
      </div>

      <div className="ticket-templates-grid">
        {ticketTemplates.map((template) => (
          <article className={`template-card ${template.color}`} key={template.id}>
            <div className="template-meta">
              <h3>{template.title}</h3>
              <span className={`template-priority ${template.priority}`}>{template.priority}</span>
            </div>
            <p>{template.description}</p>
            <button onClick={() => onSelectTemplate?.(template)} className="template-select-btn">
              Usar plantilla
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
