import React from 'react';

export const StatsCard = ({ 
  title, 
  value, 
  colorIndex = 0, 
  icon = null, 
  trend = null,
  isLoading = false,
  compact = false,
  className = ''
}) => {
  // Ordered color schemes
  const colorSchemes = [
    {
      gradient: 'linear-gradient(135deg, #3b82f6, #1e40af)',
      shadow: 'rgba(59, 130, 246, 0.5)',
      name: 'blue'
    },
    {
      gradient: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
      shadow: 'rgba(139, 92, 246, 0.5)',
      name: 'purple'
    },
    {
      gradient: 'linear-gradient(135deg, #10b981, #059669)',
      shadow: 'rgba(16, 185, 129, 0.5)',
      name: 'green'
    },
    {
      gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
      shadow: 'rgba(245, 158, 11, 0.5)',
      name: 'orange'
    },
    {
      gradient: 'linear-gradient(135deg, #ef4444, #dc2626)',
      shadow: 'rgba(239, 68, 68, 0.5)',
      name: 'red'
    },
    {
      gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)',
      shadow: 'rgba(6, 182, 212, 0.5)',
      name: 'cyan'
    },
    {
      gradient: 'linear-gradient(135deg, #84cc16, #65a30d)',
      shadow: 'rgba(132, 204, 22, 0.5)',
      name: 'lime'
    },
    {
      gradient: 'linear-gradient(135deg, #ec4899, #be185d)',
      shadow: 'rgba(236, 72, 153, 0.5)',
      name: 'pink'
    }
  ];

  const currentColor = colorSchemes[colorIndex % colorSchemes.length];

  const cardStyle = {
    background: currentColor.gradient,
    boxShadow: `0 4px 12px ${currentColor.shadow}`,
    color: 'white',
    borderRadius: '12px',
    padding: compact ? '16px' : '20px',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden'
  };

  const titleStyle = {
    margin: '0 0 8px 0',
    fontSize: compact ? '14px' : '16px',
    opacity: 0.9,
    fontWeight: '500',
    letterSpacing: '0.025em'
  };

  const valueStyle = {
    fontSize: compact ? '24px' : '32px',
    fontWeight: '700',
    margin: 0,
    lineHeight: 1,
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
  };

  const iconStyle = {
    position: 'absolute',
    top: compact ? '16px' : '20px',
    right: compact ? '16px' : '20px',
    fontSize: '24px',
    opacity: 0.3
  };

  const trendStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
    marginTop: '4px',
    opacity: 0.8
  };

  const loadingValueStyle = {
    ...valueStyle,
    background: 'rgba(255, 255, 255, 0.3)',
    color: 'transparent',
    borderRadius: '4px',
    height: compact ? '24px' : '32px',
    width: '80px',
    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
  };

  const getTrendIcon = (trend) => {
    if (trend > 0) return '↗️';
    if (trend < 0) return '↘️';
    return '➡️';
  };

  const getTrendColor = (trend) => {
    if (trend > 0) return '#22c55e';
    if (trend < 0) return '#ef4444';
    return '#64748b';
  };

  return (
    <div 
      className={`stats-card ${className}`}
      style={cardStyle}
      onMouseEnter={(e) => {
        e.target.style.transform = 'translateY(-4px)';
        e.target.style.boxShadow = `0 8px 25px ${currentColor.shadow}`;
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = 'translateY(0)';
        e.target.style.boxShadow = `0 4px 12px ${currentColor.shadow}`;
      }}
    >
      {icon && <div style={iconStyle}>{icon}</div>}
      
      <h3 style={titleStyle}>{title}</h3>
      
      {isLoading ? (
        <div style={loadingValueStyle}></div>
      ) : (
        <div style={valueStyle}>{value}</div>
      )}
      
      {trend !== null && !isLoading && (
        <div style={{...trendStyle, color: getTrendColor(trend)}}>
          <span>{getTrendIcon(trend)}</span>
          <span>{Math.abs(trend)}%</span>
        </div>
      )}
    </div>
  );
};

export const StatsGrid = ({ children, className = '' }) => {
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    margin: '20px 0'
  };

  return (
    <div className={`stats-grid ${className}`} style={gridStyle}>
      {children}
    </div>
  );
};