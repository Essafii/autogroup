import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import '../styles/components.css';
import axios from 'axios';
import { API_BASE } from '../config';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchOrders();
  }, [page, searchTerm]);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      });
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await axios.get(`${API_BASE}/commandes?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setOrders(response.data.commandes || []);
      setPagination(response.data.pagination || { total: 0, pages: 1 });
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors du chargement des commandes');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (orderId) => {
    try {
      const response = await axios.get(`${API_BASE}/commandes/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setSelectedOrder(response.data.commande);
      setShowModal(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors du chargement des détails');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return '0,00 MAD';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getStatusBadge = (statut) => {
    const statusMap = {
      'brouillon': 'Brouillon',
      'validee': 'Validée',
      'livree': 'Livrée',
      'facturee': 'Facturée',
      'annulee': 'Annulée'
    };
    
    const statusClass = statut.toLowerCase().replace('é', 'e');
    return (
      <span className={`status-badge status-${statusClass}`}>
        {statusMap[statut] || statut}
      </span>
    );
  };

  const filteredOrders = orders.filter(order => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    const clientName = order.client 
      ? (order.client.raison_sociale || `${order.client.nom} ${order.client.prenom}` || '').toLowerCase()
      : '';
    const orderNum = (order.numero || '').toLowerCase();
    return clientName.includes(search) || orderNum.includes(search);
  });

  return (
    <Layout>
      <div className="dashboard-page">
        <h1 className="page-title">Commandes</h1>
        <p className="page-subtitle">Gestion et suivi des commandes</p>

        {error && <div className="error-message">{error}</div>}

        <div className="card" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '24px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Rechercher par numéro de commande ou nom de client..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              style={{ flex: 1, maxWidth: '400px' }}
            />
            <button 
              className="btn btn-secondary"
              onClick={fetchOrders}
              disabled={loading}
            >
              {loading ? <span className="spinner"></span> : 'Actualiser'}
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <span className="spinner"></span>
              <p style={{ marginTop: '16px', color: 'rgba(255, 255, 255, 0.6)' }}>Chargement...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255, 255, 255, 0.6)' }}>
              Aucune commande trouvée
            </div>
          ) : (
            <>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Numéro</th>
                      <th>Date</th>
                      <th>Client</th>
                      <th>Montant total</th>
                      <th>Statut</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => (
                      <tr key={order.id}>
                        <td>{order.numero}</td>
                        <td>{formatDate(order.date_commande)}</td>
                        <td>
                          {order.client 
                            ? (order.client.raison_sociale || `${order.client.nom || ''} ${order.client.prenom || ''}`.trim() || 'N/A')
                            : 'N/A'}
                        </td>
                        <td>{formatCurrency(order.montant_ttc)}</td>
                        <td>{getStatusBadge(order.statut)}</td>
                        <td>
                          <button
                            className="btn btn-secondary"
                            onClick={() => handleViewDetails(order.id)}
                            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                          >
                            Voir détails
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {pagination.pages > 1 && (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  marginTop: '24px',
                  paddingTop: '24px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <div style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                    Page {pagination.page} sur {pagination.pages} ({pagination.total} commandes)
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="btn btn-secondary"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1 || loading}
                    >
                      Précédent
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                      disabled={page === pagination.pages || loading}
                    >
                      Suivant
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal de détails */}
        {showModal && selectedOrder && (
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '20px'
            }}
            onClick={() => setShowModal(false)}
          >
            <div 
              className="card"
              style={{
                maxWidth: '800px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto',
                position: 'relative'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 className="card-title">Détails de la commande {selectedOrder.numero}</h2>
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                  style={{ padding: '8px 16px' }}
                >
                  ✕ Fermer
                </button>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <strong style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.85rem' }}>Date de commande</strong>
                    <p style={{ marginTop: '4px' }}>{formatDate(selectedOrder.date_commande)}</p>
                  </div>
                  <div>
                    <strong style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.85rem' }}>Statut</strong>
                    <p style={{ marginTop: '4px' }}>{getStatusBadge(selectedOrder.statut)}</p>
                  </div>
                </div>

                {selectedOrder.client && (
                  <div style={{ marginBottom: '16px' }}>
                    <strong style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.85rem' }}>Client</strong>
                    <p style={{ marginTop: '4px' }}>
                      {selectedOrder.client.raison_sociale || `${selectedOrder.client.nom || ''} ${selectedOrder.client.prenom || ''}`.trim() || 'N/A'}
                    </p>
                    {selectedOrder.client.telephone && (
                      <p style={{ marginTop: '4px', color: 'rgba(255, 255, 255, 0.6)' }}>
                        Tél: {selectedOrder.client.telephone}
                      </p>
                    )}
                  </div>
                )}

                {selectedOrder.lignes && selectedOrder.lignes.length > 0 && (
                  <div style={{ marginTop: '24px' }}>
                    <strong style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.85rem', marginBottom: '12px', display: 'block' }}>
                      Articles commandés
                    </strong>
                    <div className="table-container">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Article</th>
                            <th>Quantité</th>
                            <th>Prix unitaire</th>
                            <th>Montant HT</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedOrder.lignes.map((ligne, idx) => (
                            <tr key={idx}>
                              <td>{ligne.article?.libelle || 'N/A'}</td>
                              <td>{ligne.quantite}</td>
                              <td>{formatCurrency(ligne.prix_unitaire)}</td>
                              <td>{formatCurrency(ligne.montant_ht)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div style={{ 
                  marginTop: '24px', 
                  paddingTop: '24px', 
                  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <strong style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.85rem' }}>Montant HT</strong>
                    <p style={{ marginTop: '4px', fontSize: '1.1rem' }}>{formatCurrency(selectedOrder.montant_ht)}</p>
                  </div>
                  <div>
                    <strong style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.85rem' }}>TVA</strong>
                    <p style={{ marginTop: '4px', fontSize: '1.1rem' }}>{formatCurrency(selectedOrder.montant_tva)}</p>
                  </div>
                  <div>
                    <strong style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.85rem' }}>Montant TTC</strong>
                    <p style={{ marginTop: '4px', fontSize: '1.2rem', fontWeight: 'bold', color: '#FF6600' }}>
                      {formatCurrency(selectedOrder.montant_ttc)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Orders;
