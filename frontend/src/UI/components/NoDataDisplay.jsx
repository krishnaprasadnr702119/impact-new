import React from 'react'

const NoDataDisplay = ({icon, message, desc}) => {
  return (
    <div style={{
      textAlign: 'center',
      padding: '48px',
      color: '#64748b'
    }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>{icon}</div>
      <h3 style={{ margin: '0 0 8px 0' }}>{message}</h3>
      {desc && <p style={{ margin: 0 }}>{desc}</p>}
    </div>
  )
}
export default NoDataDisplay