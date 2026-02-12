import React from 'react';
import './WelcomeDashboard.css';

const WelcomeDashboard = ({ 
  username = "User 122", 
  userRole = "admin 123", 
  stats = { recent_users: 25, recent_courses: 8, employee_count: 150, completion_rate: 87 },
  loading = false 
}) => {
  return (
    <div className="welcome-dashboard">
      {/* Decorative Background Elements */}
      <div className="welcome-dashboard__decoration welcome-dashboard__decoration--top"></div>
      <div className="welcome-dashboard__decoration welcome-dashboard__decoration--bottom"></div>

      {/* Main Content */}
      <div className="welcome-dashboard__content">
        {/* Animated Emoji */}
        <div className="welcome-dashboard__emoji">
          🎉
        </div>
        
        {/* Main Heading */}
        <h2 className="welcome-dashboard__title">
          Welcome back, {username}!
        </h2>
        
        {/* Description */}
        <p className="welcome-dashboard__description">
          Manage your organization, users, and settings from this powerful dashboard. Everything you need is just a click away.
        </p>

        {/* Stats Section */}
        {!loading && stats && (
          <div className="welcome-dashboard__stats">
            {userRole === 'admin' && (
              <div className="welcome-dashboard__stats-card">
                <div className="welcome-dashboard__stats-grid">
                  <div className="welcome-dashboard__stat">
                    <span className="welcome-dashboard__stat-number welcome-dashboard__stat-number--blue">
                      {stats.recent_users || 0}
                    </span>
                    <span className="welcome-dashboard__stat-label">
                      new users joined in the last 30 days
                    </span>
                  </div>
                  <div className="welcome-dashboard__stat">
                    <span className="welcome-dashboard__stat-number welcome-dashboard__stat-number--green">
                      {stats.recent_courses || 0}
                    </span>
                    <span className="welcome-dashboard__stat-label">
                      new courses were created recently
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            {userRole === 'portal_admin' && (
              <div className="welcome-dashboard__stats-card">
                <div className="welcome-dashboard__stats-grid">
                  <div className="welcome-dashboard__stat">
                    <span className="welcome-dashboard__stat-number welcome-dashboard__stat-number--blue">
                      {stats.employee_count || 0}
                    </span>
                    <span className="welcome-dashboard__stat-label">
                      employees in your organization
                    </span>
                  </div>
                  <div className="welcome-dashboard__stat">
                    <span className="welcome-dashboard__stat-number welcome-dashboard__stat-number--green">
                      {stats.completion_rate || 0}%
                    </span>
                    <span className="welcome-dashboard__stat-label">
                      course completion rate
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="welcome-dashboard__actions">
          <button className="welcome-dashboard__button welcome-dashboard__button--primary">
            <span className="welcome-dashboard__button-icon">🚀</span>
            Quick Actions
          </button>
          
          <button className="welcome-dashboard__button welcome-dashboard__button--secondary">
            <span className="welcome-dashboard__button-icon">📊</span>
            View Reports
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="welcome-dashboard__loading">
            <div className="welcome-dashboard__spinner"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WelcomeDashboard;