// Header.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaShoppingCart, FaBars, FaTimes } from 'react-icons/fa';

function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const idToken = localStorage.getItem('IdToken');
    setIsLoggedIn(!!idToken);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('IdToken');
    localStorage.removeItem('AccessToken');
    localStorage.removeItem('RefreshToken');
    setIsLoggedIn(false);
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Styles
  const headerContainer = {
    backgroundColor: '#FFFFFF',
    padding: '15px 20px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  };

  const logoStyle = {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333333',
    textDecoration: 'none'
  };

  const navLinks = {
    display: 'flex',
    gap: '20px',
    alignItems: 'center'
  };

  const linkStyle = {
    color: '#F56600',
    textDecoration: 'none',
    fontWeight: '500',
    padding: '5px',
    borderRadius: '4px',
    transition: 'background-color 0.3s'
  };

  const activeLinkStyle = {
    ...linkStyle,
    fontWeight: '700',
    textDecoration: 'underline'
  };

  const iconLinkStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '5px'
  };

  const mobileMenuButton = {
    display: 'none',
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#F56600',
    '@media (max-width: 768px)': {
      display: 'block'
    }
  };

  const mobileMenuStyle = {
    display: mobileMenuOpen ? 'flex' : 'none',
    position: 'fixed',
    top: '60px',
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
    flexDirection: 'column',
    padding: '20px',
    zIndex: 99
  };

  const mobileLinkStyle = {
    ...linkStyle,
    padding: '15px 0',
    borderBottom: '1px solid #eee',
    width: '100%',
    textAlign: 'center'
  };

  // Responsive styles (inline media queries simulated with conditional rendering)
  const isDesktop = window.innerWidth > 768;

  return (
    <header style={headerContainer}>
      <Link to="/" style={logoStyle}>
        Driver Incentive Program
      </Link>

      {isDesktop ? (
        <nav style={navLinks}>
          <Link 
            to="/" 
            style={window.location.pathname === '/' ? activeLinkStyle : linkStyle}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            Home
          </Link>
          
          {isLoggedIn ? (
            <>
              <Link 
                to="/about" 
                style={window.location.pathname === '/about' ? activeLinkStyle : linkStyle}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                About
              </Link>
              
              <Link 
                to="/catalog" 
                style={window.location.pathname === '/catalog' ? activeLinkStyle : linkStyle}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                Store
              </Link>
              
              <Link 
                to="/cart" 
                style={{
                  ...iconLinkStyle,
                  ...(window.location.pathname === '/cart' ? activeLinkStyle : linkStyle)
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                <FaShoppingCart /> Cart
              </Link>
              
              <Link 
                to="/profile" 
                style={{
                  ...iconLinkStyle,
                  ...(window.location.pathname === '/profile' ? activeLinkStyle : linkStyle)
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                <FaUser /> Profile
              </Link>
              
              <button 
                onClick={handleLogout} 
                style={{
                  color: '#F56600',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '500',
                  padding: '5px',
                  borderRadius: '4px'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                style={window.location.pathname === '/login' ? activeLinkStyle : linkStyle}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                Login
              </Link>
              
              <Link 
                to="/account-creation" 
                style={window.location.pathname === '/account-creation' ? activeLinkStyle : linkStyle}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                Register
              </Link>
            </>
          )}
          
          <Link 
            to="/help" 
            style={window.location.pathname === '/help' ? activeLinkStyle : linkStyle}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            Help
          </Link>
        </nav>
      ) : (
        <button 
          onClick={toggleMobileMenu} 
          style={mobileMenuButton}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      )}

      {/* Mobile Menu */}
      <div style={{
        ...mobileMenuStyle,
        display: !isDesktop && mobileMenuOpen ? 'flex' : 'none'
      }}>
        <Link 
          to="/" 
          style={mobileLinkStyle}
          onClick={() => setMobileMenuOpen(false)}
        >
          Home
        </Link>
        
        {isLoggedIn ? (
          <>
            <Link 
              to="/about" 
              style={mobileLinkStyle}
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            
            <Link 
              to="/catalog" 
              style={mobileLinkStyle}
              onClick={() => setMobileMenuOpen(false)}
            >
              Store
            </Link>
            
            <Link 
              to="/cart" 
              style={mobileLinkStyle}
              onClick={() => setMobileMenuOpen(false)}
            >
              <FaShoppingCart /> Cart
            </Link>
            
            <Link 
              to="/profile" 
              style={mobileLinkStyle}
              onClick={() => setMobileMenuOpen(false)}
            >
              <FaUser /> Profile
            </Link>
            
            <button 
              onClick={() => {
                handleLogout();
                setMobileMenuOpen(false);
              }} 
              style={{
                ...mobileLinkStyle,
                backgroundColor: 'transparent'
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link 
              to="/login" 
              style={mobileLinkStyle}
              onClick={() => setMobileMenuOpen(false)}
            >
              Login
            </Link>
            
            <Link 
              to="/account-creation" 
              style={mobileLinkStyle}
              onClick={() => setMobileMenuOpen(false)}
            >
              Register
            </Link>
          </>
        )}
        
        <Link 
          to="/help" 
          style={{
            ...mobileLinkStyle,
            borderBottom: 'none'
          }}
          onClick={() => setMobileMenuOpen(false)}
        >
          Help
        </Link>
      </div>
    </header>
  );
}

export default Header;

// Footer.js
import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  const currentYear = new Date().getFullYear();
  
  const footerContainer = {
    backgroundColor: '#333333',
    color: '#FFFFFF',
    padding: '25px 20px',
    textAlign: 'center'
  };
  
  const footerContent = {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  };
  
  const footerNav = {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: '20px',
    marginBottom: '20px'
  };
  
  const footerLink = {
    color: '#FFFFFF',
    textDecoration: 'none',
    transition: 'color 0.3s'
  };
  
  const footerText = {
    fontSize: '14px',
    marginBottom: '10px'
  };
  
  return (
    <footer style={footerContainer}>
      <div style={footerContent}>
        <nav style={footerNav}>
          <Link 
            to="/" 
            style={footerLink}
            onMouseEnter={(e) => e.target.style.color = '#F56600'}
            onMouseLeave={(e) => e.target.style.color = '#FFFFFF'}
          >
            Home
          </Link>
          <Link 
            to="/about" 
            style={footerLink}
            onMouseEnter={(e) => e.target.style.color = '#F56600'}
            onMouseLeave={(e) => e.target.style.color = '#FFFFFF'}
          >
            About
          </Link>
          <Link 
            to="/help" 
            style={footerLink}
            onMouseEnter={(e) => e.target.style.color = '#F56600'}
            onMouseLeave={(e) => e.target.style.color = '#FFFFFF'}
          >
            Help
          </Link>
        </nav>
        
        <p style={footerText}>© {currentYear} Driver Incentive Program | Python Charmers</p>
        <p style={{...footerText, fontSize: '12px'}}>Version 2.0</p>
      </div>
    </footer>
  );
}

export default Footer;