import { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';

const PaymentModal = ({ show, handleClose, jobcard, onPaymentSuccess }) => {
    const [amount, setAmount] = useState('');
    const [method, setMethod] = useState('');
    const [error, setError] = useState('');

    if (!jobcard) return null;

    const remaining = jobcard.remaining || 0;

    const handleSubmit = () => {
        const payAmount = parseFloat(amount);
        if (!payAmount || payAmount <= 0) {
            setError('Please enter a valid amount');
            return;
        }
        if (payAmount > remaining) {
            setError(`Amount cannot exceed remaining balance (₹ ${remaining})`);
            return;
        }
        if (!method) {
            setError('Please select a payment method');
            return;
        }

        // Simulate API call
        onPaymentSuccess(jobcard.jobcard_id, payAmount, method);
        handleClose();
        setAmount('');
        setMethod('');
        setError('');
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Process Payment - {jobcard.jobcard_no}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="mb-3">
                    <p><strong>Customer:</strong> {jobcard.customer_name}</p>
                    <p><strong>Total Amount:</strong> ₹ {jobcard.amount.toFixed(2)}</p>
                    <p><strong>Paid:</strong> ₹ {jobcard.paid.toFixed(2)}</p>
                    <p className="text-danger fw-bold"><strong>Remaining:</strong> ₹ {remaining.toFixed(2)}</p>
                </div>

                <hr />

                {error && <Alert variant="danger">{error}</Alert>}

                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>Payment Amount (₹)</Form.Label>
                        <Form.Control
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder={`Max: ${remaining}`}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Payment Method</Form.Label>
                        <Form.Select value={method} onChange={(e) => setMethod(e.target.value)}>
                            <option value="">Select Method</option>
                            <option value="Cash">Cash</option>
                            <option value="Card">Card</option>
                            <option value="UPI">UPI</option>
                            <option value="Net Banking">Net Banking</option>
                        </Form.Select>
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Cancel
                </Button>
                <Button variant="success" onClick={handleSubmit}>
                    Confirm Payment
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default PaymentModal;
