import React from 'react';

/**
 * DataTable — Tabla genérica reutilizable.
 *
 * Props:
 *  - columns : [{ label: string, key?: string, render?: (row, index) => ReactNode }]
 *  - rows    : array of objects
 *  - loading : boolean
 *  - emptyText : string (opcional)
 *  - keyField  : string (opcional, campo que identifica cada fila)
 */
export default function DataTable({
  columns = [],
  rows = [],
  loading = false,
  emptyText = 'No hay datos disponibles',
  keyField,
}) {
  if (loading) {
    return <div className="loading-state">Cargando...</div>;
  }

  const getKey = (row, index) => {
    if (keyField) return row[keyField];
    return row._id ?? row.filename ?? row.name ?? index;
  };

  return (
    <div className="table-wrapper">
      <table className="ticket-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.label}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="empty-state">
                {emptyText}
              </td>
            </tr>
          ) : (
            rows.map((row, index) => (
              <tr key={getKey(row, index)}>
                {columns.map((col) => (
                  <td key={col.label}>
                    {col.render ? col.render(row, index) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
