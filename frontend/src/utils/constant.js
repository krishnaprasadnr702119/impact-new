export const API_BASE_URL = '/api'; // Use Vite proxy
export const REFRESH_INTERVAL_MS = 30000; // 30 seconds
export const TOKEN_EXPIRY_BUFFER_MS = 60000; // 1 minute buffer before token expiry
export const SIDEBAR_WIDTH_EXPANDED = 250;
export const SIDEBAR_WIDTH_COLLAPSED = 80;
export const PRIMARY_COLOR = '#4F46E5'; // Indigo-600
export const SECONDARY_COLOR = '#6366F1'; // Indigo-500
export const BACKGROUND_COLOR = '#1E1E2F';  // Dark background
export const TEXT_COLOR = '#E0E0E0';    // Light text
export const BORDER_RADIUS = '12px';
export const BOX_SHADOW = '0 4px 6px rgba(0, 0, 0, 0.1)';
export const HEADER_HEIGHT = 64;
export const FOOTER_HEIGHT = 40;
export const MAX_CONTENT_WIDTH = 1200;
export const DEFAULT_PADDING = 24;
export const ANIMATION_DURATION = '0.3s';
export const ANIMATION_EASING = 'ease-in-out';
export const DATE_FORMAT = 'YYYY-MM-DD';
export const TIME_FORMAT = 'HH:mm:ss';
export const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';
export const ITEMS_PER_PAGE = 10;
export const MAX_PAGE_BUTTONS = 5;
export const ROLES = {
  ADMIN: 'admin',
  EDITOR: 'editor',
  VIEWER: 'viewer'
};
export const ROLE_HIERARCHY = {
  [ROLES.VIEWER]: 1,
  [ROLES.EDITOR]: 2,
  [ROLES.ADMIN]: 3
};
export const DEFAULT_ROLE = ROLES.VIEWER;
export const GUEST_ROLE = 'guest';
export const JWT_KEY = 'jwt_token';
export const USERNAME_KEY = 'username';
export const THEME_KEY = 'themePreference'; // 'light' or 'dark'
export const LIGHT_THEME = 'light';
export const DARK_THEME = 'dark';
export const DEFAULT_THEME = DARK_THEME;    