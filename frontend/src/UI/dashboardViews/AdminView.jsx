import { FaHome, FaUsers, FaCog, FaTachometerAlt, FaChartBar, FaBook, FaBuilding, FaShoppingCart, FaCreditCard, FaCogs } from 'react-icons/fa'; // Import the correct icons
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { adminApi, ApiError } from '../../utils/apiClient';
import EnhancedAdminDashboard from './admin-pages/EnhancedAdminDashboard';
import AnalyticsDashboard from './admin-pages/AnalyticsDashboard';
import ErrorBoundary from '../../ErrorBoundary';
import Footer from '../Footer';
import Layout from '../Layout';
import OrganizationList from './admin-pages/OrganizationList';
import OrganizationStats from './admin-pages/OrganizationStats';
import CourseRequestManagement from './admin-pages/CourseRequestManagement'
import PortalAdminsList from './admin-pages/PortalAdminsList';
import React, { useState, useCallback, useEffect, use } from 'react';
import SettingsContent from '../components/SettingsContent';
import Sidebar from '../components/Sidebar';
import TotalUsersList from './admin-pages/TotalUsersList';
import useDeviceListener from '../../hooks/useDeviceListner';
import CourseList from './admin-pages/CourseList';
import SimulationManagement from './admin-pages/SimulationManagement';
import DashboardHeader from '../components/DashboardHeader';
import AlertDialog from '../components/AlertDialog';
import SendNotificationForm from '../components/SendNotificationForm';

