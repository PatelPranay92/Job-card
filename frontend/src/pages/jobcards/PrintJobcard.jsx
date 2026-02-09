import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Table } from 'react-bootstrap';
import api from '../../api/axios';
import './PrintJobcard.css';

const PrintJobcard = () => {
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
                <h2 className="fw-bold mb-0" style={{ fontSize: '28px' }}>Gayatri Auto</h2>
                <p className="mb-0" style={{ fontSize: '11px' }}>Address Line 1, Address Line 2</p>
                <p className="mb-0" style={{ fontSize: '11px' }}>Phone:+91 8238133400</p>
            </div>

            {/* Main Jobcard Table */}
            <Table bordered className="jobcard-table mb-0" size="sm">
                <tbody>
                    {/* Header Row */}
                    <tr>
                        <td colSpan="2" className="fw-bold bg-light">Date</td>
                        <td colSpan="2">{new Date(jobcard.date).toLocaleDateString('en-IN', {
                            timeZone: 'Asia/Kolkata',
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                        })}</td>
                        <td className="fw-bold bg-light">Reg No:</td>
                        <td className="fw-bold">{jobcard.reg_no}</td>
                    </tr>

                    {/* Customer Info */}
                    <tr>
                        <td className="fw-bold bg-light" width="12%">Customer</td>
                        <td colSpan="3">{jobcard.customer_name}</td>
                        <td className="fw-bold bg-light" width="15%">Engine No</td>
                        <td width="20%">{jobcard.engine_no}</td>
                    </tr>

                    {/* Address */}
                    <tr>
                        <td className="fw-bold bg-light">Address</td>
                        <td colSpan="5">{jobcard.address}, {jobcard.city}</td>
                    </tr>

                    {/* Phone & City */}
                    <tr>
                        <td className="fw-bold bg-light">Phone No</td>
                        <td>{jobcard.phone}</td>
                        <td className="fw-bold bg-light">City / Village</td>
                        <td>{jobcard.city}</td>
                        <td className="fw-bold bg-light">Chassis No</td>
                        <td>{jobcard.chassis_no}</td>
                    </tr>

                    {/* Odometer & Model */}
                    <tr>
                        <td className="fw-bold bg-light">Odometer (KM)</td>
                        <td>{jobcard.km}</td>
                        <td className="fw-bold bg-light">Model</td>
                        <td>{jobcard.model_name}</td>
                        <td className="fw-bold bg-light">Petrol</td>
                        <td>{jobcard.petrol}</td>
                    </tr>

                    {/* Mechanic Name */}
                    <tr>
                        <td className="fw-bold bg-light">Mechanic Name</td>
                        <td colSpan="2"></td>
                        <td className="fw-bold bg-light">KM</td>
                        <td className="fw-bold bg-light">Key No</td>
                        <td></td>
                    </tr>

                    <tr>
                        <td className="fw-bold bg-light">Model</td>
                        <td colSpan="2">{jobcard.model_name}</td>
                        <td className="fw-bold bg-light">Helper Name</td>
                        <td colSpan="2"></td>
                    </tr>
                </tbody>
            </Table>

            {/* Service Detail Section */}
            <div className="mt-3">
                <h6 className="fw-bold mb-2 bg-dark text-white p-2">Service Detail</h6>
                <Table bordered size="sm" className="service-table">
                    <thead>
                        <tr>
                            <th width="5%" className="text-center">No.</th>
                            <th width="28%">Service Detail</th>
                            <th width="10%" className="text-end">Amount</th>
                            <th width="5%" className="text-center">No.</th>
                            <th width="28%">Service Detail</th>
                            <th width="10%" className="text-end">Amount</th>
                            <th width="5%" className="text-center">No.</th>
                            <th width="9%" className="text-end">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Services */}
                        {Array.from({ length: 10 }).map((_, index) => {
                            const service1 = jobcard.services?.[index * 3];
                            const service2 = jobcard.services?.[index * 3 + 1];
                            const service3 = jobcard.services?.[index * 3 + 2];

                            return (
                                <tr key={index}>
                                    <td className="text-center">{service1 ? index * 3 + 1 : ''}</td>
                                    <td>{service1?.name || ''}</td>
                                    <td className="text-end">{service1 ? `₹ ${service1.amount.toFixed(2)}` : ''}</td>
                                    <td className="text-center">{service2 ? index * 3 + 2 : ''}</td>
                                    <td>{service2?.name || ''}</td>
                                    <td className="text-end">{service2 ? `₹ ${service2.amount.toFixed(2)}` : ''}</td>
                                    <td className="text-center">{service3 ? index * 3 + 3 : ''}</td>
                                    <td className="text-end">{service3 ? `₹ ${service3.amount.toFixed(2)}` : ''}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </Table>
            </div>

            {/* Parts and Labour Summary */}
            <Table bordered size="sm" className="mt-2">
                <tbody>
                    <tr>
                        <td className="fw-bold bg-light" width="15%">Parts</td>
                        <td width="35%">
                            {jobcard.parts?.map((part, i) => (
                                <div key={i}>{part.name}</div>
                            ))}
                        </td>
                        <td className="fw-bold bg-light" width="15%">Labour Charge</td>
                        <td width="35%">
                            {jobcard.labour?.map((labour, i) => (
                                <div key={i}>{labour.name}</div>
                            ))}
                        </td>
                    </tr>
                </tbody>
            </Table>

            {/* Totals Section */}
            <Table bordered size="sm" className="mt-2 totals-table">
                <tbody>
                    <tr>
                        <td className="fw-bold bg-light" width="15%">Service</td>
                        <td width="18%" className="text-end">₹ {servicesTotal.toFixed(2)}</td>
                        <td className="fw-bold bg-light" width="15%">Parts</td>
                        <td width="18%" className="text-end">₹ {partsTotal.toFixed(2)}</td>
                        <td className="fw-bold bg-light" width="18%">Labour Charge</td>
                        <td width="16%" className="text-end">₹ {labourTotal.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td className="fw-bold bg-light">CGST</td>
                        <td className="text-end">-</td>
                        <td className="fw-bold bg-light">SGST</td>
                        <td className="text-end">-</td>
                        <td className="fw-bold bg-light">Total GST</td>
                        <td className="text-end">-</td>
                    </tr>
                    <tr>
                        <td colSpan="4" className="text-end fw-bold">Total Sub</td>
                        <td className="fw-bold bg-light">₹ {jobcard.amount.toFixed(2)}</td>
                        <td className="text-end fw-bold">₹ {jobcard.amount.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td colSpan="4" className="text-end fw-bold">Final Total (Parts + Labour) Rs.</td>
                        <td colSpan="2" className="text-end fw-bold fs-5">₹ {jobcard.amount.toFixed(2)}</td>
                    </tr>
                </tbody>
            </Table>

            {/* Footer */}
            <div className="text-center mt-3">
                <p className="mb-0 fw-bold">Signature</p>
                <p className="mb-0" style={{ fontSize: '11px' }}>Print Service Detail : Good / Warranty</p>
            </div>
        </Container>
    );
};

export default PrintJobcard;
