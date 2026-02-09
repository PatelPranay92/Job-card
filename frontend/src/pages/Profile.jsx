import { useState } from 'react';
import { Card, Form, Button, Alert, InputGroup } from 'react-bootstrap';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import api from '../api/axios';

const Profile = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState(null);

    // Visibility states
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);

        // Basic Validation
        if (!currentPassword || !newPassword || !confirmPassword) {
            setMessage({ type: 'danger', text: 'All fields are required.' });
            return;
        }
        if (newPassword !== confirmPassword) {
            setMessage({ type: 'danger', text: 'New Password and Confirm Password do not match.' });
            return;
        }

        try {
            await api.post('/auth/change-password', {
                username: user.username || 'admin',
                currentPassword,
                newPassword
            });
            setMessage({ type: 'success', text: 'Password changed successfully.' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            setMessage({ type: 'danger', text: err.response?.data?.message || 'Error updating password' });
        }
    };

    return (
        <div className="container mt-4">
            <h2 className="text-primary fw-bold mb-4">Admin Profile</h2>

            <div className="row">
                <div className="col-md-6">
                    <Card className="card-custom mb-4">
                        <Card.Header className="bg-white border-bottom-0 pt-3">
                            <h5 className="mb-0 text-secondary"><User size={20} className="me-2" />Profile Details</h5>
                        </Card.Header>
                        <Card.Body>
                            <p>Logged in as: <strong>{user.name || 'Admin'}</strong></p>
                            <p>Role: <strong>{user.role || 'Administrator'}</strong></p>
                        </Card.Body>
                    </Card>

                    <Card className="card-custom">
                        <Card.Header className="bg-white border-bottom-0 pt-3">
                            <h5 className="mb-0 text-secondary"><Lock size={20} className="me-2" />Change Password</h5>
                        </Card.Header>
                        <Card.Body>
                            {message && <Alert variant={message.type}>{message.text}</Alert>}

                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Current Password</Form.Label>
                                    <InputGroup>
                                        <Form.Control
                                            type={showCurrent ? "text" : "password"}
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            required
                                        />
                                        <Button variant="outline-secondary" onClick={() => setShowCurrent(!showCurrent)} tabIndex="-1">
                                            {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </Button>
                                    </InputGroup>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>New Password</Form.Label>
                                    <InputGroup>
                                        <Form.Control
                                            type={showNew ? "text" : "password"}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            required
                                        />
                                        <Button variant="outline-secondary" onClick={() => setShowNew(!showNew)} tabIndex="-1">
                                            {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </Button>
                                    </InputGroup>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Confirm New Password</Form.Label>
                                    <InputGroup>
                                        <Form.Control
                                            type={showConfirm ? "text" : "password"}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                        />
                                        <Button variant="outline-secondary" onClick={() => setShowConfirm(!showConfirm)} tabIndex="-1">
                                            {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </Button>
                                    </InputGroup>
                                </Form.Group>

                                <Button variant="primary" type="submit">
                                    Change Password
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Profile;
