import React, { useState, useEffect } from 'react';
import { validateForm, productValidations } from '../../../utils/validation';

const ProductForm = ({ product, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    subscription_price: '',
    sacks_per_pallet: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        subscription_price: product.subscription_price || '',
        sacks_per_pallet: product.sacks_per_pallet || '',
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const { isValid, errors: validationErrors } = validateForm(formData, productValidations);
    
    if (!isValid) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        price: parseFloat(formData.price),
        subscription_price: parseFloat(formData.subscription_price || formData.price),
        sacks_per_pallet: parseInt(formData.sacks_per_pallet),
      });
    } catch (error) {
      // Error handled by parent
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = (fieldName) => ({
    width: '100%',
    padding: '0.75rem',
    border: `1px solid ${errors[fieldName] ? '#ef4444' : '#d1d5db'}`,
    borderRadius: '8px',
    fontSize: '1rem',
    backgroundColor: errors[fieldName] ? '#fef2f2' : 'white',
  });

  const labelStyle = {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: '500',
    color: '#374151',
  };

  const errorStyle = {
    color: '#ef4444',
    fontSize: '0.875rem',
    marginTop: '0.25rem',
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      padding: '2rem'
    }}>
      <h3 style={{
        margin: '0 0 1.5rem 0',
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: '#1f2937'
      }}>
        {product ? 'Edit Product' : 'Add New Product'}
      </h3>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>
              Product Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              style={inputStyle('name')}
              placeholder="e.g., Lambi Pellets 16kg"
            />
            {errors.name && <div style={errorStyle}>{errors.name}</div>}
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              style={{...inputStyle('description'), resize: 'vertical'}}
              placeholder="Product description..."
            />
            {errors.description && <div style={errorStyle}>{errors.description}</div>}
          </div>

          <div>
            <label style={labelStyle}>
              Price (kr) *
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              step="0.01"
              min="0"
              style={inputStyle('price')}
              placeholder="0.00"
            />
            {errors.price && <div style={errorStyle}>{errors.price}</div>}
          </div>

          <div>
            <label style={labelStyle}>
              Subscription Price (kr)
            </label>
            <input
              type="number"
              name="subscription_price"
              value={formData.subscription_price}
              onChange={handleChange}
              step="0.01"
              min="0"
              style={inputStyle('subscription_price')}
              placeholder="Same as price if empty"
            />
            {errors.subscription_price && <div style={errorStyle}>{errors.subscription_price}</div>}
          </div>

          <div>
            <label style={labelStyle}>
              Sacks per Pallet *
            </label>
            <input
              type="number"
              name="sacks_per_pallet"
              value={formData.sacks_per_pallet}
              onChange={handleChange}
              min="1"
              step="1"
              style={inputStyle('sacks_per_pallet')}
              placeholder="e.g., 75"
            />
            {errors.sacks_per_pallet && <div style={errorStyle}>{errors.sacks_per_pallet}</div>}
          </div>
        </div>

        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'flex-end',
          marginTop: '2rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid #e5e7eb'
        }}>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: 'white',
              color: '#374151',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: '500',
              opacity: isSubmitting ? 0.5 : 1
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#7c3aed',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: '500',
              opacity: isSubmitting ? 0.5 : 1
            }}
          >
            {isSubmitting ? 'Saving...' : (product ? 'Update Product' : 'Create Product')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
