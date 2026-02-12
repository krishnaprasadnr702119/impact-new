import { useState, useEffect } from 'react';
import Loader from '../../components/Loader';
import NoDataDisplay from '../../components/NoDataDisplay';
import AlertDialog from '../../components/AlertDialog';
import { API_BASE_URL } from '../../../utils/constant';
import './CertificatesContent.css';

const CertificatesContent = ({ username }) => {
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true); const [alertDialog, setAlertDialog] = useState({ isOpen: false, title: '', message: '', type: 'info' }); const [error, setError] = useState(null);

    useEffect(() => {
        if (username) {
            fetchCertificates();
        }
    }, [username]);

    const fetchCertificates = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');

            if (!username || !token) {
                setError('Please log in to view certificates');
                setLoading(false);
                return;
            }

            const response = await fetch(
                `${API_BASE_URL}/employee/certificates?username=${username}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error('Failed to fetch certificates');
            }

            const data = await response.json();
            setCertificates(data.certificates || []);
        } catch (err) {
            console.error('Error fetching certificates:', err);
            setError(err.message || 'Failed to load certificates');
        } finally {
            setLoading(false);
        }
    };

    const downloadCertificate = async (courseId, courseTitle) => {
        try {
            const token = localStorage.getItem('token');

            const response = await fetch(
                `${API_BASE_URL}/employee/certificate/${courseId}?username=${username}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error('Failed to download certificate');
            }

            // Create a blob from the response
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            // Create a temporary link and trigger download
            const link = document.createElement('a');
            link.href = url;
            link.download = `Certificate_${courseTitle.replace(/\s+/g, '_')}.pdf`;
            document.body.appendChild(link);
            link.click();

            // Cleanup
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Error downloading certificate:', err);
            setAlertDialog({ isOpen: true, title: 'Download Failed', message: 'Failed to download certificate. Please try again.', type: 'error' });
        }
    };

    if (loading) {
        return <Loader />;
    }

    if (error) {
        return (
            <div className="certificates-error">
                <p>{error}</p>
            </div>
        );
    }

    if (certificates.length === 0) {
        return (
            <NoDataDisplay message="No certificates available yet. Complete a course to earn your first certificate!" />
        );
    }

    return (
        <div className="certificates-container">
            <div className="certificates-header">
                <h2>My Certificates</h2>
                <p className="certificates-subtitle">
                    Download and share your course completion certificates
                </p>
            </div>

            <div className="certificates-grid">
                {certificates.map((cert) => (
                    <div key={cert.course_id} className="certificate-card">
                        <div className="certificate-icon">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="certificate-svg"
                            >
                                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                            </svg>
                        </div>

                        <div className="certificate-content">
                            <h3 className="certificate-title">{cert.course_title}</h3>

                            <div className="certificate-details">
                                <div className="certificate-detail-item">
                                    <span className="detail-label">Completed:</span>
                                    <span className="detail-value">
                                        {new Date(cert.completion_date).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </span>
                                </div>

                                {cert.progress_percentage && (
                                    <div className="certificate-detail-item">
                                        <span className="detail-label">Final Score:</span>
                                        <span className="detail-value score">
                                            {Math.round(cert.progress_percentage)}%
                                        </span>
                                    </div>
                                )}
                            </div>

                            <button
                                className="download-certificate-btn"
                                onClick={() => downloadCertificate(cert.course_id, cert.course_title)}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    className="download-icon"
                                >
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                    <polyline points="7 10 12 15 17 10" />
                                    <line x1="12" y1="15" x2="12" y2="3" />
                                </svg>
                                Download Certificate
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Alert Dialog */}
            <AlertDialog
                isOpen={alertDialog.isOpen}
                onClose={() => setAlertDialog({ isOpen: false, title: '', message: '', type: 'info' })}
                title={alertDialog.title}
                message={alertDialog.message}
                type={alertDialog.type}
            />
        </div>
    );
};

export default CertificatesContent;
