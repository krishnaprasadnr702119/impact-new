import React, { useState, useEffect } from 'react';
import './NotificationBell.css';
import { api } from '../../utils/apiClient';
import { getToken } from '../../utils/auth';
import NotificationCenter from './NotificationCenter';

const NotificationBell = () => {
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);

    useEffect(() => {
        // Only fetch if we have a valid token
        const token = getToken();
        if (!token) {
            return;
        }

        fetchUnreadCount();

        // Poll for new notifications every 30 seconds
        const interval = setInterval(() => {
            const currentToken = getToken();
            if (currentToken) {
                fetchUnreadCount();
            }
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    const fetchUnreadCount = async () => {
        try {
            const data = await api.get('/notifications/unread_count');

            if (data.success) {
                setUnreadCount(data.unread_count);
            }
        } catch (error) {
            // Silently fail for notification errors
            // Don't kick user out if notifications aren't available
            setUnreadCount(0);
        }
    };

    const handleBellClick = () => {
        setShowNotifications(!showNotifications);
    };

    const handleCloseNotifications = () => {
        setShowNotifications(false);
        fetchUnreadCount(); // Refresh count when closing
    };

    return (
        <>
            <div className="notification-bell-container">
                <button className="notification-bell-btn" onClick={handleBellClick}>
                    <span className="bell-icon">🔔</span>
                    {unreadCount > 0 && (
                        <span className="notification-count">{unreadCount > 99 ? '99+' : unreadCount}</span>
                    )}
                </button>
            </div>

            {showNotifications && (
                <NotificationCenter onClose={handleCloseNotifications} />
            )}
        </>
    );
};

export default NotificationBell;