const AdminView = ({ payload }) => {
    const [loading, setLoading] = useState(false);
    const [activePage, setActivePage] = useState('dashboard');
    const [collapsed, setCollapsed] = useState(false);
    const [stats, setStats] = useState(null);
    const [error, setError] = useState(null);
    const [refreshInterval, setRefreshInterval] = useState(null);
    const [showSignOutDialog, setShowSignOutDialog] = useState(false);
    const [showNotificationForm, setShowNotificationForm] = useState(false);
    const userRole = payload?.role || 'admin'; // Default to 'admin' if role not provided
    const navigate = useNavigate();
    const { logout } = useAuth();

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <FaTachometerAlt />, color: '#3b82f6' },
        { id: 'organization_stats', label: 'Organization Stats', icon: <FaChartBar />, color: '#8b5cf6' },
        { id: 'organization_list', label: 'Organization list', icon: <FaBuilding />, color: '#10b981' },
        { id: 'portal_admins', label: 'Portal Admins', icon: <FaUsers />, color: '#ec4899' },
        { id: 'total_users', label: 'Total Users', icon: <FaUsers />, color: '#3b82f6' },
        { id: 'courses', label: 'Courses', icon: <FaBook />, color: '#f59e0b' },
        { id: 'simulations', label: 'Simulations', icon: <FaCogs />, color: '#06b6d4' },
        { id: 'courses_requests', label: 'Course Requests', icon: <FaShoppingCart />, color: '#ec4899' },
        { id: 'analytics', label: 'Analytics', icon: <FaChartBar />, color: '#8b5cf6' },
        { id: 'settings', label: 'Settings', icon: <FaCog />, color: '#6b7280' },
        { id: 'payment', label: 'Payment', icon: <FaCreditCard />, color: '#ef4444' }
    ]
    const adminCard = [
        // Superadmin stats
        { label: 'Total Users', value: stats?.total_users || 0, icon: <FaBook />, color: '#3b82f6', bgColor: '#dbeafe', clickable: true, page: 'Total Users' },
        { label: 'Portal Admins', value: stats?.total_portal_admins || 0, icon: <FaBook />, color: '#ec4899', bgColor: '#fce7f3', clickable: true, page: 'Portal Admins' },
        { label: 'Courses Created', value: stats?.total_courses || 0, icon: <FaBook />, color: '#10b981', bgColor: '#d1fae5', clickable: true, page: 'Courses' },
        { label: 'Active Organizations', value: stats?.active_organizations || 0, icon: <FaBuilding />, color: '#f59e0b', bgColor: '#fef3c7', clickable: true, page: 'Organization list' },
        { label: 'Total Organizations', value: stats?.total_organizations || 0, icon: <FaBuilding />, color: '#8b5cf6', bgColor: '#ede9fe', clickable: true, page: 'Organization list' }
    ]
    const portalAdminCard = [
        // Portal admin stats
        { label: 'Employee Count', value: stats?.employee_count || 0, icon: <FaBook />, color: '#3b82f6', bgColor: '#dbeafe' },
        { label: 'Courses Created', value: stats?.total_courses || 0, icon: <FaBook />, color: '#10b981', bgColor: '#d1fae5' },
        { label: 'Active Courses', value: stats?.active_courses || 0, icon: <FaBook />, color: '#f59e0b', bgColor: '#fef3c7' },
        { label: 'Course Completion', value: stats?.completion_rate ? `${stats.completion_rate}%` : '0%', icon: <FaBook />, color: '#8b5cf6', bgColor: '#ede9fe' }
    ]
    useDeviceListener((device) => {
        console.log("Current device:", device);
        if (device === "mobile") {
            // your function for mobile
            setCollapsed(true);
        }
    });
    const handleSignOut = useCallback(() => {
        setShowSignOutDialog(true);
    }, []);

    const confirmSignOut = useCallback(() => {
        console.log('Sign out clicked');
        logout();
        navigate('/login', { replace: true });
    }, [logout, navigate]);

    const getPageTitle = () => {
        switch (activePage) {
            case 'dashboard': return 'Dashboard Overview';
            case 'users': return 'User Management';
            case 'settings': return 'System Settings';
            default: return 'Admin Panel';
        }
    };
    const fetchSystemStats = async () => {
        try {
            setLoading(true);
            console.log('🚀 Fetching system stats with JWT authentication...');

            // Use the new API client - it handles authentication automatically
            const data = await adminApi.getSystemStats();

            if (data.success) {
                setStats(data.data);
                setError(null);
                console.log('✅ System stats loaded successfully');
            } else {
                const errorMsg = data.error || 'Failed to fetch system statistics';
                console.error('❌ API Error:', errorMsg);
                setError(errorMsg);
                setStats(null);
            }
        } catch (err) {
            console.error('🚨 Error fetching system stats:', err);

            if (err instanceof ApiError) {
                if (err.status === 401) {
                    setError('Authentication required. Please log in again.');
                    // Optionally redirect to login
                    // navigate('/login');
                } else if (err.status === 403) {
                    setError('Access denied. Admin privileges required.');
                } else {
                    setError(err.message || 'Failed to fetch system statistics');
                }
            } else {
                setError('Network error when fetching system statistics');
            }
            setStats(null);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        // Initial fetch
        fetchSystemStats();

        // Set up auto-refresh every 30 seconds
        const interval = setInterval(() => {
            fetchSystemStats();
        }, 30000); // 30 seconds

        setRefreshInterval(interval);

        // Cleanup on unmount
        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [payload?.username]);

    // Manual refresh function
    const handleManualRefresh = () => {
        fetchSystemStats();
    };

    // Render main content based on active page
    const renderContent = () => {
        switch (activePage) {
            case 'dashboard':
                return (
                    <>
                        <EnhancedAdminDashboard payload={payload} onNavigate={setActivePage} />
                    </>
                );
            case 'organization_stats':
                return (
                    <OrganizationStats />
                );
            case 'organization_list':
                return <OrganizationList username={payload.username} />;
            case 'portal_admins':
                return <PortalAdminsList username={payload.username} />;
            case 'total_users':
                return <TotalUsersList username={payload.username} />
            case 'courses':
                return <CourseList username={payload.username} userRole={userRole} />;
            case 'simulations':
                return <SimulationManagement username={payload.username} />;
            case 'courses_requests':
                return <CourseRequestManagement username={payload.username} />;
            case 'analytics':
                return <AnalyticsDashboard username={payload.username} />;
            case 'settings':
                return <SettingsContent token={payload.token} payload={payload} username={payload.username} />;
            default:
                return <div className="dashboard-content">
                    <div className="coming-soon">
                        <h3>Coming Soon</h3>
                        <p>features coming soon...</p>
                    </div>
                </div>

        }
    };
    return (
        <ErrorBoundary>
            <div className="layout admin-view">
                <div className="sidebar">
                    <Sidebar
                        title="🎓Impact"
                        subtitle="Management Console"
                        menuItems={menuItems}
                        activeTab={activePage}
                        onTabChange={setActivePage}
                        onSignOut={handleSignOut}
                        showSignOut={true}
                        collapsed={collapsed}
                        onCollapse={() => setCollapsed(!collapsed)}
                    />
                </div>
                <div className="main-content">
                    <div className="header">
                        <DashboardHeader
                            username={payload.username}
                            loading={loading}
                            onRefresh={handleManualRefresh}
                            title={getPageTitle()}
                            setCollapsed={setCollapsed}
                            rightContent={
                                <button
                                    onClick={() => setShowNotificationForm(true)}
                                    style={{
                                        padding: '8px 16px',
                                        background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontWeight: '600',
                                        fontSize: '14px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        transition: 'all 0.2s',
                                        boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.3)';
                                    }}
                                >
                                    📢 Send Notification
                                </button>
                            }
                        />
                    </div>
                    <div className="dashboard-content">
                        {renderContent()}
                    </div>
                    <div className="footer">
                        <Footer />
                    </div>
                </div>

            </div>

            {/* Sign Out Confirmation Dialog */}
            <AlertDialog
                isOpen={showSignOutDialog}
                onClose={() => setShowSignOutDialog(false)}
                title="Sign Out"
                message="Are you sure you want to sign out? You will need to log in again to access your account."
                type="confirm"
                showConfirm={true}
                onConfirm={confirmSignOut}
                confirmText="Sign Out"
                cancelText="Cancel"
            />

            {/* Send Notification Form */}
            {showNotificationForm && (
                <SendNotificationForm
                    userRole="admin"
                    onClose={() => setShowNotificationForm(false)}
                    onSuccess={(message) => {
                        alert(message);
                        setShowNotificationForm(false);
                    }}
                />
            )}
        </ErrorBoundary>
    );
};

export default AdminView;
