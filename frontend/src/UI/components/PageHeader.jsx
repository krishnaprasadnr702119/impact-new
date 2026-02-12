import { Children } from 'react';
import { FaPlus, FaTrash } from 'react-icons/fa';

// Search Bar Component
const SearchBar = ({
  value,
  onChange,
  onClear,
  placeholder = "Search...",
  minWidth = "200px"
}) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: '#F9FAFB',
    borderRadius: 8,
    padding: '8px 12px',
    border: '1px solid #EAECF0',
    minWidth,
    maxWidth: '100%',
    flexShrink: 1
  }}>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#64748b"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0 }}
    >
      <circle cx="11" cy="11" r="8"></circle>
      <path d="m21 21-4.35-4.35"></path>
    </svg>
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{
        border: 'none',
        outline: 'none',
        background: 'transparent',
        fontSize: 'clamp(14px, 2vw, 15px)',
        fontWeight: 500,
        color: '#334155',
        width: '100%',
        minWidth: 0,
        padding: '2px 0',
        fontFamily: 'inherit'
      }}
    />
    {value && (
      <button
        onClick={onClear}
        style={{
          background: 'rgba(148,163,184,0.1)',
          border: 'none',
          cursor: 'pointer',
          padding: '6px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#64748b',
          transition: 'all 0.2s',
          flexShrink: 0
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'rgba(148,163,184,0.2)';
          e.currentTarget.style.color = '#334155';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'rgba(148,163,184,0.1)';
          e.currentTarget.style.color = '#64748b';
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    )}
  </div>
);

// Action Button Component
const ActionButton = ({
  onClick,
  children,
  icon: Icon = FaPlus,
  variant = "primary",
  size = "medium",
  responsive = true
}) => {
  const getButtonStyles = () => {
    const baseStyles = {
      display: 'flex',
      alignItems: 'center',
      gap: 'clamp(6px, 1vw, 10px)',
      border: 'none',
      borderRadius: 16,
      fontWeight: 700,
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      whiteSpace: 'nowrap',
      flexShrink: 0,
      outline: 'none',
      minWidth: 'fit-content'
    };

    const sizes = {
      small: { padding: '6px 12px', fontSize: '14px' },
      medium: { padding: 'clamp(8px, 1.5vw, 12px) clamp(12px, 2vw, 24px)', fontSize: 'clamp(13px, 1.5vw, 16px)' },
      large: { padding: '12px 32px', fontSize: '18px' }
    };

    const variants = {
      primary: {
        background: 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)',
        color: '#fff',
        boxShadow: '0 8px 24px rgba(37,99,235,0.3)'
      },
      secondary: {
        background: '#f1f5f9',
        color: '#334155',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      },
      outline: {
        background: 'transparent',
        color: '#3b82f6',
        border: '2px solid #3b82f6'
      }
    };

    return { ...baseStyles, ...sizes[size], ...variants[variant] };
  };

  return (
    <button
      style={getButtonStyles()}
      onClick={onClick}
      onMouseOver={e => {
        if (variant === 'primary') {
          e.currentTarget.style.background = '#1D54D3';
        }
      }}
      onMouseOut={e => {
        if (variant === 'primary') {
          e.currentTarget.style.background = 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)';
        }
      }}
    >
      {Icon && <Icon size={18} />}
      {responsive ? (
        <span style={{ display: 'inline-block' }}>
          <span style={{ display: window.innerWidth > 768 ? 'inline' : 'none' }}>
            {children}
          </span>
          <span style={{ display: window.innerWidth <= 768 ? 'inline' : 'none' }}>
            {typeof children === 'string' ? children.split(' ')[0] : children}
          </span>
        </span>
      ) : (
        <span>{children}</span>
      )}
    </button>
  );
};

// Header Title Component
const HeaderTitle = ({
  icon,
  title,
  subtitle,
  iconBg = "#EEF4FF"
}) => (
  <div className='page-header'>
    <div className='page-header-icon ' style={{
      background: iconBg
    }}>
      {icon}
    </div>
    <div className='page-header-text'>
      <h1>
        {title}
      </h1>
      {subtitle && (
        <p >
          {subtitle}
        </p>
      )}
    </div>
  </div>
);

// Decorative Background Component
const DecorativeBackground = ({
  showDecorations = true,
  primaryColor = "linear-gradient(135deg, #dbeafe, #e0e7ff)",
  secondaryColor = "linear-gradient(135deg, #fef3c7, #fed7aa)"
}) => (
  showDecorations && (
    <>
      <div style={{
        position: 'absolute',
        bottom: '-20px',
        left: '-20px',
        width: '80px',
        height: '80px',
        background: secondaryColor,
        borderRadius: '50%',
        opacity: 0.4
      }}></div>
    </>
  )
);

// Main Page Header Component
const PageHeader = ({
  // Header content
  icon = "🏢",
  title = "Page Title",
  subtitle,
  iconBg = "#EEF4FF",

  // Search functionality
  searchValue = "",
  onSearchChange,
  onSearchClear,
  searchPlaceholder = "Search...",
  showSearch = false,

  // Action button
  actionLabel = "Create New",
  onActionClick,
  actionIcon: ActionIcon = FaPlus,
  actionVariant = "primary",
  actionSize = "medium",
  showAction = false,

  // Styling
  showDecorations = true,
  className,
  style = {},
  children
},) => {
  return (
    <div
      className={`page-header-box ${className}`}
      style={{
        ...style
      }}
    >
      {/* <DecorativeBackground showDecorations={showDecorations} /> */}

      <HeaderTitle
        icon={icon}
        title={title}
        subtitle={subtitle}
        iconBg={iconBg}
      />
      {children}
      {(showSearch || showAction) && <div className='page-header-actions'>
        {showSearch && (
          <SearchBar
            value={searchValue}
            onChange={onSearchChange}
            onClear={onSearchClear}
            placeholder={searchPlaceholder}
          />
        )}

        {showAction && (
          <ActionButton
            onClick={onActionClick}
            icon={ActionIcon}
            variant={actionVariant}
            size={actionSize}
          >
            {actionLabel}
          </ActionButton>
        )}
      </div>
      }
    </div>
  );
};
export default PageHeader;