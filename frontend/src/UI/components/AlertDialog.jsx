import React from 'react';
import { FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaTimesCircle, FaSignOutAlt } from 'react-icons/fa';
import './AlertDialog.css';

const AlertDialog = ({
    isOpen,
    onClose,
    title,
    message,
    type = 'info',
    showConfirm = false,
    onConfirm = null,
    confirmText = 'Confirm',
    cancelText = 'Cancel'
}) => {
    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <FaCheckCircle className="alert-icon success" />;
            case 'error':
                return <FaTimesCircle className="alert-icon error" />;
            case 'warning':
                return <FaExclamationTriangle className="alert-icon warning" />;
            case 'confirm':
                return <FaSignOutAlt className="alert-icon confirm" />;
            case 'info':
            default:
                return <FaInfoCircle className="alert-icon info" />;
        }
    };

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleConfirm = () => {
        if (onConfirm) {
            onConfirm();
        }
        onClose();
    };

    return (
        <div className="alert-dialog-overlay" onClick={handleOverlayClick}>
            <div className="alert-dialog-container">
                <div className="alert-dialog-icon-wrapper">
                    {getIcon()}
                </div>

                {title && <h3 className="alert-dialog-title">{title}</h3>}

                <p className="alert-dialog-message">{message}</p>

                <div className="alert-dialog-actions">
                    {showConfirm ? (
                        <>
                            <button
                                className="alert-dialog-btn alert-dialog-btn-cancel"
                                onClick={onClose}
                            >
                                {cancelText}
                            </button>
                            <button
                                className="alert-dialog-btn alert-dialog-btn-confirm"
                                onClick={handleConfirm}
                            >
                                {confirmText}
                            </button>
                        </>
                    ) : (
                        <button
                            className={`alert-dialog-btn alert-dialog-btn-${type}`}
                            onClick={onClose}
                        >
                            OK
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AlertDialog;
