import React, { useState, useEffect } from 'react';
import { FaUsers, FaBook, FaChartLine, FaBuilding, FaCheckCircle, FaUserClock, FaArrowUp, FaPlus, FaEye, FaCogs, FaBullhorn } from 'react-icons/fa';
import './EnhancedAdminDashboard.css';

const EnhancedAdminDashboard = ({ payload, onNavigate }) => {
    const [stats, setStats] = useState({
        total_users: 0,
        active_users: 0,
        total_courses: 0,
        total_organizations: 0,
        completion_rate: 0,
        avg_quiz_score: 0,
        recent_users: [],
        course_trends: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await fetch('/api/admin/system_stats', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setStats(data.data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ icon: Icon, label, value, trend, color, onClick }) => (
        <div className="stat-card" style={{ borderLeftColor: color }} onClick={onClick}>
            <div className="stat-card-header">
                <div className="stat-icon" style={{
                    backgroundColor: color + '20',
                    color: color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    {Icon && <Icon style={{ fontSize: '24px' }} />}
                </div>
                <span className="stat-label">{label}</span>
            </div>
            <div className="stat-value">{value}</div>
            {trend && <div className="stat-trend" style={{ color: trend > 0 ? '#10b981' : '#ef4444' }}>
                <FaArrowUp size={14} /> {trend > 0 ? '+' : ''}{trend}%
            </div>}
        </div>
    );

    const QuickActionButton = ({ icon: Icon, label, color, onClick }) => (
        <button className="quick-action-btn" onClick={onClick} style={{ borderTopColor: color }}>
            <div className="action-icon" style={{
                backgroundColor: color + '20',
                color: color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                {Icon && <Icon style={{ fontSize: '24px' }} />}
            </div>
            <span>{label}</span>
        </button>
    );

    return (
        <div className="enhanced-dashboard">
            {/* Welcome Section */}
            <div className="welcome-section">
                <div className="welcome-content">
                    <h1>Welcome back, {payload?.username}! 👋</h1>
                </div>
            </div>

            {/* Primary Stats Grid */}
            <div className="stats-grid primary-stats">
                <StatCard
                    icon={FaUsers}
                    label="Total Users"
                    value={stats.total_users}
                    color="#3b82f6"
                    onClick={() => onNavigate?.('total_users')}
                />
                <StatCard
                    icon={FaUserClock}
                    label="Active Users"
                    value={stats.active_users}
                    color="#10b981"
                    onClick={() => onNavigate?.('total_users')}
                />
                <StatCard
                    icon={FaBook}
                    label="Total Courses"
                    value={stats.total_courses}
                    color="#f59e0b"
                    onClick={() => onNavigate?.('courses')}
                />
                <StatCard
                    icon={FaBuilding}
                    label="Organizations"
                    value={stats.total_organizations}
                    color="#8b5cf6"
                    onClick={() => onNavigate?.('organization_list')}
                />
            </div>

            {/* Secondary Stats Grid */}
            <div className="stats-grid secondary-stats">
                <StatCard
                    icon={FaCheckCircle}
                    label="Completion Rate"
                    value={`${stats.completion_rate}%`}
                    color="#06b6d4"
                    onClick={() => onNavigate?.('analytics')}
                />
                <StatCard
                    icon={FaChartLine}
                    label="Avg Quiz Score"
                    value={`${stats.avg_quiz_score}%`}
                    color="#ec4899"
                    onClick={() => onNavigate?.('analytics')}
                />
            </div>

            {/* Quick Actions Section */}
            <div className="quick-actions-section">
                <h2>Quick Actions</h2>
                <div className="quick-actions">
                    <QuickActionButton
                        icon={FaPlus}
                        label="Add New Course"
                        color="#3b82f6"
                        onClick={() => onNavigate?.('courses', { action: 'create' })}
                    />
                    <QuickActionButton
                        icon={FaUsers}
                        label="Manage Users"
                        color="#10b981"
                        onClick={() => onNavigate?.('total_users')}
                    />
                    <QuickActionButton
                        icon={FaBuilding}
                        label="Organizations"
                        color="#f59e0b"
                        onClick={() => onNavigate?.('organization_list')}
                    />
                    <QuickActionButton
                        icon={FaEye}
                        label="View Analytics"
                        color="#8b5cf6"
                        onClick={() => onNavigate?.('analytics')}
                    />
                    <QuickActionButton
                        icon={FaCogs}
                        label="Simulations"
                        color="#06b6d4"
                        onClick={() => onNavigate?.('simulations')}
                    />
                    <QuickActionButton
                        icon={FaBook}
                        label="Course Requests"
                        color="#ec4899"
                        onClick={() => onNavigate?.('courses_requests')}
                    />
                </div>
            </div>
        </div>
    );
};

export default EnhancedAdminDashboard;
