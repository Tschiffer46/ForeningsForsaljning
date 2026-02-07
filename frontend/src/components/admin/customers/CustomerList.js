import React from 'react';

function CustomerList({ customers, areas, onEdit, onDelete }) {
  if (customers.length === 0) {
    return <div className="empty-state">No customers found. Click "Add Customer" to create one.</div>;
  }

  const getAreaName = (areaId) => {
    const area = areas.find(a => a.id === areaId);
    return area ? area.name : '-';
  };

  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>Customer #</th>
          <th>Name</th>
          <th>Phone</th>
          <th>Email</th>
          <th>Area</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {customers.map(customer => (
          <tr key={customer.id}>
            <td><strong>{customer.customer_number}</strong></td>
            <td>{customer.name}</td>
            <td>{customer.phone || '-'}</td>
            <td>{customer.email || '-'}</td>
            <td>{getAreaName(customer.geographic_area_id)}</td>
            <td>
              <button onClick={() => onEdit(customer)} className="btn-sm">Edit</button>
              <button onClick={() => onDelete(customer.id)} className="btn-sm btn-danger">Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default CustomerList;
