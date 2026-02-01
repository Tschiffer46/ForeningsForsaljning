import React from 'react';

const ProductList = ({ products, onEdit, onDelete, onToggleActive }) => {
  if (products.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '3rem',
        backgroundColor: '#f9fafb',
        borderRadius: '12px',
        border: '2px dashed #d1d5db'
      }}>
        <p style={{ fontSize: '1.125rem', color: '#6b7280', margin: 0 }}>
          No products found. Click "Add Product" to create one.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      overflow: 'hidden'
    }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
            <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>
              Product Name
            </th>
            <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>
              Description
            </th>
            <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: '600', color: '#374151' }}>
              Price
            </th>
            <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: '600', color: '#374151' }}>
              Subscription
            </th>
            <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: '600', color: '#374151' }}>
              Sacks/Pallet
            </th>
            <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: '600', color: '#374151' }}>
              Status
            </th>
            <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: '600', color: '#374151' }}>
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr
              key={product.id}
              style={{
                borderBottom: '1px solid #e5e7eb',
                opacity: product.active ? 1 : 0.5
              }}
            >
              <td style={{ padding: '1rem', fontWeight: '500', color: '#1f2937' }}>
                {product.name}
              </td>
              <td style={{ padding: '1rem', color: '#6b7280', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {product.description || '-'}
              </td>
              <td style={{ padding: '1rem', textAlign: 'right', color: '#1f2937' }}>
                {product.price} kr
              </td>
              <td style={{ padding: '1rem', textAlign: 'right', color: '#1f2937' }}>
                {product.subscription_price} kr
              </td>
              <td style={{ padding: '1rem', textAlign: 'center', color: '#1f2937' }}>
                {product.sacks_per_pallet}
              </td>
              <td style={{ padding: '1rem', textAlign: 'center' }}>
                <button
                  onClick={() => onToggleActive(product)}
                  style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '9999px',
                    border: 'none',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    backgroundColor: product.active ? '#dcfce7' : '#fee2e2',
                    color: product.active ? '#166534' : '#991b1b'
                  }}
                >
                  {product.active ? 'Active' : 'Inactive'}
                </button>
              </td>
              <td style={{ padding: '1rem', textAlign: 'right' }}>
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => onEdit(product)}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#7c3aed',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '500'
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(product)}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '500'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductList;
