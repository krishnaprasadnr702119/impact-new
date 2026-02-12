import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { setToken, setRefreshToken, parseJwt } from '../utils/auth';
import { authApi, ApiError } from '../utils/apiClient';
import './LoginPage.css';
import { useAuth } from '../hooks/useAuth';

const LoginPage = () => {
  const [message, setMessage] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginStatus, setLoginStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    username: '',
    password: '',
    org_name: '',
    org_domain: '',
  });
  const [registerStatus, setRegisterStatus] = useState(null);
  const [registerLoading, setRegisterLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleRegisterChange = e => {
    setRegisterForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterStatus(null);
    setRegisterLoading(true);
    if (!registerForm.username || !registerForm.password || !registerForm.org_name || !registerForm.org_domain) {
      setRegisterStatus({ success: false, message: 'Please fill all fields.' });
      setRegisterLoading(false);
      return;
    }
    try {
      const orgRes = await fetch('/api/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: registerForm.org_name,
          portal_admin: registerForm.username,
          org_domain: registerForm.org_domain,
          status: 'active',
          admin_password: registerForm.password,
          admin_email: `${registerForm.username}@${registerForm.org_domain}`,
          admin_designation: 'Portal Administrator'
        })
      });
      const orgData = await orgRes.json();
      if (!orgRes.ok) throw new Error(orgData.message || 'Failed to create organization');

      setRegisterStatus({
        success: true,
        message: `✅ Registration successful!\n\nYour portal admin account has been created:\n• Username: ${registerForm.username}\n• Email: ${registerForm.username}@${registerForm.org_domain}\n• Organization: ${registerForm.org_name}\n\nYou can now log in with your credentials.`
      });
      setShowRegister(false);
      setRegisterForm({ username: '', password: '', org_name: '', org_domain: '' });
    } catch (err) {
      setRegisterStatus({ success: false, message: err.message });
    } finally {
      setRegisterLoading(false);
    }
  };

  useEffect(() => {
    fetch('/api/hello')
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch(() => {
        setMessage('Could not fetch backend message.');
      });
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginStatus(null);
    setIsLoading(true);

    try {
      const data = await authApi.login({ username, password });

      if (data.success && data.access_token) {
        // Store both access and refresh tokens
        setToken(data.access_token);
        if (data.refresh_token) {
          setRefreshToken(data.refresh_token);
        }

        setLoginStatus({ success: true, message: data.message });

        const payload = parseJwt(data.access_token);
        if (payload && payload.role) {
          login(data.access_token);
          navigate('/dashboard', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      } else {
        setLoginStatus({ success: false, message: data.message || 'Login failed' });
      }
    } catch (error) {
      console.error('Login error:', error);

      if (error instanceof ApiError) {
        if (error.status === 401) {
          setLoginStatus({
            success: false,
            message: 'Invalid username or password. Please try again.'
          });
        } else if (error.status === 400) {
          setLoginStatus({
            success: false,
            message: 'Please provide both username and password.'
          });
        } else {
          setLoginStatus({
            success: false,
            message: error.message || 'Login failed. Please try again.'
          });
        }
      } else {
        setLoginStatus({
          success: false,
          message: 'Network error. Please check your connection and try again.'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container parallax">
      {/* Left Column - Visual Section */}
      <div className="login-visual-section">
        <div className="visual-content">
          <div className="visual-overlay">
            <div className="brand-section">
              <div className="brand-logo">📚</div>
              <h1 className="brand-title">Impact</h1>
              <p className="brand-tagline">Empowering Organizations Through Knowledge</p>
            </div>
            <div className="visual-features">
              <div className="feature-item">
                <div className="feature-icon">�</div>
                <div className="feature-text">
                  <h3>Track Progress</h3>
                  <p>Monitor learning journeys in real-time</p>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">✨</div>
                <div className="feature-text">
                  <h3>Achieve Goals</h3>
                  <p>Reach milestones with guided learning</p>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">💡</div>
                <div className="feature-text">
                  <h3>Grow Together</h3>
                  <p>Build a culture of continuous improvement</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Form Section */}
      <div className="login-form-section">
        {showRegister ? (
          <form onSubmit={handleRegister} className="auth-form" autoComplete="off">
            <div className="form-header">
              <div className="logo-container">
                <span>📝</span>
              </div>
              <h1 className="form-title">Register as Portal Admin</h1>
              <p className="form-subtitle">Create your organization account</p>
            </div>
            <div className="form-body">
              <div className="input-group">
                <label className="input-label">Username</label>
                <input
                  name="username"
                  className="input-field"
                  value={registerForm.username}
                  onChange={handleRegisterChange}
                  placeholder="Enter username"
                  required
                />
              </div>
              <div className="input-group">
                <label className="input-label">Password</label>
                <div className="password-field-container">
                  <input
                    name="password"
                    className="input-field"
                    type="password"
                    value={registerForm.password}
                    onChange={handleRegisterChange}
                    placeholder="Enter password"
                    required
                  />
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Organization Name</label>
                <input
                  name="org_name"
                  className="input-field"
                  value={registerForm.org_name}
                  onChange={handleRegisterChange}
                  placeholder="Enter organization name"
                  required
                />
              </div>
              <div className="input-group">
                <label className="input-label">Organization Domain</label>
                <input
                  name="org_domain"
                  className="input-field"
                  value={registerForm.org_domain}
                  onChange={handleRegisterChange}
                  placeholder="e.g., company.com"
                  required
                />
              </div>

              {registerForm.username && registerForm.org_domain && (
                <div className="status-message status-success">
                  <div style={{ fontWeight: 500, marginBottom: '0.5rem' }}>
                    📧 Portal Admin Email:
                  </div>
                  <div style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                    {registerForm.username}@{registerForm.org_domain}
                  </div>
                </div>
              )}

              <button type="submit" className="submit-button" disabled={registerLoading}>
                {registerLoading ? (
                  <>
                    <div className="spinner" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  'Create Account'
                )}
              </button>

              <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowRegister(false)} className="link-button">
                  Back to Login
                </button>
              </div>

              {registerStatus && (
                <div className={`status-message ${registerStatus.success ? 'status-success' : 'status-error'}`}>
                  {registerStatus.message}
                </div>
              )}
            </div>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="auth-form" autoComplete="off">
            <div className="form-header">

              <h1 className="form-title">Welcome Back</h1>
              <p className="form-subtitle">Sign in to your account</p>
            </div>

            <div className="form-body">
              <div className="input-group">
                <label className="input-label">Username</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Enter your username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">Password</label>
                <div className="password-field-container">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="input-field"
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(v => !v)}
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="submit-button"
                disabled={isLoading || !username || !password}
              >
                {isLoading ? (
                  <>
                    <div className="spinner" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  'Sign In'
                )}
              </button>

              <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowRegister(true)} className="link-button">
                  Register as Portal Admin
                </button>
              </div>

              {loginStatus && (
                <div className={`status-message ${loginStatus.success ? 'status-success' : 'status-error'}`}>
                  {loginStatus.message}
                </div>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default LoginPage;