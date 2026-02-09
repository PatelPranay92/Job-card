import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Table } from 'react-bootstrap';
import api from '../../api/axios';
import './PrintReceipt.css';

const PrintReceipt = () => {
    const { id } = useParams();
    const [jobcard, setJobcard] = useState(null);

    useEffect(() => {
        const fetchJobcard = async () => {
            try {
                const res = await api.get(`/jobcards/${id}`);
                setJobcard(res.data);
                // Auto-print after data loads
                setTimeout(() => window.print(), 500);
            } catch (err) {
                console.error(err);
                alert('Error fetching jobcard');
            }
        };
        fetchJobcard();
    }, [id]);

    if (!jobcard) {
        return <div className="text-center py-5">Loading...</div>;
    }

    const calculateTotal = (items) => items ? items.reduce((sum, item) => sum + item.amount, 0) : 0;

    const servicesTotal = calculateTotal(jobcard.services);
    const partsTotal = calculateTotal(jobcard.parts);
    const labourTotal = calculateTotal(jobcard.labour);

    return (
        <Container className="py-3 print-container">
            {/* Header with Company Name */}
            <div className="text-center mb-3">
                <h2 className="fw-bold mb-0" style={{ fontSize: '28px', color: '#0066cc' }}>Gayatri Auto</h2>
                <p className="mb-0" style={{ fontSize: '11px' }}>N H No 8, Rajpur Hali, ta: Prantij</p>
                <p className="mb-0" style={{ fontSize: '11px' }}>Phone: +91 8238133400</p>
            </div>

            {/* Date and Jobcard Info */}
            <div className="d-flex justify-content-between mb-2" style={{ fontSize: '11px' }}>
                <div>{new Date(jobcard.date).toLocaleDateString('en-IN', {
                    timeZone: 'Asia/Kolkata',
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                })} {new Date(jobcard.date).toLocaleTimeString('en-IN', {
                    timeZone: 'Asia/Kolkata',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                })}</div>
                <div>Dt : {new Date(jobcard.date).toLocaleDateString('en-IN', {
                    timeZone: 'Asia/Kolkata',
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                })}</div>
            </div>

            {/* Main Receipt Table */}
            <Table bordered className="receipt-table mb-0" size="sm">
                <tbody>
                    {/* Jobcard No and Date */}
                    <tr>
                        <td className="fw-bold bg-light" width="15%">Jobcard No.</td>
                        <td width="35%">{jobcard.jobcard_no}</td>
                        <td className="fw-bold bg-light" width="15%">Date</td>
                        <td width="35%">{new Date(jobcard.date).toLocaleDateString('en-IN', {
                            timeZone: 'Asia/Kolkata',
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                        })}</td>
                    </tr>

                    {/* Reg No */}
                    <tr>
                        <td colSpan="2"></td>
                        <td className="fw-bold bg-light">Reg No.</td>
                        <td>{jobcard.reg_no}</td>
                    </tr>

                    {/* Customer Name and Engine No */}
                    <tr>
                        <td className="fw-bold bg-light">Customer Name</td>
                        <td>{jobcard.customer_name}</td>
                        <td className="fw-bold bg-light">Engine No.</td>
                        <td>{jobcard.engine_no}</td>
                    </tr>

                    {/* Address and Chassis No */}
                    <tr>
                        <td className="fw-bold bg-light">Address</td>
                        <td>{jobcard.address}, {jobcard.city}</td>
                        <td className="fw-bold bg-light">Chassis No.</td>
                        <td>{jobcard.chassis_no}</td>
                    </tr>

                    {/* Phone, City and Petrol */}
                    <tr>
                        <td className="fw-bold bg-light">Phone No.</td>
                        <td>{jobcard.phone}</td>
                        <td className="fw-bold bg-light">City / Village</td>
                        <td>{jobcard.city}</td>
                    </tr>

                    <tr>
                        <td colSpan="2"></td>
                        <td className="fw-bold bg-light">Petrol</td>
                        <td>{jobcard.petrol}</td>
                    </tr>

                    {/* Coupon No and KM */}
                    <tr>
                        <td className="fw-bold bg-light">Coupon No.</td>
                        <td></td>
                        <td className="fw-bold bg-light">Km</td>
                        <td>{jobcard.km}</td>
                    </tr>

                    {/* Model and Key No */}
                    <tr>
                        <td className="fw-bold bg-light">Model</td>
                        <td>{jobcard.model_name}</td>
                        <td className="fw-bold bg-light">Key No.</td>
                        <td></td>
                    </tr>

                    {/* Mechanic Name and Helper Name */}
                    <tr>
                        <td className="fw-bold bg-light">Mechanic Name</td>
                        <td></td>
                        <td className="fw-bold bg-light">Helper Name</td>
                        <td></td>
                    </tr>

                    {/* Comments */}
                    <tr>
                        <td className="fw-bold bg-light">Comments</td>
                        <td colSpan="3"></td>
                    </tr>
                </tbody>
            </Table>

            {/* Parts and Labour Detail Section */}
            <Table bordered size="sm" className="mt-0 details-table">
                <thead className="table-dark">
                    <tr>
                        <th colSpan="2" className="text-center">Parts Detail</th>
                        <th colSpan="2" className="text-center">Labour Detail</th>
                    </tr>
                    <tr>
                        <th width="35%">Item</th>
                        <th width="15%" className="text-end">Amount</th>
                        <th width="35%">Item</th>
                        <th width="15%" className="text-end">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {/* Get max length between parts and labour */}
                    {Array.from({
                        length: Math.max(
                            jobcard.parts?.length || 0,
                            jobcard.labour?.length || 0,
                            3 // Minimum 3 rows
                        )
                    }).map((_, index) => {
                        const part = jobcard.parts?.[index];
                        const labour = jobcard.labour?.[index];

                        return (
                            <tr key={index}>
                                <td>{part?.name || ''}</td>
                                <td className="text-end">{part ? part.amount.toFixed(0) : ''}</td>
                                <td>{labour?.name || ''}</td>
                                <td className="text-end">{labour ? labour.amount.toFixed(0) : ''}</td>
                            </tr>
                        );
                    })}

                    {/* Totals Row */}
                    <tr className="fw-bold">
                        <td className="text-end">Total (Rs) :</td>
                        <td className="text-end">{partsTotal.toFixed(0)}</td>
                        <td className="text-end">Total (Rs) :</td>
                        <td className="text-end">{labourTotal.toFixed(0)}</td>
                    </tr>
                </tbody>
            </Table>

            {/* Final Total */}
            <Table bordered size="sm" className="mt-0">
                <tbody>
                    <tr className="fw-bold">
                        <td className="text-end" width="85%">Final Total (Parts + Labour) Rs. :</td>
                        <td className="text-end" width="15%">{(partsTotal + labourTotal).toFixed(0)}</td>
                    </tr>
                </tbody>
            </Table>

            {/* Signature */}
            <div className="text-center mt-4">
                <p className="mb-0">Signature :</p>
            </div>
        </Container>
    );
};

export default PrintReceipt;
