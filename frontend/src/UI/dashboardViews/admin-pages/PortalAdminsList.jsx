import { useEffect, useState } from "react";
import { FaUsers } from "react-icons/fa";
import PageHeader from "../../components/PageHeader";
import UserCard from "../../components/dataCards/UserCard";
import SearchBar from "../../components/SearchBar";
import AlertDialog from '../../components/AlertDialog';
import ConfirmDialog from '../../components/ConfirmDialog';
import { api } from '../../../utils/apiClient';

// Portal Admins List Component
const PortalAdminsList = ({ username }) => {
  const [portalAdmins, setPortalAdmins] = useState([]);
  const [filteredPortalAdmins, setFilteredPortalAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resettingPassword, setResettingPassword] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [alertDialog, setAlertDialog] = useState({ isOpen: false, title: '', message: '', type: 'info' });
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, onConfirm: null, adminUsername: '' });

  useEffect(() => {
    const fetchPortalAdmins = async () => {
      try {
        setLoading(true);
        const data = await api.get(`/admin/portal_admins?username=${username}`);

        if (data.success) {
          setPortalAdmins(data.portal_admins);
          setFilteredPortalAdmins(data.portal_admins);
          setError(null);
        } else {
          setError(data.error || 'Failed to fetch portal admins');
          setPortalAdmins([]);
          setFilteredPortalAdmins([]);
        }
      } catch (err) {
        console.error('Error fetching portal admins:', err);
        setError(err.message || 'Network error when fetching portal admins');
        setPortalAdmins([]);
        setFilteredPortalAdmins([]);
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchPortalAdmins();

    // Set up auto-refresh every 2 minutes instead of 30 seconds
    const interval = setInterval(() => {
      fetchPortalAdmins();
    }, 120000);

    return () => clearInterval(interval);
  }, [username]);

  // Filter portal admins based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredPortalAdmins(portalAdmins);
    } else {
      const filtered = portalAdmins.filter(admin =>
        admin.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (admin.designation && admin.designation.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (admin.organization && admin.organization.name && admin.organization.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredPortalAdmins(filtered);
    }
  }, [searchTerm, portalAdmins]);

  const handleResetPassword = (adminUsername) => {
    setConfirmDialog({
      isOpen: true,
      adminUsername: adminUsername,
      onConfirm: () => confirmResetPassword(adminUsername)
    });
  };

  const confirmResetPassword = async (adminUsername) => {
    setConfirmDialog({ isOpen: false, onConfirm: null, adminUsername: '' });

    try {
      setResettingPassword(adminUsername);
      const data = await api.post('/admin/reset_portal_admin_password', {
        portal_admin_username: adminUsername
      });

      if (data.success) {
        setAlertDialog({ isOpen: true, title: 'Password Reset', message: `Password reset successfully for ${adminUsername}. ${data.email_sent ? 'Email sent to user.' : 'Email could not be sent.'}`, type: 'success' });
      } else {
        setAlertDialog({ isOpen: true, title: 'Reset Failed', message: `Error: ${data.error || 'Failed to reset password'}`, type: 'error' });
      }
    } catch (err) {
      console.error('Error resetting password:', err);
      setAlertDialog({ isOpen: true, title: 'Network Error', message: 'Network error when resetting password', type: 'error' });
    } finally {
      setResettingPassword(null);
    }
  };

  return (
    <>
      <PageHeader
        icon="👨‍💼"
        title="Portal Admins"
        subtitle=" Manage and view all portal administrators in the system"
      >
        <div className="status-badge">
          {filteredPortalAdmins.length} of {portalAdmins.length} Total
        </div>
      </PageHeader>

      <div
        className="content-card-section"
      >
        {/* Search Bar */}

        <SearchBar placeholder="🔍 Search portal admins by name, email, designation, or organization..." searchTerm={searchTerm} onSearch={(e) => setSearchTerm(e)} />
        {loading ? (
          <div className="loader-box-section">
            <div className="loader-box-card"></div>
            <p>Loading portal admins...</p>
          </div>
        ) : error ? (
          <div className="error-box">
            <h3 >Error Loading Data</h3>
            <p >{error}</p>
          </div>
        ) : filteredPortalAdmins.length === 0 && portalAdmins.length === 0 ? (
          <div className="box">
            <FaUsers className="icon" />
            <h3 >{portalAdmins.length === 0 ? 'No Portal Admins Found' : 'No Results Found'}</h3>
            <p >{portalAdmins.length === 0 ? 'There are currently no portal administrators in the system.' : 'No portal admins match your search criteria. Try a different search term.'}</p>
          </div>
        ) : (
          <div className="grid">
            {filteredPortalAdmins.map((admin) => (
              <UserCard
                key={admin.id}
                username={admin.username}
                email={admin.email}
                designation={admin.designation}
                organization={admin.organization}
                createdAt={admin.created_at}
                onResetPassword={handleResetPassword}
                resettingPassword={resettingPassword}
                avatarGradient="linear-gradient(135deg, #ec4899, #be185d)"
              />
            ))}
          </div>
        )}
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
        onClose={() => setConfirmDialog({ isOpen: false, onConfirm: null, adminUsername: '' })}
        onConfirm={confirmDialog.onConfirm}
        title="Reset Password?"
        message={`Are you sure you want to reset the password for ${confirmDialog.adminUsername}? A new password will be generated and sent to their email.`}
        confirmText="Reset Password"
        cancelText="Cancel"
        type="warning"
      />
    </>
  );
}
export default PortalAdminsList;