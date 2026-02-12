import React, { useEffect, useState } from 'react';
import { portalAdminApi, courseApi, ApiError } from '../../../utils/apiClient';
import { getToken, parseJwt } from '../../../utils/auth';
import PurchaseRequestStatus from './PurchaseRequestStatus';
import PageHeader from '../../components/PageHeader';
import NoDataDisplay from '../../components/NoDataDisplay';
import { CourseCard } from './CourseCard';
import CourseEmployeeAssignment from './CourseEmployeeAssignment';
import AlertDialog from '../../components/AlertDialog';

const PortalAdminCourses = ({ username }) => {
  const [allCourses, setAllCourses] = useState([
    {
      id: '123',
      title: 'ancd',
      can_buy: true,
      description: 'Test a2 dsfjks dsfdsfd',
      module_count: 3,
      price: 350,
      is_assigned: true,
      is_pending_request: true,
      organization_id: '3'
    },
    {
      id: '122',
      title: 'tytr',
      can_buy: false,
      description: 'Test a2 dsfjks dsfdsfd',
      module_count: 3,
      price: 350,
      is_assigned: true,
      is_pending_request: true,
      organization_id: '3'
    },
    {
      id: '124',
      title: 'tytr',
      can_buy: false,
      description: 'Test a2 dsfjks dsfdsfd',
      module_count: 3,
      price: 350,
      is_assigned: false,
      is_pending_request: true,
      organization_id: '3'
    },
    {
      id: '121',
      title: 'tytr',
      can_buy: false,
      description: 'Test a2 dsfjks dsfdsfd',
      module_count: 3,
      price: 350,
      is_assigned: false,
      is_pending_request: false,
      organization_id: '3'
    }
  ]);
  const [assignedCourses, setAssignedCourses] = useState([
    {
      id: '123',
      title: 'ancd',
      can_buy: true,
      description: 'Test a2 dsfjks dsfdsfd',
      module_count: 3,
      price: 350,
      is_assigned: true,
      is_pending_request: true,
      organization_id: '3'
    },
    {
      id: '122',
      title: 'tytr',
      can_buy: false,
      description: 'Test a2 dsfjks dsfdsfd',
      module_count: 3,
      price: 350,
      is_assigned: true,
      is_pending_request: true,
      organization_id: '3'
    },
    {
      id: '124',
      title: 'tytr',
      can_buy: false,
      description: 'Test a2 dsfjks dsfdsfd',
      module_count: 3,
      price: 350,
      is_assigned: false,
      is_pending_request: true,
      organization_id: '3'
    },
    {
      id: '121',
      title: 'tytr',
      can_buy: false,
      description: 'Test a2 dsfjks dsfdsfd',
      module_count: 3,
      price: 350,
      is_assigned: false,
      is_pending_request: false,
      organization_id: '3'
    }
  ]);
  const [organizationInfo, setOrganizationInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedCourseForAssignment, setSelectedCourseForAssignment] = useState(null);
  const [alertDialog, setAlertDialog] = useState({ isOpen: false, title: '', message: '', type: 'info' });

  const fetchCourses = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('� Fetching portal admin courses...');

      // Use the portal admin API to get courses with assignment status
      const data = await portalAdminApi.getAllCourses();

      console.log('📥 API Response:', data);

      if (data.success) {
        setAllCourses(data.all_courses || data.courses || []);
        setAssignedCourses(data.assigned_courses || []);
        setOrganizationInfo(data.organization);
        setError(null);
        console.log('✅ Courses loaded successfully');
      } else {
        const errorMsg = data.error || 'Failed to fetch courses';
        console.log('❌ API Error:', errorMsg);
        setError(errorMsg);
      }
    } catch (err) {
      console.log('🚨 Network Error:', err);
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to fetch courses. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleAssignCourse = async (courseId, courseTitle) => {
    setActionLoading(courseId);
    try {
      const response = await portalAdminApi.assignCourseToAll(courseId);
      if (response.success) {
        setAlertDialog({ isOpen: true, title: 'Success!', message: `Successfully assigned "${courseTitle}" to your organization!`, type: 'success' });
        await fetchCourses(); // Refresh the course list
      } else {
        setAlertDialog({ isOpen: true, title: 'Assignment Failed', message: `Failed to assign course: ${response.error}`, type: 'error' });
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setAlertDialog({ isOpen: true, title: 'Assignment Failed', message: `Failed to assign course: ${err.message}`, type: 'error' });
      } else {
        setAlertDialog({ isOpen: true, title: 'Network Error', message: 'Network error while assigning course', type: 'error' });
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handlePurchaseRequest = async (courseId, courseTitle, price) => {
    const confirmed = window.confirm(
      `Are you sure you want to request to purchase "${courseTitle}" for $${price}?\n\nThis will send a purchase request to the admin for approval.`
    );

    if (!confirmed) return;

    setActionLoading(courseId);
    try {
      const response = await portalAdminApi.requestCourse({
        course_id: courseId,
        payment_amount: price
      });

      if (response.success) {
        setAlertDialog({ isOpen: true, title: 'Request Submitted', message: `Purchase request submitted for "${courseTitle}"!\n\nYour request will be reviewed by the admin. You'll be notified once approved.`, type: 'success' });
        await fetchCourses(); // Refresh the course list
      } else {
        setAlertDialog({ isOpen: true, title: 'Request Failed', message: `Failed to submit purchase request: ${response.error}`, type: 'error' });
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setAlertDialog({ isOpen: true, title: 'Request Failed', message: `Failed to submit purchase request: ${err.message}`, type: 'error' });
      } else {
        setAlertDialog({ isOpen: true, title: 'Network Error', message: 'Network error while submitting purchase request', type: 'error' });
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnassignCourse = async (courseId, courseTitle) => {
    if (!window.confirm(`Are you sure you want to remove "${courseTitle}" from your organization?`)) {
      return;
    }

    setActionLoading(courseId);
    try {
      // Use the API client to unassign course
      // Note: This endpoint may need to be added to apiClient if not already present
      const response = await portalAdminApi.unassignCourse(courseId);

      if (response.success) {
        const employeesText = response.employees_updated
          ? `and removed from ${response.employees_updated} employee${response.employees_updated === 1 ? '' : 's'}`
          : '';
        setAlertDialog({ isOpen: true, title: 'Course Removed', message: `Successfully removed "${courseTitle}" from your organization ${employeesText}!`, type: 'success' });
        await fetchCourses(); // Refresh the course list
      } else {
        setAlertDialog({ isOpen: true, title: 'Remove Failed', message: `Failed to remove course: ${response.error}`, type: 'error' });
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setAlertDialog({ isOpen: true, title: 'Remove Failed', message: `Failed to remove course: ${err.message}`, type: 'error' });
      } else {
        setAlertDialog({ isOpen: true, title: 'Network Error', message: 'Network error while removing course', type: 'error' });
      }
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '200px',
      fontSize: '18px',
      color: '#6b7280'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '20px',
          height: '20px',
          border: '2px solid #e5e7eb',
          borderTop: '2px solid #764ba2',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        Loading courses...
      </div>
    </div>
  );

  if (error) return (
    <div style={{
      background: '#fef2f2',
      border: '1px solid #fecaca',
      borderRadius: '8px',
      padding: '16px',
      color: '#dc2626',
      fontSize: '16px',
      fontWeight: '500'
    }}>
      ⚠️ {error}
    </div>
  );

  return (
    <>
      {/* Purchase Request Status */}
      <PurchaseRequestStatus username={username} />
      <div style={{ padding: '8px' }}>
        <PageHeader
          icon="🛒"
          title="Course Marketplace"
          subtitle="">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              background: '#f3f4f6',
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#6b7280'
            }}>
              {allCourses.length} courses available
            </div>
          </div>
        </PageHeader>
        {/* All Courses Section */}
        {allCourses.length === 0 ? (
          <NoDataDisplay icon="📚" message="No courses available yet" />
        ) :
          <div className="grid-container">

            {allCourses.map((course, index) => (
              <CourseCard assignedCourses={false} course={course} key={index} actionLoading={actionLoading} handlePurchase={handlePurchaseRequest} />
            ))}
          </div>
        }
      </div>

      <div style={{ padding: '8px' }}>

        <PageHeader
          icon="📖 "
          title="My Assigned Courses"
          subtitle="">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {organizationInfo && (
              <div style={{
                background: '#ede9fe',
                color: '#7c3aed',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                🏢 {organizationInfo.name}
              </div>
            )}
            <div style={{
              background: '#f3f4f6',
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#6b7280'
            }}>
              {assignedCourses.length} courses assigned
            </div>
          </div>

          <div>

          </div>
          {/* Assigned Courses Section */}
        </PageHeader>

        {/* All Courses Section */}
        {assignedCourses.length === 0 ? (
          <NoDataDisplay icon="📚" message="No courses assigned yet. Assign some from the marketplace above!" />
        ) :
          <div className="grid-container">

            {assignedCourses.map((course, index) => (
              <CourseCard assignedCourses={true} course={course} key={index} actionLoading={actionLoading} handleUnassign={handleUnassignCourse} setSelectedCourse={setSelectedCourseForAssignment} handlePurchaseRequest={handlePurchaseRequest} />
            ))}
          </div>
        }

      </div>
      {/* Course Employee Assignment Modal */}
      {selectedCourseForAssignment && (
        <CourseEmployeeAssignment
          username={username}
          course={{
            ...selectedCourseForAssignment,
            organization_id: selectedCourseForAssignment.organization_id || (organizationInfo && (organizationInfo.id || organizationInfo.organization_id))
          }}
          onClose={() => setSelectedCourseForAssignment(null)}
        />
      )}

      {/* Alert Dialog */}
      <AlertDialog
        isOpen={alertDialog.isOpen}
        onClose={() => setAlertDialog({ isOpen: false, title: '', message: '', type: 'info' })}
        title={alertDialog.title}
        message={alertDialog.message}
        type={alertDialog.type}
      />
    </>
  );
}

export default PortalAdminCourses;
