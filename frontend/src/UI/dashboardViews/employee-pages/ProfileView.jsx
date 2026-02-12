import React, { useState, useEffect } from 'react';
import {
    FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaLock, FaBell,
    FaShieldAlt, FaHistory, FaCog, FaSave, FaCamera, FaBook,
    FaCertificate, FaSignInAlt, FaEye, FaEyeSlash, FaEdit,
    FaBriefcase, FaCalendarAlt
} from 'react-icons/fa';
import { employeeApi } from '../../../utils/apiClient';
import './ProfileView.css';

const ProfileContent = ({ userInfo }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        coursesCompleted: 0,
        certificatesEarned: 0,
        hoursLearned: 0,
        totalCourses: 0
    });
    const [formData, setFormData] = useState({
        username: userInfo?.username || '',
        email: userInfo?.email || '',
        phone: userInfo?.phone || '',
        department: userInfo?.department || '',
        location: userInfo?.location || '',
        bio: userInfo?.bio || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [notifications, setNotifications] = useState({
        emailNotifications: true,
        courseReminders: true,
        certificateAlerts: true,
        weeklyReport: false,
        marketingEmails: false
    });

    // Fetch actual data on mount
    useEffect(() => {
        fetchUserStats();
    }, [userInfo]);

    const fetchUserStats = async () => {
        try {
            setLoading(true);
            const data = await employeeApi.getMyCourses();
            if (data.success && data.courses) {
                const courses = data.courses;
                const completed = courses.filter(c => c.progress === 100).length;
                const totalHours = courses.reduce((sum, c) => sum + (c.duration_hours || 0), 0);

                setStats({
                    coursesCompleted: completed,
                    certificatesEarned: completed, // Assuming certificate per completed course
                    hoursLearned: totalHours,
                    totalCourses: courses.length
                });
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const toggleNotification = (key) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="profile-container">
            {/* Profile Header Card */}
            <div className="profile-header-card">
                <div className="profile-header-content">
                    <div className="profile-avatar-section">
                        <div className="profile-avatar">
                            {userInfo?.username?.substring(0, 1).toUpperCase() || '?'}
                        </div>
                        <button className="profile-avatar-badge" title="Change Avatar">
                            <FaCamera />
                        </button>
                    </div>
                    <div className="profile-info">
                        <h1 className="profile-name">{userInfo?.username || 'User'}</h1>
                        <div className="profile-role-badge">
                            <FaBriefcase />
                            {userInfo?.role?.charAt(0).toUpperCase() + userInfo?.role?.slice(1) || 'Employee'}
                        </div>
                        <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0, fontSize: '14px' }}>
                            <FaCalendarAlt style={{ marginRight: '8px' }} />
                            Member since January 2024
                        </p>
                        <div className="profile-stats">
                            <div className="profile-stat">
                                <div className="profile-stat-value">{stats.totalCourses}</div>
                                <div className="profile-stat-label">Total Courses</div>
                            </div>
                            <div className="profile-stat">
                                <div className="profile-stat-value">{stats.coursesCompleted}</div>
                                <div className="profile-stat-label">Completed</div>
                            </div>
                            <div className="profile-stat">
                                <div className="profile-stat-value">{stats.certificatesEarned}</div>
                                <div className="profile-stat-label">Certificates</div>
                            </div>
                            <div className="profile-stat">
                                <div className="profile-stat-value">{stats.hoursLearned}h</div>
                                <div className="profile-stat-label">Learning Hours</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Profile Sections */}
            <div className="profile-sections">
                {/* Personal Information */}
                <div className="profile-section">
                    <div className="section-header">
                        <div className="section-header-left">
                            <div className="section-icon personal">
                                <FaUser />
                            </div>
                            <h3 className="section-title">Personal Information</h3>
                        </div>
                        <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>
                            <FaEdit /> Edit
                        </button>
                    </div>
                    <div className="section-body">
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Username</label>
                                <input
                                    type="text"
                                    name="username"
                                    className="form-input"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    disabled
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    className="form-input"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="Enter your email"
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Phone Number</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    className="form-input"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    placeholder="Enter your phone number"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Department</label>
                                <input
                                    type="text"
                                    name="department"
                                    className="form-input"
                                    value={formData.department}
                                    onChange={handleInputChange}
                                    placeholder="Enter your department"
                                />
                            </div>
                        </div>
                        <div className="form-row single">
                            <div className="form-group">
                                <label className="form-label">Location</label>
                                <input
                                    type="text"
                                    name="location"
                                    className="form-input"
                                    value={formData.location}
                                    onChange={handleInputChange}
                                    placeholder="Enter your location"
                                />
                            </div>
                        </div>
                        <div className="form-row single">
                            <div className="form-group">
                                <label className="form-label">Bio</label>
                                <textarea
                                    name="bio"
                                    className="form-input textarea"
                                    value={formData.bio}
                                    onChange={handleInputChange}
                                    placeholder="Tell us about yourself..."
                                />
                            </div>
                        </div>
                        <div className="section-actions">
                            <button className="btn-primary">
                                <FaSave /> Save Changes
                            </button>
                            <button className="btn-secondary">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>

                {/* Security Settings */}
                <div className="profile-section">
                    <div className="section-header">
                        <div className="section-header-left">
                            <div className="section-icon security">
                                <FaShieldAlt />
                            </div>
                            <h3 className="section-title">Security Settings</h3>
                        </div>
                    </div>
                    <div className="section-body">
                        <div className="form-row single">
                            <div className="form-group">
                                <label className="form-label">Current Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="currentPassword"
                                        className="form-input"
                                        value={formData.currentPassword}
                                        onChange={handleInputChange}
                                        placeholder="Enter current password"
                                        style={{ paddingRight: '44px' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{
                                            position: 'absolute',
                                            right: '12px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'none',
                                            border: 'none',
                                            color: '#64748b',
                                            cursor: 'pointer',
                                            padding: '4px'
                                        }}
                                    >
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">New Password</label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    className="form-input"
                                    value={formData.newPassword}
                                    onChange={handleInputChange}
                                    placeholder="Enter new password"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Confirm Password</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    className="form-input"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    placeholder="Confirm new password"
                                />
                            </div>
                        </div>
                        <div style={{
                            padding: '16px',
                            background: '#fef3c7',
                            borderRadius: '12px',
                            marginBottom: '20px',
                            fontSize: '13px',
                            color: '#92400e'
                        }}>
                            <strong>Password Requirements:</strong>
                            <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
                                <li>At least 8 characters long</li>
                                <li>Contains uppercase and lowercase letters</li>
                                <li>Contains at least one number</li>
                                <li>Contains at least one special character</li>
                            </ul>
                        </div>
                        <div className="section-actions">
                            <button className="btn-primary">
                                <FaLock /> Update Password
                            </button>
                        </div>
                    </div>
                </div>

                {/* Notification Preferences */}
                <div className="profile-section">
                    <div className="section-header">
                        <div className="section-header-left">
                            <div className="section-icon notifications">
                                <FaBell />
                            </div>
                            <h3 className="section-title">Notification Preferences</h3>
                        </div>
                    </div>
                    <div className="section-body">
                        <div className="toggle-row">
                            <div className="toggle-info">
                                <div className="toggle-label">Email Notifications</div>
                                <div className="toggle-description">Receive important updates via email</div>
                            </div>
                            <div
                                className={`toggle-switch ${notifications.emailNotifications ? 'active' : ''}`}
                                onClick={() => toggleNotification('emailNotifications')}
                            />
                        </div>
                        <div className="toggle-row">
                            <div className="toggle-info">
                                <div className="toggle-label">Course Reminders</div>
                                <div className="toggle-description">Get reminded about incomplete courses</div>
                            </div>
                            <div
                                className={`toggle-switch ${notifications.courseReminders ? 'active' : ''}`}
                                onClick={() => toggleNotification('courseReminders')}
                            />
                        </div>
                        <div className="toggle-row">
                            <div className="toggle-info">
                                <div className="toggle-label">Certificate Alerts</div>
                                <div className="toggle-description">Notification when you earn a certificate</div>
                            </div>
                            <div
                                className={`toggle-switch ${notifications.certificateAlerts ? 'active' : ''}`}
                                onClick={() => toggleNotification('certificateAlerts')}
                            />
                        </div>
                        <div className="toggle-row">
                            <div className="toggle-info">
                                <div className="toggle-label">Weekly Progress Report</div>
                                <div className="toggle-description">Receive weekly learning summary</div>
                            </div>
                            <div
                                className={`toggle-switch ${notifications.weeklyReport ? 'active' : ''}`}
                                onClick={() => toggleNotification('weeklyReport')}
                            />
                        </div>
                        <div className="toggle-row">
                            <div className="toggle-info">
                                <div className="toggle-label">Marketing Emails</div>
                                <div className="toggle-description">Receive updates about new features</div>
                            </div>
                            <div
                                className={`toggle-switch ${notifications.marketingEmails ? 'active' : ''}`}
                                onClick={() => toggleNotification('marketingEmails')}
                            />
                        </div>
                    </div>
                </div>

                {/* Account Info */}
                <div className="profile-section">
                    <div className="section-header">
                        <div className="section-header-left">
                            <div className="section-icon activity">
                                <FaUser />
                            </div>
                            <h3 className="section-title">Account Information</h3>
                        </div>
                    </div>
                    <div className="section-body">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                padding: '12px 16px',
                                background: 'var(--theme-background, #f8fafc)',
                                borderRadius: '10px'
                            }}>
                                <span style={{ color: 'var(--theme-textSecondary, #64748b)', fontWeight: '500' }}>Username</span>
                                <span style={{ color: 'var(--theme-text, #1e293b)', fontWeight: '600' }}>{userInfo?.username || '-'}</span>
                            </div>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                padding: '12px 16px',
                                background: 'var(--theme-background, #f8fafc)',
                                borderRadius: '10px'
                            }}>
                                <span style={{ color: 'var(--theme-textSecondary, #64748b)', fontWeight: '500' }}>Role</span>
                                <span style={{ color: 'var(--theme-text, #1e293b)', fontWeight: '600' }}>{userInfo?.role || '-'}</span>
                            </div>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                padding: '12px 16px',
                                background: 'var(--theme-background, #f8fafc)',
                                borderRadius: '10px'
                            }}>
                                <span style={{ color: 'var(--theme-textSecondary, #64748b)', fontWeight: '500' }}>Organization</span>
                                <span style={{ color: 'var(--theme-text, #1e293b)', fontWeight: '600' }}>{userInfo?.org_name || '-'}</span>
                            </div>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                padding: '12px 16px',
                                background: 'var(--theme-background, #f8fafc)',
                                borderRadius: '10px'
                            }}>
                                <span style={{ color: 'var(--theme-textSecondary, #64748b)', fontWeight: '500' }}>Email</span>
                                <span style={{ color: 'var(--theme-text, #1e293b)', fontWeight: '600' }}>{userInfo?.email || '-'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Danger Zone - Full Width */}
                <div className="profile-section full-width">
                    <div className="section-header" style={{ background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)' }}>
                        <div className="section-header-left">
                            <div className="section-icon" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}>
                                <FaCog />
                            </div>
                            <h3 className="section-title" style={{ color: '#dc2626' }}>Danger Zone</h3>
                        </div>
                    </div>
                    <div className="section-body">
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '16px',
                            background: '#fef2f2',
                            borderRadius: '12px',
                            border: '1px solid #fecaca'
                        }}>
                            <div>
                                <div style={{ fontWeight: '600', color: '#dc2626', marginBottom: '4px' }}>
                                    Delete Account
                                </div>
                                <div style={{ fontSize: '13px', color: '#64748b' }}>
                                    Once you delete your account, there is no going back. Please be certain.
                                </div>
                            </div>
                            <button className="btn-danger">
                                Delete Account
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileContent;