import { useState } from "react";
import capitalizedText from "../../utils/util";
import AlertDialog from './AlertDialog';
import ConfirmDialog from './ConfirmDialog';
import EmailSettings from './EmailSettings';

const SettingsContent = ({ token, payload, username }) => {
  const [resettingPassword, setResettingPassword] = useState(false);
  const [changePassword, setChangePassword] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [changePasswordSubmitting, setChangePasswordSubmitting] = useState(false);
  const [alertDialog, setAlertDialog] = useState({ isOpen: false, title: '', message: '', type: 'info' });
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, onConfirm: null, title: '', message: '' });
  const [accountInformation, setAccountInformation] = useState({
    username: username || (payload ? payload.username : ''),
    role: payload ? payload.role : ''
  });

  const handleSelfPasswordReset = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Reset Password?',
      message: 'Are you sure you want to reset your password? A new password will be sent to your email.',
      onConfirm: confirmPasswordReset
    });
  };

  const confirmPasswordReset = async () => {
    setConfirmDialog({ isOpen: false, onConfirm: null, title: '', message: '' });

    try {
      setResettingPassword(true);
      const response = await fetch('/api/portal_admin/reset_my_password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setAlertDialog({ isOpen: true, title: 'Password Reset', message: 'Password reset successfully! Check your email for the new password.', type: 'success' });
      } else {
        setAlertDialog({ isOpen: true, title: 'Reset Failed', message: `Error: ${data.error || 'Failed to reset password'}`, type: 'error' });
      }
    } catch (err) {
      console.error('Error resetting password:', err);
      setAlertDialog({ isOpen: true, title: 'Network Error', message: 'Network error when resetting password', type: 'error' });
    } finally {
      setResettingPassword(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (changePassword.newPassword !== changePassword.confirmPassword) {
      setAlertDialog({ isOpen: true, title: 'Validation Error', message: 'New passwords do not match', type: 'warning' });
      return;
    }

    if (changePassword.newPassword.length < 6) {
      setAlertDialog({ isOpen: true, title: 'Validation Error', message: 'New password must be at least 6 characters long', type: 'warning' });
      return;
    }

    try {
      setChangePasswordSubmitting(true);
      const response = await fetch('/api/change_password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          current_password: changePassword.currentPassword,
          new_password: changePassword.newPassword
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setAlertDialog({ isOpen: true, title: 'Success!', message: 'Password changed successfully!', type: 'success' });
        setChangePassword({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        setAlertDialog({ isOpen: true, title: 'Change Failed', message: `Error: ${data.error || 'Failed to change password'}`, type: 'error' });
      }
    } catch (err) {
      console.error('Error changing password:', err);
      setAlertDialog({ isOpen: true, title: 'Network Error', message: 'Network error when changing password', type: 'error' });
    } finally {
      setChangePasswordSubmitting(false);
    }
  };

  return (
    <>
      <div className="settings-container flex-container">
        {/* Email Configuration - Only for Admin */}
        {payload?.role === 'admin' && (
          <div className="flex-item" style={{ marginBottom: '24px' }}>
            <EmailSettings />
          </div>
        )}

        <div className="password-section flex-item">
          <h2 >
            🔐 Password Management
          </h2>

          {/* Quick Password Reset */}
          <div className="quick-actions">
            <h3 >
              Quick Password Reset
            </h3>
            <p >
              Forgot your password? Generate a new temporary password that will be sent to your email address.
            </p>
            <button
              onClick={handleSelfPasswordReset}
              disabled={resettingPassword}
              style={{
                background: resettingPassword
                  ? '#d1d5db'
                  : 'linear-gradient(135deg, #ef4444, #dc2626)',
                cursor: resettingPassword ? 'not-allowed' : 'pointer',
              }}
            >
              {resettingPassword ? '🔄 Sending Reset Email...' : '📧 Reset Password via Email'}
            </button>
          </div>

          {/* Change Password Form */}
          <div className="change-psw-form">
            <h3 >
              Change Password
            </h3>
            <p >
              Update your password by providing your current password and choosing a new one.
            </p>

            <form onSubmit={handleChangePassword} >
              <div>
                <label >
                  Current Password
                </label>
                <input
                  type="password"
                  value={changePassword.currentPassword}
                  onChange={(e) => setChangePassword({ ...changePassword, currentPassword: e.target.value })}
                  required
                  className="input-field"
                />
              </div>

              <div>
                <label >
                  New Password
                </label>
                <input
                  type="password"
                  value={changePassword.newPassword}
                  onChange={(e) => setChangePassword({ ...changePassword, newPassword: e.target.value })}
                  required
                  minLength="6"
                />
              </div>

              <div>
                <label >
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={changePassword.confirmPassword}
                  onChange={(e) => setChangePassword({ ...changePassword, confirmPassword: e.target.value })}
                  required
                  minLength="6"
                />
              </div>

              <button
                type="submit"
                disabled={changePasswordSubmitting}
                style={{
                  background: changePasswordSubmitting
                    ? '#d1d5db'
                    : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  cursor: changePasswordSubmitting ? 'not-allowed' : 'pointer',
                }}
              >
                {changePasswordSubmitting ? '🔄 Updating Password...' : '🔐 Update Password'}
              </button>
            </form>
          </div>
        </div>
        <div
          className="flex-item"
        >
          {/* Account Information Section */}
          <div className="account-info-section">
            <h2 >
              👤 Account Information
            </h2>

            <div style={{
              display: 'flex',
              gap: '24px',
              flexDirection: 'column',
            }}>
              <div className="light-box">
                <div className="title">
                  Username
                </div>
                <div className="text">
                  {capitalizedText(username)}
                </div>
              </div>

              <div className="dark-box">
                <div className="title">
                  Role
                </div>
                <div className="text">
                  {capitalizedText(accountInformation.role)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Dialog */}
      <AlertDialog
        isOpen={alertDialog.isOpen}
        onClose={() => setAlertDialog({ isOpen: false, title: '', message: '', type: 'info' })}
        title={alertDialog.title}
        message={alertDialog.message}
        type={alertDialog.type}
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, onConfirm: null, title: '', message: '' })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type="warning"
      />
    </>
  );
}
export default SettingsContent;