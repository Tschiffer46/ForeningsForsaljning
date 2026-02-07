import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminContext } from '../../../contexts/AdminContext';
import NavBar from '../../shared/NavBar';
import AreaList from './AreaList';
import AreaForm from './AreaForm';
import LoadingSpinner from '../../shared/LoadingSpinner';

function AreaManagement() {
  const navigate = useNavigate();
  const { areas, teams, loadAreas, loadTeams, createArea, updateArea, deleteArea, loading } = useContext(AdminContext);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingArea, setEditingArea] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [teamFilter, setTeamFilter] = useState('');

  // Get user info from localStorage
  const userName = React.useMemo(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      return user?.full_name || user?.name || 'Admin';
    } catch {
      return 'Admin';
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  useEffect(() => {
    loadAreas();
    loadTeams();
  }, [loadAreas, loadTeams]);

  const handleAdd = () => {
    setEditingArea(null);
    setIsFormOpen(true);
  };

  const handleEdit = (area) => {
    setEditingArea(area);
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this area?')) {
      await deleteArea(id);
    }
  };

  const handleSave = async (areaData) => {
    if (editingArea) {
      await updateArea(editingArea.id, areaData);
    } else {
      await createArea(areaData);
    }
    setIsFormOpen(false);
    setEditingArea(null);
  };

  const filteredAreas = areas.filter(area => {
    const matchesSearch = area.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (area.description && area.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesTeam = !teamFilter || String(area.team_id) === teamFilter;
    return matchesSearch && matchesTeam;
  });

  return (
    <>
      <NavBar 
        title="Geographic Areas Management"
        dashboardPath="/admin"
        userName={userName}
        onLogout={handleLogout}
      />
      <div className="dashboard" style={{ padding: '2rem' }}>

      <div className="management-header">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search areas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select value={teamFilter} onChange={(e) => setTeamFilter(e.target.value)}>
            <option value="">All Teams</option>
            {teams.map(team => (
              <option key={team.id} value={team.id}>{team.name}</option>
            ))}
          </select>
        </div>
        <button onClick={handleAdd} className="btn-primary">Add Area</button>
      </div>

      {loading.areas ? (
        <LoadingSpinner />
      ) : (
        <AreaList
          areas={filteredAreas}
          teams={teams}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {isFormOpen && (
        <AreaForm
          area={editingArea}
          teams={teams}
          onSave={handleSave}
          onCancel={() => { setIsFormOpen(false); setEditingArea(null); }}
        />
      )}
    </div>
    </>
  );
}

export default AreaManagement;
