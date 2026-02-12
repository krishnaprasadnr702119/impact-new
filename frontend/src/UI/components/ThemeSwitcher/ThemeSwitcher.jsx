import React, { useState, useRef, useEffect } from 'react';
import { useTheme, themes } from '../../../context/ThemeContext';
import { FaPalette, FaCheck } from 'react-icons/fa';
import './ThemeSwitcher.css';

const ThemeSwitcher = () => {
    const { currentTheme, setTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleThemeSelect = (themeKey) => {
        setTheme(themeKey);
        setIsOpen(false);
    };

    return (
        <div className="theme-switcher" ref={dropdownRef}>
            <button
                className="theme-toggle-btn"
                onClick={() => setIsOpen(!isOpen)}
                title="Change Theme"
            >
                <FaPalette />
                <span className="theme-name">{themes[currentTheme].icon} {themes[currentTheme].name}</span>
            </button>

            {isOpen && (
                <div className="theme-dropdown">
                    <div className="theme-dropdown-header">
                        <span>Choose Theme</span>
                    </div>
                    <div className="theme-options">
                        {Object.entries(themes).map(([key, theme]) => (
                            <button
                                key={key}
                                className={`theme-option ${currentTheme === key ? 'active' : ''}`}
                                onClick={() => handleThemeSelect(key)}
                            >
                                <span className="theme-icon">{theme.icon}</span>
                                <span className="theme-label">{theme.name}</span>
                                <div
                                    className="theme-preview"
                                    style={{ background: theme.colors.gradient }}
                                />
                                {currentTheme === key && (
                                    <FaCheck className="theme-check" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ThemeSwitcher;
