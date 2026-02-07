import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import NavBar from '../shared/NavBar';

const API_URL = process.env.REACT_APP_API_URL || window.location.origin;

function TeamSwishPayment() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [paymentRef, setPaymentRef] = useState('');

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

  useEffect(() => {
    loadOrderDetails();
  }, [orderId]);

  const loadOrderDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrder(response.data);
      setPayment(response.data.payment);
      
      // Check if already paid
      if (response.data.payment?.paid) {
        setPaymentComplete(true);
        setPaymentRef(response.data.payment.payment_reference || 'N/A');
      }
    } catch (error) {
      console.error('Error loading order:', error);
      alert('Failed to load order details');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleSimulatePayment = async () => {
    setProcessing(true);
    const mockRef = 'SWISH-' + Date.now();
    setPaymentRef(mockRef);

    // Simulate processing delay (1.5 seconds)
    setTimeout(async () => {
      try {
        const token = localStorage.getItem('token');
        await axios.put(`${API_URL}/api/payments/${payment.id}/mark-paid`, {
          payment_reference: mockRef
        }, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            'x-user-role': 'team'
          }
        });
        
        setPaymentComplete(true);
        setProcessing(false);
      } catch (error) {
        console.error('Error marking payment as paid:', error);
        alert('Failed to process payment: ' + (error.response?.data?.error || error.message));
        setProcessing(false);
      }
    }, 1500);
  };

  // Generate a mock QR code pattern
  const generateQRPattern = () => {
    const size = 21; // QR codes are typically 21x21 or larger
    const pattern = [];
    const amount = order?.total_amount || 0;
    
    // Create a deterministic but realistic-looking pattern based on the order amount
    for (let i = 0; i < size; i++) {
      const row = [];
      for (let j = 0; j < size; j++) {
        // Create patterns: corners (position markers), data area
        const isCorner = (i < 7 && j < 7) || (i < 7 && j >= size - 7) || (i >= size - 7 && j < 7);
        const isCornerInner = (i >= 2 && i < 5 && j >= 2 && j < 5) || 
                             (i >= 2 && i < 5 && j >= size - 5 && j < size - 2) || 
                             (i >= size - 5 && i < size - 2 && j >= 2 && j < 5);
        
        // Use amount and position to create pseudo-random but consistent pattern
        const seed = (i * size + j + amount) % 100;
        const isBlack = isCorner || (seed > 45 && !isCornerInner);
        
        row.push(isBlack);
      }
      pattern.push(row);
    }
    return pattern;
  };

  if (loading) {
    return (
      <>
        <NavBar 
          title="Payment"
          dashboardPath="/dashboard"
          userName={userName}
          onLogout={handleLogout}
        />
        <div style={{ padding: '20px', textAlign: 'center' }}>Loading payment details...</div>
      </>
    );
  }

  if (!order) {
    return (
      <>
        <NavBar 
          title="Payment"
          dashboardPath="/dashboard"
          userName={userName}
          onLogout={handleLogout}
        />
        <div style={{ padding: '20px', textAlign: 'center' }}>Order not found</div>
      </>
    );
  }

  const qrPattern = generateQRPattern();

  return (
    <>
      <NavBar 
        title="Swish Payment"
        dashboardPath="/dashboard"
        userName={userName}
        onLogout={handleLogout}
      />
      <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        {!paymentComplete ? (
          <>
            <h2 style={{ marginBottom: '20px' }}>💳 Payment for Order #{order.id}</h2>
            
            {/* Order Details */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              padding: '20px',
              marginBottom: '20px'
            }}>
              <h3 style={{ marginTop: 0, marginBottom: '15px' }}>Order Details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '10px' }}>
                <strong>Order ID:</strong>
                <span>#{order.id}</span>
                <strong>Customer:</strong>
                <span>{order.customer_name}</span>
                <strong>Period:</strong>
                <span>{order.quarter} {order.year}</span>
                <strong>Order Date:</strong>
                <span>{new Date(order.order_date).toLocaleDateString()}</span>
                <strong>Total Amount:</strong>
                <span style={{ fontSize: '1.2em', color: '#10b981', fontWeight: 'bold' }}>
                  {order.total_amount} SEK
                </span>
              </div>
            </div>

            {/* Order Items */}
            {order.items && order.items.length > 0 && (
              <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                padding: '20px',
                marginBottom: '20px'
              }}>
                <h3 style={{ marginTop: 0, marginBottom: '15px' }}>Order Items</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ backgroundColor: '#f9fafb' }}>
                    <tr>
                      <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Product</th>
                      <th style={{ padding: '8px', textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>Quantity</th>
                      <th style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #e5e7eb' }}>Price</th>
                      <th style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #e5e7eb' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item, index) => (
                      <tr key={index}>
                        <td style={{ padding: '8px' }}>
                          {item.product_name}
                          {item.is_subscription ? ' (Subscription)' : ''}
                        </td>
                        <td style={{ padding: '8px', textAlign: 'center' }}>{item.quantity}</td>
                        <td style={{ padding: '8px', textAlign: 'right' }}>{item.price} SEK</td>
                        <td style={{ padding: '8px', textAlign: 'right' }}>
                          {(item.price * item.quantity).toFixed(2)} SEK
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Swish QR Code */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              padding: '30px',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              <h3 style={{ marginTop: 0, marginBottom: '20px' }}>📱 Swish QR Code</h3>
              
              {/* Mock QR Code */}
              <div style={{
                display: 'inline-block',
                padding: '20px',
                backgroundColor: 'white',
                border: '2px solid #333',
                borderRadius: '8px',
                marginBottom: '20px'
              }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${qrPattern.length}, 8px)`,
                  gap: '0px',
                  backgroundColor: 'white'
                }}>
                  {qrPattern.map((row, i) => 
                    row.map((cell, j) => (
                      <div
                        key={`${i}-${j}`}
                        style={{
                          width: '8px',
                          height: '8px',
                          backgroundColor: cell ? '#000' : '#fff'
                        }}
                      />
                    ))
                  )}
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <p style={{ fontSize: '1.3em', fontWeight: 'bold', color: '#10b981', margin: '10px 0' }}>
                  Amount: {order.total_amount} SEK
                </p>
                <p style={{ fontSize: '0.9em', color: '#6b7280', margin: '5px 0' }}>
                  Swish Number: 123 456 78 90
                </p>
              </div>

              <div style={{
                backgroundColor: '#fef3c7',
                border: '1px solid #fbbf24',
                borderRadius: '6px',
                padding: '12px',
                marginTop: '20px',
                fontSize: '0.9em',
                color: '#92400e'
              }}>
                ⚠️ <strong>MOCK PAYMENT</strong> – In production, a real Swish QR code will appear here
              </div>
            </div>

            {/* Action Button */}
            <div style={{ textAlign: 'center' }}>
              <button
                onClick={handleSimulatePayment}
                disabled={processing}
                style={{
                  padding: '15px 40px',
                  backgroundColor: processing ? '#9ca3af' : '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1.1em',
                  fontWeight: 'bold',
                  cursor: processing ? 'not-allowed' : 'pointer',
                  marginRight: '10px'
                }}
              >
                {processing ? '⏳ Processing Payment...' : '💳 Simulate Swish Payment'}
              </button>
              <button
                onClick={() => navigate('/orders')}
                style={{
                  padding: '15px 40px',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1.1em',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Back to Orders
              </button>
            </div>
          </>
        ) : (
          // Payment Success Screen
          <div style={{ textAlign: 'center' }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              padding: '40px',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              <div style={{ fontSize: '4em', marginBottom: '20px' }}>✅</div>
              <h2 style={{ color: '#10b981', marginBottom: '10px' }}>Payment Complete!</h2>
              <p style={{ fontSize: '1.1em', color: '#6b7280', marginBottom: '30px' }}>
                The payment has been successfully processed and recorded.
              </p>
              
              <div style={{
                backgroundColor: '#f3f4f6',
                borderRadius: '6px',
                padding: '20px',
                marginBottom: '30px',
                textAlign: 'left'
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '10px' }}>
                  <strong>Order ID:</strong>
                  <span>#{order.id}</span>
                  <strong>Customer:</strong>
                  <span>{order.customer_name}</span>
                  <strong>Amount Paid:</strong>
                  <span style={{ color: '#10b981', fontWeight: 'bold' }}>
                    {order.total_amount} SEK
                  </span>
                  <strong>Payment Ref:</strong>
                  <span>{paymentRef}</span>
                  <strong>Payment Date:</strong>
                  <span>{new Date().toLocaleString()}</span>
                </div>
              </div>

              <div style={{
                backgroundColor: '#d1fae5',
                border: '1px solid #10b981',
                borderRadius: '6px',
                padding: '12px',
                marginBottom: '20px',
                fontSize: '0.9em',
                color: '#065f46'
              }}>
                ✓ Payment has been marked as paid in the system
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button
                  onClick={() => navigate('/orders')}
                  style={{
                    padding: '12px 30px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '1em',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  Back to Orders
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  style={{
                    padding: '12px 30px',
                    backgroundColor: '#6366f1',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '1em',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default TeamSwishPayment;
