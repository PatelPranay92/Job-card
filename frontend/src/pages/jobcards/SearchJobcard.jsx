import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  RotateCcw,
  Eye,
  FileText,
  Filter,
  User,
  Car,
  Calendar,
} from 'lucide-react';
import api from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import LoadingSkeleton from '../../components/LoadingSkeleton';

const SearchJobcard = () => {
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    jobcardNo: '',
    chassisNo: '',
    customerName: '',
    city: '',
    modelId: '',
    regNo: '',
    mechanicName: '',
    helperName: '',
    phone: '',
  });

  const [availableModels, setAvailableModels] = useState([]);
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const res = await api.get('/models');
        setAvailableModels(res.data || []);
      } catch (err) {
        console.error('Error fetching models:', err);
      }
    };
    fetchModels();
  }, []);

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value.toUpperCase() });
  };

  const handleReset = () => {
    setFilters({
      startDate: '',
      endDate: '',
      jobcardNo: '',
      chassisNo: '',
      customerName: '',
      city: '',
      modelId: '',
      regNo: '',
      mechanicName: '',
      helperName: '',
      phone: '',
    });
    setResults([]);
    setHasSearched(false);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      setSearching(true);
      const res = await api.post('/jobcards/search', filters);
      setResults(res.data || []);
      setHasSearched(true);
    } catch (err) {
      console.error(err);
      alert('Error searching job cards');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header-saas">
        <div>
          <h1 className="page-title">Advanced Search</h1>
          <p className="page-subtitle">
            Query workshop database across customer details, registration numbers, dates and staff.
          </p>
        </div>
      </div>

      {/* Search Criteria Card */}
      <div className="saas-card mb-4">
        <div className="saas-card-header">
          <div className="saas-card-title">
            <Filter size={18} className="text-primary" />
            <span>Search Filters</span>
          </div>
        </div>

        <div className="saas-card-body">
          <form onSubmit={handleSearch}>
            <div className="row g-2 g-sm-3 mb-3">
              <div className="col-12 col-sm-6 col-md-3">
                <label className="form-label-saas">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleChange}
                  className="form-control-saas"
                />
              </div>

              <div className="col-12 col-sm-6 col-md-3">
                <label className="form-label-saas">End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleChange}
                  className="form-control-saas"
                />
              </div>

              <div className="col-12 col-sm-6 col-md-3">
                <label className="form-label-saas">Job Card No</label>
                <input
                  type="text"
                  name="jobcardNo"
                  placeholder="e.g. JC-00001"
                  value={filters.jobcardNo}
                  onChange={handleChange}
                  className="form-control-saas"
                />
              </div>

              <div className="col-12 col-sm-6 col-md-3">
                <label className="form-label-saas">Chassis No</label>
                <input
                  type="text"
                  name="chassisNo"
                  placeholder="Chassis number"
                  value={filters.chassisNo}
                  onChange={handleChange}
                  className="form-control-saas"
                />
              </div>
            </div>

            <div className="row g-2 g-sm-3 mb-3">
              <div className="col-12 col-sm-6 col-md-3">
                <label className="form-label-saas">Customer Name</label>
                <input
                  type="text"
                  name="customerName"
                  placeholder="Customer name"
                  value={filters.customerName}
                  onChange={handleChange}
                  className="form-control-saas"
                />
              </div>

              <div className="col-12 col-sm-6 col-md-3">
                <label className="form-label-saas">Customer Mobile</label>
                <input
                  type="text"
                  name="phone"
                  placeholder="Mobile number"
                  value={filters.phone}
                  onChange={handleChange}
                  className="form-control-saas"
                />
              </div>

              <div className="col-12 col-sm-6 col-md-3">
                <label className="form-label-saas">City / Village</label>
                <input
                  type="text"
                  name="city"
                  placeholder="Location / Village"
                  value={filters.city}
                  onChange={handleChange}
                  className="form-control-saas"
                />
              </div>

              <div className="col-12 col-sm-6 col-md-3">
                <label className="form-label-saas">Reg No (Bike No)</label>
                <input
                  type="text"
                  name="regNo"
                  placeholder="e.g. GJ01AB1234"
                  value={filters.regNo}
                  onChange={handleChange}
                  className="form-control-saas"
                />
              </div>
            </div>

            <div className="row g-2 g-sm-3 mb-4">
              <div className="col-12 col-sm-6 col-md-4">
                <label className="form-label-saas">Vehicle Model</label>
                <select
                  name="modelId"
                  value={filters.modelId}
                  onChange={handleChange}
                  className="form-select-saas"
                >
                  <option value="">All Models</option>
                  {availableModels.map((m) => (
                    <option key={m._id} value={m.name}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-12 col-sm-6 col-md-4">
                <label className="form-label-saas">Mechanic Name</label>
                <input
                  type="text"
                  name="mechanicName"
                  placeholder="Mechanic"
                  value={filters.mechanicName}
                  onChange={handleChange}
                  className="form-control-saas"
                />
              </div>

              <div className="col-12 col-sm-6 col-md-4">
                <label className="form-label-saas">Helper Name</label>
                <input
                  type="text"
                  name="helperName"
                  placeholder="Helper"
                  value={filters.helperName}
                  onChange={handleChange}
                  className="form-control-saas"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="d-flex justify-content-end gap-2 pt-3 border-top flex-wrap">
              <button
                type="button"
                onClick={handleReset}
                className="btn-saas btn-saas-secondary"
              >
                <RotateCcw size={15} />
                <span>Reset Form</span>
              </button>
              <button
                type="submit"
                disabled={searching}
                className="btn-saas btn-saas-primary px-4"
              >
                <Search size={15} />
                <span>{searching ? 'Searching...' : 'Search Records'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Results Section */}
      {hasSearched && (
        <div className="saas-card">
          <div className="saas-card-header">
            <div className="saas-card-title">
              <FileText size={18} className="text-primary" />
              <span>Matching Records</span>
            </div>
            <span className="badge bg-light text-secondary border px-3 py-1">
              Found: {results.length}
            </span>
          </div>

          {searching ? (
            <div className="p-4">
              <LoadingSkeleton type="table" rows={4} />
            </div>
          ) : results.length === 0 ? (
            <EmptyState
              icon={<Search size={32} />}
              title="No records found"
              description="No job cards matched your exact filter criteria. Try broadening your dates or clearing specific fields."
              actionLabel="Clear Filters"
              onAction={handleReset}
            />
          ) : (
            <>
              {/* Desktop / Tablet Table */}
              <div className="d-none d-md-block saas-table-container border-0 rounded-0">
                <table className="saas-table">
                  <thead>
                    <tr>
                      <th>Job Card No</th>
                      <th>Date</th>
                      <th>Customer</th>
                      <th>Reg No</th>
                      <th>Model</th>
                      <th className="text-end">Amount</th>
                      <th className="text-center">Status</th>
                      <th className="text-end">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((jc) => (
                      <tr key={jc.jobcard_id || jc._id}>
                        <td className="fw-semibold text-primary">{jc.jobcard_no}</td>
                        <td className="text-secondary small">
                          {new Date(jc.date).toLocaleDateString('en-IN', {
                            timeZone: 'Asia/Kolkata',
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="fw-medium">{jc.customer_name}</td>
                        <td>
                          <span className="badge bg-light text-dark border fw-medium">
                            {jc.reg_no}
                          </span>
                        </td>
                        <td className="text-secondary small">{jc.model_name || '—'}</td>
                        <td className="text-end fw-semibold">₹{(jc.amount || 0).toFixed(2)}</td>
                        <td className="text-center">
                          <StatusBadge status={jc.status} />
                        </td>
                        <td className="text-end">
                          <Link
                            to={`/jobcards/view/${jc.jobcard_id || jc._id}`}
                            className="btn-saas btn-saas-secondary btn-saas-sm"
                          >
                            <Eye size={14} />
                            <span>View</span>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="d-block d-md-none p-3">
                <div className="d-flex flex-column gap-3">
                  {results.map((jc) => (
                    <div
                      key={jc.jobcard_id || jc._id}
                      className="p-3 bg-white rounded-3 border shadow-xs"
                    >
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <Link
                            to={`/jobcards/view/${jc.jobcard_id || jc._id}`}
                            className="fw-bold text-primary fs-6 d-block"
                          >
                            {jc.jobcard_no}
                          </Link>
                          <span className="small text-secondary d-flex align-items-center gap-1">
                            <Calendar size={12} />
                            {new Date(jc.date).toLocaleDateString('en-IN', {
                              timeZone: 'Asia/Kolkata',
                              day: '2-digit',
                              month: 'short',
                            })}
                          </span>
                        </div>
                        <StatusBadge status={jc.status} size="sm" />
                      </div>

                      <div className="d-flex flex-column gap-1 mb-2 pt-2 border-top small">
                        <div className="d-flex align-items-center gap-2">
                          <User size={13} className="text-secondary" />
                          <span className="fw-medium">{jc.customer_name}</span>
                        </div>
                        <div className="d-flex align-items-center justify-content-between">
                          <div className="d-flex align-items-center gap-2">
                            <Car size={13} className="text-secondary" />
                            <span className="text-secondary">{jc.model_name || 'Vehicle'}</span>
                          </div>
                          <span className="badge bg-light text-dark border">
                            {jc.reg_no}
                          </span>
                        </div>
                      </div>

                      <div className="d-flex justify-content-between align-items-center pt-2 border-top">
                        <div className="fw-bold text-primary">
                          ₹{(jc.amount || 0).toFixed(2)}
                        </div>
                        <Link
                          to={`/jobcards/view/${jc.jobcard_id || jc._id}`}
                          className="btn-saas btn-saas-secondary btn-saas-sm"
                        >
                          <Eye size={14} />
                          <span>View Details</span>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchJobcard;
