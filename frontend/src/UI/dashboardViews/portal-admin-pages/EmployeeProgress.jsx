import React, { useState, useEffect } from 'react';
import { FaUser, FaBook, FaCheckCircle, FaClock, FaTrophy, FaChartLine } from 'react-icons/fa';
import { getToken, parseJwt } from '../../../utils/auth';

const EmployeeProgress = () => {
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [employeeDetails, setEmployeeDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [organizationId, setOrganizationId] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const token = getToken();
            const payload = token ? parseJwt(token) : null;
            const username = payload?.username;

            // First get the organization info
            const orgRes = await fetch(`/api/portal_admin/org_domain?username=${username}`);
            const orgData = await orgRes.json();

            if (!orgRes.ok || !orgData.success) {
                console.error('Failed to fetch organization info');
                setLoading(false);
                return;
            }

            setOrganizationId(orgData.organization_id);

            // Then fetch employees for this organization
            const empRes = await fetch(`/api/portal_admin/organizations/${orgData.organization_id}/employees`);
            const empData = await empRes.json();

            if (empRes.ok) {
                setEmployees(empData.employees || []);
            } else {
                console.error('Failed to fetch employees:', empData.error);
            }
        } catch (error) {
            console.error('Error fetching employees:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchEmployeeProgress = async (employeeUsername) => {
        try {
            setDetailsLoading(true);
            setErrorMessage('');
            const token = getToken();
            const payload = token ? parseJwt(token) : null;
            const adminUsername = payload?.username;

            console.log('Fetching progress for:', employeeUsername, 'Admin:', adminUsername);
            const response = await fetch(`/api/portal_admin/employee_progress/${employeeUsername}?username=${adminUsername}`);
            const data = await response.json();
            console.log('Employee progress response:', data);

            if (response.ok && data.success) {
                setEmployeeDetails(data);
            } else {
                const error = data.error || 'Failed to load progress data';
                console.error('Failed to fetch employee progress:', error);
                setErrorMessage(error);
                setEmployeeDetails(null);
            }
        } catch (error) {
            console.error('Error fetching employee progress:', error);
            setErrorMessage(error.message || 'Network error occurred');
            setEmployeeDetails(null);
        } finally {
            setDetailsLoading(false);
        }
    };

    const handleEmployeeClick = (employee) => {
        setSelectedEmployee(employee);
        fetchEmployeeProgress(employee.name);
    };

    const filteredEmployees = employees.filter(emp =>
        emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.designation?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getProgressColor = (percentage) => {
        if (percentage >= 70) return '#10b981';
        if (percentage >= 40) return '#f59e0b';
        return '#ef4444';
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 18, color: '#6b7280' }}>Loading employees...</div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: 24 }}>
            <h1 style={{ marginBottom: 24, fontSize: 28, fontWeight: 700, color: '#111827' }}>
                <FaChartLine style={{ marginRight: 12, color: '#3b82f6' }} />
                Employee Progress Tracking
            </h1>

            <div style={{ display: 'grid', gridTemplateColumns: selectedEmployee ? '400px 1fr' : '1fr', gap: 24 }}>
                {/* Employee List */}
                <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <div style={{ marginBottom: 16 }}>
                        <input
                            type="text"
                            placeholder="Search employees..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                borderRadius: 8,
                                border: '1px solid #e5e7eb',
                                fontSize: 14
                            }}
                        />
                    </div>

                    <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 12 }}>
                        {filteredEmployees.length} employees found
                    </div>

                    <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                        {filteredEmployees.map(employee => (
                            <div
                                key={employee.id}
                                onClick={() => handleEmployeeClick(employee)}
                                style={{
                                    padding: 12,
                                    borderRadius: 8,
                                    marginBottom: 8,
                                    cursor: 'pointer',
                                    background: selectedEmployee?.id === employee.id ? '#eff6ff' : '#f9fafb',
                                    border: `2px solid ${selectedEmployee?.id === employee.id ? '#3b82f6' : 'transparent'}`,
                                    transition: 'all 0.2s'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: '50%',
                                        background: '#3b82f6',
                                        color: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 600,
                                        fontSize: 16
                                    }}>
                                        {employee.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>
                                            {employee.name}
                                        </div>
                                        <div style={{ fontSize: 12, color: '#6b7280' }}>
                                            {employee.designation || 'Employee'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Employee Progress Details */}
                {selectedEmployee && (
                    <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        {detailsLoading ? (
                            <div style={{ textAlign: 'center', padding: 40 }}>
                                <div style={{ fontSize: 16, color: '#6b7280' }}>Loading progress...</div>
                            </div>
                        ) : employeeDetails ? (
                            <>
                                {/* Employee Header */}
                                <div style={{ borderBottom: '2px solid #f3f4f6', paddingBottom: 20, marginBottom: 20 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                                        <div style={{
                                            width: 60,
                                            height: 60,
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
                                            color: 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: 700,
                                            fontSize: 24
                                        }}>
                                            {employeeDetails.employee?.username?.charAt(0).toUpperCase() || selectedEmployee.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>
                                                {employeeDetails.employee?.username || selectedEmployee.name}
                                            </h2>
                                            <div style={{ color: '#6b7280', fontSize: 14 }}>
                                                {employeeDetails.employee?.email || selectedEmployee.email}
                                            </div>
                                            <div style={{ color: '#6b7280', fontSize: 14 }}>
                                                {employeeDetails.employee?.designation || selectedEmployee.designation || 'Employee'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Overall Stats */}
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                                        <div style={{ background: '#eff6ff', padding: 12, borderRadius: 8, textAlign: 'center' }}>
                                            <div style={{ fontSize: 12, color: '#3b82f6', marginBottom: 4 }}>Enrolled Courses</div>
                                            <div style={{ fontSize: 24, fontWeight: 700, color: '#1e40af' }}>
                                                {employeeDetails.courses?.length || 0}
                                            </div>
                                        </div>
                                        <div style={{ background: '#d1fae5', padding: 12, borderRadius: 8, textAlign: 'center' }}>
                                            <div style={{ fontSize: 12, color: '#059669', marginBottom: 4 }}>Completed</div>
                                            <div style={{ fontSize: 24, fontWeight: 700, color: '#047857' }}>
                                                {employeeDetails.courses?.filter(c => c.progress_percentage >= 100).length || 0}
                                            </div>
                                        </div>
                                        <div style={{ background: '#fef3c7', padding: 12, borderRadius: 8, textAlign: 'center' }}>
                                            <div style={{ fontSize: 12, color: '#d97706', marginBottom: 4 }}>Avg Progress</div>
                                            <div style={{ fontSize: 24, fontWeight: 700, color: '#b45309' }}>
                                                {employeeDetails.average_progress || 0}%
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Course Progress List */}
                                <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Course Progress</h3>
                                {employeeDetails.courses && employeeDetails.courses.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                        {employeeDetails.courses.map((course, index) => (
                                            <div
                                                key={index}
                                                style={{
                                                    border: '1px solid #e5e7eb',
                                                    borderRadius: 10,
                                                    padding: 16,
                                                    background: '#fafafa'
                                                }}
                                            >
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontWeight: 600, fontSize: 16, color: '#111827', marginBottom: 4 }}>
                                                            <FaBook style={{ marginRight: 8, color: '#3b82f6' }} />
                                                            {course.course_title}
                                                        </div>
                                                        <div style={{ fontSize: 13, color: '#6b7280' }}>
                                                            Modules: {course.completed_modules || 0} / {course.total_modules || 0}
                                                        </div>
                                                    </div>
                                                    <div style={{
                                                        background: course.progress_percentage >= 100 ? '#10b981' : course.progress_percentage >= 50 ? '#f59e0b' : '#ef4444',
                                                        color: 'white',
                                                        padding: '4px 12px',
                                                        borderRadius: 20,
                                                        fontSize: 12,
                                                        fontWeight: 600
                                                    }}>
                                                        {course.progress_percentage || 0}%
                                                    </div>
                                                </div>

                                                {/* Progress Bar */}
                                                <div style={{
                                                    background: '#e5e7eb',
                                                    borderRadius: 20,
                                                    height: 8,
                                                    overflow: 'hidden',
                                                    marginBottom: 12
                                                }}>
                                                    <div style={{
                                                        background: getProgressColor(course.progress_percentage),
                                                        height: '100%',
                                                        width: `${course.progress_percentage || 0}%`,
                                                        transition: 'width 0.3s ease',
                                                        borderRadius: 20
                                                    }} />
                                                </div>

                                                {/* Course Stats */}
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, fontSize: 12 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#6b7280' }}>
                                                        <FaClock style={{ color: '#3b82f6' }} />
                                                        {course.last_accessed ? new Date(course.last_accessed).toLocaleDateString() : 'Not started'}
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#6b7280' }}>
                                                        <FaTrophy style={{ color: '#f59e0b' }} />
                                                        Quiz: {course.quiz_score || 0}%
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#6b7280' }}>
                                                        <FaCheckCircle style={{ color: course.completed ? '#10b981' : '#9ca3af' }} />
                                                        {course.completed ? 'Completed' : 'In Progress'}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>
                                        No courses assigned yet
                                    </div>
                                )}
                            </>
                        ) : (
                            <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>
                                {errorMessage ? (
                                    <>
                                        <div style={{ fontSize: 18, fontWeight: 600, color: '#ef4444', marginBottom: 8 }}>
                                            Error Loading Progress
                                        </div>
                                        <div style={{ fontSize: 14 }}>
                                            {errorMessage}
                                        </div>
                                    </>
                                ) : (
                                    'No progress data available'
                                )}
                            </div>
                        )}
                    </div>
                )}

                {!selectedEmployee && (
                    <div style={{
                        background: '#fff',
                        borderRadius: 12,
                        padding: 60,
                        textAlign: 'center',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}>
                        <FaUser style={{ fontSize: 64, color: '#d1d5db', marginBottom: 16 }} />
                        <h3 style={{ color: '#6b7280', fontSize: 18, fontWeight: 600 }}>
                            Select an employee to view progress
                        </h3>
                        <p style={{ color: '#9ca3af', fontSize: 14 }}>
                            Click on any employee from the list to see their detailed progress
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmployeeProgress;
