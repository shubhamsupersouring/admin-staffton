import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '70vh', 
      textAlign: 'center',
      padding: '40px' 
    }}>
      <h1 style={{ 
        fontFamily: 'Inter, sans-serif', 
        fontSize: '120px', 
        fontWeight: '800', 
        color: 'var(--navy)', 
        margin: '0',
        lineHeight: '1'
      }}>
        404
      </h1>
      <h2 style={{ 
        fontFamily: 'Inter, sans-serif', 
        fontSize: '24px', 
        fontWeight: '700', 
        color: 'var(--text)', 
        marginTop: '10px' 
      }}>
        Page Not Found
      </h2>
      <p style={{ 
        fontSize: '16px', 
        color: 'var(--text-muted)', 
        maxWidth: '400px', 
        margin: '16px 0 32px' 
      }}>
        The section you are looking for has been moved or doesn't exist in the current system.
      </p>
      <Link to="/" style={{ 
        backgroundColor: 'var(--teal)', 
        color: 'white', 
        padding: '12px 24px', 
        borderRadius: 'var(--radius-sm)', 
        textDecoration: 'none', 
        fontWeight: '600',
        boxShadow: '0 4px 12px rgba(0, 150, 136, 0.2)',
        transition: 'transform 0.2s'
      }}
      onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
      onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
      >
        Return to Dashboard
      </Link>
    </div>
  );
}

export default NotFound;
