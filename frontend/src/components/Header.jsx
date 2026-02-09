import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Home, FileText, Search, Car, User, LogOut, Plus, List, Wrench } from 'lucide-react';
import { getUser, isAdmin } from '../utils/auth';
import './Header.css';

const Header = () => {
    const navigate = useNavigate();
    const user = getUser();
    const adminUser = isAdmin();

    const handleLogout = () => {
        // Clear session/token here
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <Navbar expand="lg" className="modern-navbar sticky-top">
            <Container>
                <Navbar.Brand as={Link} to="/" className="modern-brand">
                    <div className="brand-icon">
                        <Wrench size={24} />
                    </div>
                    <span className="brand-text">Gayatri Auto</span>
                </Navbar.Brand>

                <Navbar.Toggle aria-controls="basic-navbar-nav" />

                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="ms-auto align-items-lg-center">
                        <Nav.Link as={NavLink} to="/" end className="modern-nav-link">
                            <Home size={18} />
                            <span>Home</span>
                        </Nav.Link>

                        <NavDropdown
                            title={
                                <span className="dropdown-title">
                                    <FileText size={18} />
                                    <span>Jobcard</span>
                                </span>
                            }
                            id="jobcard-nav-dropdown"
                            className="modern-dropdown"
                        >
                            <NavDropdown.Item as={NavLink} to="/jobcards/add">
                                <Plus size={16} />
                                <span>Add Jobcard</span>
                            </NavDropdown.Item>
                            <NavDropdown.Item as={NavLink} to="/jobcards">
                                <List size={16} />
                                <span>Jobcard List</span>
                            </NavDropdown.Item>
                        </NavDropdown>

                        <Nav.Link as={NavLink} to="/jobcards/search" className="modern-nav-link">
                            <Search size={18} />
                            <span>Search</span>
                        </Nav.Link>

                        {adminUser && (
                            <NavDropdown
                                title={
                                    <span className="dropdown-title">
                                        <Car size={18} />
                                        <span>Model</span>
                                    </span>
                                }
                                id="model-nav-dropdown"
                                className="modern-dropdown"
                            >
                                <NavDropdown.Item as={NavLink} to="/models/add">
                                    <Plus size={16} />
                                    <span>Add Model</span>
                                </NavDropdown.Item>
                            </NavDropdown>
                        )}

                        <div className="nav-divider"></div>

                        <Nav.Link as={NavLink} to="/profile" className="modern-nav-link profile-link">
                            <div className="user-avatar">
                                <User size={18} />
                            </div>
                            <span>Profile</span>
                        </Nav.Link>

                        <Nav.Link onClick={handleLogout} className="modern-nav-link logout-link">
                            <LogOut size={18} />
                            <span>Logout</span>
                        </Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default Header;
