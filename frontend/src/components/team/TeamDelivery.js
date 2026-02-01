import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import NavBar from '../shared/NavBar';

const API_URL = process.env.REACT_APP_API_URL || window.location.origin;

function TeamDelivery() {
  const navigate = useNavigate();

  // Get user info from localStorage
  const userName = React.useMemo(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      return user?.name || 'Team Member';
    } catch {
      return 'Team Member';
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDeliveryStatus = (order) => {
    if (order.delivery_date) {
      return { text: 'Delivered', color: '#10b981', bgColor: '#d1fae5' };
    } else if (order.status === 'completed' || order.status === 'paid') {
      return { text: 'In Transit', color: '#f59e0b', bgColor: '#fef3c7' };
    } else {
      return { text: 'Pending', color: '#6b7280', bgColor: '#f3f4f6' };
    }
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading delivery information...</div>;
  }

  return (
    <>
      <NavBar 
        title="Delivery Tracking"
        dashboardPath="/dashboard"
        userName={userName}
        onLogout={handleLogout}
      />
      <div style={{ padding: '20px' }}>
      <h2 style={{ marginBottom: '20px' }}>Delivery Tracking</h2>
      
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#f9fafb' }}>
            <tr>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Order ID</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Customer</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Order Date</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Delivery Status</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Delivery Date</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
                  No orders to track
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const deliveryStatus = getDeliveryStatus(order);
                return (
                  <tr key={order.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '12px' }}>#{order.id}</td>
                    <td style={{ padding: '12px', fontWeight: 'bold' }}>{order.customer_name}</td>
                    <td style={{ padding: '12px' }}>
                      {new Date(order.order_date).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        backgroundColor: deliveryStatus.bgColor,
                        color: deliveryStatus.color
                      }}>
                        {deliveryStatus.text}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      {order.delivery_date
                        ? new Date(order.delivery_date).toLocaleDateString()
                        : '-'}
                    </td>
                    <td style={{ padding: '12px', fontWeight: 'bold' }}>
                      {order.total_amount} SEK
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
        <h3 style={{ marginTop: 0, marginBottom: '15px' }}>Delivery Status Legend</h3>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              padding: '4px 12px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 'bold',
              backgroundColor: '#f3f4f6',
              color: '#6b7280'
            }}>
              Pending
            </span>
            <span style={{ fontSize: '14px' }}>Order placed, awaiting processing</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              padding: '4px 12px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 'bold',
              backgroundColor: '#fef3c7',
              color: '#f59e0b'
            }}>
              In Transit
            </span>
            <span style={{ fontSize: '14px' }}>Order is being delivered</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              padding: '4px 12px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 'bold',
              backgroundColor: '#d1fae5',
              color: '#10b981'
            }}>
              Delivered
            </span>
            <span style={{ fontSize: '14px' }}>Order delivered successfully</span>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

export default TeamDelivery;
