import React, { useState, useEffect } from 'react';
import './AnalyticsDashboard.css';
import PageHeader from '../../components/PageHeader';
import AnalyticsTabs from '../../components/AnalyticsTabs/AnalyticsTabs';
import LineChartView from '../../components/chart/LineChartView';
import BarChartView from '../../components/chart/BarChartView';
import PieChartView from '../../components/chart/PieChatView';
import MatricsGrid from '../../components/dataCards/MatricsGrid';
import DataCardsSection from '../../components/dataCards/DataCardsSection';

const AnalyticsDashboard = () => {
    const [analytics, setAnalytics] = useState({
        overview: null,
        users: null,
        courses: null,
        organizations: null,
        learning: null,
        system: null,
        financial: null,
        compliance: null
    });
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshInterval, setRefreshInterval] = useState(null);
    // ✅ define metricsData here, not inside renderOverview
    const [metricsData, setMetricsData] = useState([]);
    const [dataCards, setDataCards] = useState([])
    const [analyticData, setAnalyticData] = useState({})

    useEffect(() => {
        if (analytics.overview) {
            setMetricsData([
                {
                    title: "Total Users",
                    value: analytics.overview.users?.total || 0,
                    sub: `Active (7d): ${analytics.overview.users?.active_7d || 0}`,
                },
                {
                    title: "Organizations",
                    value: analytics.overview.organizations?.total || 0,
                },
                {
                    title: "Courses",
                    value: analytics.overview.courses?.total || 0,
                    sub: `Completion Rate: ${analytics.overview.courses?.completion_rate || 0}%`,
                },
                {
                    title: "Quiz Performance",
                    value: `${analytics.overview.quizzes?.average_score || 0}%`,
                    sub: `Total Attempts: ${analytics.overview.quizzes?.total_attempts || 0}`,
                },
            ]);
            setDataCards([
                {
                    label: "Recent Logins (24h)",
                    value: analytics.overview.users?.recent_logins_24h || 0,
                },
                {
                    label: "Course Enrollments",
                    value: analytics.overview.courses?.enrollments || 0,
                },
                {
                    label: "Completed Courses",
                    value: analytics.overview.courses?.completed || 0,
                }
            ])
            setAnalyticData(analytics.overview.learning || {})
        }
    }, [analytics?.overview]);

    const fetchAnalytics = async (type = 'overview') => {
        try {
            const response = await fetch(`/api/analytics/${type}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch ${type} analytics`);
            }

            const data = await response.json();
            if (data.success) {
                setAnalytics(prev => ({
                    ...prev,
                    [type]: data[`${type}_analytics`] || data.overview
                }));
            }
        } catch (err) {
            setError(err.message);
        }
    };

    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            await fetchAnalytics('overview');
            setLoading(false);
        };
        loadInitialData();

        // Reduce refresh frequency to prevent constant updates
        const interval = setInterval(() => {
            fetchAnalytics(activeTab);
        }, 300000); // Refresh every 5 minutes instead of 30 seconds

        setRefreshInterval(interval);

        return () => {
            if (refreshInterval) {
                clearInterval(refreshInterval);
            }
        };
    }, []);

    useEffect(() => {
        if (activeTab !== 'overview' && !analytics[activeTab]) {
            fetchAnalytics(activeTab);
        }
    }, [activeTab]);

    const exportData = async (format = 'csv') => {
        try {
            const response = await fetch('/api/analytics/export', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    type: activeTab,
                    format: format
                })
            });

            const data = await response.json();
            if (data.success) {
                alert(`Export prepared: ${data.message}`);
            }
        } catch (err) {
            alert('Export failed: ' + err.message);
        }
    };

    const renderOverview = (metricsData) => {
        return (
            <div className="analytics-overview">
                {metricsData.length > 0 && <MatricsGrid metricsData={metricsData} />}
                {dataCards.length > 0 && <DataCardsSection title='Recent Activity' dataCards={dataCards} type={1} keyValue='label' value='value' />}
            </div>
        );
    };

    const renderUsers = () => {
        if (!analytics.users || !analytics.users.registration_trends) {
            return <div className='text-center'>{loading ? 'Loading user analytics...' : 'No user analytics data available yet'}</div>;
        }

        return (
            <div className="analytics-users">

                {analytics.users && analytics.users.registration_trends &&
                    <DataCardsSection title='User Registration Trends' dataCards={analytics.users.registration_trends}
                        keyValue={'date'} value={'count'} type={8} classValue='' typeText='registrations' />}

                {analytics.users && analytics.users.role_distribution &&
                    <DataCardsSection title='User Roles Distribution' dataCards={analytics.users.role_distribution}
                        keyValue={'role'} value={'count'} type={8} classValue='green' />}

                <div className="section">
                    <h3>Top Active Users</h3>
                    <div className="top-users">
                        {analytics.users.top_active_users?.map((user, index) => (
                            <div key={index} className="user-item">
                                <span className="username">{user.username}</span>
                                <span className="sessions">{user.session_count} sessions</span>
                            </div>
                        ))}
                    </div>
                </div>
                {analytics.users && analytics.users.top_active_users &&
                    <DataCardsSection title='Top Active Users' dataCards={analytics.users.top_active_users}
                        keyValue={'username'} value={'session_count'} type={10} classValue='purple' />}
                {analytics.users && analytics.users.login_patterns &&
                    <DataCardsSection title='Login Patterns by Hour' dataCards={analytics.users.login_patterns}
                        keyValue={'hour'} value={'count'} valueText=':00' typeText='logins' type={8} classValue='yellow' />}

            </div>
        );
    };

    const renderCourses = () => {
        if (!analytics.courses || !analytics.courses.popular_courses) {
            return <div className='text-center'>{loading ? 'Loading course analytics...' : 'No course analytics data available yet'}</div>;
        }

        return (
            <div className="analytics-courses">
                {analytics.courses && analytics.courses.popular_courses &&
                    <DataCardsSection title='Popular Courses' dataCards={analytics.courses.popular_courses}
                        keyValue={'course_title'} value={'enrollment_count'} type={6} typeText='enrollments' />}

                {analytics.courses && analytics.courses.completion_rates &&
                    <DataCardsSection title='Course Completion Rates' dataCards={analytics.courses.completion_rates}
                        keyValue={'course_title'} type={7}
                        typeText="Enrolled: "
                        typeValue='total_enrollments'
                        secondText="Completed: "
                        secondValue='completed_count'
                        tagText={'completion_rate'}
                        tagValue='%' />
                }
                {analytics.courses && analytics.courses.time_spent &&
                    <DataCardsSection title='Average Time Spent' dataCards={analytics.courses.time_spent}
                        keyValue={'course_title'} value={'avg_time_minutes'} type={6} typeText='minutes' />}

            </div>
        );
    };

    const renderLearning = () => {
        // if (!analytics.learning) return <div className='text-center'>{loading?'Loading learning analytics...':'No learning analytics available'}</div>;

        return (
            <>
                {/* Quiz Performance Trends */}
                {/* <div className="section">
                    <h3>📊 Quiz Performance Trends</h3>
                    <div className="quiz-trends">
                        {analyticData.quiz_trends?.map((trend, index) => (
                            <div key={index} className="card quiz-trend-item">
                                <div className="card-header">{trend.date}</div>
                                <div className="card-body">
                                    <span className="score">{trend.avg_score}%</span>
                                    <span className="attempts">{trend.attempt_count} attempts</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div> */}
                {analyticData && <DataCardsSection title='📊 Quiz Performance Trends' dataCards={analyticData?.quiz_trends} keyValue={'date'}
                    value={'avg_score'} type={2} typeValue={'attempt_count'} typeText={'attempts'} />}
                {/* Content Interactions */}
                {/* <div className="section">
                    <h3>📝 Content Interactions</h3>
                    <div className="content-interactions">
                        {analytics.content_interactions?.map((interaction, index) => (
                            <div key={index} className="card interaction-item">
                                <span className="type">{interaction.type}</span>
                                <span className="count">{interaction.count}</span>
                            </div>
                        ))}
                    </div>
                </div> */}
                {analyticData && analyticData?.content_interactions && <DataCardsSection title='📝 Content Interactions' dataCards={analyticData?.content_interactions}
                    keyValue={'type'} value={'count'} type={3} />}
                {/* Top Learners */}
                {/* <div className="section">
                    <h3>🏅 Top Learners</h3>
                    <div className="top-learners">
                        {analyticData.top_learners?.map((learner, index) => (
                            <div key={index} className="card learner-item">
                                <span className="username">{learner.username}</span>
                                <span className="progress">{learner.avg_progress}% avg progress</span>
                            </div>
                        ))}
                    </div>
                </div> */}
                {analyticData && analyticData?.top_learners && <DataCardsSection title='🏅 Top Learners' dataCards={analyticData?.top_learners}
                    keyValue={'username'} value={'avg_progress'} type={1} typeText='% avg progress' />}
            </>

        );
    };

    const renderSystem = () => {
        if (!analytics.system || !analytics.system.page_views) {
            return <div className='text-center'>{loading ? 'Loading system analytics...' : 'No system analytics data available yet'}</div>;
        }
        return (
            <>

                <LineChartView title={'📈 Page Views (Last 7 Days)'} xKey="date" yKey="views" data={analytics.system.page_views} />
                {/* <div className="section">
                    <h3>Most Visited Pages</h3>
                    <div className="quiz-trends">
                        {analytics.system.popular_pages?.map((page, index) => (
                            <div key={index} className="card quiz-trend-item">
                                <div className="card-header">{page.page}</div>
                                <div className="card-body">
                                    <span className="score">{page.visits} visits</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div> */}
                {analytics?.system?.popular_pages &&
                    <DataCardsSection title='Most Visited Pages' dataCards={analytics?.system?.popular_pages}
                        keyValue={'page'} value={'visits'} type={3} valueText='visits' />
                }
                {/* <div className="section">
                    <h3>API Usage Statistics</h3>
                    <div className="api-usage">
                        {analytics.system.api_usage?.map((api, index) => (
                            <div key={index} className="api-item">
                                <span className="endpoint">{api.endpoint}</span>
                                <span className="requests">{api.request_count} requests</span>
                                <span className="response-time">{api.avg_response_time}ms avg</span>
                            </div>
                        ))}
                    </div>
                </div> */}
                {analytics?.system?.api_usage &&
                    <DataCardsSection title='API Usage Statistics' dataCards={analytics?.system?.api_usage}
                        keyValue={'endpoint'} value={'request_count'} type={5} valueText='requests' typeValue={'avg_response_time'} typeText={'ms avg'} />
                }
                {/* <div className="section">
                    <h3>🖥️ System Metrics</h3>
                    <div className="system-metrics">
                        {analytics.system.system_metrics?.slice(0, 10).map((metric, index) => {
                            let valueClass = "metric-value";
                            if (metric.name.toLowerCase().includes("cpu") || metric.name.toLowerCase().includes("memory")) {
                                if (metric.value < 50) valueClass += " good";
                                else if (metric.value > 85) valueClass += " bad";
                                else valueClass += " warning";
                            }

                            return (
                                <div key={index} className="metric-card">
                                    <div className="metric-header">{metric.name}</div>
                                    <div className={valueClass}>
                                        {metric.value} {metric.unit}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div> */}
                {analytics?.system?.system_metrics &&
                    <DataCardsSection title='🖥️ System Metrics' dataCards={analytics?.system?.system_metrics}
                        keyValue={'name'} value={'value'} type={4} valueText={'unit'} />
                }
                <BarChartView title={'📈 Page Views (Last 7 Days)'} xKey="endpoint" yKey="request_count" data={analytics.system.api_usage} />
                {/* // Pie Chart - System Metrics */}
                <PieChartView
                    title="⚙️ System Metrics"
                    data={analytics.system.system_metrics}
                    dataKey="value"
                    nameKey="name"
                />

            </>
        );
    };

    const renderOrganizations = () => {
        if (!analytics.organizations || !analytics.organizations.organization_sizes) {
            return <div className='text-center'>{loading ? 'Loading organizations analytics...' : 'No organizations analytics data available yet'}</div>;
        }

        return (
            <div className="analytics-organizations">

                {analytics.organizations && analytics.organizations.organization_sizes &&
                    <DataCardsSection title='Organization Sizes' dataCards={analytics.organizations.organization_sizes}
                        keyValue={'organization'} value={'employee_count'} type={8} classValue='' typeText='employees' />}

                {analytics.organizations && analytics.organizations.organization_sizes &&
                    <DataCardsSection title='Course Assignments by Organization' dataCards={analytics.organizations.organization_sizes}
                        keyValue={'organization'} value={'course_count'} type={8} classValue='' typeText=' courses assigned' />}

            </div>
        );
    };

    if (loading) {
        return <div className="analytics-loading">Loading analytics dashboard...</div>;
    }

    if (error) {
        return <div className="analytics-error">Error: {error}</div>;
    }

    return (
        <>
            <PageHeader
                icon="🏢"
                title="Analytics Dashboard"
                subtitle=""
            >
                <div className="analytics-controls">
                    <button onClick={() => fetchAnalytics(activeTab)} className="refresh-btn">
                        🔄 Refresh
                    </button>
                    <button onClick={() => exportData('csv')} className="export-btn">
                        📊 Export CSV
                    </button>
                    <button onClick={() => exportData('excel')} className="export-btn">
                        📈 Export Excel
                    </button>
                </div>
            </PageHeader>

            <AnalyticsTabs activeTab={activeTab} setActiveTab={(e) => setActiveTab(e)} />
            <div className="analytics-content">
                {activeTab === 'overview' && renderOverview(metricsData)}
                {activeTab === 'users' && renderUsers()}
                {activeTab === 'courses' && renderCourses()}
                {activeTab === 'organizations' && renderOrganizations()}
                {activeTab === 'learning' && renderLearning()}
                {activeTab === 'system' && renderSystem()}
                {activeTab === 'financial' && (
                    <div className="coming-soon">
                        <h3>Financial Analytics</h3>
                        <p>Financial analytics features coming soon...</p>
                    </div>
                )}
                {activeTab === 'compliance' && (
                    <div className="coming-soon">
                        <h3>Compliance Analytics</h3>
                        <p>Certification and compliance tracking features coming soon...</p>
                    </div>
                )}
            </div>
        </>
    );
};

export default AnalyticsDashboard;
