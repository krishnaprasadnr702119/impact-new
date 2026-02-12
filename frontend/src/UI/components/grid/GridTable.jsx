
import React from 'react';
import './GridTable.css'
import NoDataDisplay from '../NoDataDisplay'

// Main GridTable Component
const GridTable = ({ columns, data, emptyMessage = "No data available" }) => {
  // Generate grid template columns from column widths
  const gridTemplate = columns?.map(col => col.width || '1fr').join(' ');

  return (
    <div className="grid-table">
      <div className="grid-table-wrapper">
        <div className="grid-table-content">
          <div className="grid-table-header" style={{ gridTemplateColumns: gridTemplate }}>
            {columns?.map((col, idx) => (
              <div
                key={idx}
                className={col.align === 'left' ? 'text-left' : 'text-center'}
              >
                {col.header}
              </div>
            ))}
          </div>
          <div className="grid-table-body">
            {data.length > 0 ? (
              data?.map((row, rowIdx) => (
                <div
                  key={row.id || rowIdx}
                  className="grid-table-row"
                  style={{ gridTemplateColumns: gridTemplate }}
                >
                  {columns?.map((col, colIdx) => (
                    <div
                      key={colIdx}
                      className={col.align === 'left' ? 'text-left' : 'text-center'}
                      style={col.cellStyle ? col.cellStyle(row) : {}}
                    >
                      {col.render ? col.render(row) : row[col.field]}
                    </div>
                  ))}
                </div>
              ))
            ) : (
              <div className="grid-table-empty">
                <NoDataDisplay message={emptyMessage} />
              </div>
            )}
          </div>
        </div></div>
    </div>
  );
};

// Button Component for table actions
export const TableButton = ({ children, color = 'blue', onClick, disabled = false }) => {
  return (
    <button
      className={`grid-table-btn ${color}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

// Action Buttons Container
export const TableActions = ({ children }) => {
  return <div className="grid-table-actions">{children}</div>;
};
export default GridTable