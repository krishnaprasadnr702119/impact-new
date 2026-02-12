import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { AuthProvider, useAuth } from './hooks/useAuth.jsx';
import MarketingHome from "./pages/MarketingHome.jsx";
import LoginPage from "./UI/LoginPage.jsx";
import PortalAdminView from './UI/dashboardViews/PortalAdminView.jsx';
import AdminView from './UI/dashboardViews/AdminView.jsx';
import EmployeeView from './UI/dashboardViews/EmployeeView.jsx';
import CourseViewer from "./UI/dashboardViews/shared-view/CourseViewer.jsx";
const LoadingSpinner = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  }}>
    <div style={{
      width: '50px',
      height: '50px',
      border: '5px solid rgba(255, 255, 255, 0.3)',
      borderTop: '5px solid white',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }} />
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

const UnauthorizedAccess = ({ requiredRole, currentRole, payload }) => {
  const navigate = useNavigate();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: '#fff',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        padding: '40px',
        textAlign: 'center',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        maxWidth: '500px',
        margin: '20px'
      }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>🚫</div>
        <h1 style={{ fontSize: '32px', margin: '0 0 16px 0', fontWeight: '700' }}>
          Access Denied
        </h1>
        <p style={{ fontSize: '18px', margin: '0 0 24px 0', opacity: 0.9 }}>
          You don't have permission to access this page.
        </p>
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '16px',
          fontSize: '14px',
          textAlign: 'left'
        }}>
          <div><strong>Required Role:</strong> {requiredRole}</div>
          <div><strong>Your Role:</strong> {currentRole || 'Not logged in'}</div>
        </div>

        {/* Debug Info - Secure development info only */}
        {process.env.NODE_ENV === 'development' && payload && (
          <div style={{
            background: 'rgba(255, 0, 0, 0.1)',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '16px',
            fontSize: '12px',
            textAlign: 'left',
            border: '1px solid rgba(255, 0, 0, 0.3)'
          }}>
            <strong>Debug Info:</strong>
            <div>User ID: {payload?.user_id}</div>
            <div>Username: {payload?.username}</div>
            <div>Role: {payload?.role}</div>
            <div>Token Type: {payload?.token_type}</div>
          </div>
        )}

        <button
          onClick={() => navigate('/login')}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '8px',
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.3)';
          }}
          onMouseOut={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.2)';
          }}
        >
          🏠 Go to Login
        </button>
      </div>
    </div>
  );
};

UnauthorizedAccess.propTypes = {
  requiredRole: PropTypes.string.isRequired,
  currentRole: PropTypes.string,
  payload: PropTypes.object,
};

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, userRole, isLoading, payload, userName, token } = useAuth();

  if (isLoading) return <LoadingSpinner />;

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // Clone the child element and pass payload + userRole
  return React.cloneElement(children, { payload, userRole, userName, token });
};


PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

// Redirect logged-in users away from login page
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner />;

  // If already logged in, redirect to dashboard
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return children;
};

PublicRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

const Dashboard = ({ payload, userRole, userName, token }) => {
  const log = process.env.NODE_ENV === 'development' ? console.log : () => { };

  // Secure debugging - only log non-sensitive information
  log('🔐 Dashboard Debug:', {
    userRole,
    userName,
    route: window.location.pathname,
    hasPayload: !!payload,
    userId: payload?.user_id || 'unknown'
  });

  // Normalize role to handle different possible formats
  const normalizedRole = userRole?.toLowerCase().trim();

  // More comprehensive role mapping with fallbacks
  const roleToComponent = {
    'admin': <AdminView payload={payload} userName={userName} />,
    'administrator': <AdminView payload={payload} userName={userName} />, // fallback
    'portal_admin': <PortalAdminView payload={payload} token={token} />,
    'portaladmin': <PortalAdminView payload={payload} token={token} />, // fallback
    'portal-admin': <PortalAdminView payload={payload} token={token} />, // fallback
    'employee': <EmployeeView payload={payload} />,
    'user': <EmployeeView payload={payload} />, // fallback
  };

  log('🎯 Role mapping attempt:', {
    originalRole: userRole,
    normalizedRole: normalizedRole,
    availableRoles: Object.keys(roleToComponent),
    hasComponent: !!roleToComponent[normalizedRole]
  });

  const component = roleToComponent[normalizedRole];

  if (!component) {
    log('❌ No component found for role:', normalizedRole);
    return (
      <UnauthorizedAccess
        requiredRole="admin, portal_admin, or employee"
        currentRole={userRole}
        payload={payload}
      />
    );
  }

  log('✅ Rendering component for role:', normalizedRole);
  return component;
};

Dashboard.propTypes = {
  payload: PropTypes.object,
  userRole: PropTypes.string,
  userName: PropTypes.string,
  token: PropTypes.string,
};

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <div style={{
      textAlign: 'center',
      padding: '50px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: '#fff'
    }}>
      <h1 style={{ fontSize: '48px', margin: '0 0 20px 0' }}>404</h1>
      <p style={{ fontSize: '18px', margin: '0 0 30px 0' }}>Page Not Found</p>
      <button
        onClick={() => navigate('/login')}
        style={{
          background: 'rgba(255, 255, 255, 0.2)',
          color: '#fff',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '8px',
          padding: '12px 24px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: 'pointer'
        }}
      >
        Go to Login
      </button>
    </div>
  );
};

const AppRouter = () => {

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <Routes>
          {/* Marketing Home Page - Root Route */}
          <Route path="/" element={<MarketingHome />} />

          {/* Authentication */}
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/course/:courseId" element={<PrivateRoute><CourseViewer /></PrivateRoute>} />

          {/* 404 Catch All */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default AppRouter;