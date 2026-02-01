import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminContext } from '../../../contexts/AdminContext';
import TeamList from './TeamList';
import TeamForm from './TeamForm';
import LoadingSpinner from '../../shared/LoadingSpinner';

function TeamManagement() {
  const navigate = useNavigate();
  const { teams, areas, loadTeams, loadAreas, createTeam, updateTeam, deleteTeam, loading } = useContext(AdminContext);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadTeams();
    loadAreas();
  }, [loadTeams, loadAreas]);

  const handleAdd = () => {
    setEditingTeam(null);
    setIsFormOpen(true);
  };

  const handleEdit = (team) => {
    setEditingTeam(team);
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this team? This will unassign all areas and customers.')) {
      await deleteTeam(id);
    }
  };

  const handleSave = async (teamData) => {
    if (editingTeam) {
      await updateTeam(editingTeam.id, teamData);
    } else {
      await createTeam(teamData);
    }
    setIsFormOpen(false);
    setEditingTeam(null);
  };

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dashboard">
      <nav className="navbar">
        <h2>Team Management</h2>
        <button onClick={() => navigate('/admin')}>Back to Dashboard</button>
      </nav>

      <div className="management-header">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search teams..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button onClick={handleAdd} className="btn-primary">Add Team</button>
      </div>

      {loading.teams ? (
        <LoadingSpinner />
      ) : (
        <TeamList
          teams={filteredTeams}
          areas={areas}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {isFormOpen && (
        <TeamForm
          team={editingTeam}
          onSave={handleSave}
          onCancel={() => { setIsFormOpen(false); setEditingTeam(null); }}
        />
      )}
    </div>
  );
}

export default TeamManagement;
