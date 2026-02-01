import React from 'react';

function PaymentList({ payments, onMarkPaid, onMarkUnpaid }) {
  if (payments.length === 0) {
    return <div className="empty-state">No payments found.</div>;
  }

  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>Order #</th>
          <th>Customer</th>
          <th>Date</th>
          <th>Amount</th>
          <th>Status</th>
          <th>Payment Ref</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {payments.map(payment => (
          <tr key={payment.id}>
            <td><strong>#{payment.id}</strong></td>
            <td>{payment.customer_name || 'Unknown'}</td>
            <td>{new Date(payment.order_date).toLocaleDateString()}</td>
            <td>{payment.total_price?.toFixed(2)} kr</td>
            <td>
              <span className={`badge ${payment.payment_status === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                {payment.payment_status || 'unpaid'}
              </span>
            </td>
            <td>{payment.payment_reference || '-'}</td>
            <td>
              {payment.payment_status === 'unpaid' ? (
                <button onClick={() => onMarkPaid(payment)} className="btn-sm btn-success">
                  Mark Paid
                </button>
              ) : (
                <button onClick={() => onMarkUnpaid(payment)} className="btn-sm btn-warning">
                  Mark Unpaid
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default PaymentList;
