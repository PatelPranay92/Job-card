import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  User,
  Car,
  Package,
  Wrench,
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  Calendar,
  Gauge,
} from 'lucide-react';
import api from '../../api/axios';
import LoadingSkeleton from '../../components/LoadingSkeleton';

const EditJobcard = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [jobcardNo, setJobcardNo] = useState('');
  const [date, setDate] = useState('');
  const [availableModels, setAvailableModels] = useState([]);

  // Customer Information
  const [customer, setCustomer] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
  });

  // Vehicle Information
  const [vehicle, setVehicle] = useState({
    regNo: '',
    modelId: '',
    chassisNo: '',
    engineNo: '',
    km: '',
    petrol: '',
    keyNo: '',
    vehicleType: 'Bike',
    mechanicName: '',
    helperName: '',
    remarks: '',
  });

  // Line items
  const [parts, setParts] = useState([{ name: '', amount: '' }]);
  const [labour, setLabour] = useState([{ name: '', amount: '' }]);
  const [services, setServices] = useState([{ name: '', amount: '' }]);

  // Totals
  const [totals, setTotals] = useState({
    parts: 0,
    labour: 0,
    services: 0,
    grandTotal: 0,
  });

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

  useEffect(() => {
    const fetchJobcard = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/jobcards/${id}`);
        const found = res.data;

        setJobcardNo(found.jobcard_no || '');
        if (found.date) {
          setDate(new Date(found.date).toISOString().split('T')[0]);
        }

        setCustomer({
          name: found.customer_name || '',
          phone: found.phone || '',
          address: found.address || '',
          city: found.city || '',
        });

        setVehicle({
          regNo: found.reg_no || '',
          modelId: found.model_name || '',
          chassisNo: found.chassis_no || '',
          engineNo: found.engine_no || '',
          km: found.km || '',
          petrol: found.petrol || '',
          keyNo: found.key_no || '',
          vehicleType: found.vehicle_type || 'Bike',
          mechanicName: found.mechanic_name || '',
          helperName: found.helper_name || '',
          remarks: found.remarks || '',
        });

        if (found.parts && found.parts.length > 0) setParts(found.parts);
        if (found.labour && found.labour.length > 0) setLabour(found.labour);
        if (found.services && found.services.length > 0) setServices(found.services);
      } catch (err) {
        console.error('Error loading job card:', err);
        alert('Could not find job card');
        navigate('/jobcards');
      } finally {
        setLoading(false);
      }
    };

    fetchJobcard();
  }, [id, navigate]);

  useEffect(() => {
    const calc = (items) =>
      items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

    const pTotal = calc(parts);
    const lTotal = calc(labour);
    const sTotal = calc(services);

    setTotals({
      parts: pTotal,
      labour: lTotal,
      services: sTotal,
      grandTotal: pTotal + lTotal + sTotal,
    });
  }, [parts, labour, services]);

  const addRow = (setter) => setter((prev) => [...prev, { name: '', amount: '' }]);
  const removeRow = (setter, index) =>
    setter((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : [{ name: '', amount: '' }]));
  const updateRow = (setter, index, field, value) => {
    setter((prev) => {
      const copy = [...prev];
      copy[index][field] = value;
      return copy;
    });
  };

  const handleCustomerChange = (e) =>
    setCustomer({ ...customer, [e.target.name]: e.target.value.toUpperCase() });

  const handleVehicleChange = (e) =>
    setVehicle({ ...vehicle, [e.target.name]: e.target.value.toUpperCase() });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      date,
      customer_name: customer.name.trim(),
      phone: customer.phone.trim(),
      address: customer.address.trim(),
      city: customer.city.trim(),
      reg_no: vehicle.regNo.trim(),
      model_name: vehicle.modelId,
      chassis_no: vehicle.chassisNo,
      engine_no: vehicle.engineNo,
      km: vehicle.km,
      petrol: vehicle.petrol,
      key_no: vehicle.keyNo,
      vehicle_type: vehicle.vehicleType,
      mechanic_name: vehicle.mechanicName,
      helper_name: vehicle.helperName,
      remarks: vehicle.remarks,
      services: services.filter((s) => s.name && s.amount),
      parts: parts.filter((p) => p.name && p.amount),
      labour: labour.filter((l) => l.name && l.amount),
      amount: totals.grandTotal,
      remaining: totals.grandTotal,
    };

    try {
      setSubmitting(true);
      await api.put(`/jobcards/${id}`, payload);
      alert('Job Card updated successfully!');
      navigate('/jobcards');
    } catch (err) {
      console.error(err);
      alert('Error updating job card: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div>
        <div className="page-header-saas">
          <div>
            <h1 className="page-title">Edit Job Card</h1>
          </div>
        </div>
        <LoadingSkeleton type="form" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header-saas">
        <div>
          <Link
            to="/jobcards"
            className="text-decoration-none text-secondary small d-inline-flex align-items-center gap-1 mb-1"
          >
            <ArrowLeft size={14} /> Back to Job Cards
          </Link>
          <div className="d-flex align-items-center gap-2 gap-sm-3 flex-wrap">
            <h1 className="page-title">Edit Job Card</h1>
            <span className="badge bg-primary-light text-primary border border-primary-subtle px-3 py-1 fs-6 fw-bold">
              {jobcardNo}
            </span>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2 bg-white px-3 py-2 rounded-2 border">
          <Calendar size={15} className="text-secondary" />
          <span className="small text-secondary">Date:</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border-0 p-0 text-primary fw-semibold small bg-transparent outline-none"
            style={{ outline: 'none' }}
            aria-label="Job card date"
          />
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Customer Information */}
        <div className="form-section-card">
          <div className="form-section-header">
            <div
              className="d-flex align-items-center justify-content-center"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
              }}
            >
              <User size={18} />
            </div>
            <div>
              <div className="form-section-title">Customer Information</div>
              <div className="form-section-subtitle">
                Update customer details and contact number
              </div>
            </div>
          </div>

          <div className="row g-2 g-sm-3">
            <div className="col-12 col-sm-6 col-lg-3">
              <label className="form-label-saas">Phone Number</label>
              <input
                type="text"
                name="phone"
                value={customer.phone}
                onChange={handleCustomerChange}
                placeholder="10-digit mobile"
                maxLength={10}
                className="form-control-saas"
              />
            </div>

            <div className="col-12 col-sm-6 col-lg-3">
              <label className="form-label-saas">
                Customer Name<span className="required-star">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={customer.name}
                onChange={handleCustomerChange}
                required
                className="form-control-saas"
              />
            </div>

            <div className="col-12 col-sm-6 col-lg-3">
              <label className="form-label-saas">Address</label>
              <input
                type="text"
                name="address"
                value={customer.address}
                onChange={handleCustomerChange}
                className="form-control-saas"
              />
            </div>

            <div className="col-12 col-sm-6 col-lg-3">
              <label className="form-label-saas">City / Village</label>
              <input
                type="text"
                name="city"
                value={customer.city}
                onChange={handleCustomerChange}
                className="form-control-saas"
              />
            </div>
          </div>
        </div>

        {/* Vehicle Information */}
        <div className="form-section-card">
          <div className="form-section-header">
            <div
              className="d-flex align-items-center justify-content-center"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'var(--info-light)',
                color: 'var(--info)',
              }}
            >
              <Car size={18} />
            </div>
            <div>
              <div className="form-section-title">Vehicle Information</div>
              <div className="form-section-subtitle">
                Registration, model, fuel and mechanic assignments
              </div>
            </div>
          </div>

          <div className="row g-2 g-sm-3">
            <div className="col-12 col-sm-6 col-lg-3">
              <label className="form-label-saas">
                Registration No<span className="required-star">*</span>
              </label>
              <input
                type="text"
                name="regNo"
                value={vehicle.regNo}
                onChange={handleVehicleChange}
                required
                className="form-control-saas"
              />
            </div>

            <div className="col-12 col-sm-6 col-lg-3">
              <label className="form-label-saas">Vehicle Model</label>
              <select
                name="modelId"
                value={vehicle.modelId}
                onChange={handleVehicleChange}
                className="form-select-saas"
              >
                <option value="">Select Vehicle Model</option>
                {availableModels.map((m) => (
                  <option key={m._id} value={m.name}>
                    {m.name} ({m.type || 'Bike'})
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12 col-sm-6 col-lg-3">
              <label className="form-label-saas">Odometer Reading (KM)</label>
              <div className="position-relative">
                <input
                  type="number"
                  name="km"
                  value={vehicle.km}
                  onChange={handleVehicleChange}
                  className="form-control-saas"
                />
                <Gauge
                  size={14}
                  className="position-absolute text-tertiary"
                  style={{ right: '12px', top: '50%', transform: 'translateY(-50%)' }}
                />
              </div>
            </div>

            <div className="col-12 col-sm-6 col-lg-3">
              <label className="form-label-saas">Fuel Level</label>
              <select
                name="petrol"
                value={vehicle.petrol}
                onChange={handleVehicleChange}
                className="form-select-saas"
              >
                <option value="">Select Level</option>
                <option value="E">E — Empty</option>
                <option value="1/4">1/4 Tank</option>
                <option value="1/2">1/2 Tank</option>
                <option value="3/4">3/4 Tank</option>
                <option value="F">F — Full</option>
              </select>
            </div>

            <div className="col-12 col-sm-6 col-lg-3">
              <label className="form-label-saas">Mechanic Name</label>
              <input
                type="text"
                name="mechanicName"
                value={vehicle.mechanicName}
                onChange={handleVehicleChange}
                className="form-control-saas"
              />
            </div>

            <div className="col-12 col-sm-6 col-lg-3">
              <label className="form-label-saas">Helper Name</label>
              <input
                type="text"
                name="helperName"
                value={vehicle.helperName}
                onChange={handleVehicleChange}
                className="form-control-saas"
              />
            </div>

            <div className="col-12 col-lg-6">
              <label className="form-label-saas">Remarks / Issues</label>
              <input
                type="text"
                name="remarks"
                value={vehicle.remarks}
                onChange={handleVehicleChange}
                className="form-control-saas"
              />
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="row g-3 mb-4">
          {/* Parts */}
          <div className="col-12 col-lg-6">
            <div className="saas-card h-100">
              <div className="saas-card-header flex-wrap gap-2">
                <div className="saas-card-title text-success">
                  <Package size={18} />
                  <span>Replacement Parts</span>
                </div>
                <button
                  type="button"
                  onClick={() => addRow(setParts)}
                  className="btn-saas btn-saas-secondary btn-saas-sm"
                  style={{ minHeight: '34px' }}
                >
                  <Plus size={14} /> Add Part
                </button>
              </div>

              <div className="saas-card-body p-2 p-sm-3">
                <div className="d-flex flex-column gap-2">
                  {parts.map((item, idx) => (
                    <div key={idx} className="d-flex align-items-center gap-1 gap-sm-2">
                      <input
                        type="text"
                        placeholder="Part name"
                        value={item.name}
                        onChange={(e) =>
                          updateRow(setParts, idx, 'name', e.target.value.toUpperCase())
                        }
                        className="form-control-saas flex-grow-1"
                        style={{ minWidth: '100px' }}
                      />
                      <div className="position-relative" style={{ width: '100px', flexShrink: 0 }}>
                        <span
                          className="position-absolute text-secondary"
                          style={{ left: '8px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px' }}
                        >
                          ₹
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Amount"
                          value={item.amount}
                          onChange={(e) => updateRow(setParts, idx, 'amount', e.target.value)}
                          className="form-control-saas"
                          style={{ paddingLeft: '20px' }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeRow(setParts, idx)}
                        className="btn-saas btn-saas-outline-danger btn-saas-icon flex-shrink-0"
                        style={{ width: '36px', height: '36px' }}
                        aria-label="Remove part"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                  <span className="small text-secondary">Parts Subtotal:</span>
                  <span className="fw-bold text-success fs-6">
                    ₹{totals.parts.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Labour */}
          <div className="col-12 col-lg-6">
            <div className="saas-card h-100">
              <div className="saas-card-header flex-wrap gap-2">
                <div className="saas-card-title text-primary">
                  <Wrench size={18} />
                  <span>Labour & Services</span>
                </div>
                <button
                  type="button"
                  onClick={() => addRow(setLabour)}
                  className="btn-saas btn-saas-secondary btn-saas-sm"
                  style={{ minHeight: '34px' }}
                >
                  <Plus size={14} /> Add Labour
                </button>
              </div>

              <div className="saas-card-body p-2 p-sm-3">
                <div className="d-flex flex-column gap-2">
                  {labour.map((item, idx) => (
                    <div key={idx} className="d-flex align-items-center gap-1 gap-sm-2">
                      <input
                        type="text"
                        placeholder="Labour work"
                        value={item.name}
                        onChange={(e) =>
                          updateRow(setLabour, idx, 'name', e.target.value.toUpperCase())
                        }
                        className="form-control-saas flex-grow-1"
                        style={{ minWidth: '100px' }}
                      />
                      <div className="position-relative" style={{ width: '100px', flexShrink: 0 }}>
                        <span
                          className="position-absolute text-secondary"
                          style={{ left: '8px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px' }}
                        >
                          ₹
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Amount"
                          value={item.amount}
                          onChange={(e) => updateRow(setLabour, idx, 'amount', e.target.value)}
                          className="form-control-saas"
                          style={{ paddingLeft: '20px' }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeRow(setLabour, idx)}
                        className="btn-saas btn-saas-outline-danger btn-saas-icon flex-shrink-0"
                        style={{ width: '36px', height: '36px' }}
                        aria-label="Remove labour"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                  <span className="small text-secondary">Labour Subtotal:</span>
                  <span className="fw-bold text-primary fs-6">
                    ₹{totals.labour.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cost Summary & Actions */}
        <div className="saas-card p-3 p-sm-4 mb-4">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <div className="small text-secondary">Updated Total Bill</div>
              <div className="fs-3 fw-bold text-primary">
                ₹{totals.grandTotal.toFixed(2)}
              </div>
            </div>

            <div className="d-flex align-items-center gap-2 w-100 w-sm-auto justify-content-between justify-content-sm-end">
              <button
                type="button"
                onClick={() => navigate('/jobcards')}
                className="btn-saas btn-saas-secondary flex-grow-1 flex-sm-grow-0"
                style={{ minHeight: '44px' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn-saas btn-saas-primary flex-grow-1 flex-sm-grow-0 px-4"
                style={{ minHeight: '44px' }}
              >
                <Save size={16} />
                <span>{submitting ? 'Saving...' : 'Update Job Card'}</span>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditJobcard;
