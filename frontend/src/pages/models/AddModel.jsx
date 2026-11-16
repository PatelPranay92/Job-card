import React, { useState, useEffect } from 'react';
import {
  Car,
  Plus,
  Trash2,
  Search,
  CheckCircle,
  AlertCircle,
  Database,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import api from '../../api/axios';
import ConfirmDialog from '../../components/ConfirmDialog';
import EmptyState from '../../components/EmptyState';

const AddModel = () => {
  const [models, setModels] = useState([]);
  const [newModel, setNewModel] = useState({ name: '', type: 'Bike' });
  const [message, setMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [modelToDelete, setModelToDelete] = useState(null);

  const fetchModels = async () => {
    try {
      const res = await api.get('/models');
      setModels(res.data || []);
    } catch (err) {
      console.error('Error fetching models:', err);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    if (!newModel.name.trim()) return;

    setLoading(true);
    try {
      await api.post('/models', {
        name: newModel.name.trim().toUpperCase(),
        type: newModel.type,
      });
      setMessage({ type: 'success', text: `Model "${newModel.name.toUpperCase()}" added successfully!` });
      setNewModel({ name: '', type: 'Bike' });
      fetchModels();
      setTimeout(() => setMessage(null), 3500);
    } catch (err) {
      setMessage({
        type: 'danger',
        text: err.response?.data?.message || 'Error adding vehicle model',
      });
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteModel = async () => {
    if (!modelToDelete) return;
    try {
      await api.delete(`/models/${modelToDelete._id}`);
      setMessage({ type: 'success', text: `Model "${modelToDelete.name}" deleted successfully!` });
      setModelToDelete(null);
      fetchModels();
      setTimeout(() => setMessage(null), 3500);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'danger', text: 'Error deleting model' });
    }
  };

  const filteredModels = models.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.type || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeBadge = (type) => {
    const t = (type || 'Bike').toLowerCase();
    if (t === 'car') {
      return <span className="badge bg-primary-light text-primary border border-primary-subtle">Car</span>;
    }
    if (t === 'scooter') {
      return <span className="badge bg-warning-light text-warning-text border border-warning-border">Scooter</span>;
    }
    return <span className="badge bg-success-light text-success-text border border-success-border">Bike</span>;
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header-saas">
        <div>
          <h1 className="page-title">Vehicle Models</h1>
          <p className="page-subtitle">
            Configure vehicle models and types available for selection during job card creation.
          </p>
        </div>
      </div>

      {message && (
        <div
          className={`alert alert-${message.type} py-2 px-3 small d-flex align-items-center gap-2 mb-4`}
        >
          {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="row g-4">
        {/* Left Column: Add New Model */}
        <div className="col-12 col-lg-4">
          <div className="saas-card mb-4">
            <div className="saas-card-header">
              <div className="saas-card-title">
                <Plus size={18} className="text-primary" />
                <span>Add Vehicle Model</span>
              </div>
            </div>

            <div className="saas-card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label-saas">
                    Model Name<span className="required-star">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. SPLENDOR PLUS, ACTIVA 6G"
                    value={newModel.name}
                    onChange={(e) =>
                      setNewModel({ ...newModel, name: e.target.value.toUpperCase() })
                    }
                    required
                    className="form-control-saas"
                  />
                  <small className="text-muted" style={{ fontSize: '11px' }}>
                    Auto-converts to uppercase for consistency
                  </small>
                </div>

                <div className="mb-4">
                  <label className="form-label-saas">Vehicle Classification</label>
                  <select
                    value={newModel.type}
                    onChange={(e) => setNewModel({ ...newModel, type: e.target.value })}
                    className="form-select-saas"
                  >
                    <option value="Bike">Motorcycle / Bike</option>
                    <option value="Scooter">Scooter / Moped</option>
                    <option value="Car">Car / Four Wheeler</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-saas btn-saas-primary w-100 py-2"
                >
                  <Plus size={16} />
                  <span>{loading ? 'Adding...' : 'Save Model'}</span>
                </button>
              </form>
            </div>
          </div>

          {/* Quick Info Box */}
          <div className="saas-card p-3 bg-light">
            <div className="d-flex align-items-center gap-2 mb-1">
              <Sparkles size={16} className="text-primary" />
              <span className="fw-semibold small">Quick Stats</span>
            </div>
            <p className="small text-secondary mb-0">
              Total registered vehicle models:{' '}
              <strong className="text-primary">{models.length}</strong>
            </p>
          </div>
        </div>

        {/* Right Column: Existing Models List */}
        <div className="col-12 col-lg-8">
          <div className="saas-card">
            <div className="saas-card-header flex-wrap gap-2">
              <div className="saas-card-title">
                <Car size={18} className="text-primary" />
                <span>Existing Models ({filteredModels.length})</span>
              </div>

              <div className="position-relative w-100" style={{ maxWidth: '220px' }}>
                <Search
                  size={14}
                  className="position-absolute text-tertiary"
                  style={{ left: '10px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  type="text"
                  placeholder="Filter models..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-control-saas py-1"
                  style={{ paddingLeft: '30px', fontSize: '12.5px', height: '32px' }}
                />
              </div>
            </div>

            {filteredModels.length === 0 ? (
              <EmptyState
                icon={<Car size={32} />}
                title="No models found"
                description={
                  searchTerm
                    ? `No vehicle models matched "${searchTerm}".`
                    : 'No models added yet. Add your first vehicle model using the form on the left.'
                }
              />
            ) : (
              <div className="saas-table-container border-0 rounded-0">
                <table className="saas-table">
                  <thead>
                    <tr>
                      <th style={{ width: '50px' }}>#</th>
                      <th>Model Name</th>
                      <th>Classification</th>
                      <th className="text-end">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredModels.map((m, idx) => (
                      <tr key={m._id}>
                        <td className="text-secondary small">{idx + 1}</td>
                        <td className="fw-semibold text-primary">{m.name}</td>
                        <td>{getTypeBadge(m.type)}</td>
                        <td className="text-end">
                          <button
                            onClick={() => setModelToDelete(m)}
                            className="btn-saas btn-saas-outline-danger btn-saas-icon"
                            title="Delete model"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        show={!!modelToDelete}
        title="Delete Vehicle Model"
        message={`Are you sure you want to delete model "${modelToDelete?.name}"?`}
        confirmText="Delete Model"
        confirmVariant="danger"
        onConfirm={confirmDeleteModel}
        onCancel={() => setModelToDelete(null)}
      />
    </div>
  );
};

export default AddModel;
