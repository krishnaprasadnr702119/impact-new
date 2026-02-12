import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { buildFileUrl } from '../../utils/api';

// Helper functions for media handling
const MediaDebugger = {
  fixMediaUrl: (url, useApi = false) => {
    return buildFileUrl(url, useApi);
  },

  // Log media loading errors with details (no-op in production)
  logMediaError: (type, element, error) => { },

  // Debug overlay removed for production
  debugOverlay: () => null
};

// Enhanced video player component with multiple fallbacks
const EnhancedVideoPlayer = ({ src, title, onError }) => {
  const [videoState, setVideoState] = useState({
    mainPlayerFailed: false,
    fallbackPlayerFailed: false,
    apiAccessFailed: false,
    directLinkNeeded: false,
    error: null
  });

  const videoRef = useRef(null);
  // First try direct access
  const directAccessSrc = MediaDebugger.fixMediaUrl(src, false);
  // Fallback to API access if direct fails
  const apiAccessSrc = MediaDebugger.fixMediaUrl(src, true);

  console.log('🎥 Video Player - Original src:', src);
  console.log('🎥 Video Player - Direct access URL:', directAccessSrc);
  console.log('🎥 Video Player - API access URL:', apiAccessSrc);

  const handleVideoError = (e) => {
    console.error('❌ Video error (Direct):', e);
    console.error('❌ Video error details:', e.target?.error);
    MediaDebugger.logMediaError('Video (Direct Access)', e.target, e);
    setVideoState(prev => ({ ...prev, mainPlayerFailed: true }));
    if (onError) onError(e);
  };

  const handleFallbackError = (e) => {
    console.error('❌ Fallback video error (API):', e);
    console.error('❌ Fallback error details:', e.target?.error);
    MediaDebugger.logMediaError('Fallback video (API Access)', e.target, e);
    setVideoState(prev => ({ ...prev, fallbackPlayerFailed: true, apiAccessFailed: true, directLinkNeeded: true }));
  };

  return (
    <div style={{
      position: 'relative',
      paddingTop: '56.25%',
      background: '#000',
      width: '100%',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      {/* Debug overlay removed for production */}

      {/* Main Video Player (Direct Access) */}
      {!videoState.mainPlayerFailed && (
        <video
          ref={videoRef}
          src={directAccessSrc}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain'
          }}
          controls
          playsInline
          onError={handleVideoError}
        >
          Your browser does not support the video tag.
        </video>
      )}

      {/* Fallback Video Player (API Access) */}
      {videoState.mainPlayerFailed && !videoState.fallbackPlayerFailed && (
        <video
          src={apiAccessSrc}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain'
          }}
          controls
          playsInline
          onError={handleFallbackError}
        >
          Your browser does not support the video tag.
        </video>
      )}

      {/* Direct Link Fallback */}
      {videoState.directLinkNeeded && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(0,0,0,0.8)',
          padding: '20px',
          borderRadius: '10px',
          textAlign: 'center',
          zIndex: 5,
          maxWidth: '80%'
        }}>
          <p style={{ color: 'white', marginBottom: '15px' }}>
            Unable to play the video in browser. Try downloading it:
          </p>
          <a
            href={directAccessSrc || apiAccessSrc}
            download
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              padding: '10px 15px',
              background: '#007bff',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '5px',
              fontWeight: 'bold'
            }}
          >
            Download {title || 'Video'}
          </a>
        </div>
      )}
    </div>
  );
};

// Enhanced PDF viewer with fallback
const EnhancedPdfViewer = ({ src, title, onError }) => {
  const [pdfState, setPdfState] = useState({
    iframeError: false,
    error: null
  });

  const directAccessSrc = MediaDebugger.fixMediaUrl(src, false);
  const apiAccessSrc = MediaDebugger.fixMediaUrl(src, true);

  const handlePdfError = (e) => {
    MediaDebugger.logMediaError('PDF iframe', null, e);
    setPdfState({ iframeError: true, error: e });
    if (onError) onError(e);
  };

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      minHeight: '600px',
      maxHeight: '80vh',
      margin: '0 auto',
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
    }}>
      {/* Debug overlay removed for production */}

      {!pdfState.iframeError ? (
        <iframe
          src={directAccessSrc || apiAccessSrc}
          style={{
            width: '100%',
            height: '600px',
            maxHeight: '80vh',
            border: 'none',
            background: '#fff'
          }}
          title={title || "PDF Document"}
          onError={handlePdfError}
        />
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '600px',
          padding: '20px',
          textAlign: 'center',
          background: '#f8f9fa'
        }}>
          <p style={{ marginBottom: '20px' }}>
            Unable to display the PDF in browser. Try downloading it:
          </p>
          <a
            href={fixedSrc}
            download
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              padding: '10px 15px',
              background: '#007bff',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '5px',
              fontWeight: 'bold'
            }}
          >
            Download {title || 'PDF'}
          </a>
        </div>
      )}
    </div>
  );
};

export { EnhancedVideoPlayer, EnhancedPdfViewer, MediaDebugger };
