import { useState, useEffect } from 'react';
import { Card, Form, Button, Table, Alert, Row, Col, InputGroup, Badge } from 'react-bootstrap';
import { Plus, Trash2, Database, Car, Search, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const AddModel = () => {
    const navigate = useNavigate();
    const [models, setModels] = useState([]);
    const [newModel, setNewModel] = useState({ name: '', type: 'Bike' });
    const [message, setMessage] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchModels = async () => {
        try {
            const res = await api.get('/models');
            setModels(res.data);
        } catch (err) {
            console.error('Error fetching models', err);
        }
    };

    useEffect(() => {
        fetchModels();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);
        if (!newModel.name) return;

        setLoading(true);
        try {
            await api.post('/models', newModel);
            setMessage({ type: 'success', text: 'Model added successfully!' });
            setNewModel({ name: '', type: 'Bike' });
            fetchModels();

            // Auto-hide success message after 3 seconds
            setTimeout(() => setMessage(null), 3000);
        } catch (err) {
            setMessage({ type: 'danger', text: err.response?.data?.message || 'Error adding model' });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this model?')) return;
        try {
            await api.delete(`/models/${id}`);
            setMessage({ type: 'success', text: 'Model deleted successfully!' });
            fetchModels();
            setTimeout(() => setMessage(null), 3000);
        } catch (err) {
            setMessage({ type: 'danger', text: 'Error deleting model' });
        }
    };

    const filteredModels = models.filter(model =>
        model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        model.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="text-primary fw-bold">Manage Vehicle Models</h2>
                <Button variant="secondary" onClick={() => navigate('/')}>
                    Back to Home
                </Button>
            </div>

            {message && (
                <Alert
                    variant={message.type}
                    dismissible
                    onClose={() => setMessage(null)}
                    className="d-flex align-items-center"
                >
                    {message.type === 'success' && <CheckCircle size={20} className="me-2" />}
                    {message.text}
                </Alert>
            )}

            <Row>
                <Col lg={4}>
                    <Card className="card-custom mb-4">
                        <Card.Header className="bg-white border-bottom-0 pt-3">
                            <h5 className="mb-0 text-secondary">
                                <Plus size={20} className="me-2" />
                                Add New Model
                            </h5>
                        </Card.Header>
                        <Card.Body>
                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Model Name</Form.Label>
                                    <InputGroup>
                                        <InputGroup.Text>
                                            <Car size={18} />
                                        </InputGroup.Text>
                                        <Form.Control
                                            type="text"
                                            placeholder="e.g. SPLENDOR, ACTIVA"
                                            value={newModel.name}
                                            onChange={(e) => setNewModel({ ...newModel, name: e.target.value.toUpperCase() })}
                                            required
                                        />
                                    </InputGroup>
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <Form.Label>Vehicle Type</Form.Label>
                                    <Form.Select
                                        value={newModel.type}
                                        onChange={(e) => setNewModel({ ...newModel, type: e.target.value })}
                                    >
                                        <option value="Bike">Bike</option>
                                        <option value="Scooter">Scooter</option>
                                        <option value="Car">Car</option>
                                    </Form.Select>
                                </Form.Group>

                                <Button
                                    variant="primary"
                                    type="submit"
                                    className="w-100"
                                    size="lg"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span className="loading me-2"></span>
                                            Adding...
                                        </>
                                    ) : (
                                        <>
                                            <Plus size={18} className="me-2" />
                                            Add Model
                                        </>
                                    )}
                                </Button>
                            </Form>

                            <div className="mt-4 p-3 bg-light rounded">
                                <h6 className="text-muted mb-2">Quick Stats</h6>
                                <div className="d-flex justify-content-between">
                                    <span className="text-muted">Total Models:</span>
                                    <Badge bg="primary" className="fs-6">{models.length}</Badge>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={8}>
                    <Card className="card-custom">
                        <Card.Header className="bg-white border-bottom-0 pt-3">
                            <div className="d-flex justify-content-between align-items-center">
                                <h5 className="mb-0 text-secondary">
                                    <Database size={20} className="me-2" />
                                    Existing Models ({filteredModels.length})
                                </h5>
                                <InputGroup style={{ maxWidth: '300px' }}>
                                    <InputGroup.Text>
                                        <Search size={16} />
                                    </InputGroup.Text>
                                    <Form.Control
                                        placeholder="Search models..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </InputGroup>
                            </div>
                        </Card.Header>
                        <Card.Body>
                            <div className="table-responsive" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                                <Table hover className="table-custom mb-0">
                                    <thead className="sticky-top" style={{ backgroundColor: 'var(--bg-color)' }}>
                                        <tr>
                                            <th>#</th>
                                            <th>Model Name</th>
                                            <th>Type</th>
                                            <th className="text-end">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredModels.length > 0 ? (
                                            filteredModels.map((model, index) => (
                                                <tr key={model._id}>
                                                    <td className="text-muted">{index + 1}</td>
                                                    <td className="fw-bold">{model.name}</td>
                                                    <td>
                                                        <Badge
                                                            bg={
                                                                model.type === 'Bike' ? 'primary' :
                                                                    model.type === 'Scooter' ? 'info' :
                                                                        'success'
                                                            }
                                                        >
                                                            {model.type}
                                                        </Badge>
                                                    </td>
                                                    <td className="text-end">
                                                        <Button
                                                            variant="outline-danger"
                                                            size="sm"
                                                            onClick={() => handleDelete(model._id)}
                                                            title="Delete Model"
                                                        >
                                                            <Trash2 size={16} />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="text-center text-muted py-5">
                                                    {searchTerm ? 'No models found matching your search' : 'No models added yet'}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </Table>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default AddModel;
