// Layout.jsx
import React from 'react';
import './Layout.css';  // Import CSS for styling
const Layout = ({ sidebar, header, footer, children }) => {
    return (
        <div className="layout">
            <div className="sidebar">
                {sidebar}  {/* Render Sidebar */}
            </div>
            <div className="main-content">
                <div className="header">
                    {header}  {/* Render Header */}
                </div>
                <div className="content">
                    {children}  {/* Dynamic content for each dashboard */}
                </div>
                <div className="footer">
                    {footer}  {/* Render Footer */}
                </div>
            </div>
        </div>
    );
};

export default Layout;
