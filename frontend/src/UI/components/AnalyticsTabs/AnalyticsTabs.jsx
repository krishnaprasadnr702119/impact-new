import React from 'react';
import './AnalyticsTabs.css'; // Import the CSS file

const AnalyticsTabs = ({ activeTab, setActiveTab }) => {
    const tabs = [
        { key: 'overview', label: 'Overview' },
        { key: 'users', label: 'User Analytics' },
        { key: 'courses', label: 'Course Analytics' },
        { key: 'organizations', label: 'Organizations' },
        { key: 'learning', label: 'Learning Analytics' },
        { key: 'system', label: 'System Analytics' },
        { key: 'financial', label: 'Financial' },
        { key: 'compliance', label: 'Compliance' }
    ];

    return (
        <div className="analytics-tabs">
            {tabs.map(tab => (
                <button
                    key={tab.key}
                    className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.key)}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
};

export default AnalyticsTabs;