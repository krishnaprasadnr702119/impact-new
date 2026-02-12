import React, { useEffect, useState } from 'react';
import { FaPlus, FaTrash } from 'react-icons/fa';
import Loader from '../../components/Loader';
import PageHeader from '../../components/PageHeader';


const OrganizationList = () => {
  const [manageOrg, setManageOrg] = useState(null);
  const [manageCourses, setManageCourses] = useState([]);
  const [manageSaving, setManageSaving] = useState(false);
  const [manageError, setManageError] = useState('');
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: '',
    portal_admin: '',
    org_domain: '',
    assigned_course: '',
    status: 'active',
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [statusLoading, setStatusLoading] = useState(null);
  const [courses, setCourses] = useState([]);
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOrganizations, setFilteredOrganizations] = useState([]);

  const fetchOrganizations = () => {
    setLoading(true);
    setError(null);
    fetch('/api/organizations')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then(data => {
        setOrganizations(data.organizations || []);
        setFilteredOrganizations(data.organizations || []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Unknown error');
        setLoading(false);
      });
  };

  const fetchCourses = () => {
    fetch('/api/courses')
      .then(res => res.json())
      .then(data => setCourses(data.courses || []));
  };

  useEffect(() => {
    fetchOrganizations();
    fetchCourses();
  }, []);

  // Filter organizations based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredOrganizations(organizations);
    } else {
      const filtered = organizations.filter(org =>
        org.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOrganizations(filtered);
    }
  }, [searchTerm, organizations]);

  const handleInputChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleCreate = async e => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    // Validate required fields
    if (!form.name || !form.portal_admin || !form.org_domain || !form.status) {
      setFormError('Please fill all required fields.');
      setSubmitting(false);
      return;
    }
    try {
      // Get password for portal admin
      const portalAdminPassword = prompt(
        `🔐 Set Password for Portal Admin\n\n` +
        `Username: ${form.portal_admin}\n` +
        `Email: ${form.portal_admin}@${form.org_domain}\n` +
        `Organization: ${form.name}\n\n` +
        `Enter a secure password for the portal admin:`,
        'portaladmin123'
      );
      if (!portalAdminPassword) {
        setFormError('Portal admin password is required.');
        setSubmitting(false);
        return;
      }

      // Create organization with portal admin user in one call
      const res = await fetch('/api/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          admin_password: portalAdminPassword,
          admin_email: `${form.portal_admin}@${form.org_domain}`,
          admin_designation: 'Portal Administrator'
        }),
      });

      let data = null;
      try {
        data = await res.json();
      } catch (jsonErr) {
        // Not valid JSON
        if (!res.ok) {
          setFormError('Server error: ' + res.status);
          setSubmitting(false);
          return;
        }
      }

      if (!res.ok) throw new Error((data && data.message) || 'Failed to create organization');

      // Show success message with details
      if (data && data.admin_username && data.admin_email) {
        alert(`✅ Organization created successfully!\n\nPortal Admin Details:\nUsername: ${data.admin_username}\nEmail: ${data.admin_email}\nPassword: ${portalAdminPassword}\n\nThe portal admin can now log in with these credentials.`);
      }

      setShowModal(false);
      setForm({ name: '', portal_admin: '', org_domain: '', assigned_course: '', status: 'active' });
      fetchOrganizations();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this organization?')) {
      return;
    }

    setDeleteLoading(id);
    try {
      const res = await fetch(`/api/organizations/${id}`, {
        method: 'DELETE',
      });

      let data = null;
      try {
        data = await res.json();
      } catch (jsonErr) {
        // Not valid JSON, ignore
      }

      if (!res.ok) {
        const errorMsg = (data && (data.error || data.message)) ? data.error || data.message : 'Failed to delete organization';
        throw new Error(errorMsg);
      }

      // Refresh the list after successful deletion
      fetchOrganizations();
    } catch (err) {
      alert('Error deleting organization: ' + err.message);
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    if (statusLoading) return;

    setStatusLoading(`${id}-${newStatus}`);
    try {
      const res = await fetch(`/api/organizations/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        throw new Error('Failed to update organization status');
      }

      // Refresh the list after successful update
      fetchOrganizations();
    } catch (err) {
      alert('Error updating status: ' + err.message);
    } finally {
      setStatusLoading(null);
    }
  };

  const openManageModal = (org) => {
    setManageOrg(org);
    setManageCourses(org.courses ? org.courses.map(c => c.id) : []);
    setManageError('');
  };

  const handleDeleteOrganization = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }
    await handleDelete(id);
  };

  return (
    <
      >
      <PageHeader
        icon="🏢"
        title="Organization Management"
        subtitle="Create and manage organizations in your learning platform"
        searchValue={searchTerm}
        onSearchChange={(e) => setSearchTerm(e.target.value)}
        onSearchClear={() => setSearchTerm('')}
        actionLabel="Create New Organization"
        showAction={true}
        showSearch={true}
        onActionClick={() => setShowModal(true)}
      />
      {/* Modal for creating organization */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(15,23,42,0.65)',
          backdropFilter: 'blur(5px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'fadeIn 0.2s ease-out',
        }}>
          <form
            onSubmit={handleCreate}
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
              Create Organization
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontWeight: 600, color: '#334155', fontSize: 15 }}>
                Organization Name*
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleInputChange}
                required
                placeholder="Enter organization name"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 10,
                  border: '1px solid #e2e8f0',
                  fontSize: 15,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  transition: 'all 0.2s',
                  outline: 'none'
                }}
                onFocus={e => {
                  e.target.style.borderColor = '#93c5fd';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)';
                }}
                onBlur={e => {
                  e.target.style.borderColor = '#e2e8f0';
                  e.target.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontWeight: 600, color: '#334155', fontSize: 15 }}>
                Portal Admin*
              </label>
              <input
                name="portal_admin"
                value={form.portal_admin}
                onChange={handleInputChange}
                required
                placeholder="Enter admin name"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 10,
                  border: '1px solid #e2e8f0',
                  fontSize: 15,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  transition: 'all 0.2s',
                  outline: 'none'
                }}
                onFocus={e => {
                  e.target.style.borderColor = '#93c5fd';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)';
                }}
                onBlur={e => {
                  e.target.style.borderColor = '#e2e8f0';
                  e.target.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontWeight: 600, color: '#334155', fontSize: 15 }}>
                Org Domain*
              </label>
              <input
                name="org_domain"
                value={form.org_domain}
                onChange={handleInputChange}
                required
                placeholder="e.g. example.com"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 10,
                  border: '1px solid #e2e8f0',
                  fontSize: 15,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  transition: 'all 0.2s',
                  outline: 'none'
                }}
                onFocus={e => {
                  e.target.style.borderColor = '#93c5fd';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)';
                }}
                onBlur={e => {
                  e.target.style.borderColor = '#e2e8f0';
                  e.target.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
                }}
              />
            </div>

            {/* Auto-generated email preview */}
            {form.portal_admin && form.org_domain && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ fontWeight: 600, color: '#334155', fontSize: 15 }}>
                  Portal Admin Email (Auto-generated)
                </label>
                <div style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 10,
                  border: '1px solid #e5f3ff',
                  fontSize: 15,
                  background: '#f0f9ff',
                  color: '#0369a1',
                  fontFamily: 'monospace'
                }}>
                  {form.portal_admin}@{form.org_domain}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontWeight: 600, color: '#334155', fontSize: 15 }}>
                Assign Course
              </label>
              <select
                name="assigned_course"
                value={form.assigned_course}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 10,
                  border: '1px solid #e2e8f0',
                  fontSize: 15,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  transition: 'all 0.2s',
                  outline: 'none',
                  background: '#fff',
                }}
              >
                <option value="">-- No course assigned --</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>{course.title}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontWeight: 600, color: '#334155', fontSize: 15 }}>
                Status*
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 10,
                  border: '1px solid #e2e8f0',
                  fontSize: 15,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  transition: 'all 0.2s',
                  outline: 'none',
                  appearance: 'none',
                  backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748b\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 12px center',
                  backgroundSize: '16px',
                  cursor: 'pointer'
                }}
                onFocus={e => {
                  e.target.style.borderColor = '#93c5fd';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)';
                }}
                onBlur={e => {
                  e.target.style.borderColor = '#e2e8f0';
                  e.target.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
                }}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            {formError && (
              <div style={{
                color: '#ef4444',
                fontWeight: 600,
                background: '#fee2e2',
                padding: '10px 14px',
                borderRadius: 8,
                fontSize: 14,
                display: 'flex',
                alignItems: 'center'
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8 }}>
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                {formError}
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, marginTop: 8, justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{
                  padding: '10px 18px',
                  borderRadius: 10,
                  border: '1px solid #e2e8f0',
                  background: 'white',
                  color: '#475569',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: 15,
                  transition: 'all 0.2s',
                }}
                onMouseOver={e => {
                  e.currentTarget.style.background = '#f8fafc';
                  e.currentTarget.style.borderColor = '#cbd5e1';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.background = 'white';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: '10px 24px',
                  borderRadius: 10,
                  border: 'none',
                  background: 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)',
                  color: '#fff',
                  fontWeight: 700,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.7 : 1,
                  boxShadow: '0 4px 12px rgba(37,99,235,0.2)',
                  fontSize: 15,
                  transition: 'all 0.2s',
                }}
                onMouseOver={e => {
                  if (!submitting) {
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(37,99,235,0.25)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseOut={e => {
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(37,99,235,0.2)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {submitting ? 'Creating...' : 'Create Organization'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table and content below the top layer */}
      <div
        style={{
          width: '100%',
          height: '100%',
          margin: 0,
        }}
      >
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            overflow: 'hidden',
            width: '100%',
            minWidth: 0,
            minHeight: 0,
            height: '100%',
            maxHeight: 'calc(100vh - 180px)',
            border: '1px solid #EAECF0',
          }}
        >
          {loading ? (
            <div style={{ padding: '40px' }}>
              <Loader />
            </div>
          ) : error ? (
            <div style={{
              color: '#ef4444',
              fontWeight: 600,
              fontSize: '18px',
              padding: '40px',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%'
            }}>
              <div>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
                Failed to load organizations: {error}
              </div>
            </div>
          ) : filteredOrganizations.length === 0 && searchTerm ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: '#64748b',
              fontSize: '18px',
              fontWeight: 500,
              flexDirection: 'column',
              gap: '16px'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                marginBottom: '8px'
              }}>
                🔍
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 600, marginBottom: '8px' }}>No Organizations Found</div>
                <div style={{ fontSize: '16px', opacity: 0.8 }}>
                  No organizations match "{searchTerm}". Try a different search term.
                </div>
              </div>
            </div>
          ) : organizations.length === 0 ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: '#64748b',
              fontSize: '18px',
              fontWeight: 500,
              flexDirection: 'column',
              gap: '16px'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                marginBottom: '8px'
              }}>
                🏢
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 600, marginBottom: '8px' }}>No Organizations Yet</div>
                <div style={{ fontSize: '16px', opacity: 0.8 }}>Create your first organization to get started</div>
              </div>
            </div>
          ) : (
            <div style={{ padding: '24px', height: '100%', overflow: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                {filteredOrganizations.map((org, idx) => (
                  <div
                    key={org.id || org.name}
                    style={{
                      padding: '24px',
                      borderRadius: '20px',
                      background: 'white',
                      border: '2px solid transparent',
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.12)';
                      e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
                      e.currentTarget.style.borderColor = 'transparent';
                    }}
                  >
                    {/* Gradient top border */}
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: 'linear-gradient(90deg, #1e3a8a 0%, #0d9488 50%, #0891b2 100%)',
                    }}></div>

                    {/* Decorative background */}
                    <div style={{
                      position: 'absolute',
                      top: '-20px',
                      right: '-20px',
                      width: '100px',
                      height: '100px',
                      background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.1), rgba(13, 148, 136, 0.1))',
                      borderRadius: '50%',
                    }}></div>

                    {/* Organization Header */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      marginBottom: '20px',
                      position: 'relative',
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          marginBottom: '8px',
                        }}>
                          <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #1e3a8a 0%, #0d9488 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '24px',
                            boxShadow: '0 4px 12px rgba(13, 148, 136, 0.3)',
                          }}>
                            🏢
                          </div>
                          <div>
                            <h3 style={{
                              fontWeight: 800,
                              background: 'linear-gradient(135deg, #1e293b 0%, #0d9488 100%)',
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                              backgroundClip: 'text',
                              fontSize: '20px',
                              margin: '0 0 4px 0',
                              lineHeight: '1.2',
                            }}>
                              {org.name}
                            </h3>
                            <p style={{
                              color: '#64748b',
                              fontSize: '12px',
                              margin: 0,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontWeight: 500,
                            }}>
                              📅 {org.created}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Status Badge */}
                      {org.status && (
                        <div style={{
                          padding: '6px 12px',
                          borderRadius: '20px',
                          fontSize: '11px',
                          fontWeight: 700,
                          background: getStatusBgColor(org.status),
                          color: getStatusColor(org.status),
                          border: `2px solid ${getStatusColor(org.status)}`,
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          boxShadow: `0 2px 8px ${getStatusColor(org.status)}30`,
                          whiteSpace: 'nowrap',
                          alignSelf: 'flex-start',
                        }}>
                          {org.status.charAt(0).toUpperCase() + org.status.slice(1)}
                        </div>
                      )}
                    </div>

                    {/* Status Change Section */}
                    <div style={{
                      marginBottom: '20px',
                      padding: '16px',
                      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                    }}>
                      <div style={{
                        fontSize: '13px',
                        fontWeight: 700,
                        color: '#475569',
                        marginBottom: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}>
                        ⚡ Status Actions
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {org.status !== 'active' && (
                          <button
                            onClick={() => handleStatusChange(org.id, 'active')}
                            disabled={statusLoading === `${org.id}-active`}
                            style={{
                              flex: 1,
                              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '8px 12px',
                              fontSize: '12px',
                              fontWeight: 700,
                              cursor: statusLoading === `${org.id}-active` ? 'not-allowed' : 'pointer',
                              opacity: statusLoading === `${org.id}-active` ? 0.7 : 1,
                              transition: 'all 0.2s',
                              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
                            }}
                            onMouseEnter={(e) => {
                              if (statusLoading !== `${org.id}-active`) {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = '0 2px 8px rgba(16, 185, 129, 0.3)';
                            }}
                          >
                            {statusLoading === `${org.id}-active` ? '⏳' : '✓ Activate'}
                          </button>
                        )}
                        {org.status !== 'inactive' && (
                          <button
                            onClick={() => handleStatusChange(org.id, 'inactive')}
                            disabled={statusLoading === `${org.id}-inactive`}
                            style={{
                              flex: 1,
                              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '8px 12px',
                              fontSize: '12px',
                              fontWeight: 700,
                              cursor: statusLoading === `${org.id}-inactive` ? 'not-allowed' : 'pointer',
                              opacity: statusLoading === `${org.id}-inactive` ? 0.7 : 1,
                              transition: 'all 0.2s',
                              boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)',
                            }}
                            onMouseEnter={(e) => {
                              if (statusLoading !== `${org.id}-inactive`) {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.4)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = '0 2px 8px rgba(245, 158, 11, 0.3)';
                            }}
                          >
                            {statusLoading === `${org.id}-inactive` ? '⏳' : '⏸ Deactivate'}
                          </button>
                        )}
                        {org.status !== 'suspended' && (
                          <button
                            onClick={() => handleStatusChange(org.id, 'suspended')}
                            disabled={statusLoading === `${org.id}-suspended`}
                            style={{
                              flex: 1,
                              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '8px 12px',
                              fontSize: '12px',
                              fontWeight: 700,
                              cursor: statusLoading === `${org.id}-suspended` ? 'not-allowed' : 'pointer',
                              opacity: statusLoading === `${org.id}-suspended` ? 0.7 : 1,
                              transition: 'all 0.2s',
                              boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)',
                            }}
                            onMouseEnter={(e) => {
                              if (statusLoading !== `${org.id}-suspended`) {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.4)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = '0 2px 8px rgba(239, 68, 68, 0.3)';
                            }}
                          >
                            {statusLoading === `${org.id}-suspended` ? '⏳' : '⊘ Suspend'}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        style={{
                          flex: 1,
                          background: 'linear-gradient(135deg, #1e3a8a 0%, #0d9488 100%)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '10px',
                          padding: '12px 16px',
                          fontSize: '14px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          boxShadow: '0 2px 8px rgba(13, 148, 136, 0.3)',
                        }}
                        onClick={() => openManageModal(org)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 4px 16px rgba(13, 148, 136, 0.5)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(13, 148, 136, 0.3)';
                        }}
                      >
                        <span style={{ fontSize: '16px' }}>⚙️</span>
                        Manage Courses
                      </button>

                      <button
                        style={{
                          flex: '0 0 auto',
                          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '10px',
                          padding: '12px',
                          fontSize: '16px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)',
                        }}
                        onClick={() => handleDeleteOrganization(org.id, org.name)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.05)';
                          e.currentTarget.style.boxShadow = '0 4px 16px rgba(239, 68, 68, 0.5)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(239, 68, 68, 0.3)';
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Manage Organization Modal */}
      {manageOrg && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(15,23,42,0.65)',
          backdropFilter: 'blur(5px)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 16,
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            padding: 36,
            minWidth: 360,
            maxWidth: '90vw',
            width: 480,
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
            position: 'relative',
            border: '1px solid rgba(226,232,240,0.8)',
          }}>
            <h3 style={{ margin: 0, color: '#1e40af', fontWeight: 800, fontSize: 22 }}>Manage Organization</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8, color: '#111' }}>
              <div><b>Name:</b> {manageOrg.name}</div>
              <div><b>Portal Admin:</b> {manageOrg.portal_admin || '-'}</div>
              <div><b>Domain:</b> {manageOrg.org_domain || '-'}</div>
              <div><b>Status:</b> {manageOrg.status}</div>
              <div><b>Created:</b> {manageOrg.created}</div>
            </div>
            <div style={{ fontWeight: 600, color: '#111', fontSize: 15, marginBottom: 4 }}>Assigned Courses</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 200, overflowY: 'auto', marginBottom: 8, color: '#111' }}>
              {courses.length === 0 && <span style={{ color: '#111' }}>No courses available.</span>}
              {courses.map(course => (
                <label key={course.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 500, color: '#111' }}>
                  <input
                    type="checkbox"
                    checked={manageCourses.includes(course.id)}
                    onChange={e => {
                      if (e.target.checked) {
                        setManageCourses(prev => [...prev, course.id]);
                      } else {
                        setManageCourses(prev => prev.filter(id => id !== course.id));
                      }
                    }}
                  />
                  {course.title}
                  {manageCourses.includes(course.id) && <span style={{ color: '#111', fontSize: 13, marginLeft: 4 }}>(assigned)</span>}
                </label>
              ))}
            </div>
            {manageError && <div style={{ color: '#ef4444', fontWeight: 600 }}>{manageError}</div>}
            <div style={{ display: 'flex', gap: 12, marginTop: 8, justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setManageOrg(null)}
                style={{
                  padding: '10px 18px',
                  borderRadius: 10,
                  border: '1px solid #e2e8f0',
                  background: 'white',
                  color: '#475569',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: 15,
                  transition: 'all 0.2s',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={manageSaving}
                style={{
                  padding: '10px 24px',
                  borderRadius: 10,
                  border: 'none',
                  background: 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)',
                  color: '#fff',
                  fontWeight: 700,
                  cursor: manageSaving ? 'not-allowed' : 'pointer',
                  opacity: manageSaving ? 0.7 : 1,
                  boxShadow: '0 4px 12px rgba(37,99,235,0.2)',
                  fontSize: 15,
                  transition: 'all 0.2s',
                }}
                onClick={async () => {
                  setManageSaving(true);
                  setManageError('');
                  try {
                    const res = await fetch(`/api/organizations/${manageOrg.id}/assign_courses`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ course_ids: manageCourses })
                    });
                    if (!res.ok) {
                      const data = await res.json();
                      throw new Error(data.message || 'Failed to assign courses');
                    }
                    setManageOrg(null);
                    fetchOrganizations();
                  } catch (err) {
                    setManageError(err.message);
                  } finally {
                    setManageSaving(false);
                  }
                }}
              >
                {manageSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Dropdown component for assigning course to an organization
const AssignCourseDropdown = ({ org, courses, fetchOrganizations }) => {
  const [selectedCourse, setSelectedCourse] = useState(org.assigned_course || '');
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState('');

  const handleAssign = async () => {
    setAssignError('');
    setAssigning(true);
    try {
      const res = await fetch(`/api/organizations/${org.id}/assign_course`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ course_id: selectedCourse })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to assign course');
      }
      fetchOrganizations();
    } catch (err) {
      setAssignError(err.message);
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <select
        value={selectedCourse}
        onChange={e => setSelectedCourse(e.target.value)}
        style={{
          padding: '6px 12px',
          borderRadius: 8,
          border: '1px solid #e5e7eb',
          fontSize: 14,
          minWidth: 120
        }}
      >
        <option value="">-- Assign Course --</option>
        {courses.map(course => (
          <option key={course.id} value={course.id}>{course.title}</option>
        ))}
      </select>
      <button
        onClick={handleAssign}
        disabled={assigning || !selectedCourse}
        style={{
          background: '#2563eb',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          padding: '6px 14px',
          fontWeight: 600,
          fontSize: 14,
          cursor: assigning || !selectedCourse ? 'not-allowed' : 'pointer',
          opacity: assigning || !selectedCourse ? 0.7 : 1,
          transition: 'all 0.2s',
        }}
      >
        {assigning ? 'Assigning...' : 'Assign'}
      </button>
      {assignError && <span style={{ color: '#ef4444', fontSize: 13 }}>{assignError}</span>}
    </div>
  );
}


const thStyle = {
  textAlign: 'left',
  padding: 'clamp(10px, 2vw, 16px) clamp(10px, 2vw, 18px)',
  fontWeight: 700,
  color: '#1e293b',
  fontSize: 'clamp(13px, 2vw, 16px)',
  borderBottom: '2px solid #e5e7eb',
  whiteSpace: 'nowrap',
};

const tdStyle = {
  padding: 'clamp(8px, 1.5vw, 14px) clamp(8px, 1.5vw, 18px)',
  fontSize: 'clamp(12px, 2vw, 15px)',
  color: '#374151',
  background: 'none',
  whiteSpace: 'nowrap',
};

const getStatusColor = (status) => {
  switch (status) {
    case 'active': return '#16a34a';
    case 'inactive': return '#b45309';
    case 'suspended': return '#dc2626';
    default: return '#64748b';
  }
}

const getStatusBgColor = (status) => {
  switch (status) {
    case 'active': return '#dcfce7';
    case 'inactive': return '#fef3c7';
    case 'suspended': return '#fee2e2';
    default: return '#f1f5f9';
  }
}

export default OrganizationList;

