import { useEffect, useState } from "react";
import PageHeader from '../../components/PageHeader';
import EmployeeModal from "../../components/EmployeeModal";
import FormModal from "../../components/FormModal";
import NoDataDisplay from "../../components/NoDataDisplay";
import GridTable, { TableActions, TableButton } from "../../components/grid/GridTable";
import AlertDialog from '../../components/AlertDialog';
import ConfirmDialog from '../../components/ConfirmDialog';

const EmployeesContent = ({ username, token }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [organizationInfo, setOrganizationInfo] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignError, setAssignError] = useState('');
  const [assignSuccess, setAssignSuccess] = useState('');
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [employeeError, setEmployeeError] = useState('');
  const [employeeSubmitting, setEmployeeSubmitting] = useState(false);
  const [inviteSubmitting, setInviteSubmitting] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState('');
  const [orgDomain, setOrgDomain] = useState('');
  const [employeeListRefresh, setEmployeeListRefresh] = useState(0);
  const [alertDialog, setAlertDialog] = useState({ isOpen: false, title: '', message: '', type: 'info' });
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, onConfirm: null, title: '', message: '' });
  const [employeeForm, setEmployeeForm] = useState({
    username: '',
    password: '',
    email: '',
    designation: '',
  });
  const handleEmployeeInput = (e) => {
    const { name, value } = e.target;
    setEmployeeForm(f => ({ ...f, [name]: value }));
    setEmployeeError('');
    setInviteSuccess('');
  };

  // Email domain validation
  const emailMatchesDomain = (email) => {
    if (!orgDomain) return true; // allow until orgDomain is loaded
    const parts = email.split('@');
    return parts.length === 2 && parts[1].toLowerCase() === orgDomain.toLowerCase();
  };

  // Create employee handler
  const handleCreateEmployee = async (e) => {
    // e.preventDefault();
    setEmployeeError('');
    setInviteSuccess('');
    if (!employeeForm.username || !employeeForm.password || !employeeForm.email || !employeeForm.designation) {
      setEmployeeError('All fields are required.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(employeeForm.email)) {
      setEmployeeError('Invalid email format.');
      return;
    }
    if (orgDomain && !emailMatchesDomain(employeeForm.email)) {
      setEmployeeError('Email must match your organization domain: ' + orgDomain);
      return;
    }
    setEmployeeSubmitting(true);
    try {
      const res = await fetch('/api/portal_admin/create_employee', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(employeeForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create employee');
      // Keep modal open but clear form for next entry
      setEmployeeForm({ username: '', password: '', email: '', designation: '' });
      setInviteSuccess('✅ Employee created successfully! You can add another employee.');
      setEmployeeListRefresh(prev => prev + 1); // Trigger employee list refresh
    } catch (err) {
      setEmployeeError(err.message);
    } finally {
      setEmployeeSubmitting(false);
    }
  };

  // Invite employee handler
  const handleInviteEmployee = async () => {
    setEmployeeError('');
    setInviteSuccess('');
    if (!employeeForm.email) {
      setEmployeeError('Email is required to send invite.');
      return;
    }
    if (orgDomain && !emailMatchesDomain(employeeForm.email)) {
      setEmployeeError('Email must match your organization domain: ' + orgDomain);
      return;
    }
    setInviteSubmitting(true);
    try {
      const res = await fetch('/api/portal_admin/invite_employee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: employeeForm.email, designation: employeeForm.designation }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send invite');

      // Handle different response types
      if (data.email_error) {
        setInviteSuccess(`✅ Account created successfully!\n\nUsername: ${data.username}\nTemporary Password: ${data.temp_password}\n\n⚠️ Email delivery failed. Please provide these credentials to the employee manually.\n\n🔄 You can invite another employee below.`);
      } else {
        setInviteSuccess(`✅ Invitation sent successfully!\n\n📧 Email sent to: ${employeeForm.email}\n👤 Username: ${data.username}\n🏢 Account created for your organization\n\nThe employee will receive login credentials via email.\n\n🔄 You can invite another employee below.`);
      }

      // Clear form on success
      setEmployeeForm({ email: '', designation: '' });
      setEmployeeListRefresh(prev => prev + 1); // Trigger employee list refresh
    } catch (err) {
      setEmployeeError(err.message);
    } finally {
      setInviteSubmitting(false);
    }
  };

  // Employee form handlers
  // Clear form and messages when opening modal
  const handleOpenEmployeeModal = () => {
    setEmployeeForm({
      username: '',
      password: '',
      email: '',
      designation: '',
    });
    setEmployeeError('');
    setInviteSuccess('');
    setShowEmployeeModal(true);
  };

  // Clear form and messages when closing modal
  const handleCloseEmployeeModal = () => {
    setEmployeeForm({
      username: '',
      password: '',
      email: '',
      designation: '',
    });
    setEmployeeError('');
    setInviteSuccess('');
    setShowEmployeeModal(false);
  };
  // Fetch organization info and employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        // const token = getToken();
        // const payload = token ? parseJwt(token) : null;
        // const username = payload?.username;
        if (!username) {
          setError('No username found');
          return;
        }
        // First get the organization info
        const orgRes = await fetch(`/api/portal_admin/org_domain?username=${username}`);
        const orgData = await orgRes.json();
        if (!orgRes.ok || !orgData.success) {
          setError('Failed to fetch organization info');
          return;
        }
        setOrganizationInfo(orgData);
        // Then fetch employees for this organization
        const empRes = await fetch(`/api/portal_admin/organizations/${orgData.organization_id}/employees`);
        const empData = await empRes.json();
        if (!empRes.ok) {
          setError(empData.error || 'Failed to fetch employees');
          return;
        }
        setEmployees(empData.employees || []);
        setOrganizationInfo(prev => ({ ...prev, ...empData.organization }));
      } catch (err) {
        setError('Error fetching employees: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, [employeeListRefresh]);

  // Fetch courses for assignment when modal opens
  const openAssignModal = async (employee) => {
    setSelectedEmployee(employee);
    setShowAssignModal(true);
    setAssignError('');
    setAssignSuccess('');
    setSelectedCourseId('');
    if (organizationInfo?.organization_id) {
      try {
        setAssignLoading(true);
        const res = await fetch(`/api/portal_admin/organizations/${organizationInfo.organization_id}/courses`);
        const data = await res.json();
        if (res.ok && Array.isArray(data.courses)) {
          setCourses(data.courses);
        } else {
          setCourses([]);
          setAssignError('Failed to fetch courses');
        }
      } catch (err) {
        setCourses([]);
        setAssignError('Error fetching courses');
      } finally {
        setAssignLoading(false);
      }
    }
  };

  const closeAssignModal = () => {
    setShowAssignModal(false);
    setSelectedEmployee(null);
    setCourses([]);
    setSelectedCourseId('');
    setAssignError('');
    setAssignSuccess('');
  };

  const handleAssignCourse = async (e) => {
    e.preventDefault();
    setAssignError('');
    setAssignSuccess('');
    if (!selectedCourseId) {
      setAssignError('Please select a course');
      return;
    }
    setAssignLoading(true);
    try {
      const res = await fetch('/api/portal_admin/assign_course', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employee_id: selectedEmployee.id, username: username, course_id: selectedCourseId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to assign course');
      setAssignSuccess('Course assigned successfully!');
    } catch (err) {
      setAssignError(err.message);
    } finally {
      setAssignLoading(false);
    }
  };

  const handleDeleteEmployee = async (employeeId, employeeName) => {
    if (!window.confirm(`Are you sure you want to delete employee "${employeeName}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/portal_admin/employees/${employeeId}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete employee');
      }

      // Remove employee from local state
      setEmployees(prev => prev.filter(emp => emp.id !== employeeId));
      setAlertDialog({ isOpen: true, title: 'Success!', message: 'Employee deleted successfully', type: 'success' });

    } catch (err) {
      setAlertDialog({ isOpen: true, title: 'Delete Failed', message: 'Error deleting employee: ' + err.message, type: 'error' });
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '32px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
        <p>Loading employees...</p>
      </div>
    );
  }
  const employeeColumns = [
    {
      header: "Name",
      field: "name",
      align: "left",
      width: "1fr",
      render: (row) => (
        <div className="bold text-left">
          {row.name}
        </div>
      )
    },
    {
      header: "Email",
      field: "email",
      width: "1fr",
      align: "left"
    },
    {
      header: "Designation",
      field: "designation",
      align: "left",
      width: "1fr",
      render: (row) => row.designation || 'N/A'
    },
    {
      header: "Actions",
      width: "1fr",
      render: (row) => (
        <TableActions>
          <TableButton
            color="red"
            onClick={() => handleDeleteEmployee(row.id, row.name)}
          // disabled={!row.isActive}
          >
            Delete
          </TableButton>
          <TableButton color="blue" onClick={() => openAssignModal(row)}>
            Assign Course
          </TableButton>

        </TableActions>
      )
    }
  ];
  return (<>
    <PageHeader
      icon="👥"
      title="Employee Management"
      subtitle="Create and manage emplyoees in your organization"
      actionLabel="Create/Invite Employee"
      showAction={true}
      onActionClick={handleOpenEmployeeModal}
    >
      {organizationInfo && (
        <p style={{
          color: '#64748b',
          margin: 0
        }}>
          Organization: <strong>{organizationInfo.organization_name || organizationInfo.name}</strong> •
          Total Employees: <strong>{employees.length}</strong>
        </p>
      )}
    </PageHeader>

    <div
      className="content-card-section"
    >
      {/* {employees.length === 0 ? (
        <NoDataDisplay icon="📋" message="No employees found" desc="Start by inviting or creating employees using the dashboard." />
      ) : (
        <div className="board">
          <div className="table-header"
            style={{
              gridTemplateColumns: '1fr 1fr 100px 200px',
            }}>
            <div>Name</div>
            <div>Email</div>
            <div>Designation</div>
            <div>Actions</div>
          </div>
          {employees.map((employee, index) => (
            <div key={employee.id}
              className="table-row"
              style={{
                borderBottom: index < employees.length - 1 ? '1px solid #f1f5f9' : 'none',
                gridTemplateColumns: '1fr 1fr 100px 200px',
              }}>
              <div style={{ fontWeight: '600', color: '#1e293b' }}>{employee.name}</div>
              <div style={{ color: '#64748b' }}>{employee.email}</div>
              <div className="text-center" style={{ color: '#64748b' }}>{employee.designation}</div>
              <div className="actions">
                <button
                  onClick={() => handleDeleteEmployee(employee.id, employee.name)}
                  className="red"
                >
                  Delete
                </button>
                <button
                  onClick={() => openAssignModal(employee)}
                  className="blue"
                >
                  Assign Course
                </button>
              </div>
            </div>
          ))}
        </div>
      )} */}

      {employees &&
        <GridTable data={employees} columns={employeeColumns} />
      }
    </div>
    {showEmployeeModal &&
      <FormModal isOpen={true} className="form-modal">
        <EmployeeModal
          onClose={() => handleCloseEmployeeModal()}
          orgDomain={orgDomain}
          error={employeeError}
          successMessage={inviteSuccess}
          isSubmitting={employeeSubmitting}
          isInviting={inviteSubmitting}
          formData={employeeForm}
          onInputChange={handleEmployeeInput}
          onCreateEmployee={handleCreateEmployee}
          onInviteEmployee={handleInviteEmployee}
        />
      </FormModal>
    }
    {showAssignModal && (
      <FormModal isOpen={true} className="form-modal">

        <form
          onSubmit={handleAssignCourse}
          style={{
            background: '#fff',
            borderRadius: 16,
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            padding: 36,
            minWidth: 320,
            maxWidth: '90vw',
            width: 380,
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
            position: 'relative',
            border: '1px solid rgba(226,232,240,0.8)',
          }}
        >
          <h3 style={{ margin: 0, color: '#1e40af', fontWeight: 800, fontSize: 20, marginBottom: 8 }}>
            Assign Course to {selectedEmployee?.name}
          </h3>
          <label style={{ fontWeight: 600, color: '#334155', fontSize: 15, marginBottom: 4 }}>
            Select Course
          </label>
          <select
            value={selectedCourseId}
            onChange={e => setSelectedCourseId(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 8,
              border: '1px solid #e2e8f0',
              fontSize: 15,
              marginBottom: 8
            }}
            disabled={assignLoading}
          >
            <option value="">-- Select a course --</option>
            {courses.map(course => (
              <option key={course.id || course.course_id} value={course.id || course.course_id}>
                {course.title}
              </option>
            ))}
          </select>
          {assignError && (
            <div style={{ color: '#ef4444', background: '#fee2e2', padding: '8px 12px', borderRadius: 8, fontSize: 14 }}>
              {assignError}
            </div>
          )}
          {assignSuccess && (
            <div style={{ color: '#16a34a', background: '#dcfce7', padding: '10px 14px', borderRadius: 8, fontSize: 14 }}>
              {assignSuccess}
            </div>
          )}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <button
              type="button"
              onClick={closeAssignModal}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: '1px solid #e2e8f0',
                background: 'white',
                color: '#475569',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: 15,
              }}
              disabled={assignLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={assignLoading || !selectedCourseId}
              style={{
                padding: '8px 20px',
                borderRadius: 8,
                border: 'none',
                background: 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)',
                color: '#fff',
                fontWeight: 700,
                cursor: assignLoading ? 'not-allowed' : 'pointer',
                opacity: assignLoading ? 0.7 : 1,
                fontSize: 15,
              }}
            >
              {assignLoading ? 'Assigning...' : 'Assign Course'}
            </button>
          </div>
        </form>
      </FormModal>
    )}

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
      type="danger"
    />
  </>
  );
}
export default EmployeesContent;