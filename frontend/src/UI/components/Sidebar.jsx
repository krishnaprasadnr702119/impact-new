import React from 'react';
import {
  FaBars,
  FaTimes,
  FaSignOutAlt,
} from 'react-icons/fa';
import { removeToken } from '../../utils/auth';

// Reusable Sidebar Component
const Sidebar = ({
  collapsed,
  onCollapse,
  activeTab,
  onTabChange,
  menuItems = [],
  title = "Portal Admin",
  subtitle = "Management Console",
  showSignOut = true,
  className = "",
  style = {},
  onSignOut
}) => {
  const sidebarStyle = {
    width: collapsed ? '70px' : '280px',
    background: 'linear-gradient(180deg, #1e293b 0%, #334155 100%)',
    transition: 'all 0.3s ease',
    boxShadow: '4px 0 24px rgba(0,0,0,0.15)',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    zIndex: 10,
    height: '100vh',
    ...style
  };
  return (
    <div className={className} style={sidebarStyle}>
      {/* Header */}
      <div style={{
        padding: '24px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {!collapsed && (
          <div>
            <h2 style={{
              color: '#fff',
              fontSize: '20px',
              fontWeight: '800',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              {title}
            </h2>
            <p style={{
              color: 'rgba(255,255,255,0.7)',
              fontSize: '14px',
              margin: '4px 0 0 0',
              fontWeight: '500'
            }}>
              {subtitle}
            </p>
          </div>
        )}
        <button
          onClick={() => onCollapse && onCollapse(!collapsed)}
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            borderRadius: '8px',
            padding: '8px',
            color: '#fff',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
          }}
        >
          {collapsed ? <FaBars size={16} /> : <FaTimes size={16} />}
        </button>
      </div>

      {/* Navigation Menu */}
      <nav style={{ flex: 1, padding: '20px 0' }}>
        {menuItems.map((item) => {
          // const IconComponent = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange && onTabChange(item.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: collapsed ? '16px 20px' : '16px 24px',
                background: isActive
                  ? 'linear-gradient(90deg, rgba(59,130,246,0.2), rgba(139,92,246,0.1))'
                  : 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '15px',
                fontWeight: isActive ? '600' : '500',
                transition: 'all 0.2s ease',
                justifyContent: collapsed ? 'center' : 'flex-start',
                outline: 'none',
                borderRight: isActive ? '3px solid #3b82f6' : 'none',
                color: isActive ? '#60a5fa' : 'rgba(255,255,255,0.8)',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  e.currentTarget.style.color = '#fff';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.8)';
                }
              }}
            >
              {/* <IconComponent size={20} /> */}
              {item.icon}
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Sign Out Button */}
      {showSignOut && (
        <div style={{
          padding: '8px 4px',
          borderTop: '1px solid rgba(255,255,255,0.1)'
        }}>
          <button
            onClick={onSignOut}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'flex-start',
              gap: '16px',
              padding: '12px 16px',
              background: 'rgba(239,68,68,0.1)',
              color: '#fca5a5',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: '600',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239,68,68,0.2)';
              e.currentTarget.style.color = '#fee2e2';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(239,68,68,0.1)';
              e.currentTarget.style.color = '#fca5a5';
            }}
          >
            <FaSignOutAlt size={20} />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      )}
    </div>
  );
};

export default Sidebar;