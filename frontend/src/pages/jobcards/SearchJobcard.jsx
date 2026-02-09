import { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Card, Table, Badge } from 'react-bootstrap';
import { Search, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const SearchJobcard = () => {
    const [filters, setFilters] = useState({
        startDate: '', endDate: '', jobcardNo: '', chassisNo: '',
        customerName: '', city: '', modelId: '', regNo: '',
        mechanicName: '', helperName: '', phone: ''
    });

    const [availableModels, setAvailableModels] = useState([]);
    const [results, setResults] = useState([]);
    const [hasSearched, setHasSearched] = useState(false);

    useEffect(() => {
        const fetchModels = async () => {
            try {
                const res = await api.get('/models');
                setAvailableModels(res.data);
            } catch (err) { console.error(err); }
        };
        fetchModels();
    }, []);

    const handleChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value.toUpperCase() });
    };

    const handleReset = () => {
        setFilters({
            startDate: '', endDate: '', jobcardNo: '', chassisNo: '',
            customerName: '', city: '', modelId: '', regNo: '',
            mechanicName: '', helperName: '', phone: ''
        });
        setResults([]);
        setHasSearched(false);
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/jobcards/search', filters);
            setResults(res.data);
            setHasSearched(true);
        } catch (err) {
            console.error(err);
            alert('Error searching jobcards');
        }
    };

    return (
        <div className="container-fluid">
            <h2 className="text-primary fw-bold mb-4">Search Jobcard</h2>

            <Card className="card-custom mb-4">
                <Card.Header className="bg-white border-bottom-0 pt-3">
                    <h5 className="mb-0 text-secondary">Search Criteria</h5>
                </Card.Header>
                <Card.Body>
                    <Form onSubmit={handleSearch}>
                        <Row className="g-3 mb-3">
                            <Col md={3}>
                                <Form.Label>Start Date</Form.Label>
                                <Form.Control type="date" name="startDate" value={filters.startDate} onChange={handleChange} />
                            </Col>
                            <Col md={3}>
                                <Form.Label>End Date</Form.Label>
                                <Form.Control type="date" name="endDate" value={filters.endDate} onChange={handleChange} />
                            </Col>
                            <Col md={3}>
                                <Form.Label>Jobcard No</Form.Label>
                                <Form.Control type="text" name="jobcardNo" value={filters.jobcardNo} onChange={handleChange} />
                            </Col>
                            <Col md={3}>
                                <Form.Label>Chassis No</Form.Label>
                                <Form.Control type="text" name="chassisNo" value={filters.chassisNo} onChange={handleChange} />
                            </Col>
                        </Row>

                        <Row className="g-3 mb-3">
                            <Col md={3}>
                                <Form.Label>Customer Name</Form.Label>
                                <Form.Control type="text" name="customerName" value={filters.customerName} onChange={handleChange} />
                            </Col>
                            <Col md={3}>
                                <Form.Label>City / Village</Form.Label>
                                <Form.Control type="text" name="city" value={filters.city} onChange={handleChange} />
                            </Col>
                            <Col md={3}>
                                <Form.Label>Model</Form.Label>
                                <Form.Select name="modelId" value={filters.modelId} onChange={handleChange}>
                                    <option value="">Select</option>
                                    {availableModels.map(model => (
                                        <option key={model._id} value={model.name}>{model.name}</option>
                                    ))}
                                </Form.Select>
                            </Col>
                            <Col md={3}>
                                <Form.Label>Reg No (Bike No)</Form.Label>
                                <Form.Control type="text" name="regNo" value={filters.regNo} onChange={handleChange} placeholder="Bike No" />
                            </Col>
                        </Row>

                        <Row className="g-3 mb-4">
                            <Col md={3}>
                                <Form.Label>Mechanic</Form.Label>
                                <Form.Control type="text" name="mechanicName" value={filters.mechanicName} onChange={handleChange} />
                            </Col>
                            <Col md={3}>
                                <Form.Label>Helper</Form.Label>
                                <Form.Control type="text" name="helperName" value={filters.helperName} onChange={handleChange} />
                            </Col>
                            <Col md={3}>
                                <Form.Label>Customer Mobile</Form.Label>
                                <Form.Control type="text" name="phone" value={filters.phone} onChange={handleChange} />
                            </Col>
                        </Row>

                        <div className="d-flex gap-2 justify-content-center">
                            <Button variant="secondary" onClick={handleReset}><RotateCcw size={16} className="me-1" /> Reset</Button>
                            <Button variant="primary" type="submit" className="px-4"><Search size={16} className="me-1" /> Search</Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>

            {hasSearched && (
                <Card className="card-custom">
                    <Card.Body>
                        <h5>Search Results ({results.length})</h5>
                        <div className="table-responsive">
                            <Table hover className="table-custom text-center align-middle mt-3">
                                <thead>
                                    <tr>
                                        <th>Jobcard No</th>
                                        <th>Date</th>
                                        <th>Customer</th>
                                        <th>Reg No</th>
                                        <th>Model</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {results.length > 0 ? (
                                        results.map((jc) => (
                                            <tr key={jc.jobcard_id} className={jc.payment_status === 'Unpaid' ? 'table-danger' : ''}>
                                                <td className="fw-bold">{jc.jobcard_no}</td>
                                                <td>{new Date(jc.date).toLocaleDateString('en-IN', {
                                                    timeZone: 'Asia/Kolkata',
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    year: 'numeric'
                                                })}</td>
                                                <td>{jc.customer_name}</td>
                                                <td>{jc.reg_no}</td>
                                                <td>{jc.model_name}</td>
                                                <td>₹ {jc.amount.toFixed(2)}</td>
                                                <td>
                                                    <Badge bg={jc.status === 'Paid' ? 'success' : jc.status === 'Partial' ? 'warning' : 'danger'}>
                                                        {jc.status}
                                                    </Badge>
                                                </td>
                                                <td>
                                                    <Link to={`/jobcards/view/${jc.jobcard_id}`} className="btn btn-sm btn-outline-primary">View</Link>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="8" className="text-center py-4">No records found matching your criteria.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        </div>
                    </Card.Body>
                </Card>
            )}
        </div>
    );
};

export default SearchJobcard;
