import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import '../styles/components.css';
import axios from 'axios';
import { API_BASE } from '../config';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [formData, setFormData] = useState({
    type: 'entreprise',
    nom: '',
    prenom: '',
    raison_sociale: '',
    telephone: '',
    email: '',
    adresse: '',
    ville: ''
  });

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'admin';

  useEffect(() => {
    fetchClients();
  }, [page]);

  const fetchClients = async () => {
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

      const response = await axios.get(`${API_BASE}/clients?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setClients(response.data.clients || []);
      setPagination(response.data.pagination || { total: 0, pages: 1 });
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors du chargement des clients');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchClients();
  };

  const handleOpenForm = (client = null) => {
    if (client) {
      setEditingClient(client);
      setFormData({
        type: client.type || 'entreprise',
        nom: client.nom || '',
        prenom: client.prenom || '',
        raison_sociale: client.raison_sociale || '',
        telephone: client.telephone || '',
        email: client.email || '',
        adresse: client.adresse || '',
        ville: client.ville || ''
      });
    } else {
      setEditingClient(null);
      setFormData({
        type: 'entreprise',
        nom: '',
        prenom: '',
        raison_sociale: '',
        telephone: '',
        email: '',
        adresse: '',
        ville: ''
      });
    }
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingClient(null);
    setFormData({
      type: 'entreprise',
      nom: '',
      prenom: '',
      raison_sociale: '',
      telephone: '',
      email: '',
      adresse: '',
      ville: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editingClient) {
        await axios.put(`${API_BASE}/clients/${editingClient.id}`, formData, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } else {
        await axios.post(`${API_BASE}/clients`, formData, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
      
      handleCloseForm();
      fetchClients();
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.details || 'Erreur lors de l\'enregistrement');
    }
  };

  const filteredClients = clients.filter(client => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    const name = (client.raison_sociale || `${client.nom || ''} ${client.prenom || ''}`.trim() || '').toLowerCase();
    const phone = (client.telephone || '').toLowerCase();
    const email = (client.email || '').toLowerCase();
    return name.includes(search) || phone.includes(search) || email.includes(search);
  });

  return (
    <Layout>
      <div className="dashboard-page">
        <h1 className="page-title">Clients</h1>
        <p className="page-subtitle">Gestion des clients revendeurs</p>

        {error && <div className="error-message">{error}</div>}

        <div className="card" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Rechercher par nom, téléphone ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              style={{ flex: 1, minWidth: '250px', maxWidth: '400px' }}
            />
            <button 
              className="btn btn-secondary"
              onClick={handleSearch}
              disabled={loading}
            >
              Rechercher
            </button>
            {isAdmin && (
              <button 
                className="btn btn-primary"
                onClick={() => handleOpenForm()}
              >
                + Nouveau client
              </button>
            )}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <span className="spinner"></span>
              <p style={{ marginTop: '16px', color: 'rgba(255, 255, 255, 0.6)' }}>Chargement...</p>
            </div>
          ) : filteredClients.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255, 255, 255, 0.6)' }}>
              Aucun client trouvé
            </div>
          ) : (
            <>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Raison sociale / Nom</th>
                      <th>Email</th>
                      <th>Téléphone</th>
                      <th>Ville</th>
                      <th>Statut</th>
                      {isAdmin && <th>Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClients.map((client) => (
                      <tr key={client.id}>
                        <td>
                          {client.raison_sociale || `${client.nom || ''} ${client.prenom || ''}`.trim() || 'N/A'}
                        </td>
                        <td>{client.email || '-'}</td>
                        <td>{client.telephone || '-'}</td>
                        <td>{client.ville || '-'}</td>
                        <td>
                          <span className={`status-badge ${client.is_active ? 'status-active' : 'status-inactive'}`}>
                            {client.is_active ? 'Actif' : 'Inactif'}
                          </span>
                        </td>
                        {isAdmin && (
                          <td>
                            <button
                              className="btn btn-secondary"
                              onClick={() => handleOpenForm(client)}
                              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                            >
                              Modifier
                            </button>
                          </td>
                        )}
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
                    Page {pagination.page} sur {pagination.pages} ({pagination.total} clients)
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

        {/* Modal de formulaire */}
        {showForm && (
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
            onClick={handleCloseForm}
          >
            <div 
              className="card"
              style={{
                maxWidth: '600px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto',
                position: 'relative'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 className="card-title">
                  {editingClient ? 'Modifier le client' : 'Nouveau client'}
                </h2>
                <button
                  className="btn btn-secondary"
                  onClick={handleCloseForm}
                  style={{ padding: '8px 16px' }}
                >
                  ✕ Fermer
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select
                    className="form-input"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    required
                  >
                    <option value="entreprise">Entreprise</option>
                    <option value="particulier">Particulier</option>
                  </select>
                </div>

                {formData.type === 'entreprise' ? (
                  <div className="form-group">
                    <label className="form-label">Raison sociale *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.raison_sociale}
                      onChange={(e) => setFormData({ ...formData, raison_sociale: e.target.value })}
                      required
                    />
                  </div>
                ) : (
                  <>
                    <div className="form-group">
                      <label className="form-label">Nom *</label>
                      <input
                        type="text"
                        className="form-input"
                        value={formData.nom}
                        onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Prénom *</label>
                      <input
                        type="text"
                        className="form-input"
                        value={formData.prenom}
                        onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                        required
                      />
                    </div>
                  </>
                )}

                <div className="form-group">
                  <label className="form-label">Téléphone *</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={formData.telephone}
                    onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                    placeholder="+212XXXXXXXXX ou 0XXXXXXXXX"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-input"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Adresse</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.adresse}
                    onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Ville</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.ville}
                    onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCloseForm}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    {editingClient ? 'Enregistrer' : 'Créer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Clients;
