import React from 'react';
import { useNavigate } from 'react-router-dom';
import './EmployeePortal.css';

const DashboardContent = ({ userInfo, courses = [] }) => {
    const navigate = useNavigate();

    const completedCourses = courses.filter(c => c.progress === 100).length;
    const inProgressCourses = courses.filter(c => c.progress > 0 && c.progress < 100).length;
    const totalModules = courses.reduce((sum, c) => sum + (c.module_count || 0), 0);
    const completedModules = courses.reduce((sum, c) => sum + (c.completed_modules || 0), 0);

    return (
        <div className="employee-dashboard">
            {/* Welcome Section */}
            <div className="welcome-section">
                <div className="welcome-icon">🎓</div>
                <h1 className="welcome-title">
                    Welcome back, {userInfo?.username || 'Learner'}!
                </h1>
                <p className="welcome-subtitle">
                    Continue your learning journey and achieve your goals with our comprehensive courses
                </p>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon blue">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                        </svg>
                    </div>
                    <div className="stat-label">Total Courses</div>
                    <h2 className="stat-value">{courses.length}</h2>
                </div>

                <div className="stat-card">
                    <div className="stat-icon green">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </div>
                    <div className="stat-label">Completed</div>
                    <h2 className="stat-value">{completedCourses}</h2>
                </div>

                <div className="stat-card">
                    <div className="stat-icon orange">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                        </svg>
                    </div>
                    <div className="stat-label">In Progress</div>
                    <h2 className="stat-value">{inProgressCourses}</h2>
                </div>

                <div className="stat-card">
                    <div className="stat-icon purple">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <circle cx="12" cy="12" r="6"></circle>
                            <circle cx="12" cy="12" r="2"></circle>
                        </svg>
                    </div>
                    <div className="stat-label">Modules Completed</div>
                    <h2 className="stat-value">{completedModules}/{totalModules}</h2>
                </div>
            </div>

            {/* Course Progress Section */}
            {courses && courses.length > 0 ? (
                <div className="progress-section">
                    <div className="section-header">
                        <span className="section-icon">📊</span>
                        <h2 className="section-title">Your Course Progress</h2>
                    </div>
                    <div className="course-progress-grid">
                        {courses.map((course) => {
                            const progress = course.progress || 0;
                            const progressClass = progress === 100 ? 'high' : progress > 50 ? 'medium' : 'low';

                            return (
                                <div
                                    key={course.id}
                                    className="course-progress-card"
                                    onClick={() => navigate(`/course/${course.id}`)}
                                >
                                    <h3 className="course-progress-title">{course.title}</h3>
                                    <div className="course-progress-info">
                                        <span>📝</span>
                                        <span>{course.completed_modules || 0} / {course.module_count} modules completed</span>
                                    </div>
                                    <div className="progress-bar-container">
                                        <div
                                            className={`progress-bar-fill ${progressClass}`}
                                            style={{ width: `${progress}%` }}
                                        ></div>
                                    </div>
                                    <div className="progress-footer">
                                        <span className="progress-percentage">
                                            {Math.round(progress)}%
                                        </span>
                                        {progress === 100 && (
                                            <span className="completion-badge">
                                                <span>🏆</span>
                                                <span>Completed</span>
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div className="empty-state">
                    <div className="empty-state-icon">📚</div>
                    <h3 className="empty-state-title">No Courses Yet</h3>
                    <p className="empty-state-text">
                        You haven't been assigned any courses yet. Check back soon!
                    </p>
                </div>
            )}

        </div>
    );
};

export default DashboardContent;
