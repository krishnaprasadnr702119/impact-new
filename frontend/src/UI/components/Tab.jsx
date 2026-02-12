
import { useState } from 'react';

// Reusable Tabs Component
const Tabs = ({
    tabs,
    defaultTab,
    onChange,
    variant = 'pills', // 'pills', 'underline', 'buttons'
    size = 'md', // 'sm', 'md', 'lg'
    fullWidth = false,
    activeColor = '#1e40af',
    inactiveColor = '#6b7280',
    className = ''
}) => {
    const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        if (onChange) onChange(tabId);
    };

    const sizes = {
        sm: { padding: '8px 16px', fontSize: '14px' },
        md: { padding: '12px 20px', fontSize: '15px' },
        lg: { padding: '14px 24px', fontSize: '16px' }
    };

    const variants = {
        pills: {
            container: {
                display: 'flex',
                gap: '2px',
                background: '#e5e7eb',
                borderRadius: '10px',
                padding: '4px'
            },
            button: (isActive) => ({
                flex: fullWidth ? 1 : 'initial',
                padding: sizes[size].padding,
                background: isActive ? 'white' : 'transparent',
                border: 'none',
                borderRadius: '8px',
                fontSize: sizes[size].fontSize,
                fontWeight: isActive ? '600' : '500',
                color: isActive ? activeColor : inactiveColor,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
            })
        },
        underline: {
            container: {
                display: 'flex',
                gap: '0',
                borderBottom: '2px solid #e5e7eb'
            },
            button: (isActive) => ({
                flex: fullWidth ? 1 : 'initial',
                padding: sizes[size].padding,
                background: 'transparent',
                border: 'none',
                borderBottom: `3px solid ${isActive ? activeColor : 'transparent'}`,
                fontSize: sizes[size].fontSize,
                fontWeight: isActive ? '600' : '500',
                color: isActive ? activeColor : inactiveColor,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
                marginBottom: '-2px'
            })
        },
        buttons: {
            container: {
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap'
            },
            button: (isActive) => ({
                padding: sizes[size].padding,
                background: isActive ? activeColor : '#f3f4f6',
                border: `2px solid ${isActive ? activeColor : '#e5e7eb'}`,
                borderRadius: '8px',
                fontSize: sizes[size].fontSize,
                fontWeight: '600',
                color: isActive ? 'white' : inactiveColor,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
            })
        }
    };

    const currentVariant = variants[variant];

    return (
        <div style={currentVariant.container} className={`mb24 ${className}`}>
            {tabs.map((tab,index) => (
                
                <button
                    key={index+tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    style={currentVariant.button(activeTab === tab.id)}
                    disabled={tab.disabled}
                >
                    {tab.icon && <span style={{ marginRight: '8px' }}>{tab.icon}</span>}
                    {tab.label}
                    {tab.badge && (
                        <span style={{
                            marginLeft: '8px',
                            background: activeTab === tab.id ? '#ef4444' : '#d1d5db',
                            color: 'white',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '600'
                        }}>
                            {tab.badge}
                        </span>
                    )}
                </button>
            ))}
        </div>
    );
};

// TabPanel component for content
export const TabPanel = ({ children, activeTab, tabId }) => {
    if (activeTab !== tabId) return null;
    return <div>{children}</div>;
};
export default Tabs;