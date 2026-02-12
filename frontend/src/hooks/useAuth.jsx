import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getToken, isTokenExpired, parseJwt, removeToken } from '../utils/auth';
import { logger, getSafeUserInfo } from '../utils/security';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    userRole: null,
    isLoading: true,
    userName: '',
    payload: null,
    token: null
  });

  const checkAuth = useCallback(() => {
    const token = getToken();

    if (!token || isTokenExpired(token)) {
      setAuthState({
        isAuthenticated: false,
        userRole: null,
        isLoading: false,
        userName: '',
        payload: null,
        token: ''
      });
      return;
    }

    try {
      const payload = parseJwt(token);
      // Secure logging - only safe user info
      logger.info('🔐 Auth: User authenticated', getSafeUserInfo(payload));

      setAuthState({
        isAuthenticated: !!payload,
        userRole: payload?.role || null,
        isLoading: false,
        userName: payload?.username || 'Unknown',
        payload: payload || null,
        token: token
      });
    } catch (error) {
      console.error('Auth error:', error);
      setAuthState({
        isAuthenticated: false,
        userRole: null,
        isLoading: false,
        userName: '',
        payload: null,
      });
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // 🔑 Explicit login/logout methods
  const login = (token) => {
    localStorage.setItem('token', token); // or sessionStorage
    checkAuth();
  };

  const logout = () => {
    removeToken(); // Clears both access token and refresh token
    setAuthState({
      isAuthenticated: false,
      userRole: null,
      isLoading: false,
      userName: '',
      payload: null,
      token: null
    });
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout, refreshAuth: checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
