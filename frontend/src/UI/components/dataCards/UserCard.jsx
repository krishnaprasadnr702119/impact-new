import React from 'react';

const UserCard = ({
  username,
  email,
  designation,
  organization,
  createdAt,
  onResetPassword,
  resettingPassword,
  role,
  avatarGradient,
  showRoleBadge = true
}) => {
  // Role-based styling
  const getRoleStyles = () => {
    switch (role) {
      case 'admin':
        return {
          gradient: 'linear-gradient(135deg, #ef4444, #dc2626)',
          bgColor: '#fee2e2',
          textColor: '#dc2626'
        };
      case 'portal_admin':
        return {
          gradient: 'linear-gradient(135deg, #ec4899, #be185d)',
          bgColor: '#fce7f3',
          textColor: '#ec4899'
        };
      default:
        return {
          gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
          bgColor: '#dbeafe',
          textColor: '#3b82f6'
        };
    }
  };

  const roleStyles = getRoleStyles();
  return (
    <div style={{
      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
      padding: '24px',
      borderRadius: '16px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
      border: '1px solid rgba(255,255,255,0.2)',
      transition: 'all 0.3s ease',
      cursor: 'pointer'
    }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)';
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '16px'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          background: avatarGradient || roleStyles.gradient,
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
          fontWeight: '700',
          marginRight: '16px',

        }}>
          {username[0]?.toUpperCase() || 'U'}
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{
            margin: 0,
            fontSize: '18px',
            fontWeight: '700',
            color: '#1f2937'
          }}>
            {username}
          </h3>
          {designation && (
            <p style={{
              margin: '4px 0 0 0',
              fontSize: '14px',
              color: '#64748b'
            }}>
              {designation}
            </p>
          )}
        </div>
        {showRoleBadge && role && (
          <div style={{
            padding: '4px 12px',
            background: roleStyles.bgColor,
            color: roleStyles.textColor,
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '600'
          }}>
            {role.replace('_', ' ').toUpperCase()}
          </div>
        )}
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{
          fontSize: '14px',
          color: '#64748b',
          marginBottom: '4px'
        }}>
          Email:
        </div>
        <div style={{
          fontSize: '14px',
          color: '#1f2937',
          fontWeight: '500'
        }}>
          {email}
        </div>
      </div>

      {organization ? (
        <div style={{ marginBottom: '16px' }}>
          <div style={{
            fontSize: '14px',
            color: '#64748b',
            marginBottom: '4px'
          }}>
            Organization:
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <div style={{
              fontSize: '14px',
              color: '#1f2937',
              fontWeight: '500'
            }}>
              {organization.name}
            </div>
            <div style={{
              padding: '2px 8px',
              background: organization.status === 'active' ? '#dcfce7' : '#fee2e2',
              color: organization.status === 'active' ? '#16a34a' : '#dc2626',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              {organization.status}
            </div>
          </div>
          {organization.domain && (
            <div style={{
              fontSize: '12px',
              color: '#64748b',
              marginTop: '4px'
            }}>
              Domain: {organization.domain}
            </div>
          )}
        </div>
      ) : (
        <div style={{
          padding: '12px',
          background: '#fef3c7',
          borderRadius: '8px',
          marginBottom: '16px'
        }}>
          <div style={{
            fontSize: '14px',
            color: '#92400e',
            fontWeight: '500'
          }}>
            ⚠️ No Organization Assigned
          </div>
        </div>
      )}

      <div style={{
        fontSize: '12px',
        color: '#64748b',
        paddingTop: '16px',
        borderTop: '1px solid #e5e7eb',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span>Created: {createdAt ? new Date(createdAt).toLocaleDateString() : 'Unknown'}</span>
        {onResetPassword && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onResetPassword(username);
            }}
            disabled={resettingPassword === username}
            style={{
              padding: '6px 12px',
              background: resettingPassword === username
                ? '#d1d5db'
                : 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: resettingPassword === username ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              if (resettingPassword !== username) {
                e.currentTarget.style.transform = 'scale(1.05)';
              }
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            {resettingPassword === username ? '🔄 Resetting...' : '🔐 Reset Password'}
          </button>
        )}
      </div>
    </div>
  );
};

export default UserCard;