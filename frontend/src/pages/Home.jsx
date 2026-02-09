import { useState, useEffect } from 'react';
import { Card, Table, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { FileEdit, Eye, CreditCard } from 'lucide-react';
import PaymentModal from '../components/PaymentModal';

const Home = () => {
    const [jobcards, setJobcards] = useState([]);
    const [dailyTotal, setDailyTotal] = useState(0);

    // Payment Modal State
    const [showPayment, setShowPayment] = useState(false);
    const [selectedJobcard, setSelectedJobcard] = useState(null);

    const fetchData = async () => {
        try {
            // Get today's date in Indian timezone
            const now = new Date();
            const istDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
            const today = istDate.toISOString().split('T')[0];

            const [jcRes, statsRes] = await Promise.all([
                api.get(`/jobcards?start_date=${today}`),
                api.get('/stats/daily')
            ]);
            setJobcards(jcRes.data);
            setDailyTotal(statsRes.data.total);
        } catch (err) {
            console.error("Error fetching data", err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleOpenPayment = (jc) => {
        setSelectedJobcard(jc);
        setShowPayment(true);
    };

    const handlePaymentSuccess = async (id, amount, method) => {
        try {
            await api.post(`/jobcards/${id}/pay`, { amount, method });
            alert(`Payment of ₹${amount} recorded successfully via ${method}!`);
            fetchData(); // Refresh data
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

    const getRowClass = (status) => {
        if (status === 'Unpaid') return 'table-danger';
        if (status === 'Paid') return 'table-success';
        return ''; // Partial or others
    };

    return (
        <div className="container mt-4">
            {/* Daily Total Box */}
            <div className="stat-card mb-4">
                <div>
                    <h5 className="mb-0">Today Paid Total ({new Date().toLocaleDateString()})</h5>
                </div>
                <div>
                    <span className="stat-value">₹ {dailyTotal.toFixed(2)}</span>
                </div>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-3">
                <h3>Today Jobcards</h3>
            </div>

            <Card className="card-custom">
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
                            {jobcards.length > 0 ? (
                                jobcards.map((jc) => (
                                    <tr key={jc.jobcard_id} className={getRowClass(jc.status)}>
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
                                                    <Button variant="success" size="sm" title="Pay" onClick={() => handleOpenPayment(jc)}>
                                                        <CreditCard size={16} /> Pay
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="10" className="text-center py-4">No Jobcards Found Today</td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </div>
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

export default Home;
