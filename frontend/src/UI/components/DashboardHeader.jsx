
import React from 'react';
import { FaUndoAlt } from 'react-icons/fa';
import useDeviceListener from '../../hooks/useDeviceListner';
import NotificationBell from './NotificationBell';

// Status Badge Component
const StatusBadge = ({ loading }) => (
  <div style={{
    padding: '6px 12px',
    background: loading ?
      'linear-gradient(135deg, #fbbf24, #f59e0b)' :
      'linear-gradient(135deg, #10b981, #059669)',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#ffffff',
    border: '1px solid rgba(16,185,129,0.2)',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.3s ease'
  }}>
    {loading ? (
      <>
        <FaUndoAlt style={{ animation: 'spin 1s linear infinite', fontSize: '10px' }} />
        UPDATING
      </>
    ) : (
      <>
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: '#ffffff',
          animation: 'pulse 2s infinite'
        }}></div>
        LIVE
      </>
    )}
  </div>
);

// Logo Component
const Logo = ({ title = "Admin Dashboard" }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: 16
  }}>
    <div style={{
      fontSize: 20,
      fontWeight: 800,
      background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text'
    }}>
      {title}
    </div>
  </div>
);

// User Welcome Component
const UserWelcome = ({ username }) => (
  <div style={{
    fontWeight: 600,
    color: '#374151',
    fontSize: 16,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '8px 16px',
    background: 'rgba(59,130,246,0.05)',
    borderRadius: '12px',
    border: '1px solid rgba(59,130,246,0.1)'
  }}>
    <span style={{ color: '#64748b', fontWeight: 400 }}>Welcome back,</span>
    <span style={{
      color: '#3b82f6',
      fontWeight: 700
    }}>
      {username}
    </span>
  </div>
);

// Refresh Button Component
const RefreshButton = ({ loading, onClick }) => (
  // <button
  //   onClick={onClick}
  //   style={{
  //     // padding: '12px',
  //     // background: loading ? 'linear-gradient(135deg, #6b7280, #9ca3af)' : 'linear-gradient(135deg, #10b981, #059669)',
  //     // border: 'none',
  //     // borderRadius: '12px',
  //     // color: 'white',
  //     cursor: loading ? 'not-allowed' : 'pointer',
  //     display: 'flex',
  //     alignItems: 'center',
  //     justifyContent: 'center',
  //     transition: 'all 0.3s ease',
  //     boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
  //     fontSize: '16px'
  //   }}
  //   disabled={loading}
  //   title="Refresh Dashboard (Auto-refreshes every 30s)"
  // >
  //   {loading ? (
  <FaUndoAlt
    onClick={onClick}
    disabled={loading}

    style={{ animation: loading ? 'spin 1s linear infinite' : '', cursor: loading ? 'not-allowed' : 'pointer', }} />
  // ) : (
  //   '🔄'
  // )}
  // </button>
);

// Auto Refresh Info Component
const AutoRefreshInfo = ({ interval = "30s" }) => (

  <div style={{
    fontSize: '12px',
    color: '#6b7280',
    textAlign: 'center',
    padding: '4px 8px',
    background: 'rgba(107, 114, 128, 0.1)',
    borderRadius: '8px',
    border: '1px solid rgba(107, 114, 128, 0.2)'
  }}>
    <div>Auto-refresh</div>
    <div style={{ fontWeight: '600', color: '#10b981' }}>{interval}</div>
  </div>);

// Avatar Component
const Avatar = ({ username }) => (
  <div style={{
    width: 24,
    height: 24,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 800,
    fontSize: 16,
    boxShadow: '0 8px 24px rgba(102,126,234,0.3)',
    border: '3px solid rgba(255,255,255,0.9)',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  }}
    onMouseOver={(e) => {
      e.currentTarget.style.transform = 'scale(1.05)';
      e.currentTarget.style.boxShadow = '0 12px 32px rgba(102,126,234,0.4)';
    }}
    onMouseOut={(e) => {
      e.currentTarget.style.transform = 'scale(1)';
      e.currentTarget.style.boxShadow = '0 8px 24px rgba(102,126,234,0.3)';
    }}
  >
    {username?.[0]?.toUpperCase() || 'A'}
  </div>
);
const refreshView = () => {
  return <>
    {showRefresh && <RefreshButton loading={loading} onClick={onRefresh} />}
    <AutoRefreshInfo />
  </>

}
// Main Dashboard Header Component
const DashboardHeader = ({
  username = "Admin",
  loading = false,
  onRefresh,
  title = "Admin Dashboard",
  showRefresh = true,
  subHeader = null,
  setCollapsed,
  rightContent = null
}) => {
  const [refreshing, setRefreshing] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useDeviceListener((device) => {
    console.log("Current device:", device);
    if (device === "mobile") {
      // your function for mobile
      setCollapsed?.(true);
    }
  });
  return (
    <>
      <header style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: isMobile ? '12px' : '16px',
        padding: isMobile ? '12px 16px' : '16px 24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 16, minWidth: 0, flex: isMobile ? '1 1 100%' : '0 0 auto' }}>
          <Logo title={title} />
          <StatusBadge loading={loading} />
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? 8 : 16,
          flexWrap: 'wrap',
          justifyContent: isMobile ? 'flex-start' : 'flex-end',
          flex: isMobile ? '1 1 100%' : '0 0 auto'
        }}>
          {!isMobile && <UserWelcome username={username} />}
          {rightContent}
          <NotificationBell />
          {showRefresh && <RefreshButton loading={loading} onClick={onRefresh} />}
          {!isMobile && <AutoRefreshInfo />}
          <Avatar username={username} />
        </div>
      </header>
      {subHeader && (
        <p style={{
          color: '#64748b',
          fontSize: isMobile ? '14px' : '16px',
          margin: '4px 0 0 0',
          fontWeight: '500',
          padding: isMobile ? '0 16px' : '0 24px'
        }}>
          {subHeader}
        </p>
      )}
    </>
  );
};
export default DashboardHeader;
