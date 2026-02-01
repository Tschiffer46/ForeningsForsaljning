import React from 'react';

function TeamList({ teams, areas, onEdit, onDelete }) {
  if (teams.length === 0) {
    return <div className="empty-state">No teams found. Click "Add Team" to create one.</div>;
  }

  const getTeamAreas = (teamId) => {
    return areas.filter(a => a.team_id === teamId);
  };

  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>Team Name</th>
          <th>Username</th>
          <th>Assigned Areas</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {teams.map(team => {
          const teamAreas = getTeamAreas(team.id);
          return (
            <tr key={team.id}>
              <td><strong>{team.name}</strong></td>
              <td>{team.username}</td>
              <td>
                {teamAreas.length === 0 ? (
                  <span className="badge badge-warning">No areas</span>
                ) : (
                  <span className="badge badge-success">{teamAreas.length} area(s)</span>
                )}
                {teamAreas.length > 0 && (
                  <div className="area-list">
                    {teamAreas.map(a => a.name).join(', ')}
                  </div>
                )}
              </td>
              <td>
                <button onClick={() => onEdit(team)} className="btn-sm">Edit</button>
                <button onClick={() => onDelete(team.id)} className="btn-sm btn-danger">Delete</button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default TeamList;
