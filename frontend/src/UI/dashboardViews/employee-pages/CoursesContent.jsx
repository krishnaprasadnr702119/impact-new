import { useState } from 'react';
import NoDataDisplay from "../../components/NoDataDisplay";
import { FaBook, FaVideo, FaFilePdf, FaQuestionCircle, FaCogs, FaLayerGroup, FaSearch, FaFilter, FaPlay, FaTrophy, FaClock, FaChartLine } from 'react-icons/fa';
import './CoursesContent.css';

const CoursesContent = ({ onCourseSelect, courses, loading, error }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    if (loading) {
        return (
            <div className="courses-loading">
                <div className="loader-spinner"></div>
                <div className="loader-text">Loading your courses...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="courses-error">
                <div className="error-icon">⚠️</div>
                <h3 className="error-title">Error</h3>
                <p className="error-message">{error}</p>
            </div>
        );
    }

    if (courses?.length === 0) {
        return (
            <NoDataDisplay message='No courses assigned yet' desc='Courses assigned to you will appear here.' />
        );
    }

    // Filter and search courses
    const filteredCourses = courses?.filter(course => {
        const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (course.description && course.description.toLowerCase().includes(searchQuery.toLowerCase()));

        const progress = course.progress || 0;
        let matchesFilter = true;
        if (filterStatus === 'completed') matchesFilter = progress === 100;
        else if (filterStatus === 'in-progress') matchesFilter = progress > 0 && progress < 100;
        else if (filterStatus === 'not-started') matchesFilter = progress === 0;

        return matchesSearch && matchesFilter;
    }) || [];

    // Calculate stats
    const totalCourses = courses?.length || 0;
    const completedCourses = courses?.filter(c => c.progress === 100).length || 0;
    const inProgressCourses = courses?.filter(c => c.progress > 0 && c.progress < 100).length || 0;
    const avgProgress = totalCourses > 0
        ? Math.round(courses.reduce((sum, c) => sum + (c.progress || 0), 0) / totalCourses)
        : 0;

    return (
        <div className="courses-container">
            {/* Enhanced Header */}
            <div className="courses-header-enhanced">
                <div className="courses-header-left">
                    <div className="courses-header-icon">
                        <FaBook />
                    </div>
                    <div className="courses-header-content">
                        <h1>My Courses</h1>
                        <p>Explore and continue your learning journey</p>
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="courses-stats-bar">
                <div className="course-stat-item">
                    <div className="course-stat-icon total">
                        <FaBook />
                    </div>
                    <div className="course-stat-info">
                        <span className="course-stat-value">{totalCourses}</span>
                        <span className="course-stat-label">Total Courses</span>
                    </div>
                </div>
                <div className="course-stat-item">
                    <div className="course-stat-icon completed">
                        <FaTrophy />
                    </div>
                    <div className="course-stat-info">
                        <span className="course-stat-value">{completedCourses}</span>
                        <span className="course-stat-label">Completed</span>
                    </div>
                </div>
                <div className="course-stat-item">
                    <div className="course-stat-icon progress">
                        <FaClock />
                    </div>
                    <div className="course-stat-info">
                        <span className="course-stat-value">{inProgressCourses}</span>
                        <span className="course-stat-label">In Progress</span>
                    </div>
                </div>
                <div className="course-stat-item">
                    <div className="course-stat-icon avg">
                        <FaChartLine />
                    </div>
                    <div className="course-stat-info">
                        <span className="course-stat-value">{avgProgress}%</span>
                        <span className="course-stat-label">Avg Progress</span>
                    </div>
                </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="courses-toolbar">
                <div className="courses-search">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search courses..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                    />
                </div>
                <div className="courses-filters">
                    <div className="filter-group">
                        <FaFilter className="filter-icon" />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="filter-select"
                        >
                            <option value="all">All Courses</option>
                            <option value="completed">Completed</option>
                            <option value="in-progress">In Progress</option>
                            <option value="not-started">Not Started</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Courses List */}
            <div className="courses-list">
                {filteredCourses.map(course => {
                    const progress = course.progress || 0;
                    const progressClass = progress === 100 ? 'complete' : progress > 50 ? 'medium' : progress > 0 ? 'low' : 'zero';
                    const statusLabel = progress === 100 ? 'Completed' : progress > 0 ? 'In Progress' : 'Not Started';

                    return (
                        <div
                            key={course.id}
                            onClick={() => onCourseSelect(course.id)}
                            className="course-card-list"
                        >
                            {/* Course Thumbnail */}
                            <div className={`course-thumbnail-enhanced ${progressClass}`}>
                                <div className="thumbnail-overlay"></div>
                                <div className="thumbnail-icon">
                                    <FaBook />
                                </div>
                                <div className="course-status-badge">
                                    {progress === 100 ? <FaTrophy /> : <FaPlay />}
                                    <span>{statusLabel}</span>
                                </div>
                                {progress > 0 && (
                                    <div className="thumbnail-progress">
                                        <div
                                            className="thumbnail-progress-fill"
                                            style={{ width: `${progress}%` }}
                                        ></div>
                                    </div>
                                )}
                            </div>

                            {/* Course Content */}
                            <div className="course-content-enhanced">
                                <h3 className="course-title-enhanced">{course.title}</h3>
                                <p className="course-description-enhanced">
                                    {course.description || 'No description available'}
                                </p>

                                {/* Course Meta */}
                                <div className="course-meta-enhanced">
                                    <div className="meta-item">
                                        <FaLayerGroup />
                                        <span>{course.module_count} {course.module_count === 1 ? 'Module' : 'Modules'}</span>
                                    </div>
                                    <div className="meta-item">
                                        <FaChartLine />
                                        <span>{course.completed_modules || 0} Completed</span>
                                    </div>
                                </div>

                                {/* Content Tags */}
                                <div className="course-content-tags">
                                    {course.modules?.some(m => m.contents?.some(c => c.content_type === 'video')) && (
                                        <span className="content-tag video">
                                            <FaVideo /> Video
                                        </span>
                                    )}
                                    {course.modules?.some(m => m.contents?.some(c => c.content_type === 'pdf')) && (
                                        <span className="content-tag pdf">
                                            <FaFilePdf /> PDF
                                        </span>
                                    )}
                                    {course.modules?.some(m => m.contents?.some(c => c.content_type === 'quiz')) && (
                                        <span className="content-tag quiz">
                                            <FaQuestionCircle /> Quiz
                                        </span>
                                    )}
                                    {course.modules?.some(m => m.contents?.some(c => c.content_type === 'simulation')) && (
                                        <span className="content-tag simulation">
                                            <FaCogs /> Simulation
                                        </span>
                                    )}
                                </div>

                                {/* Progress Section */}
                                <div className="course-progress-enhanced">
                                    <div className="progress-header">
                                        <span className="progress-text">Progress</span>
                                        <span className={`progress-value ${progressClass}`}>{Math.round(progress)}%</span>
                                    </div>
                                    <div className="progress-bar-enhanced">
                                        <div
                                            className={`progress-fill-enhanced ${progressClass}`}
                                            style={{ width: `${progress}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Action Button */}
                                <button className={`course-action-enhanced ${progressClass}`}>
                                    {progress === 100 ? (
                                        <>
                                            <FaTrophy />
                                            <span>Review Course</span>
                                        </>
                                    ) : progress > 0 ? (
                                        <>
                                            <FaPlay />
                                            <span>Continue Learning</span>
                                        </>
                                    ) : (
                                        <>
                                            <FaPlay />
                                            <span>Start Course</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {filteredCourses.length === 0 && (
                <div className="no-results">
                    <div className="no-results-icon">🔍</div>
                    <h3>No courses found</h3>
                    <p>Try adjusting your search or filter criteria</p>
                </div>
            )}
        </div>
    );
};

export default CoursesContent;