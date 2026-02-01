import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminContext } from '../../../contexts/AdminContext';
import PaymentList from './PaymentList';
import LoadingSpinner from '../../shared/LoadingSpinner';
import NavBar from '../../shared/NavBar';

function PaymentManagement() {
  const navigate = useNavigate();
  const { payments, loadPayments, updatePayment, loading } = useContext(AdminContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Get user info from localStorage
  const userName = React.useMemo(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      return user?.full_name || user?.name || 'Admin';
    } catch {
      return 'Admin';
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  const handleMarkPaid = async (payment) => {
    const reference = prompt('Enter payment reference:');
    if (reference) {
      await updatePayment(payment.id, {
        payment_status: 'paid',
        payment_reference: reference,
        payment_date: new Date().toISOString().split('T')[0]
      });
    }
  };

  const handleMarkUnpaid = async (payment) => {
    if (window.confirm('Mark this payment as unpaid?')) {
      await updatePayment(payment.id, {
        payment_status: 'unpaid',
        payment_reference: null,
        payment_date: null
      });
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         String(payment.id).includes(searchTerm);
    const matchesStatus = !statusFilter || payment.payment_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: payments.reduce((sum, p) => sum + (p.total_price || 0), 0),
    paid: payments.filter(p => p.payment_status === 'paid').reduce((sum, p) => sum + (p.total_price || 0), 0),
    unpaid: payments.filter(p => p.payment_status === 'unpaid').reduce((sum, p) => sum + (p.total_price || 0), 0)
  };

  return (
    <>
      <NavBar 
        title="Payment Tracking"
        dashboardPath="/admin"
        userName={userName}
        onLogout={handleLogout}
      />
      <div className="dashboard" style={{ padding: '2rem' }}>

      <div className="stats-cards">
        <div className="stat-card">
          <h4>Total Orders</h4>
          <p className="stat-value">{payments.length}</p>
          <p className="stat-label">{stats.total.toFixed(2)} kr</p>
        </div>
        <div className="stat-card success">
          <h4>Paid</h4>
          <p className="stat-value">{payments.filter(p => p.payment_status === 'paid').length}</p>
          <p className="stat-label">{stats.paid.toFixed(2)} kr</p>
        </div>
        <div className="stat-card warning">
          <h4>Unpaid</h4>
          <p className="stat-value">{payments.filter(p => p.payment_status === 'unpaid').length}</p>
          <p className="stat-label">{stats.unpaid.toFixed(2)} kr</p>
        </div>
      </div>

      <div className="management-header">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
          </select>
        </div>
      </div>

      {loading.payments ? (
        <LoadingSpinner />
      ) : (
        <PaymentList
          payments={filteredPayments}
          onMarkPaid={handleMarkPaid}
          onMarkUnpaid={handleMarkUnpaid}
        />
      )}
    </div>
    </>
  );
}

export default PaymentManagement;
