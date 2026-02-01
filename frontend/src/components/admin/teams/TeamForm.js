import React, { useState, useEffect } from 'react';

function TeamForm({ team, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (team) {
      setFormData({
        name: team.name || '',
        username: team.username || '',
        password: '' // Don't show existing password
      });
    }
  }, [team]);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!team && !formData.password.trim()) newErrors.password = 'Password is required for new teams';
    if (formData.password && formData.password.length < 4) newErrors.password = 'Password must be at least 4 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const dataToSave = { ...formData };
      if (team && !dataToSave.password) {
        delete dataToSave.password; // Don't update password if not provided
      }
      onSave(dataToSave);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>{team ? 'Edit Team' : 'Add New Team'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Team Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label>Username *</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className={errors.username ? 'error' : ''}
            />
            {errors.username && <span className="error-text">{errors.username}</span>}
          </div>

          <div className="form-group">
            <label>Password {team ? '(leave empty to keep current)' : '*'}</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className={errors.password ? 'error' : ''}
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
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

export default TeamForm;
