import { FaHome, FaUsers, FaCog, FaChartBar, FaBook, FaChartLine } from 'react-icons/fa'; // Import the correct icons
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useState, useCallback, useEffect } from 'react';
import EmployeesContent from './shared-view/EmployeesContent';
import ErrorBoundary from '../../ErrorBoundary';
import Footer from '../Footer';
import PortalAdminCourses from './portal-admin-pages/PortalAdminCourses';
import PortalAnalyticsContent from './portal-admin-pages/PortalAnalyticsContent';
import PortalDashboard from './portal-admin-pages/PortalDashboard';
import EmployeeProgress from './portal-admin-pages/EmployeeProgress';
import SettingsContent from '../components/SettingsContent';
import Sidebar from '../components/Sidebar';
import useDeviceListener from '../../hooks/useDeviceListner';
import DashboardHeader from '../components/DashboardHeader';
import AlertDialog from '../components/AlertDialog';
import SendNotificationForm from '../components/SendNotificationForm';

const PortalAdminView = ({ payload, token }) => {
    const [loading, setLoading] = useState(false);
    const [activePage, setActivePage] = useState('dashboard');
    const [collapsed, setCollapsed] = useState(false);
    const [refreshInterval, setRefreshInterval] = useState(null);
    const [employeeListRefresh, setEmployeeListRefresh] = useState(0);
    const [showSignOutDialog, setShowSignOutDialog] = useState(false);
    const [showNotificationForm, setShowNotificationForm] = useState(false);
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [error, setError] = useState(null);
    const { logout } = useAuth();
    useDeviceListener((device) => {
        console.log("Current device:", device);
        if (device === "mobile" || device == "tablet") {
            // your function for mobile
            setCollapsed(true);
        }
    });
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <FaHome />, color: '#3b82f6' },
        { id: 'employees', label: 'Employees', icon: <FaUsers />, color: '#8b5cf6' },
        { id: 'courses', label: 'Courses', icon: <FaBook />, color: '#f59e0b' },
        { id: 'progress', label: 'Employee Progress', icon: <FaChartLine />, color: '#10b981' },
        { id: 'analytics', label: 'Analytics', icon: <FaChartBar />, color: '#8b5cf6' },
        { id: 'settings', label: 'Settings', icon: <FaCog />, color: '#6b7280' },
    ]

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
            case 'employees': return 'Employees Management';
            case 'settings': return 'System Settings';
            case 'analytics': return 'Analytics Management';
            case 'courses': return 'Courses Management';
            default: return 'Portal Admin Panel';
        }
    };
    const fetchSystemStats = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/portal_admin/org_domain?username=${payload.username}`)
            const data = await response.json();

            if (response.ok && data.success) {
                setStats(data.data);
                setError(null);
            } else {
                setError(data.error || 'Failed to fetch system statistics');
                setStats(null);
            }
        } catch (err) {
            console.error('Error fetching system stats:', err);
            setError('Network error when fetching system statistics');
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
                return (<>
                    {/* Welcome Section */}
                    <div className="welcome-section">
                        <h2>Welcome, {payload?.username}!</h2>
                        <p>Here's an overview of your organization's performance</p>
                    </div>

                    {/* Stats Overview */}
                    <PortalDashboard />
                </>
                );
            case 'employees':
                return <EmployeesContent Admin key={employeeListRefresh} username={payload?.username} token={token} />;
            case 'courses':
                return <PortalAdminCourses username={payload?.username} />;
            case 'progress':
                return <EmployeeProgress username={payload?.username} />;
            case 'analytics':
                return <PortalAnalyticsContent username={payload?.username} />;
            case 'settings':
                return <SettingsContent token={token} payload={payload} username={payload?.username} />;
            default:
                return <PortalDashboard />;
        }
    };
    return (
        <ErrorBoundary>
            <div className="layout">
                <div className="sidebar">
                    <Sidebar
                        title="Portal Admin"
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
                            username={payload?.username}
                            loading={loading}
                            onRefresh={handleManualRefresh}
                            title={getPageTitle()}
                            rightContent={
                                <button
                                    onClick={() => setShowNotificationForm(true)}
                                    style={{
                                        padding: '8px 16px',
                                        background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
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
                                        boxShadow: '0 2px 8px rgba(139, 92, 246, 0.3)'
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.4)';
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(139, 92, 246, 0.3)';
                                    }}
                                >
                                    📢 Send Notification
                                </button>
                            }
                        />
                    </div>
                    <div className="content dashboard-content">
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
                    userRole="portal_admin"
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

export default PortalAdminView;
