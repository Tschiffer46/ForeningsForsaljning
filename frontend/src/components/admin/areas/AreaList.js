import React from 'react';

function AreaList({ areas, teams, onEdit, onDelete }) {
  if (areas.length === 0) {
    return <div className="empty-state">No areas found. Click "Add Area" to create one.</div>;
  }

  const getTeamName = (teamId) => {
    const team = teams.find(t => t.id === teamId);
    return team ? team.name : 'Unassigned';
  };

  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Description</th>
          <th>Postal Codes</th>
          <th>Assigned Team</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {areas.map(area => (
          <tr key={area.id}>
            <td><strong>{area.name}</strong></td>
            <td>{area.description || '-'}</td>
            <td>{area.postal_codes || '-'}</td>
            <td>
              <span className={area.team_id ? 'badge badge-success' : 'badge badge-warning'}>
                {getTeamName(area.team_id)}
              </span>
            </td>
            <td>
              <button onClick={() => onEdit(area)} className="btn-sm">Edit</button>
              <button onClick={() => onDelete(area.id)} className="btn-sm btn-danger">Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default AreaList;
