import React from 'react';
import Layout from '../components/Layout';
import '../styles/components.css';
import './Dashboard.css';

const Dashboard = () => {
  // Données mockées pour les statistiques
  const stats = [
    {
      title: 'Commandes du jour',
      value: '12',
      change: '+3 depuis hier',
      icon: '📦'
    },
    {
      title: 'Chiffre d\'affaires estimé',
      value: '45 230 MAD',
      change: '+12% ce mois',
      icon: '💰'
    },
    {
      title: 'Produits en rupture',
      value: '5',
      change: 'À réapprovisionner',
      icon: '⚠️'
    },
    {
      title: 'Clients actifs',
      value: '28',
      change: '+2 cette semaine',
      icon: '👥'
    }
  ];

  // Données mockées pour les dernières commandes
  const recentOrders = [
    { id: 'CMD-2025-001', date: '2025-01-15', client: 'Client A', montant: '12 450 MAD', statut: 'En cours' },
    { id: 'CMD-2025-002', date: '2025-01-14', client: 'Client B', montant: '8 900 MAD', statut: 'Livrée' },
    { id: 'CMD-2025-003', date: '2025-01-14', client: 'Client C', montant: '15 200 MAD', statut: 'En cours' },
    { id: 'CMD-2025-004', date: '2025-01-13', client: 'Client D', montant: '6 750 MAD', statut: 'Livrée' },
    { id: 'CMD-2025-005', date: '2025-01-13', client: 'Client E', montant: '9 300 MAD', statut: 'En attente' }
  ];

  return (
    <Layout>
      <div className="dashboard-page">
        <h1 className="page-title">Tableau de bord revendeur</h1>
        <p className="page-subtitle">Vue d'ensemble de votre activité</p>

        {/* Statistiques */}
        <div className="grid grid-4" style={{ marginBottom: '32px' }}>
          {stats.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-title">{stat.title}</span>
                <div className="stat-card-icon">{stat.icon}</div>
              </div>
              <div className="stat-card-value">{stat.value}</div>
              <div className="stat-card-change">{stat.change}</div>
            </div>
          ))}
        </div>

        {/* Dernières commandes */}
        <div className="card">
          <h2 className="card-title">Dernières commandes</h2>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Numéro</th>
                  <th>Date</th>
                  <th>Client</th>
                  <th>Montant</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{order.date}</td>
                    <td>{order.client}</td>
                    <td>{order.montant}</td>
                    <td>
                      <span className={`status-badge status-${order.statut.toLowerCase().replace(' ', '-')}`}>
                        {order.statut}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
