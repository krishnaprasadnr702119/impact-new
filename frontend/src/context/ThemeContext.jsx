import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const themes = {
    light: {
        name: 'Light',
        icon: '☀️',
        colors: {
            primary: '#3b82f6',
            primaryDark: '#2563eb',
            secondary: '#8b5cf6',
            accent: '#0d9488',
            background: '#f8fafc',
            surface: '#ffffff',
            surfaceHover: '#f1f5f9',
            text: '#1e293b',
            textSecondary: '#64748b',
            border: '#e2e8f0',
            success: '#10b981',
            warning: '#f59e0b',
            error: '#ef4444',
            gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            cardShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        }
    },
    dark: {
        name: 'Dark',
        icon: '🌙',
        colors: {
            primary: '#60a5fa',
            primaryDark: '#3b82f6',
            secondary: '#a78bfa',
            accent: '#2dd4bf',
            background: '#0f172a',
            surface: '#1e293b',
            surfaceHover: '#334155',
            text: '#f1f5f9',
            textSecondary: '#94a3b8',
            border: '#334155',
            success: '#34d399',
            warning: '#fbbf24',
            error: '#f87171',
            gradient: 'linear-gradient(135deg, #1e3a8a 0%, #7c3aed 100%)',
            cardShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
        }
    },
    ocean: {
        name: 'Ocean',
        icon: '🌊',
        colors: {
            primary: '#0891b2',
            primaryDark: '#0e7490',
            secondary: '#06b6d4',
            accent: '#14b8a6',
            background: '#ecfeff',
            surface: '#ffffff',
            surfaceHover: '#cffafe',
            text: '#164e63',
            textSecondary: '#0e7490',
            border: '#a5f3fc',
            success: '#10b981',
            warning: '#f59e0b',
            error: '#ef4444',
            gradient: 'linear-gradient(135deg, #0891b2 0%, #14b8a6 100%)',
            cardShadow: '0 4px 20px rgba(8, 145, 178, 0.15)',
        }
    },
    forest: {
        name: 'Forest',
        icon: '🌲',
        colors: {
            primary: '#059669',
            primaryDark: '#047857',
            secondary: '#10b981',
            accent: '#34d399',
            background: '#ecfdf5',
            surface: '#ffffff',
            surfaceHover: '#d1fae5',
            text: '#064e3b',
            textSecondary: '#047857',
            border: '#a7f3d0',
            success: '#10b981',
            warning: '#f59e0b',
            error: '#ef4444',
            gradient: 'linear-gradient(135deg, #059669 0%, #34d399 100%)',
            cardShadow: '0 4px 20px rgba(5, 150, 105, 0.15)',
        }
    },
    sunset: {
        name: 'Sunset',
        icon: '🌅',
        colors: {
            primary: '#f97316',
            primaryDark: '#ea580c',
            secondary: '#fb923c',
            accent: '#fbbf24',
            background: '#fffbeb',
            surface: '#ffffff',
            surfaceHover: '#fef3c7',
            text: '#78350f',
            textSecondary: '#92400e',
            border: '#fde68a',
            success: '#10b981',
            warning: '#f59e0b',
            error: '#ef4444',
            gradient: 'linear-gradient(135deg, #f97316 0%, #fbbf24 100%)',
            cardShadow: '0 4px 20px rgba(249, 115, 22, 0.15)',
        }
    }
};

export const ThemeProvider = ({ children }) => {
    const [currentTheme, setCurrentTheme] = useState(() => {
        const saved = localStorage.getItem('employeeTheme');
        return saved || 'light';
    });

    useEffect(() => {
        localStorage.setItem('employeeTheme', currentTheme);
        const theme = themes[currentTheme];
        const root = document.documentElement;

        // Apply CSS custom properties
        Object.entries(theme.colors).forEach(([key, value]) => {
            root.style.setProperty(`--theme-${key}`, value);
        });

        // Add theme class to body
        document.body.className = `theme-${currentTheme}`;
    }, [currentTheme]);

    const value = {
        currentTheme,
        setTheme: setCurrentTheme,
        theme: themes[currentTheme],
        themes
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export default ThemeContext;
