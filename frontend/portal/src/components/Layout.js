import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../styles/layout.css';

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="app-wrapper">
      <header className="app-header">
        <div className="app-header-logo">
          <h1>Groupauto ERP</h1>
          <span className="subtitle">Portail Revendeurs</span>
        </div>
        <div className="app-header-user">
          <span>{user.email || 'Utilisateur'}</span>
          <button onClick={handleLogout}>Déconnexion</button>
        </div>
      </header>

      <aside className="app-sidebar">
        <nav>
          <ul className="app-sidebar-nav">
            <li>
              <Link to="/dashboard" className={isActive('/dashboard') ? 'active' : ''}>
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/orders" className={isActive('/orders') ? 'active' : ''}>
                Commandes
              </Link>
            </li>
            <li>
              <Link to="/clients" className={isActive('/clients') ? 'active' : ''}>
                Clients
              </Link>
            </li>
            <li>
              <Link to="/products" className={isActive('/products') ? 'active' : ''}>
                Produits
              </Link>
            </li>
            <li>
              <Link to="/settings" className={isActive('/settings') ? 'active' : ''}>
                Paramètres
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      <main className="app-main">
        {children}
      </main>
    </div>
  );
};

export default Layout;

