import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import '../styles/components.css';
import axios from 'axios';
import { API_BASE } from '../config';

const Settings = () => {
  const [users, setUsers] = useState([]);
  const [agences, setAgences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nom: '',
    prenom: '',
    telephone: '',
    role: 'employe',
    agence_id: '',
    is_active: true
  });

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'admin';
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) {
      navigate('/dashboard');
      return;
    }
    fetchUsers();
    fetchAgences();
  }, [page, isAdmin, navigate]);

  const fetchUsers = async () => {
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

      const response = await axios.get(`${API_BASE}/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setUsers(response.data.users || []);
      setPagination(response.data.pagination || { total: 0, pages: 1 });
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const fetchAgences = async () => {
    try {
      const response = await axios.get(`${API_BASE}/users/agences/list`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }).catch(() => {
        // If endpoint doesn't exist, return empty array
        return { data: { agences: [] } };
      });
      setAgences(response.data.agences || []);
    } catch (err) {
      console.error('Erreur lors du chargement des agences:', err);
      setAgences([]);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchUsers();
  };

  const handleOpenForm = (userData = null) => {
    if (userData) {
      setEditingUser(userData);
      setFormData({
        email: userData.email || '',
        password: '', // Don't prefill password
        nom: userData.nom || '',
        prenom: userData.prenom || '',
        telephone: userData.telephone || '',
        role: userData.role || 'employe',
        agence_id: userData.agence_id || '',
        is_active: userData.is_active !== false
      });
    } else {
      setEditingUser(null);
      setFormData({
        email: '',
        password: '',
        nom: '',
        prenom: '',
        telephone: '',
        role: 'employe',
        agence_id: '',
        is_active: true
      });
    }
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingUser(null);
    setFormData({
      email: '',
      password: '',
      nom: '',
      prenom: '',
      telephone: '',
      role: 'employe',
      agence_id: '',
      is_active: true
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const payload = { ...formData };
      
      // Don't send password if editing and password is empty
      if (editingUser && !payload.password) {
        delete payload.password;
      }

      if (editingUser) {
        await axios.put(`${API_BASE}/users/${editingUser.id}`, payload, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } else {
        await axios.post(`${API_BASE}/users`, payload, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
      
      handleCloseForm();
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.details || 'Erreur lors de l\'enregistrement');
    }
  };

  const handleToggleActive = async (userId, currentStatus) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir ${currentStatus ? 'désactiver' : 'activer'} cet utilisateur ?`)) {
      return;
    }

    try {
      await axios.put(`${API_BASE}/users/${userId}`, {
        is_active: !currentStatus
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la modification');
    }
  };

  const filteredUsers = users.filter(userItem => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    const email = (userItem.email || '').toLowerCase();
    const nom = (userItem.nom || '').toLowerCase();
    const prenom = (userItem.prenom || '').toLowerCase();
    return email.includes(search) || nom.includes(search) || prenom.includes(search);
  });

  if (!isAdmin) {
    return null; // Will redirect in useEffect
  }

  return (
    <Layout>
      <div className="dashboard-page">
        <h1 className="page-title">Paramètres</h1>
        <p className="page-subtitle">Gestion des utilisateurs</p>

        {error && <div className="error-message">{error}</div>}

        <div className="card" style={{ marginBottom: '24px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '24px',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <h2 className="card-title" style={{ margin: 0 }}>Utilisateurs</h2>
            <button 
              className="btn btn-primary"
              onClick={() => handleOpenForm()}
            >
              + Créer un utilisateur
            </button>
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Rechercher par email, nom ou prénom..."
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
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <span className="spinner"></span>
              <p style={{ marginTop: '16px', color: 'rgba(255, 255, 255, 0.6)' }}>Chargement...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255, 255, 255, 0.6)' }}>
              Aucun utilisateur trouvé
            </div>
          ) : (
            <>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Email</th>
                      <th>Nom</th>
                      <th>Prénom</th>
                      <th>Rôle</th>
                      <th>Agence</th>
                      <th>Statut</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((userItem) => (
                      <tr key={userItem.id}>
                        <td>{userItem.email}</td>
                        <td>{userItem.nom || '-'}</td>
                        <td>{userItem.prenom || '-'}</td>
                        <td>
                          <span style={{ 
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '0.85rem',
                            backgroundColor: userItem.role === 'admin' 
                              ? 'rgba(255, 102, 0, 0.2)' 
                              : 'rgba(255, 255, 255, 0.1)',
                            color: 'rgba(255, 255, 255, 0.9)'
                          }}>
                            {userItem.role}
                          </span>
                        </td>
                        <td>{userItem.agence?.nom || '-'}</td>
                        <td>
                          <span className={`status-badge ${userItem.is_active ? 'status-active' : 'status-inactive'}`}>
                            {userItem.is_active ? 'Actif' : 'Inactif'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              className="btn btn-secondary"
                              onClick={() => handleOpenForm(userItem)}
                              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                            >
                              Modifier
                            </button>
                            <button
                              className="btn btn-secondary"
                              onClick={() => handleToggleActive(userItem.id, userItem.is_active)}
                              style={{ 
                                padding: '8px 16px', 
                                fontSize: '0.85rem',
                                backgroundColor: userItem.is_active 
                                  ? 'rgba(220, 53, 69, 0.2)' 
                                  : 'rgba(40, 167, 69, 0.2)',
                                borderColor: userItem.is_active 
                                  ? 'rgba(220, 53, 69, 0.3)' 
                                  : 'rgba(40, 167, 69, 0.3)'
                              }}
                            >
                              {userItem.is_active ? 'Désactiver' : 'Activer'}
                            </button>
                          </div>
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
                    Page {pagination.page} sur {pagination.pages} ({pagination.total} utilisateurs)
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
                  {editingUser ? 'Modifier l\'utilisateur' : 'Créer un utilisateur'}
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
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    className="form-input"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Mot de passe {editingUser ? '(laisser vide pour ne pas modifier)' : '*'}
                  </label>
                  <input
                    type="password"
                    className="form-input"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required={!editingUser}
                    minLength={6}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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
                </div>

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
                  <label className="form-label">Rôle *</label>
                  <select
                    className="form-input"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    required
                  >
                    <option value="admin">Admin</option>
                    <option value="comptable">Comptable</option>
                    <option value="tc">TC</option>
                    <option value="commercial">Commercial</option>
                    <option value="rh">RH</option>
                    <option value="manager_agence">Manager Agence</option>
                    <option value="employe">Employé</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Agence</label>
                  <select
                    className="form-input"
                    value={formData.agence_id}
                    onChange={(e) => setFormData({ ...formData, agence_id: e.target.value })}
                  >
                    <option value="">Aucune agence</option>
                    {agences.map((agence) => (
                      <option key={agence.id} value={agence.id}>
                        {agence.nom}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      style={{ width: 'auto' }}
                    />
                    <span className="form-label" style={{ margin: 0 }}>Utilisateur actif</span>
                  </label>
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
                    {editingUser ? 'Enregistrer' : 'Créer'}
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

export default Settings;
