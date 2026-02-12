import { useState, useEffect } from 'react';
import { adminApi } from '../../utils/apiClient';
import AlertDialog from './AlertDialog';
import ConfirmDialog from './ConfirmDialog';

const EmailSettings = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);
    const [settings, setSettings] = useState({
        smtp_server: '',
        smtp_port: 587,
        smtp_use_tls: true,
        smtp_use_ssl: false,
        smtp_username: '',
        smtp_password: '',
        default_sender: '',
        notification_enabled: true
    });
    const [testEmail, setTestEmail] = useState('');
    const [alertDialog, setAlertDialog] = useState({ isOpen: false, title: '', message: '', type: 'info' });
    const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, onConfirm: null, title: '', message: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        fetchEmailSettings();
    }, []);

    const fetchEmailSettings = async () => {
        try {
            setLoading(true);
            const response = await adminApi.getEmailSettings();

            if (response.success) {
                const settingsData = {};
                Object.keys(response.settings).forEach(key => {
                    settingsData[key] = response.settings[key].value;
                });
                setSettings(settingsData);
                setHasChanges(false);
            } else {
                setAlertDialog({
                    isOpen: true,
                    title: 'Error',
                    message: response.error || 'Failed to load email settings',
                    type: 'error'
                });
            }
        } catch (error) {
            console.error('Error fetching email settings:', error);
            setAlertDialog({
                isOpen: true,
                title: 'Error',
                message: 'Failed to load email settings',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
        setHasChanges(true);
    };

    const handleSaveSettings = () => {
        setConfirmDialog({
            isOpen: true,
            title: 'Save Email Settings?',
            message: 'Are you sure you want to update the email configuration? This will affect all email notifications sent by the system.',
            onConfirm: confirmSaveSettings
        });
    };

    const confirmSaveSettings = async () => {
        setConfirmDialog({ isOpen: false, onConfirm: null, title: '', message: '' });

        try {
            setSaving(true);
            const response = await adminApi.updateEmailSettings(settings);

            if (response.success) {
                setAlertDialog({
                    isOpen: true,
                    title: 'Success!',
                    message: 'Email settings updated successfully',
                    type: 'success'
                });
                setHasChanges(false);
            } else {
                setAlertDialog({
                    isOpen: true,
                    title: 'Error',
                    message: response.error || 'Failed to update email settings',
                    type: 'error'
                });
            }
        } catch (error) {
            console.error('Error saving email settings:', error);
            setAlertDialog({
                isOpen: true,
                title: 'Error',
                message: 'Failed to save email settings',
                type: 'error'
            });
        } finally {
            setSaving(false);
        }
    };

    const handleTestEmail = async () => {
        if (!testEmail) {
            setAlertDialog({
                isOpen: true,
                title: 'Validation Error',
                message: 'Please enter a test email address',
                type: 'warning'
            });
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(testEmail)) {
            setAlertDialog({
                isOpen: true,
                title: 'Validation Error',
                message: 'Please enter a valid email address',
                type: 'warning'
            });
            return;
        }

        try {
            setTesting(true);
            const response = await adminApi.testEmail(testEmail);

            if (response.success) {
                setAlertDialog({
                    isOpen: true,
                    title: 'Test Email Sent!',
                    message: `Test email sent successfully to ${testEmail}. Please check the inbox.`,
                    type: 'success'
                });
            } else {
                setAlertDialog({
                    isOpen: true,
                    title: 'Test Failed',
                    message: response.error || 'Failed to send test email',
                    type: 'error'
                });
            }
        } catch (error) {
            console.error('Error sending test email:', error);
            setAlertDialog({
                isOpen: true,
                title: 'Error',
                message: 'Failed to send test email',
                type: 'error'
            });
        } finally {
            setTesting(false);
        }
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '40px' }}>
                <div className="spinner" style={{ margin: '0 auto' }}>Loading email settings...</div>
            </div>
        );
    }

    return (
        <>
            <div style={{
                background: '#fff',
                borderRadius: '12px',
                padding: '24px',
                border: '1px solid #e5e7eb'
            }}>
                <h2 style={{
                    marginTop: 0,
                    marginBottom: '8px',
                    color: '#1f2937',
                    fontSize: '20px',
                    fontWeight: '600'
                }}>
                    📧 Email Configuration
                </h2>
                <p style={{
                    color: '#6b7280',
                    fontSize: '14px',
                    marginBottom: '24px'
                }}>
                    Configure SMTP settings for sending email notifications
                </p>

                {/* SMTP Server Settings */}
                <div style={{
                    background: '#f9fafb',
                    padding: '20px',
                    borderRadius: '8px',
                    marginBottom: '20px'
                }}>
                    <h3 style={{
                        marginTop: 0,
                        fontSize: '16px',
                        color: '#374151',
                        marginBottom: '16px'
                    }}>
                        SMTP Server Configuration
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '14px',
                                fontWeight: '500',
                                color: '#374151',
                                marginBottom: '6px'
                            }}>
                                SMTP Server
                            </label>
                            <input
                                type="text"
                                value={settings.smtp_server}
                                onChange={(e) => handleChange('smtp_server', e.target.value)}
                                placeholder="smtp.gmail.com"
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '6px',
                                    fontSize: '14px'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '14px',
                                fontWeight: '500',
                                color: '#374151',
                                marginBottom: '6px'
                            }}>
                                SMTP Port
                            </label>
                            <input
                                type="number"
                                value={settings.smtp_port}
                                onChange={(e) => handleChange('smtp_port', parseInt(e.target.value))}
                                placeholder="587"
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '6px',
                                    fontSize: '14px'
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '24px', marginTop: '16px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={settings.smtp_use_tls}
                                onChange={(e) => handleChange('smtp_use_tls', e.target.checked)}
                                style={{ marginRight: '8px' }}
                            />
                            <span style={{ fontSize: '14px', color: '#374151' }}>Use TLS</span>
                        </label>

                        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={settings.smtp_use_ssl}
                                onChange={(e) => handleChange('smtp_use_ssl', e.target.checked)}
                                style={{ marginRight: '8px' }}
                            />
                            <span style={{ fontSize: '14px', color: '#374151' }}>Use SSL</span>
                        </label>
                    </div>
                </div>

                {/* Authentication */}
                <div style={{
                    background: '#f9fafb',
                    padding: '20px',
                    borderRadius: '8px',
                    marginBottom: '20px'
                }}>
                    <h3 style={{
                        marginTop: 0,
                        fontSize: '16px',
                        color: '#374151',
                        marginBottom: '16px'
                    }}>
                        Authentication
                    </h3>

                    <div style={{ marginBottom: '16px' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '6px'
                        }}>
                            SMTP Username
                        </label>
                        <input
                            type="text"
                            value={settings.smtp_username}
                            onChange={(e) => handleChange('smtp_username', e.target.value)}
                            placeholder="your-email@gmail.com"
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                fontSize: '14px'
                            }}
                        />
                    </div>

                    <div>
                        <label style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '6px'
                        }}>
                            SMTP Password
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={settings.smtp_password}
                                onChange={(e) => handleChange('smtp_password', e.target.value)}
                                placeholder="••••••••"
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    paddingRight: '40px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '6px',
                                    fontSize: '14px'
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '8px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '16px'
                                }}
                            >
                                {showPassword ? '🙈' : '👁️'}
                            </button>
                        </div>
                        <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                            For Gmail, use an App Password instead of your regular password
                        </p>
                    </div>
                </div>

                {/* Email Settings */}
                <div style={{
                    background: '#f9fafb',
                    padding: '20px',
                    borderRadius: '8px',
                    marginBottom: '20px'
                }}>
                    <h3 style={{
                        marginTop: 0,
                        fontSize: '16px',
                        color: '#374151',
                        marginBottom: '16px'
                    }}>
                        Email Settings
                    </h3>

                    <div style={{ marginBottom: '16px' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '6px'
                        }}>
                            Default Sender Email
                        </label>
                        <input
                            type="email"
                            value={settings.default_sender}
                            onChange={(e) => handleChange('default_sender', e.target.value)}
                            placeholder="noreply@lms.com"
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                fontSize: '14px'
                            }}
                        />
                    </div>

                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={settings.notification_enabled}
                            onChange={(e) => handleChange('notification_enabled', e.target.checked)}
                            style={{ marginRight: '8px' }}
                        />
                        <span style={{ fontSize: '14px', color: '#374151' }}>Enable Email Notifications</span>
                    </label>
                </div>

                {/* Test Email */}
                <div style={{
                    background: '#eff6ff',
                    padding: '20px',
                    borderRadius: '8px',
                    border: '1px solid #bfdbfe',
                    marginBottom: '20px'
                }}>
                    <h3 style={{
                        marginTop: 0,
                        fontSize: '16px',
                        color: '#1e40af',
                        marginBottom: '12px'
                    }}>
                        Test Email Configuration
                    </h3>
                    <p style={{ fontSize: '14px', color: '#1e40af', marginBottom: '12px' }}>
                        Send a test email to verify your configuration is working correctly
                    </p>

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <input
                            type="email"
                            value={testEmail}
                            onChange={(e) => setTestEmail(e.target.value)}
                            placeholder="test@example.com"
                            style={{
                                flex: 1,
                                padding: '8px 12px',
                                border: '1px solid #93c5fd',
                                borderRadius: '6px',
                                fontSize: '14px'
                            }}
                        />
                        <button
                            onClick={handleTestEmail}
                            disabled={testing || !testEmail}
                            style={{
                                padding: '8px 20px',
                                background: testing ? '#d1d5db' : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '14px',
                                fontWeight: '500',
                                cursor: testing ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {testing ? '📤 Sending...' : '📤 Send Test Email'}
                        </button>
                    </div>
                </div>

                {/* Action Buttons */}
                <div style={{
                    display: 'flex',
                    gap: '12px',
                    justifyContent: 'flex-end',
                    paddingTop: '20px',
                    borderTop: '1px solid #e5e7eb'
                }}>
                    <button
                        onClick={fetchEmailSettings}
                        disabled={saving}
                        style={{
                            padding: '10px 24px',
                            background: '#f3f4f6',
                            color: '#374151',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer'
                        }}
                    >
                        🔄 Reset
                    </button>
                    <button
                        onClick={handleSaveSettings}
                        disabled={saving || !hasChanges}
                        style={{
                            padding: '10px 24px',
                            background: saving || !hasChanges ? '#d1d5db' : 'linear-gradient(135deg, #10b981, #059669)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: saving || !hasChanges ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {saving ? '💾 Saving...' : '💾 Save Changes'}
                    </button>
                </div>
            </div>

            {/* Alert Dialog */}
            <AlertDialog
                isOpen={alertDialog.isOpen}
                onClose={() => setAlertDialog({ isOpen: false, title: '', message: '', type: 'info' })}
                title={alertDialog.title}
                message={alertDialog.message}
                type={alertDialog.type}
            />

            {/* Confirm Dialog */}
            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                onClose={() => setConfirmDialog({ isOpen: false, onConfirm: null, title: '', message: '' })}
                onConfirm={confirmDialog.onConfirm}
                title={confirmDialog.title}
                message={confirmDialog.message}
                type="warning"
            />
        </>
    );
};

export default EmailSettings;
