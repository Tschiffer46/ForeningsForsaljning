import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || window.location.origin;

function TeamProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/products`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(response.data.filter(p => p.active));
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading products...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ marginBottom: '20px' }}>Product Catalog</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
        {products.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280', gridColumn: '1 / -1' }}>
            No active products available
          </div>
        ) : (
          products.map((product) => (
            <div
              key={product.id}
              style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                padding: '20px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}
            >
              <h3 style={{ marginTop: 0, marginBottom: '10px', color: '#1f2937' }}>
                {product.name}
              </h3>
              {product.description && (
                <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '15px' }}>
                  {product.description}
                </p>
              )}
              <div style={{ marginBottom: '10px' }}>
                <span style={{ fontWeight: 'bold', color: '#1f2937' }}>Price:</span>{' '}
                <span style={{ color: '#059669', fontSize: '18px', fontWeight: 'bold' }}>
                  {product.price} SEK
                </span>
              </div>
              {product.subscription_price && (
                <div style={{ marginBottom: '10px' }}>
                  <span style={{ fontWeight: 'bold', color: '#1f2937' }}>Subscription:</span>{' '}
                  <span style={{ color: '#059669' }}>
                    {product.subscription_price} SEK
                  </span>
                </div>
              )}
              <div style={{ marginBottom: '10px' }}>
                <span style={{ fontWeight: 'bold', color: '#1f2937' }}>Sacks/Pallet:</span>{' '}
                <span>{product.sacks_per_pallet}</span>
              </div>
              {product.type && (
                <div style={{
                  marginTop: '15px',
                  padding: '4px 8px',
                  backgroundColor: '#dbeafe',
                  color: '#1e40af',
                  borderRadius: '4px',
                  fontSize: '12px',
                  display: 'inline-block'
                }}>
                  {product.type}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default TeamProducts;
