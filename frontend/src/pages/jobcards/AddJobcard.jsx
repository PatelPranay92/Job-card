import { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Card, InputGroup } from 'react-bootstrap';
import { Plus, Trash2, Search, Car, User, Wrench, Package, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import api from '../../api/axios';

const AddJobcard = () => {
    const navigate = useNavigate();

    // Jobcard Metadata
    const [jobcardNo, setJobcardNo] = useState('New');
    // Get current date in Indian Standard Time (IST)
    const getIndianDate = () => {
        const now = new Date();
        const istDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
        return istDate.toISOString().split('T')[0];
    };
    const [date, setDate] = useState(getIndianDate());

    // Model state
    const [availableModels, setAvailableModels] = useState([]);

    useEffect(() => {
        const fetchModels = async () => {
            try {
                const res = await api.get('/models');
                setAvailableModels(res.data);
            } catch (err) { console.error(err); }
        };
        fetchModels();
    }, []);

    const [customer, setCustomer] = useState({
        name: '',
        phone: '',
        address: '',
        city: ''
    });

    // Vehicle Info
    const [vehicle, setVehicle] = useState({
        regNo: '',
        modelId: '',
        chassisNo: '',
        engineNo: '',
        km: '',
        petrol: '',
        keyNo: '',
        vehicleType: '',
        mechanicName: '',
        helperName: '',
        remarks: ''
    });

    // Service Details
    const [services, setServices] = useState([{ name: '', amount: '' }]);
    const [parts, setParts] = useState([{ name: '', amount: '' }]);
    const [labour, setLabour] = useState([{ name: '', amount: '' }]);

    // Totals
    const [totals, setTotals] = useState({
        service: 0,
        parts: 0,
        labour: 0,
        grandTotal: 0
    });

    // Update totals whenever line items change
    useEffect(() => {
        const calc = (items) => items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
        const sTotal = calc(services);
        const pTotal = calc(parts);
        const lTotal = calc(labour);

        setTotals({
            service: sTotal,
            parts: pTotal,
            labour: lTotal,
            grandTotal: sTotal + pTotal + lTotal
        });
    }, [services, parts, labour]);

    // Handlers for dynamic rows
    const addRow = (setter) => setter(prev => [...prev, { name: '', amount: '' }]);
    const removeRow = (setter, index) => setter(prev => prev.filter((_, i) => i !== index));
    const updateRow = (setter, index, field, value) => {
        setter(prev => {
            const newRows = [...prev];
            newRows[index][field] = value;
            return newRows;
        });
    };

    const handleCustomerChange = (e) => setCustomer({ ...customer, [e.target.name]: e.target.value.toUpperCase() });
    const handleVehicleChange = (e) => setVehicle({ ...vehicle, [e.target.name]: e.target.value.toUpperCase() });

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            date,
            customer_name: customer.name,
            phone: customer.phone,
            address: customer.address,
            city: customer.city,
            reg_no: vehicle.regNo,
            model_name: vehicle.modelId, // Assuming ID or Name
            chassis_no: vehicle.chassisNo,
            engine_no: vehicle.engineNo,
            km: vehicle.km,
            petrol: vehicle.petrol,
            key_no: vehicle.keyNo,
            vehicle_type: vehicle.vehicleType,
            mechanic_name: vehicle.mechanicName,
            helper_name: vehicle.helperName,
            remarks: vehicle.remarks,
            services: services.filter(s => s.name && s.amount),
            parts: parts.filter(p => p.name && p.amount),
            labour: labour.filter(l => l.name && l.amount),
            amount: totals.grandTotal,
            remaining: totals.grandTotal,
            paid: 0,
            status: 'Unpaid'
        };

        try {
            await api.post('/jobcards', payload);
            alert('Jobcard saved successfully!');
            navigate('/');
        } catch (err) {
            console.error(err);
            alert('Error saving jobcard: ' + (err.response?.data?.message || err.message));
        }
    };

    const autofillCustomerByRegNo = async () => {
        if (!vehicle.regNo) {
            alert('Please enter a registration number first');
            return;
        }

        try {
            // Search for existing jobcard with this reg number
            const res = await api.get(`/jobcards?reg_no=${vehicle.regNo}`);

            if (res.data && res.data.length > 0) {
                // Get the most recent jobcard for this vehicle
                const latestJobcard = res.data[0];

                // Auto-fill customer details
                setCustomer({
                    name: latestJobcard.customer_name || '',
                    phone: latestJobcard.phone || '',
                    address: latestJobcard.address || '',
                    city: latestJobcard.city || ''
                });

                // Auto-fill vehicle details
                setVehicle(prev => ({
                    ...prev,
                    modelId: latestJobcard.model_name || prev.modelId,
                    chassisNo: latestJobcard.chassis_no || prev.chassisNo,
                    engineNo: latestJobcard.engine_no || prev.engineNo
                }));

                alert('Customer and vehicle details loaded from previous jobcard!');
            } else {
                alert('No previous jobcard found for this registration number. Please enter customer details manually.');
            }
        } catch (err) {
            console.error(err);
            alert('Error searching for customer: ' + (err.response?.data?.message || err.message));
        }
    };

    return (
        <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="text-primary fw-bold">Add Jobcard</h2>
                <div className="d-flex align-items-center gap-3">
                    <div className="text-muted">
                        <small>Jobcard No: <strong>{jobcardNo}</strong></small>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                        <small className="text-muted">Date:</small>
                        <Form.Control
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            style={{
                                width: '160px',
                                fontSize: '0.9rem',
                                padding: '0.25rem 0.5rem'
                            }}
                        />
                    </div>
                </div>
            </div>

            <Form onSubmit={handleSubmit}>

                {/* Customer Details Section */}
                <Card className="card-custom mb-4">
                    <Card.Header className="bg-white border-bottom-0 pt-3">
                        <h5 className="mb-0 text-secondary"><User size={20} className="me-2" />Customer Details</h5>
                    </Card.Header>
                    <Card.Body>
                        <Row className="g-3">
                            <Col md={3}>
                                <Form.Label>Phone No</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="phone"
                                    value={customer.phone}
                                    onChange={handleCustomerChange}
                                    placeholder="Enter phone number"
                                    maxLength={10}
                                />
                            </Col>
                            <Col md={3}>
                                <Form.Label>Customer Name</Form.Label>
                                <Form.Control type="text" name="name" value={customer.name} onChange={handleCustomerChange} required />
                            </Col>
                            <Col md={3}>
                                <Form.Label>Address</Form.Label>
                                <Form.Control type="text" name="address" value={customer.address} onChange={handleCustomerChange} />
                            </Col>
                            <Col md={3}>
                                <Form.Label>City</Form.Label>
                                <Form.Control type="text" name="city" value={customer.city} onChange={handleCustomerChange} />
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                {/* Vehicle Details Section */}
                <Card className="card-custom mb-4">
                    <Card.Header className="bg-white border-bottom-0 pt-3">
                        <h5 className="mb-0 text-secondary"><Car size={20} className="me-2" />Vehicle Details</h5>
                    </Card.Header>
                    <Card.Body>
                        <Row className="g-3">
                            <Col md={2}>
                                <Form.Label>Reg No</Form.Label>
                                <InputGroup>
                                    <Form.Control
                                        type="text"
                                        name="regNo"
                                        value={vehicle.regNo}
                                        onChange={handleVehicleChange}
                                        placeholder="Enter reg no"
                                        required
                                    />
                                    <Button variant="outline-primary" onClick={autofillCustomerByRegNo} title="Search customer by Reg No">
                                        <Search size={16} />
                                    </Button>
                                </InputGroup>
                            </Col>
                            <Col md={3}>
                                <Form.Label>Model</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text>
                                        <Car size={16} />
                                    </InputGroup.Text>
                                    <Form.Select
                                        name="modelId"
                                        value={vehicle.modelId}
                                        onChange={handleVehicleChange}
                                        style={{
                                            cursor: 'pointer',
                                            fontWeight: vehicle.modelId ? '600' : 'normal'
                                        }}
                                    >
                                        <option value="">
                                            {availableModels.length > 0 ? 'Select Model' : 'No models available'}
                                        </option>
                                        {availableModels.map(model => (
                                            <option key={model._id} value={model.name}>
                                                {model.name}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </InputGroup>
                                {availableModels.length === 0 && (
                                    <Form.Text className="text-muted">
                                        <small>
                                            No models found. <a href="/models/add" target="_blank" rel="noopener noreferrer">Add a model</a> first.
                                        </small>
                                    </Form.Text>
                                )}
                            </Col>
                            <Col md={2}>
                                <Form.Label>Chassis No</Form.Label>
                                <Form.Control type="text" name="chassisNo" value={vehicle.chassisNo} onChange={handleVehicleChange} />
                            </Col>
                            <Col md={2}>
                                <Form.Label>Engine No</Form.Label>
                                <Form.Control type="text" name="engineNo" value={vehicle.engineNo} onChange={handleVehicleChange} />
                            </Col>
                            <Col md={1}>
                                <Form.Label>KM</Form.Label>
                                <Form.Control type="number" name="km" value={vehicle.km} onChange={handleVehicleChange} />
                            </Col>
                            <Col md={1}>
                                <Form.Label>Petrol</Form.Label>
                                <Form.Select name="petrol" value={vehicle.petrol} onChange={handleVehicleChange}>
                                    <option value="">Select</option>
                                    <option value="E">Empty</option>
                                    <option value="1/4">1/4</option>
                                    <option value="1/2">1/2</option>
                                    <option value="3/4">3/4</option>
                                    <option value="F">Full</option>
                                </Form.Select>
                            </Col>
                            {/* <Col md={2}>
                                <Form.Label>Key No</Form.Label>
                                <Form.Control type="text" name="keyNo" value={vehicle.keyNo} onChange={handleVehicleChange} />
                            </Col> */}
                        </Row>
                        <Row className="g-3 mt-2">
                            <Col md={3}>
                                <Form.Label>Mechanic Name</Form.Label>
                                <Form.Control type="text" name="mechanicName" value={vehicle.mechanicName} onChange={handleVehicleChange} />
                            </Col>
                            <Col md={3}>
                                <Form.Label>Helper Name</Form.Label>
                                <Form.Control type="text" name="helperName" value={vehicle.helperName} onChange={handleVehicleChange} />
                            </Col>
                            <Col md={2}>
                                <Form.Label>Vehicle Type</Form.Label>
                                <Form.Select name="vehicleType" value={vehicle.vehicleType} onChange={handleVehicleChange}>
                                    <option value="Bike">Bike</option>
                                    <option value="Scooter">Scooter</option>
                                    <option value="Car">Car</option>
                                </Form.Select>
                            </Col>
                            <Col md={4}>
                                <Form.Label>Remarks</Form.Label>
                                <Form.Control type="text" name="remarks" value={vehicle.remarks} onChange={handleVehicleChange} placeholder="Any specific issues..." />
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                {/* Services, Parts, Labour Grid */}
                <Row>
                    {/* Services */}
                    <Col lg={4}>
                        <Card className="card-custom h-100">
                            <Card.Header className="bg-light border-bottom pt-3 d-flex justify-content-between align-items-center">
                                <h6 className="mb-0 text-primary"><Wrench size={18} className="me-1" /> Services</h6>
                                <Button size="sm" variant="outline-primary" onClick={() => addRow(setServices)}><Plus size={14} /></Button>
                            </Card.Header>
                            <Card.Body className="p-2">
                                {services.map((svc, i) => (
                                    <div key={i} className="d-flex mb-2 gap-2">
                                        <Form.Control
                                            size="sm"
                                            placeholder="Service Name"
                                            value={svc.name}
                                            onChange={(e) => updateRow(setServices, i, 'name', e.target.value.toUpperCase())}
                                        />
                                        <Form.Control
                                            size="sm"
                                            type="number"
                                            placeholder="Amount"
                                            value={svc.amount}
                                            onChange={(e) => updateRow(setServices, i, 'amount', e.target.value)}
                                            style={{ width: '80px' }}
                                        />
                                        <Button size="sm" variant="outline-danger" onClick={() => removeRow(setServices, i)} tabIndex="-1">
                                            <Trash2 size={14} />
                                        </Button>
                                    </div>
                                ))}
                                <div className="text-end fw-bold mt-2 text-primary">Total: ₹ {totals.service.toFixed(2)}</div>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Parts */}
                    <Col lg={4}>
                        <Card className="card-custom h-100">
                            <Card.Header className="bg-light border-bottom pt-3 d-flex justify-content-between align-items-center">
                                <h6 className="mb-0 text-success"><Package size={18} className="me-1" /> Parts</h6>
                                <Button size="sm" variant="outline-success" onClick={() => addRow(setParts)}><Plus size={14} /></Button>
                            </Card.Header>
                            <Card.Body className="p-2">
                                {parts.map((prt, i) => (
                                    <div key={i} className="d-flex mb-2 gap-2">
                                        <Form.Control
                                            size="sm"
                                            placeholder="Part Name"
                                            value={prt.name}
                                            onChange={(e) => updateRow(setParts, i, 'name', e.target.value.toUpperCase())}
                                        />
                                        <Form.Control
                                            size="sm"
                                            type="number"
                                            placeholder="Amount"
                                            value={prt.amount}
                                            onChange={(e) => updateRow(setParts, i, 'amount', e.target.value)}
                                            style={{ width: '80px' }}
                                        />
                                        <Button size="sm" variant="outline-danger" onClick={() => removeRow(setParts, i)} tabIndex="-1">
                                            <Trash2 size={14} />
                                        </Button>
                                    </div>
                                ))}
                                <div className="text-end fw-bold mt-2 text-success">Total: ₹ {totals.parts.toFixed(2)}</div>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Labour */}
                    <Col lg={4}>
                        <Card className="card-custom h-100">
                            <Card.Header className="bg-light border-bottom pt-3 d-flex justify-content-between align-items-center">
                                <h6 className="mb-0 text-info"><Briefcase size={18} className="me-1" /> Labour</h6>
                                <Button size="sm" variant="outline-info" onClick={() => addRow(setLabour)}><Plus size={14} /></Button>
                            </Card.Header>
                            <Card.Body className="p-2">
                                {labour.map((lbr, i) => (
                                    <div key={i} className="d-flex mb-2 gap-2">
                                        <Form.Control
                                            size="sm"
                                            placeholder="Labour Name"
                                            value={lbr.name}
                                            onChange={(e) => updateRow(setLabour, i, 'name', e.target.value.toUpperCase())}
                                        />
                                        <Form.Control
                                            size="sm"
                                            type="number"
                                            placeholder="Amount"
                                            value={lbr.amount}
                                            onChange={(e) => updateRow(setLabour, i, 'amount', e.target.value)}
                                            style={{ width: '80px' }}
                                        />
                                        <Button size="sm" variant="outline-danger" onClick={() => removeRow(setLabour, i)} tabIndex="-1">
                                            <Trash2 size={14} />
                                        </Button>
                                    </div>
                                ))}
                                <div className="text-end fw-bold mt-2 text-info">Total: ₹ {totals.labour.toFixed(2)}</div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* Grand Total & Submit */}
                <Card className="card-custom mt-4 bg-light border-primary">
                    <Card.Body className="d-flex justify-content-between align-items-center">
                        <h4 className="mb-0">Grand Total: <span className="text-primary fw-bold">₹ {totals.grandTotal.toFixed(2)}</span></h4>
                        <div className="d-flex gap-2">
                            <Button variant="secondary" onClick={() => navigate('/')}>Cancel</Button>
                            <Button variant="primary" type="submit" size="lg" className="px-5">Save Jobcard</Button>
                        </div>
                    </Card.Body>
                </Card>

            </Form>
        </div>
    );
};

export default AddJobcard;
