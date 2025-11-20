import React from 'react';
import Layout from '../components/Layout';
import '../styles/components.css';

const Dashboard: React.FC = () => {
  return (
    <Layout>
      <div>
        <h1 className="page-title">Dashboard Admin</h1>
        <p className="page-subtitle">Vue d'ensemble du système</p>
        
        <div className="card">
          <h2 className="card-title">Statistiques</h2>
          <p>Page en développement - Statistiques à venir</p>
        </div>

        <div className="card">
          <h2 className="card-title">Actions rapides</h2>
          <p>Navigation placeholder</p>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
