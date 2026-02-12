import React from 'react';
import './ConfirmDialog.css';

const ConfirmDialog = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'danger' // danger, warning, info, success
}) => {
    if (!isOpen) return null;

    const getIconAndColor = () => {
        switch (type) {
            case 'danger':
                return { icon: '⚠️', color: '#ef4444' };
            case 'warning':
                return { icon: '⚡', color: '#f59e0b' };
            case 'success':
                return { icon: '✓', color: '#10b981' };
            case 'info':
                return { icon: 'ℹ️', color: '#3b82f6' };
            default:
                return { icon: '⚠️', color: '#ef4444' };
        }
    };

    const { icon, color } = getIconAndColor();

    return (
        <div className="confirm-dialog-overlay" onClick={onClose}>
            <div className="confirm-dialog-container" onClick={(e) => e.stopPropagation()}>
                <div className="confirm-dialog-icon" style={{ background: `${color}15` }}>
                    <span style={{ fontSize: '48px' }}>{icon}</span>
                </div>

                <div className="confirm-dialog-content">
                    <h2 className="confirm-dialog-title">{title}</h2>
                    <p className="confirm-dialog-message">{message}</p>
                </div>

                <div className="confirm-dialog-actions">
                    <button
                        className="confirm-dialog-btn cancel-btn"
                        onClick={onClose}
                    >
                        {cancelText}
                    </button>
                    <button
                        className="confirm-dialog-btn confirm-btn"
                        style={{ background: color }}
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
