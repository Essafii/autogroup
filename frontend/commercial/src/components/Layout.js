import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/layout.css';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="commercial-wrapper">
      <header className="commercial-header">
        <h1>Groupauto ERP - Commercial</h1>
        <div className="commercial-header-user">
          <span>{user.email || 'Commercial'}</span>
          <button onClick={handleLogout}>Déconnexion</button>
        </div>
      </header>

      <main className="commercial-main">
        {children}
      </main>
    </div>
  );
};

export default Layout;

