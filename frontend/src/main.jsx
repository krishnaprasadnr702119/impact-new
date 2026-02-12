import React from 'react';
import ReactDOM from 'react-dom/client';
import AppRouter from './router';
import './index.css';
import { AuthProvider } from './hooks/useAuth';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <AppRouter />
    </AuthProvider>

  </React.StrictMode >
);
