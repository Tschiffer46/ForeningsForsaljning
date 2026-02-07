import React, { useState, useEffect } from 'react';

function CustomerForm({ customer, areas, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    customer_number: '',
    name: '',
    phone: '',
    email: '',
    address: '',
    postal_code: '',
    city: '',
    geographic_area_id: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (customer) {
      setFormData({
        customer_number: customer.customer_number || '',
        name: customer.name || '',
        phone: customer.phone || '',
        email: customer.email || '',
        address: customer.address || '',
        postal_code: customer.postal_code || '',
        city: customer.city || '',
        geographic_area_id: customer.geographic_area_id || ''
      });
    } else {
      // Auto-generate customer number for new customers
      setFormData(prev => ({
        ...prev,
        customer_number: 'CUST' + Date.now()
      }));
    }
  }, [customer]);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.customer_number.trim()) newErrors.customer_number = 'Customer number is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSave(formData);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>{customer ? 'Edit Customer' : 'Add New Customer'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Customer Number *</label>
              <input
                type="text"
                value={formData.customer_number}
                onChange={(e) => setFormData({ ...formData, customer_number: e.target.value })}
                className={errors.customer_number ? 'error' : ''}
                disabled={!!customer}
              />
              {errors.customer_number && <span className="error-text">{errors.customer_number}</span>}
            </div>

            <div className="form-group">
              <label>Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={errors.name ? 'error' : ''}
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Postal Code</label>
              <input
                type="text"
                value={formData.postal_code}
                onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Geographic Area</label>
              <select
                value={formData.geographic_area_id}
                onChange={(e) => setFormData({ ...formData, geographic_area_id: e.target.value })}
              >
                <option value="">Unassigned</option>
                {areas.map(area => (
                  <option key={area.id} value={area.id}>{area.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CustomerForm;
