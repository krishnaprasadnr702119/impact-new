import React from 'react';

// Controlled EmployeeModal Component
const EmployeeModal = ({
  onClose,
  onCreateEmployee,
  onInviteEmployee,
  orgDomain,
  error,
  successMessage,
  isSubmitting = false,
  isInviting = false,
  formData,
  onInputChange
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onCreateEmployee) {
      onCreateEmployee();
    }
  };

  const handleInvite = () => {
    if (onInviteEmployee) {
      onInviteEmployee();
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 10,
    border: '1px solid #e2e8f0',
    fontSize: 15,
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    transition: 'all 0.2s',
    outline: 'none'
  };

  const buttonStyle = {
    padding: '10px 24px',
    borderRadius: 10,
    border: 'none',
    fontWeight: 700,
    cursor: 'pointer',
    fontSize: 15,
    transition: 'all 0.2s',
  };

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 16,
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
        padding: 36,
        minWidth: 360,
        maxWidth: '90vw',
        width: 420,
        display: 'flex',
        flexDirection: 'column',
        gap: 22,
        position: 'relative',
        animation: 'slideUp 0.3s ease-out',
        border: '1px solid rgba(226,232,240,0.8)',
      }}
    >
      <h3 style={{
        margin: 0,
        color: '#1e40af',
        fontWeight: 800,
        fontSize: 24,
        position: 'relative',
        paddingBottom: 14,
        marginBottom: 5
      }}>
        Create / Invite Employee
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: 40,
          height: 4,
          background: 'linear-gradient(90deg, #3b82f6, #1e40af)',
          borderRadius: 2
        }}></div>
      </h3>

      {/* Username */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label style={{ fontWeight: 600, color: '#334155', fontSize: 15 }}>
          Username*
        </label>
        <input
          name="username"
          value={formData.username}
          onChange={onInputChange}
          required
          placeholder="Enter username"
          style={inputStyle}
        />
      </div>

      {/* Password */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label style={{ fontWeight: 600, color: '#334155', fontSize: 15 }}>
          Password*
        </label>
        <input
          name="password"
          type="password"
          value={formData.password}
          onChange={onInputChange}
          required
          placeholder="Enter password"
          style={inputStyle}
        />
      </div>

      {/* Email */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label style={{ fontWeight: 600, color: '#334155', fontSize: 15 }}>
          Email Address*{orgDomain && ` (must match org domain: ${orgDomain})`}
        </label>
        <input
          name="email"
          type="email"
          value={formData.email}
          onChange={onInputChange}
          required
          placeholder={orgDomain ? `e.g. user@${orgDomain}` : 'Enter email address'}
          style={inputStyle}
        />
      </div>

      {/* Designation */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label style={{ fontWeight: 600, color: '#334155', fontSize: 15 }}>
          Designation*
        </label>
        <input
          name="designation"
          value={formData.designation}
          onChange={onInputChange}
          required
          placeholder="e.g. Software Engineer"
          style={inputStyle}
        />
      </div>

      {/* Error */}
      {error && (
        <div style={{
          color: '#ef4444',
          fontWeight: 600,
          background: '#fee2e2',
          padding: '10px 14px',
          borderRadius: 8,
          fontSize: 14,
          display: 'flex',
          alignItems: 'center',
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
               viewBox="0 0 24 24" fill="none"
               stroke="#ef4444" strokeWidth="2"
               strokeLinecap="round" strokeLinejoin="round"
               style={{ marginRight: 8 }}>
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          {error}
        </div>
      )}

      {/* Success */}
      {successMessage && (
        <div style={{
          color: '#16a34a',
          fontWeight: 500,
          background: '#dcfce7',
          padding: '16px 18px',
          borderRadius: 10,
          fontSize: 14,
          display: 'flex',
          alignItems: 'flex-start',
          whiteSpace: 'pre-line',
          fontFamily: 'monospace',
          border: '1px solid #86efac'
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
               viewBox="0 0 24 24" fill="none"
               stroke="#16a34a" strokeWidth="2"
               strokeLinecap="round" strokeLinejoin="round"
               style={{ marginRight: 12, marginTop: 2, flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M9 12l2 2l4-4" />
          </svg>
          <div style={{ flex: 1 }}>
            {successMessage}
          </div>
        </div>
      )}

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 12, marginTop: 8, justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={onClose}
          style={{
            ...buttonStyle,
            border: '1px solid #e2e8f0',
            background: 'white',
            color: '#475569',
            fontWeight: 600,
          }}
        >
          Cancel
        </button>

        <button
          type="button"
          disabled={isSubmitting}
          onClick={handleSubmit}
          style={{
            ...buttonStyle,
            background: 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)',
            color: '#fff',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            opacity: isSubmitting ? 0.7 : 1,
            boxShadow: '0 4px 12px rgba(37,99,235,0.2)',
          }}
        >
          {isSubmitting ? 'Creating...' : 'Create Employee'}
        </button>

        <button
          type="button"
          disabled={isInviting}
          onClick={handleInvite}
          style={{
            ...buttonStyle,
            background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
            color: '#fff',
            cursor: isInviting ? 'not-allowed' : 'pointer',
            opacity: isInviting ? 0.7 : 1,
            boxShadow: '0 4px 12px rgba(16,185,129,0.2)',
          }}
        >
          {isInviting ? 'Inviting...' : 'Invite Employee'}
        </button>
      </div>
    </div>
  );
};

export default EmployeeModal;
