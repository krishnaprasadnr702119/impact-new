import React, { useState, useEffect } from 'react';
import AlertDialog from '../../components/AlertDialog';
import PageHeader from '../../components/PageHeader';
import { FaUsers, FaCheck, FaTimes } from "react-icons/fa";

const CourseRequestManagement = ({ username }) => {
  const [requests, setRequests] = useState([
    [
      {
        status: 'pending',
        organization: {
          name: 'fddsfsd'
        },
        course: {
          title: 'Test'
        },
        requester: {
          username: 'User Name',
          email: 'adfs@edfds.in'
        },
        payment_amount: 1200,
        requested_at: '11/02/2025',
        id: '123',
        approved_by: 'admin',
        approved_at: '11/02/2025',
      },

    ]
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/course_requests');
      const data = await response.json();

      if (data.success) {
        setRequests(data.requests);
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch course requests');
      }
    } catch (err) {
      setError('Failed to fetch course requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApproveReject = async (requestId, action, notes = '') => {
    setActionLoading(requestId);
    try {
      const response = await fetch('/api/admin/approve_course_request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_id: requestId,
          action: action,
          admin_username: username, // In real app, get from JWT token
          admin_notes: notes
        })
      });

      const data = await response.json();

      if (data.success) {
        alert(`✅ Course request ${action}d successfully!`);
        await fetchRequests(); // Refresh the list
        setSelectedRequest(null);
        setAdminNotes('');
      } else {
        alert(`❌ Failed to ${action} request: ${data.error}`);
      }
    } catch (err) {
      alert(`❌ Network error while ${action}ing request`);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      pending: { bg: '#fef3c7', class: 'orange', color: '#d97706', icon: '⏳' },
      approved: { bg: '#dcfce7', class: 'green', color: '#166534', icon: '✅' },
      rejected: { bg: '#fecaca', class: 'red', color: '#dc2626', icon: '❌' }
    };

    const style = statusStyles[status] || statusStyles.pending;

    return (
      <div className={`status-tag ${style.class}`}>
        {style.icon} {status.toUpperCase()}
      </div>
    );
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
          borderTop: '2px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        Loading course requests...
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
    <div style={{ padding: '24px' }}>
      <PageHeader
        icon="💳"
        title="Course Purchase Requests"
        description=" Review and approve course purchase requests from organizations"
      >
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{
            background: '#fef3c7',
            color: '#d97706',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: '600'
          }}>
            ⏳ {requests.filter(r => r.status === 'pending').length} Pending
          </div>
          <div style={{
            background: '#f3f4f6',
            color: '#6b7280',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: '600'
          }}>
            📊 {requests.length} Total Requests
          </div>
        </div>
      </PageHeader>
      {requests.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: '#6b7280',
          fontSize: '18px',
          background: '#f9fafb',
          borderRadius: '12px',
          border: '2px dashed #d1d5db'
        }}>
          📝 No course requests yet
        </div>
      ) : (
        <div className='board'>
          <div className='table-header'>
            <div>Organization & Course</div>
            <div>Requester</div>
            <div>Amount</div>
            <div>Status</div>
            <div>Date</div>
            <div>Actions</div>
          </div>

          {requests.map((request) => (
            <div key={request.id} className='table-row'>
              <div>
                <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>
                  🏢 {request.organization.name}
                </div>
                <div style={{ color: '#6b7280' }}>
                  📚 {request.course.title}
                </div>
              </div>

              <div>
                <div style={{ fontWeight: '500', color: '#374151' }}>
                  {request.requester.username}
                </div>
                <div style={{ color: '#6b7280', fontSize: '12px' }}>
                  {request.requester.email}
                </div>
              </div>

              <div style={{ fontWeight: '700', color: '#059669' }}>
                ${request.payment_amount}
              </div>

              <div>
                {getStatusBadge(request.status)}
              </div>

              <div style={{ color: '#6b7280', fontSize: '12px' }}>
                {new Date(request.requested_at).toLocaleDateString()}
              </div>

              <div className='actions'>
                {request.status === 'pending' ? (
                  <>
                    <button
                      onClick={() => handleApproveReject(request.id, 'approve')}
                      disabled={actionLoading === request.id}
                      className={actionLoading === request.id ? 'not-allowed green' : 'green'}
                    >
                      {actionLoading === request.id ? '⏳' : <><FaCheck /> Approve</>}
                    </button>
                    <button
                      onClick={() => handleApproveReject(request.id, 'reject')}
                      disabled={actionLoading === request.id}
                      className={actionLoading === request.id ? 'not-allowed red' : 'red'}
                    >
                      {actionLoading === request.id ? '⏳' : <><FaTimes /> Reject</>}
                    </button>
                  </>
                ) : (
                  <div style={{
                    color: '#6b7280',
                    fontSize: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px'
                  }}>
                    <div>By: {request.approved_by}</div>
                    <div>{new Date(request.approved_at).toLocaleDateString()}</div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className='info-board'>
        <div className='title'>ℹ️ How Course Requests Work:</div>
        <ul >
          <li>Portal admins request to purchase courses with payment</li>
          <li>You can approve requests to assign courses to organizations</li>
          <li>You can also directly assign courses via the Organizations panel without payment</li>
          <li>Approved courses are automatically assigned to the requesting organization</li>
        </ul>
      </div>
    </div>
  );
}

export default CourseRequestManagement;
