import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, Table, Button, Row, Col, Badge } from 'react-bootstrap';
import api from '../../api/axios';
import { Printer, ArrowLeft, Trash2 } from 'lucide-react';
import { isAdmin } from '../../utils/auth';


const ViewJobcard = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [jobcard, setJobcard] = useState(null);

    useEffect(() => {
        const fetchJobcard = async () => {
            try {
                const res = await api.get(`/jobcards/${id}`);
                setJobcard(res.data);
            } catch (err) {
                console.error(err);
                alert('Error fetching jobcard');
            }
        };
        fetchJobcard();
    }, [id]);

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this jobcard? This action cannot be undone.')) return;
        try {
            await api.delete(`/jobcards/${id}`);
            alert('Jobcard deleted successfully');
            navigate('/jobcards');
        } catch (err) {
            console.error(err);
            alert('Error deleting jobcard');
        }
    };


    if (!jobcard) {
        return <div className="text-center py-5">Loading...</div>;
    }

    const calculateTotal = (items) => items ? items.reduce((sum, item) => sum + item.amount, 0) : 0;

    const servicesTotal = calculateTotal(jobcard.services);
    const partsTotal = calculateTotal(jobcard.parts);
    const labourTotal = calculateTotal(jobcard.labour);

    return (
        <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <Link to="/jobcards" className="text-decoration-none text-muted mb-2 d-inline-block">
                        <ArrowLeft size={16} /> Back to List
                    </Link>
                    <h2 className="text-primary fw-bold">Jobcard Details</h2>
                </div>
                <div className="d-flex gap-2">
                    <Button variant="primary" as={Link} to={`/jobcards/print-jobcard/${id}`} target="_blank">
                        <Printer size={16} className="me-2" /> Mechanic Jobcard
                    </Button>
                    <Button variant="success" as={Link} to={`/jobcards/print-receipt/${id}`} target="_blank">
                        <Printer size={16} className="me-2" /> Customer Receipt
                    </Button>
                    {isAdmin() && (
                        <Button variant="danger" onClick={handleDelete}>
                            <Trash2 size={16} className="me-2" /> Delete Jobcard
                        </Button>
                    )}
                </div>
            </div>

            <Row className="mb-4">
                <Col md={12}>
                    <Card className="card-custom">
                        <Card.Header className="bg-light border-bottom pt-3">
                            <h5 className="mb-0">Customer & Vehicle Details</h5>
                        </Card.Header>
                        <Card.Body>
                            <Table bordered size="sm">
                                <tbody>
                                    <tr>
                                        <th width="20%" className="bg-light">Jobcard No</th>
                                        <td width="30%" className="fw-bold">{jobcard.jobcard_no}</td>
                                        <th width="20%" className="bg-light">Date</th>
                                        <td width="30%">{new Date(jobcard.date).toLocaleDateString('en-IN', {
                                            timeZone: 'Asia/Kolkata',
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric'
                                        })}</td>
                                    </tr>
                                    <tr>
                                        <th className="bg-light">Customer</th>
                                        <td>{jobcard.customer_name}</td>
                                        <th className="bg-light">Phone</th>
                                        <td>{jobcard.phone}</td>
                                    </tr>
                                    <tr>
                                        <th className="bg-light">Address</th>
                                        <td colSpan="3">{jobcard.address}, {jobcard.city}</td>
                                    </tr>
                                    <tr>
                                        <th className="bg-light">Model</th>
                                        <td>{jobcard.model_name}</td>
                                        <th className="bg-light">Reg No</th>
                                        <td>{jobcard.reg_no}</td>
                                    </tr>
                                    <tr>
                                        <th className="bg-light">Engine No</th>
                                        <td>{jobcard.engine_no}</td>
                                        <th className="bg-light">Chassis No</th>
                                        <td>{jobcard.chassis_no}</td>
                                    </tr>
                                    <tr>
                                        <th className="bg-light">KM</th>
                                        <td>{jobcard.km}</td>
                                        <th className="bg-light">Petrol</th>
                                        <td>{jobcard.petrol}</td>
                                    </tr>
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row>
                <Col md={4}>
                    <Card className="card-custom h-100">
                        <Card.Header className="bg-light border-bottom pt-3">
                            <h6 className="mb-0 text-primary">Services</h6>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <Table hover className="table-custom mb-0">
                                <thead>
                                    <tr><th>Service</th><th className="text-end">Amount</th></tr>
                                </thead>
                                <tbody>
                                    {jobcard.services?.map((svc, i) => (
                                        <tr key={i}><td>{svc.name}</td><td className="text-end">₹ {svc.amount.toFixed(2)}</td></tr>
                                    ))}
                                    <tr className="fw-bold bg-light">
                                        <td>Total</td>
                                        <td className="text-end">₹ {servicesTotal.toFixed(2)}</td>
                                    </tr>
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={4}>
                    <Card className="card-custom h-100">
                        <Card.Header className="bg-light border-bottom pt-3">
                            <h6 className="mb-0 text-success">Parts</h6>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <Table hover className="table-custom mb-0">
                                <thead>
                                    <tr><th>Part</th><th className="text-end">Amount</th></tr>
                                </thead>
                                <tbody>
                                    {jobcard.parts?.map((prt, i) => (
                                        <tr key={i}><td>{prt.name}</td><td className="text-end">₹ {prt.amount.toFixed(2)}</td></tr>
                                    ))}
                                    <tr className="fw-bold bg-light">
                                        <td>Total</td>
                                        <td className="text-end">₹ {partsTotal.toFixed(2)}</td>
                                    </tr>
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={4}>
                    <Card className="card-custom h-100">
                        <Card.Header className="bg-light border-bottom pt-3">
                            <h6 className="mb-0 text-info">Labour</h6>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <Table hover className="table-custom mb-0">
                                <thead>
                                    <tr><th>Labour</th><th className="text-end">Amount</th></tr>
                                </thead>
                                <tbody>
                                    {jobcard.labour?.map((lbr, i) => (
                                        <tr key={i}><td>{lbr.name}</td><td className="text-end">₹ {lbr.amount.toFixed(2)}</td></tr>
                                    ))}
                                    <tr className="fw-bold bg-light">
                                        <td>Total</td>
                                        <td className="text-end">₹ {labourTotal.toFixed(2)}</td>
                                    </tr>
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row className="mt-4 mb-5">
                <Col md={12}>
                    <Card className="card-custom border-primary">
                        <Card.Body>
                            <Table bordered className="mb-0 text-center">
                                <thead className="bg-light">
                                    <tr>
                                        <th>Grand Total</th>
                                        <th>Amount Paid</th>
                                        <th>Remaining</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody className="fw-bold fs-5">
                                    <tr>
                                        <td className="text-primary">₹ {jobcard.amount.toFixed(2)}</td>
                                        <td className="text-success">₹ {jobcard.paid.toFixed(2)}</td>
                                        <td className="text-danger">₹ {jobcard.remaining.toFixed(2)}</td>
                                        <td>
                                            <Badge bg={jobcard.status === 'Paid' ? 'success' : jobcard.status === 'Partial' ? 'warning' : 'danger'}>
                                                {jobcard.status}
                                            </Badge>
                                        </td>
                                    </tr>
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default ViewJobcard;
