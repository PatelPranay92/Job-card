import { useState, useEffect } from 'react';
import { Card, Table, Button, Badge, Form, InputGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { FileEdit, Eye, CreditCard, Search } from 'lucide-react';
import PaymentModal from '../../components/PaymentModal';

const JobcardList = () => {
    const [jobcards, setJobcards] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Payment Modal State
    const [showPayment, setShowPayment] = useState(false);
    const [selectedJobcard, setSelectedJobcard] = useState(null);

    const fetchJobcards = async () => {
        try {
            const res = await api.get('/jobcards');
            setJobcards(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchJobcards();
    }, []);

    const handleOpenPayment = (jc) => {
        setSelectedJobcard(jc);
        setShowPayment(true);
    };

    const handlePaymentSuccess = async (id, amount, method) => {
        try {
            await api.post(`/jobcards/${id}/pay`, { amount, method });
            alert(`Payment of ₹${amount} recorded successfully via ${method}!`);
            fetchJobcards(); // Refresh data
        } catch (err) {
            alert('Error processing payment');
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Paid': return <Badge bg="success">Paid</Badge>;
            case 'Partial': return <Badge bg="warning" text="dark">Partial</Badge>;
            case 'Unpaid': return <Badge bg="danger">Unpaid</Badge>;
            default: return <Badge bg="secondary">{status}</Badge>;
        }
    };

    const filteredJobcards = jobcards.filter(jc =>
        jc.jobcard_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
        jc.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        jc.reg_no.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="text-primary fw-bold">Jobcard List</h2>
                <Button as={Link} to="/jobcards/add" variant="primary">
                    + New Jobcard
                </Button>
            </div>

            <Card className="card-custom mb-4">
                <Card.Body>
                    <InputGroup className="mb-3" style={{ maxWidth: '400px' }}>
                        <InputGroup.Text><Search size={18} /></InputGroup.Text>
                        <Form.Control
                            placeholder="Search by Jobcard No, Customer, or Reg No..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </InputGroup>

                    <div className="table-responsive">
                        <Table hover className="table-custom text-center align-middle">
                            <thead>
                                <tr>
                                    <th>Jobcard No</th>
                                    <th>Date</th>
                                    <th>Reg No</th>
                                    <th>Customer</th>
                                    <th>Model</th>
                                    <th>Amount</th>
                                    <th>Paid</th>
                                    <th>Remaining</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredJobcards.length > 0 ? (
                                    filteredJobcards.map((jc) => (
                                        <tr key={jc.jobcard_id}>
                                            <td className="fw-bold">{jc.jobcard_no}</td>
                                            <td>{new Date(jc.date).toLocaleDateString('en-IN', {
                                                timeZone: 'Asia/Kolkata',
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric'
                                            })}</td>
                                            <td>{jc.reg_no}</td>
                                            <td>{jc.customer_name}</td>
                                            <td>{jc.model_name}</td>
                                            <td>₹ {jc.amount.toFixed(2)}</td>
                                            <td>₹ {jc.paid.toFixed(2)}</td>
                                            <td>₹ {jc.remaining.toFixed(2)}</td>
                                            <td>{getStatusBadge(jc.status)}</td>
                                            <td>
                                                <div className="d-flex justify-content-center gap-2">
                                                    <Button variant="outline-primary" size="sm" as={Link} to={`/jobcards/view/${jc.jobcard_id}`} title="View">
                                                        <Eye size={16} />
                                                    </Button>
                                                    <Button variant="outline-warning" size="sm" as={Link} to={`/jobcards/edit/${jc.jobcard_id}`} title="Edit">
                                                        <FileEdit size={16} />
                                                    </Button>
                                                    {jc.remaining > 0 && (
                                                        <Button variant="outline-success" size="sm" title="Pay" onClick={() => handleOpenPayment(jc)}>
                                                            <CreditCard size={16} />
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="10" className="text-center py-4 text-muted">No Jobcards Found</td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </div>
                </Card.Body>
            </Card>

            {/* Payment Modal */}
            {selectedJobcard && (
                <PaymentModal
                    show={showPayment}
                    handleClose={() => setShowPayment(false)}
                    jobcard={selectedJobcard}
                    onPaymentSuccess={handlePaymentSuccess}
                />
            )}
        </div>
    );
};

export default JobcardList;
