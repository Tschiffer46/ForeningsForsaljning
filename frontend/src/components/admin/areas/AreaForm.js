import React, { useState, useEffect } from 'react';

function AreaForm({ area, teams, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    postal_codes: '',
    team_id: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (area) {
      setFormData({
        name: area.name || '',
        description: area.description || '',
        postal_codes: area.postal_codes || '',
        team_id: area.team_id || ''
      });
    }
  }, [area]);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
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
        <h3>{area ? 'Edit Area' : 'Add New Area'}</h3>
        <form onSubmit={handleSubmit}>
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
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>Postal Codes (comma-separated)</label>
            <input
              type="text"
              placeholder="e.g., 12345, 12346, 12347"
              value={formData.postal_codes}
              onChange={(e) => setFormData({ ...formData, postal_codes: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Assign to Team</label>
            <select
              value={formData.team_id}
              onChange={(e) => setFormData({ ...formData, team_id: e.target.value })}
            >
              <option value="">Unassigned</option>
              {teams.map(team => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
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

export default AreaForm;
