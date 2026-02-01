import React from 'react';
import { useNavigate } from 'react-router-dom';

const NavBar = ({ title, dashboardPath = '/dashboard', userName, onLogout }) => {
  const navigate = useNavigate();

  return (
    <nav style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '1rem 2rem',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      marginBottom: '2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '1rem'
    }}>
      {/* Left: Back to Dashboard Button */}
      <button
        onClick={() => navigate(dashboardPath)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 1rem',
          background: 'rgba(255, 255, 255, 0.2)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '8px',
          color: 'white',
          fontSize: '0.95rem',
          fontWeight: '500',
          cursor: 'pointer',
          transition: 'all 0.2s',
          backdropFilter: 'blur(10px)'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        <span style={{ fontSize: '1.2rem' }}>←</span>
        <span>Back to Dashboard</span>
      </button>

      {/* Center: Title */}
      <h2 style={{
        margin: 0,
        fontSize: '1.5rem',
        fontWeight: '600',
        flex: '1',
        textAlign: 'center',
        minWidth: '200px'
      }}>
        {title}
      </h2>

      {/* Right: User Info and Logout */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
      }}>
        {userName && (
          <span style={{
            fontSize: '0.95rem',
            opacity: 0.95,
            padding: '0.5rem 1rem',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '8px'
          }}>
            {userName}
          </span>
        )}
        {onLogout && (
          <button
            onClick={onLogout}
            style={{
              padding: '0.5rem 1rem',
              background: 'rgba(255, 255, 255, 0.9)',
              border: 'none',
              borderRadius: '8px',
              color: '#667eea',
              fontSize: '0.95rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'white';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
