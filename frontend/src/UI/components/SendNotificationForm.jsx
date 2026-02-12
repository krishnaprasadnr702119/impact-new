import React, { useState, useEffect } from 'react';
import './SendNotificationForm.css';
import { api } from '../../utils/apiClient';

const SendNotificationForm = ({ userRole, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        type: 'general',
        priority: 'normal',
        course_id: null,
        recipient_ids: [],
        expires_at: '',
        action_url: ''
    });

    const [recipients, setRecipients] = useState([]);
    const [courses, setCourses] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchRecipients();
        fetchCourses();
    }, []);

    const fetchRecipients = async () => {
        try {
            let endpoint = '';
            if (userRole === 'admin') {
                endpoint = '/admin/portal_admins';
            } else if (userRole === 'portal_admin') {
                endpoint = '/portal_admin/employees';
            }

            const data = await api.get(endpoint);

            if (data.success) {
                const recipientsList = userRole === 'admin'
                    ? data.portal_admins
                    : data.employees;
                setRecipients(recipientsList);
            }
        } catch (error) {
            console.error('Error fetching recipients:', error);
            setError('Failed to load recipients');
        }
    };

    const fetchCourses = async () => {
        try {
            const data = await api.get('/courses');

            if (data.success) {
                setCourses(data.courses);
            }
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleRecipientToggle = (recipientId) => {
        setFormData(prev => {
            const isSelected = prev.recipient_ids.includes(recipientId);
            return {
                ...prev,
                recipient_ids: isSelected
                    ? prev.recipient_ids.filter(id => id !== recipientId)
                    : [...prev.recipient_ids, recipientId]
            };
        });
    };

    const handleSelectAll = () => {
        if (selectAll) {
            setFormData(prev => ({ ...prev, recipient_ids: [] }));
        } else {
            setFormData(prev => ({
                ...prev,
                recipient_ids: recipients.map(r => r.id)
            }));
        }
        setSelectAll(!selectAll);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title || !formData.message) {
            setError('Title and message are required');
            return;
        }

        setLoading(true);
        setError('');

        try {
            let endpoint = '';
            if (userRole === 'admin') {
                endpoint = '/admin/send_notification_to_portal_admins';
            } else if (userRole === 'portal_admin') {
                endpoint = '/portal_admin/send_notification_to_employees';
            }

            const payload = {
                ...formData,
                course_id: formData.course_id || null,
                expires_at: formData.expires_at || null,
                action_url: formData.action_url || null
            };

            const data = await api.post(endpoint, payload);

            if (data.success) {
                if (onSuccess) {
                    onSuccess(data.message);
                }
                onClose();
            }
        } catch (error) {
            console.error('Error sending notification:', error);
            setError(error.response?.data?.error || 'Failed to send notification');
        } finally {
            setLoading(false);
        }
    };

    const notificationTypes = [
        { value: 'general', label: 'General' },
        { value: 'course_new', label: 'New Course' },
        { value: 'course_expiring', label: 'Course Expiring' },
        { value: 'course_assigned', label: 'Course Assigned' },
        { value: 'announcement', label: 'Announcement' }
    ];

    const priorities = [
        { value: 'low', label: 'Low' },
        { value: 'normal', label: 'Normal' },
        { value: 'high', label: 'High' },
        { value: 'urgent', label: 'Urgent' }
    ];

    return (
        <div className="send-notification-overlay">
            <div className="send-notification-form">
                <div className="form-header">
                    <h2>
                        {userRole === 'admin' ? 'Send Notification to Portal Admins' : 'Send Notification to Employees'}
                    </h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="form-group full-width">
                            <label>Title *</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                placeholder="Notification title"
                                required
                            />
                        </div>

                        <div className="form-group full-width">
                            <label>Message *</label>
                            <textarea
                                name="message"
                                value={formData.message}
                                onChange={handleInputChange}
                                placeholder="Notification message"
                                rows={4}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Type</label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleInputChange}
                            >
                                {notificationTypes.map(type => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Priority</label>
                            <select
                                name="priority"
                                value={formData.priority}
                                onChange={handleInputChange}
                            >
                                {priorities.map(priority => (
                                    <option key={priority.value} value={priority.value}>
                                        {priority.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Related Course (Optional)</label>
                            <select
                                name="course_id"
                                value={formData.course_id || ''}
                                onChange={handleInputChange}
                            >
                                <option value="">None</option>
                                {courses.map(course => (
                                    <option key={course.id} value={course.id}>
                                        {course.title}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Expires At (Optional)</label>
                            <input
                                type="datetime-local"
                                name="expires_at"
                                value={formData.expires_at}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="form-group full-width">
                            <label>Action URL (Optional)</label>
                            <input
                                type="text"
                                name="action_url"
                                value={formData.action_url}
                                onChange={handleInputChange}
                                placeholder="/courses/123"
                            />
                        </div>

                        <div className="form-group full-width">
                            <div className="recipients-header">
                                <label>
                                    Recipients {formData.recipient_ids.length === 0 && '(Send to All)'}
                                </label>
                                <button
                                    type="button"
                                    className="select-all-btn"
                                    onClick={handleSelectAll}
                                >
                                    {selectAll ? 'Deselect All' : 'Select Specific Recipients'}
                                </button>
                            </div>

                            {selectAll && (
                                <div className="recipients-list">
                                    {recipients.map(recipient => (
                                        <label key={recipient.id} className="recipient-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={formData.recipient_ids.includes(recipient.id)}
                                                onChange={() => handleRecipientToggle(recipient.id)}
                                            />
                                            <span className="recipient-info">
                                                <span className="recipient-name">{recipient.username}</span>
                                                <span className="recipient-email">{recipient.email}</span>
                                                {recipient.organization && (
                                                    <span className="recipient-org">{recipient.organization.name}</span>
                                                )}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            )}

                            {formData.recipient_ids.length > 0 && (
                                <div className="selected-count">
                                    {formData.recipient_ids.length} recipient(s) selected
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="cancel-btn" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="submit-btn" disabled={loading}>
                            {loading ? 'Sending...' : 'Send Notification'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SendNotificationForm;
