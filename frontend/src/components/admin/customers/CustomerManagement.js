import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminContext } from '../../../contexts/AdminContext';
import CustomerList from './CustomerList';
import CustomerForm from './CustomerForm';
import LoadingSpinner from '../../shared/LoadingSpinner';

function CustomerManagement() {
  const navigate = useNavigate();
  const { customers, areas, loadCustomers, loadAreas, createCustomer, updateCustomer, deleteCustomer, loading } = useContext(AdminContext);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [areaFilter, setAreaFilter] = useState('');

  useEffect(() => {
    loadCustomers();
    loadAreas();
  }, [loadCustomers, loadAreas]);

  const handleAdd = () => {
    setEditingCustomer(null);
    setIsFormOpen(true);
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      await deleteCustomer(id);
    }
  };

  const handleSave = async (customerData) => {
    if (editingCustomer) {
      await updateCustomer(editingCustomer.id, customerData);
    } else {
      await createCustomer(customerData);
    }
    setIsFormOpen(false);
    setEditingCustomer(null);
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.customer_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (customer.phone && customer.phone.includes(searchTerm));
    const matchesArea = !areaFilter || String(customer.geographic_area_id) === areaFilter;
    return matchesSearch && matchesArea;
  });

  return (
    <div className="dashboard">
      <nav className="navbar">
        <h2>Customer Management</h2>
        <button onClick={() => navigate('/admin')}>Back to Dashboard</button>
      </nav>

      <div className="management-header">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select value={areaFilter} onChange={(e) => setAreaFilter(e.target.value)}>
            <option value="">All Areas</option>
            {areas.map(area => (
              <option key={area.id} value={area.id}>{area.name}</option>
            ))}
          </select>
        </div>
        <button onClick={handleAdd} className="btn-primary">Add Customer</button>
      </div>

      {loading.customers ? (
        <LoadingSpinner />
      ) : (
        <CustomerList
          customers={filteredCustomers}
          areas={areas}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {isFormOpen && (
        <CustomerForm
          customer={editingCustomer}
          areas={areas}
          onSave={handleSave}
          onCancel={() => { setIsFormOpen(false); setEditingCustomer(null); }}
        />
      )}
    </div>
  );
}

export default CustomerManagement;
