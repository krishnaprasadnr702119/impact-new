import { useState, useCallback, useEffect } from 'react';
import { FaHome, FaUsers, FaBook, FaUser, FaQuestionCircle, FaVideo, FaFilePdf, FaCertificate } from 'react-icons/fa'; // Import the correct icons
import Sidebar from '../components/Sidebar';
import Footer from '../Footer';
import ErrorBoundary from '../../ErrorBoundary';
import { removeToken } from '../../utils/auth';
import SettingsContent from '../components/SettingsContent';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import capitalizedText from '../../utils/util';
import { useAuth } from '../../hooks/useAuth';
import useDeviceListener from '../../hooks/useDeviceListner';
import EmployeesContent from './shared-view/EmployeesContent';
import DashboardHeader from '../components/DashboardHeader';
import NoDataDisplay from '../components/NoDataDisplay';
import ProfileContent from './employee-pages/ProfileView';
import DashboardContent from './employee-pages/DashboardContent';
import CoursesContent from './employee-pages/CoursesContent';
import CertificatesContent from './employee-pages/CertificatesContent';
import { employeeApi, ApiError } from '../../utils/apiClient';
import { ThemeProvider } from '../../context/ThemeContext';
import ThemeSwitcher from '../components/ThemeSwitcher/ThemeSwitcher';
import AlertDialog from '../components/AlertDialog';

const EmployeeView = ({ payload }) => {
    const [loading, setLoading] = useState(false);
    const [activePage, setActivePage] = useState('dashboard');
    const [collapsed, setCollapsed] = useState(false);
    const [error, setError] = useState(null);
    const [employeeListRefresh, setEmployeeListRefresh] = useState(0);
    const userRole = payload?.role || 'admin'; // Default to 'admin' if role not provided
    const [userInfo, setUserInfo] = useState(null);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [activeSection, setActiveSection] = useState('dashboard');
    const [courses, setCourses] = useState([]);
    const [showSignOutDialog, setShowSignOutDialog] = useState(false);
    const navigate = useNavigate();
    const { logout } = useAuth();
    useDeviceListener((device) => {
        console.log("Current device:", device);
        if (device === "mobile" || device == 'tablet') {
            // your function for mobile
            setCollapsed(true);
        }
    });
    // Always fetch courses when userInfo is set, and also when switching to courses tab
    useEffect(() => {
        if (userInfo?.username) {
            fetchCourses();
        }
    }, [userInfo]);
    useEffect(() => {
        setUserInfo(payload);
    }, [payload]);
    useEffect(() => {
        if (activeSection === 'courses' && userInfo?.username) {
            fetchCourses();
        }
        // Reset error and courses when switching away from courses
        if (activeSection !== 'courses') {
            setCourses([]);
            setError(null);
        }
    }, [activeSection, userInfo]);
    const handleCourseClick = (courseId) => {
        navigate(`/course/${courseId}`);
    };
    const fetchCourses = async () => {
        try {
            setLoading(true);
            const data = await employeeApi.getMyCourses();

            if (data.success) {
                setCourses(data.courses);
                setError(null);
            } else {
                setError(data.error || 'Failed to fetch courses');
            }
        } catch (err) {
            if (err instanceof ApiError) {
                setError(err.message);
            } else {
                setError('Network error while fetching courses');
            }
        } finally {
            setLoading(false);
        }
    };

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <FaHome />, color: '#3b82f6' },
        { id: 'courses', label: 'Courses', icon: <FaBook />, color: '#f59e0b' },
        { id: 'certificates', label: 'Certificates', icon: <FaCertificate />, color: '#10b981' },
        { id: 'profile', label: 'Profile', icon: <FaUsers />, color: '#8b5cf6' },
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
            case 'profile': return 'Employee Profile';
            case 'courses': return 'Courses Management';
            case 'certificates': return 'My Certificates';
            default: return 'Portal Admin Panel';
        }
    };



    // Render main content based on active page
    const renderContent = () => {
        switch (activePage) {
            case 'dashboard':
                return (
                    <DashboardContent userInfo={userInfo} payload={payload} courses={courses} />
                );
            case 'employees':
                return <EmployeesContent Admin key={employeeListRefresh} username={payload?.username} />;
            case 'courses':
                return <CoursesContent onCourseSelect={handleCourseClick} username={payload?.username} courses={courses} loading={loading} error={error} />;
            case 'certificates':
                return <CertificatesContent username={payload?.username} />;
            case 'profile':
                return <ProfileContent userInfo={userInfo} />;
            case 'settings':
                return <SettingsContent token={payload?.token} payload={payload} username={payload?.username} />;
            default:
                return <DashboardContent userInfo={userInfo} payload={payload} />;
        }
    };
    return (
        <ThemeProvider>
            <ErrorBoundary>
                <div className="layout">
                    <div className="sidebar">
                        <Sidebar
                            title="👨‍💼 Employee Portal"
                            subtitle="Learning Dashboard"
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
                                onRefresh={null}
                                title={getPageTitle()}
                                rightContent={<ThemeSwitcher />}
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
            </ErrorBoundary>
        </ThemeProvider>
    );
};

export default EmployeeView;
