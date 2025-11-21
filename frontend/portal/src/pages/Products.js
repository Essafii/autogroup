import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import '../styles/components.css';
import axios from 'axios';
import { API_BASE } from '../config';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    sku: '',
    code_barres: '',
    libelle: '',
    marque: '',
    famille: '',
    sous_famille: '',
    type: 'piece',
    prix_public: '',
    prix_standard: '',
    seuil_min: '0'
  });
  const [familles, setFamilles] = useState([]);

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'admin';

  useEffect(() => {
    fetchProducts();
    fetchFamilles();
  }, [page]);

  const fetchProducts = async () => {
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

      const response = await axios.get(`${API_BASE}/articles?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setProducts(response.data.articles || []);
      setPagination(response.data.pagination || { total: 0, pages: 1 });
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors du chargement des produits');
    } finally {
      setLoading(false);
    }
  };

  const fetchFamilles = async () => {
    try {
      const response = await axios.get(`${API_BASE}/articles/familles/list`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setFamilles(response.data.familles || []);
    } catch (err) {
      console.error('Erreur lors du chargement des familles:', err);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchProducts();
  };

  const handleOpenForm = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        sku: product.sku || '',
        code_barres: product.code_barres || '',
        libelle: product.libelle || '',
        marque: product.marque || '',
        famille: product.famille || '',
        sous_famille: product.sous_famille || '',
        type: product.type || 'piece',
        prix_public: product.prix_public || '',
        prix_standard: product.prix_standard || '',
        seuil_min: product.seuil_min || '0'
      });
    } else {
      setEditingProduct(null);
      setFormData({
        sku: '',
        code_barres: '',
        libelle: '',
        marque: '',
        famille: '',
        sous_famille: '',
        type: 'piece',
        prix_public: '',
        prix_standard: '',
        seuil_min: '0'
      });
    }
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProduct(null);
    setFormData({
      sku: '',
      code_barres: '',
      libelle: '',
      marque: '',
      famille: '',
      sous_famille: '',
      type: 'piece',
      prix_public: '',
      prix_standard: '',
      seuil_min: '0'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const payload = {
        ...formData,
        prix_public: parseFloat(formData.prix_public) || 0,
        prix_standard: parseFloat(formData.prix_standard) || 0,
        seuil_min: parseInt(formData.seuil_min) || 0
      };

      if (editingProduct) {
        await axios.put(`${API_BASE}/articles/${editingProduct.id}`, payload, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } else {
        await axios.post(`${API_BASE}/articles`, payload, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
      
      handleCloseForm();
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.details || 'Erreur lors de l\'enregistrement');
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return '0,00 MAD';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getTotalStock = (product) => {
    if (!product.stocks || product.stocks.length === 0) return 0;
    return product.stocks.reduce((sum, stock) => sum + (stock.quantite || 0), 0);
  };

  const filteredProducts = products.filter(product => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    const libelle = (product.libelle || '').toLowerCase();
    const sku = (product.sku || '').toLowerCase();
    const marque = (product.marque || '').toLowerCase();
    return libelle.includes(search) || sku.includes(search) || marque.includes(search);
  });

  return (
    <Layout>
      <div className="dashboard-page">
        <h1 className="page-title">Produits</h1>
        <p className="page-subtitle">Catalogue des produits</p>

        {error && <div className="error-message">{error}</div>}

        <div className="card" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Rechercher par référence, désignation ou marque..."
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
                + Nouveau produit
              </button>
            )}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <span className="spinner"></span>
              <p style={{ marginTop: '16px', color: 'rgba(255, 255, 255, 0.6)' }}>Chargement...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255, 255, 255, 0.6)' }}>
              Aucun produit trouvé
            </div>
          ) : (
            <>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Référence</th>
                      <th>Désignation</th>
                      <th>Famille</th>
                      <th>Marque</th>
                      <th>Prix HT</th>
                      <th>Stock</th>
                      {isAdmin && <th>Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr key={product.id}>
                        <td>{product.sku || '-'}</td>
                        <td>{product.libelle || '-'}</td>
                        <td>{product.famille || '-'}</td>
                        <td>{product.marque || '-'}</td>
                        <td>{formatCurrency(product.prix_standard)}</td>
                        <td>
                          <span style={{ 
                            color: (() => {
                              const stock = getTotalStock(product);
                              if (stock < 5) return '#ff6b6b'; // Rouge
                              if (stock < 20) return '#ffa500'; // Orange
                              return '#28a745'; // Vert
                            })(),
                            fontWeight: '600'
                          }}>
                            {getTotalStock(product)}
                          </span>
                        </td>
                        {isAdmin && (
                          <td>
                            <button
                              className="btn btn-secondary"
                              onClick={() => handleOpenForm(product)}
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
                    Page {pagination.page} sur {pagination.pages} ({pagination.total} produits)
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
                  {editingProduct ? 'Modifier le produit' : 'Nouveau produit'}
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
                  <label className="form-label">Référence (SKU) *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    required
                    disabled={!!editingProduct}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Code-barres</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.code_barres}
                    onChange={(e) => setFormData({ ...formData, code_barres: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Désignation *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.libelle}
                    onChange={(e) => setFormData({ ...formData, libelle: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Marque *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.marque}
                    onChange={(e) => setFormData({ ...formData, marque: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Famille *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.famille}
                    onChange={(e) => setFormData({ ...formData, famille: e.target.value })}
                    list="familles-list"
                    required
                  />
                  <datalist id="familles-list">
                    {familles.map((famille, idx) => (
                      <option key={idx} value={famille} />
                    ))}
                  </datalist>
                </div>

                <div className="form-group">
                  <label className="form-label">Sous-famille</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.sous_famille}
                    onChange={(e) => setFormData({ ...formData, sous_famille: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Type *</label>
                  <select
                    className="form-input"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    required
                  >
                    <option value="piece">Pièce</option>
                    <option value="accessoire">Accessoire</option>
                    <option value="lubrifiant">Lubrifiant</option>
                    <option value="pneu">Pneu</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Prix public (HT) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="form-input"
                      value={formData.prix_public}
                      onChange={(e) => setFormData({ ...formData, prix_public: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Prix standard (HT) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="form-input"
                      value={formData.prix_standard}
                      onChange={(e) => setFormData({ ...formData, prix_standard: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Seuil minimum</label>
                  <input
                    type="number"
                    min="0"
                    className="form-input"
                    value={formData.seuil_min}
                    onChange={(e) => setFormData({ ...formData, seuil_min: e.target.value })}
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
                    {editingProduct ? 'Enregistrer' : 'Créer'}
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

export default Products;
