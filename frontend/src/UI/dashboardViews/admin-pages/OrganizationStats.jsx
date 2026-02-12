import React, { useState, useEffect } from 'react';
import { FaUsers, FaGraduationCap, FaChartLine, FaExclamationTriangle } from 'react-icons/fa';
import './OrganizationStats.css';
import PageHeader from '../../components/PageHeader';

const OrganizationStats = () => {
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredStats, setFilteredStats] = useState([]);
    const [confirmModal, setConfirmModal] = useState(null);

    useEffect(() => {
        // Initial fetch
        fetchOrganizationStats();

        // Setup auto-refresh interval that doesn't cause blinking
        const interval = setInterval(() => {
            // Silent refresh without changing loading state
            silentRefresh();
        }, 300000); // 5 minutes instead of 30 seconds

        // Cleanup interval on component unmount
        return () => clearInterval(interval);
    }, []);

    // Silent refresh function that doesn't trigger loading state
    const silentRefresh = async () => {
        try {
            console.log('Silently refreshing organization stats...');
            const response = await fetch(`/api/admin/org_stats?t=${Date.now()}`);

            let data;
            try {
                data = await response.json();
            } catch (parseError) {
                console.error('Error parsing JSON during silent refresh:', parseError);
                return;
            }

            if (data && data.success) {
                // Update stats without changing loading state
                setStats(data.data || []);
            }
        } catch (error) {
            console.error('Error during silent refresh:', error);
        }
    };

    const fetchOrganizationStats = async () => {
        try {
            console.log('Fetching organization stats from /api/admin/org_stats...');

            // Add timestamp to prevent caching
            const response = await fetch(`/api/admin/org_stats?t=${Date.now()}`);
            console.log('Response status:', response.status);
            console.log('Response headers:', [...response.headers.entries()]);

            // Try to parse response as JSON
            let data;
            try {
                data = await response.json();
            } catch (parseError) {
                console.error('Error parsing JSON response:', parseError);
                const textResponse = await response.text();
                console.log('Raw response:', textResponse);
                throw new Error('Failed to parse server response');
            }

            console.log('Received data:', data);

            if (data && data.success) {
                // Accept both array and object responses
                if (Array.isArray(data.data)) {
                    setStats(data.data);
                    setFilteredStats(data.data);
                } else if (data.data) {
                    setStats([data.data]);
                    setFilteredStats([data.data]);
                } else {
                    setStats([]);
                    setFilteredStats([]);
                }
                console.log('Stats set:', data.data);
            } else {
                console.error('Failed to fetch organization stats:', data?.error || 'Unknown error');
            }
        } catch (error) {
            console.error('Error fetching organization stats:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filter stats based on search term
    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredStats(stats);
        } else {
            const filtered = stats.filter(org =>
                org.org_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                org.status.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredStats(filtered);
        }
    }, [searchTerm, stats]);

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading organization statistics...</p>
            </div>
        );
    }

    return (
        <>
            <PageHeader
                icon="🏢"
                title="Organization Performance"
                subtitle="Overview of all organizations' learning progress and risk assessment"
                showSearch={true}
                searchValue={searchTerm}
                onSearchChange={(e) => setSearchTerm(e.target.value)}
                onSearchClear={() => setSearchTerm('')}
            />
            <div
                className='org-cont'
            >
                {filteredStats.map((org) => (
                    <div
                        key={org.org_id + org.org_name}
                        className={`org-stat-card `}
                    >
                        <div className="org-card-header">
                            <div className="org-header-main">
                                <h3>{org.org_name}</h3>
                                <span className={`status-badge-mini ${org.status}`}>{org.status}</span>
                            </div>
                            <div className="org-header-meta">
                                <span className="created-date">Created: {org.created_date}</span>
                                <div className={`risk-indicator ${getRiskClass(org.avg_risk_score || 0)}`}>
                                    Risk: {(org.avg_risk_score || 0).toFixed(1)}
                                </div>
                            </div>
                        </div>

                        <div className="stats-content">
                            <div className="stats-metrics-grid">
                                <div className="stat-item">
                                    <FaUsers className="stat-icon" />
                                    <div className="stat-details">
                                        <span className="stat-value">{org.total_employees || 0}</span>
                                        <span className="stat-label">Total Employees</span>
                                    </div>
                                </div>

                                <div className="stat-item">
                                    <FaGraduationCap className="stat-icon" />
                                    <div className="stat-details">
                                        <span className="stat-value">{org.courses_completed || 0}</span>
                                        <span className="stat-label">Completed Courses</span>
                                    </div>
                                </div>

                                <div className="stat-item">
                                    <FaChartLine className="stat-icon" />
                                    <div className="stat-details">
                                        <span className="stat-value">{org.in_progress_courses || 0}</span>
                                        <span className="stat-label">In Progress</span>
                                    </div>
                                </div>

                                <div className="stat-item">
                                    <div className="completion-circle">
                                        <span className="stat-value">{(org.completion_rate || 0).toFixed(1)}%</span>
                                        <span className="stat-label">Complete</span>
                                    </div>
                                </div>
                            </div>

                            <div className="risk-distribution">
                                <h4>Risk Distribution</h4>
                                <div className="risk-bars">
                                    <div className="risk-bar">
                                        <div className="bar-label">High Risk</div>
                                        <div className="bar-container">
                                            <div
                                                className="bar high-risk"
                                                style={{ width: `${org.risk_percentage?.high || 0}%` }}
                                            ></div>
                                            <span className="bar-value">{org.risk_distribution?.high || 0}</span>
                                        </div>
                                    </div>
                                    <div className="risk-bar">
                                        <div className="bar-label">Medium Risk</div>
                                        <div className="bar-container">
                                            <div
                                                className="bar medium-risk"
                                                style={{ width: `${org.risk_percentage?.medium || 0}%` }}
                                            ></div>
                                            <span className="bar-value">{org.risk_distribution?.medium || 0}</span>
                                        </div>
                                    </div>
                                    <div className="risk-bar">
                                        <div className="bar-label">Low Risk</div>
                                        <div className="bar-container">
                                            <div
                                                className="bar low-risk"
                                                style={{ width: `${org.risk_percentage?.low || 0}%` }}
                                            ></div>
                                            <span className="bar-value">{org.risk_distribution?.low || 0}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>


                        <div className="org-details">
                            <div className="progress-bar">
                                <div
                                    className="progress-fill"
                                    style={{ width: `${org.completion_rate}%` }}
                                ></div>
                            </div>
                            <p className="details-text">
                                {`${org.courses_completed} out of  ${isNaN(Math.round(org.courses_completed / (org.completion_rate / 100)))
                                    ? 0
                                    : Math.round(org.courses_completed / (org.completion_rate / 100))} courses completed`}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Confirmation Modal */}
            {confirmModal && (
                <div
                    className="confirm-modal-overlay"
                    onClick={() => setConfirmModal(null)}
                >
                    <div
                        className="confirm-modal-content"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="confirm-modal-header">
                            <div className={`confirm-modal-icon ${confirmModal.newStatus}`}>
                                {confirmModal.newStatus === 'active' && '✓'}
                                {confirmModal.newStatus === 'inactive' && '⊘'}
                                {confirmModal.newStatus === 'suspended' && '⏸'}
                            </div>
                            <button
                                className="confirm-modal-close"
                                onClick={() => setConfirmModal(null)}
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <div className="confirm-modal-body">
                            <h3>Confirm Status Change</h3>
                            <p>
                                Are you sure you want to change the status of <strong>{confirmModal.orgName}</strong> to{' '}
                                <span className={`status-text ${confirmModal.newStatus}`}>
                                    {confirmModal.newStatus}
                                </span>?
                            </p>
                            {confirmModal.newStatus === 'inactive' && (
                                <div className="confirm-warning">
                                    <FaExclamationTriangle />
                                    <span>This will deactivate all users in this organization</span>
                                </div>
                            )}
                            {confirmModal.newStatus === 'suspended' && (
                                <div className="confirm-warning">
                                    <FaExclamationTriangle />
                                    <span>This will temporarily suspend access for this organization</span>
                                </div>
                            )}
                        </div>

                        <div className="confirm-modal-actions">
                            <button
                                className="confirm-btn cancel"
                                onClick={() => setConfirmModal(null)}
                            >
                                Cancel
                            </button>
                            <button
                                className={`confirm-btn confirm ${confirmModal.newStatus}`}
                                onClick={() => handleStatusChange(confirmModal.orgId, confirmModal.newStatus)}
                                disabled={statusLoading}
                            >
                                {statusLoading ? 'Processing...' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

const getRiskClass = (score) => {
    if (score >= 8) return 'high-risk';
    if (score >= 5) return 'medium-risk';
    return 'low-risk';
};

const getRiskLabel = (score) => {
    if (score >= 8) return 'High Risk';
    if (score >= 5) return 'Medium Risk';
    return 'Low Risk';
};

export default OrganizationStats;

