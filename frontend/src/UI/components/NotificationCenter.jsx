import React, { useState, useEffect } from 'react';
import './NotificationCenter.css';
import { api } from '../../utils/apiClient';

const NotificationCenter = ({ onClose }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // 'all' or 'unread'

    useEffect(() => {
        fetchNotifications();
    }, [filter]);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const data = await api.get('/notifications', {
                unread_only: filter === 'unread',
                limit: 50
            });

            if (data.success) {
                setNotifications(data.notifications);
                setUnreadCount(data.unread_count);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            const data = await api.patch(`/notifications/${notificationId}/read`);

            if (data.success) {
                fetchNotifications();
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const data = await api.patch('/notifications/mark_all_read');

            if (data.success) {
                fetchNotifications();
            }
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const deleteNotification = async (notificationId) => {
        try {
            const data = await api.delete(`/notifications/${notificationId}`);

            if (data.success) {
                fetchNotifications();
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const getPriorityClass = (priority) => {
        const classes = {
            low: 'priority-low',
            normal: 'priority-normal',
            high: 'priority-high',
            urgent: 'priority-urgent'
        };
        return classes[priority] || 'priority-normal';
    };

    const getTypeIcon = (type) => {
        const icons = {
            course_new: '📚',
            course_expiring: '⏰',
            course_assigned: '✅',
            general: '📢',
            announcement: '📣'
        };
        return icons[type] || '📬';
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;

        return date.toLocaleDateString();
    };

    return (
        <div className="notification-center">
            <div className="notification-header">
                <div className="notification-title">
                    <h3>Notifications</h3>
                    {unreadCount > 0 && (
                        <span className="unread-badge">{unreadCount}</span>
                    )}
                </div>
                <button className="close-btn" onClick={onClose}>
                    ×
                </button>
            </div>

            <div className="notification-actions">
                <div className="notification-filters">
                    <button
                        className={filter === 'all' ? 'active' : ''}
                        onClick={() => setFilter('all')}
                    >
                        All
                    </button>
                    <button
                        className={filter === 'unread' ? 'active' : ''}
                        onClick={() => setFilter('unread')}
                    >
                        Unread ({unreadCount})
                    </button>
                </div>
                {unreadCount > 0 && (
                    <button className="mark-all-read-btn" onClick={markAllAsRead}>
                        Mark all as read
                    </button>
                )}
            </div>

            <div className="notifications-list">
                {loading ? (
                    <div className="notification-loading">Loading...</div>
                ) : notifications.length === 0 ? (
                    <div className="no-notifications">
                        <span className="no-notif-icon">🔔</span>
                        <p>No notifications</p>
                    </div>
                ) : (
                    notifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`notification-item ${!notification.is_read ? 'unread' : ''} ${getPriorityClass(notification.priority)}`}
                        >
                            <div className="notification-icon">
                                {getTypeIcon(notification.type)}
                            </div>
                            <div className="notification-content">
                                <div className="notification-header-row">
                                    <h4>{notification.title}</h4>
                                    <span className="notification-time">
                                        {formatDate(notification.created_at)}
                                    </span>
                                </div>
                                <p className="notification-message">{notification.message}</p>
                                {notification.course && (
                                    <div className="notification-course">
                                        📚 {notification.course.title}
                                    </div>
                                )}
                                {notification.sender && (
                                    <div className="notification-sender">
                                        From: {notification.sender.username} ({notification.sender.role})
                                    </div>
                                )}
                            </div>
                            <div className="notification-actions-col">
                                {!notification.is_read && (
                                    <button
                                        className="action-btn mark-read"
                                        onClick={() => markAsRead(notification.id)}
                                        title="Mark as read"
                                    >
                                        ✓
                                    </button>
                                )}
                                <button
                                    className="action-btn delete"
                                    onClick={() => deleteNotification(notification.id)}
                                    title="Delete"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default NotificationCenter;
