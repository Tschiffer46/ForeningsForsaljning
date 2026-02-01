import React, { createContext, useContext, useState, useCallback } from 'react';
import api from '../utils/api';

const AdminContext = createContext();

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
};

export const AdminProvider = ({ children }) => {
  // State for products
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);

  // State for teams
  const [teams, setTeams] = useState([]);
  const [teamsLoading, setTeamsLoading] = useState(false);

  // State for customers
  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(false);

  // State for areas
  const [areas, setAreas] = useState([]);
  const [areasLoading, setAreasLoading] = useState(false);

  // State for orders/payments
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Toast notifications
  const [toast, setToast] = useState(null);

  // Products methods
  const loadProducts = useCallback(async () => {
    setProductsLoading(true);
    try {
      const data = await api.products.getAll();
      setProducts(data);
      return data;
    } catch (error) {
      showToast(error.message, 'error');
      throw error;
    } finally {
      setProductsLoading(false);
    }
  }, []);

  const createProduct = useCallback(async (productData) => {
    try {
      const newProduct = await api.products.create(productData);
      setProducts(prev => [...prev, newProduct]);
      showToast('Product created successfully', 'success');
      return newProduct;
    } catch (error) {
      showToast(error.message, 'error');
      throw error;
    }
  }, []);

  const updateProduct = useCallback(async (id, productData) => {
    try {
      const updatedProduct = await api.products.update(id, productData);
      setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p));
      showToast('Product updated successfully', 'success');
      return updatedProduct;
    } catch (error) {
      showToast(error.message, 'error');
      throw error;
    }
  }, []);

  const deleteProduct = useCallback(async (id) => {
    try {
      await api.products.delete(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      showToast('Product deleted successfully', 'success');
    } catch (error) {
      showToast(error.message, 'error');
      throw error;
    }
  }, []);

  // Teams methods
  const loadTeams = useCallback(async () => {
    setTeamsLoading(true);
    try {
      const data = await api.teams.getAll();
      setTeams(data);
      return data;
    } catch (error) {
      showToast(error.message, 'error');
      throw error;
    } finally {
      setTeamsLoading(false);
    }
  }, []);

  const createTeam = useCallback(async (teamData) => {
    try {
      const newTeam = await api.teams.create(teamData);
      setTeams(prev => [...prev, newTeam]);
      showToast('Team created successfully', 'success');
      return newTeam;
    } catch (error) {
      showToast(error.message, 'error');
      throw error;
    }
  }, []);

  const updateTeam = useCallback(async (id, teamData) => {
    try {
      const updatedTeam = await api.teams.update(id, teamData);
      setTeams(prev => prev.map(t => t.id === id ? updatedTeam : t));
      showToast('Team updated successfully', 'success');
      return updatedTeam;
    } catch (error) {
      showToast(error.message, 'error');
      throw error;
    }
  }, []);

  const deleteTeam = useCallback(async (id) => {
    try {
      await api.teams.delete(id);
      setTeams(prev => prev.filter(t => t.id !== id));
      showToast('Team deleted successfully', 'success');
    } catch (error) {
      showToast(error.message, 'error');
      throw error;
    }
  }, []);

  // Customers methods
  const loadCustomers = useCallback(async () => {
    setCustomersLoading(true);
    try {
      const data = await api.customers.getAll();
      setCustomers(data);
      return data;
    } catch (error) {
      showToast(error.message, 'error');
      throw error;
    } finally {
      setCustomersLoading(false);
    }
  }, []);

  const createCustomer = useCallback(async (customerData) => {
    try {
      const newCustomer = await api.customers.create(customerData);
      setCustomers(prev => [...prev, newCustomer]);
      showToast('Customer created successfully', 'success');
      return newCustomer;
    } catch (error) {
      showToast(error.message, 'error');
      throw error;
    }
  }, []);

  const updateCustomer = useCallback(async (id, customerData) => {
    try {
      const updatedCustomer = await api.customers.update(id, customerData);
      setCustomers(prev => prev.map(c => c.id === id ? updatedCustomer : c));
      showToast('Customer updated successfully', 'success');
      return updatedCustomer;
    } catch (error) {
      showToast(error.message, 'error');
      throw error;
    }
  }, []);

  const deleteCustomer = useCallback(async (id) => {
    try {
      await api.customers.delete(id);
      setCustomers(prev => prev.filter(c => c.id !== id));
      showToast('Customer deleted successfully', 'success');
    } catch (error) {
      showToast(error.message, 'error');
      throw error;
    }
  }, []);

  // Areas methods
  const loadAreas = useCallback(async () => {
    setAreasLoading(true);
    try {
      const data = await api.areas.getAll();
      setAreas(data);
      return data;
    } catch (error) {
      showToast(error.message, 'error');
      throw error;
    } finally {
      setAreasLoading(false);
    }
  }, []);

  const createArea = useCallback(async (areaData) => {
    try {
      const newArea = await api.areas.create(areaData);
      setAreas(prev => [...prev, newArea]);
      showToast('Area created successfully', 'success');
      return newArea;
    } catch (error) {
      showToast(error.message, 'error');
      throw error;
    }
  }, []);

  const updateArea = useCallback(async (id, areaData) => {
    try {
      const updatedArea = await api.areas.update(id, areaData);
      setAreas(prev => prev.map(a => a.id === id ? updatedArea : a));
      showToast('Area updated successfully', 'success');
      return updatedArea;
    } catch (error) {
      showToast(error.message, 'error');
      throw error;
    }
  }, []);

  const deleteArea = useCallback(async (id) => {
    try {
      await api.areas.delete(id);
      setAreas(prev => prev.filter(a => a.id !== id));
      showToast('Area deleted successfully', 'success');
    } catch (error) {
      showToast(error.message, 'error');
      throw error;
    }
  }, []);

  // Orders methods
  const loadOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const data = await api.orders.getAll();
      setOrders(data);
      return data;
    } catch (error) {
      showToast(error.message, 'error');
      throw error;
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  const markOrderPaid = useCallback(async (id, reference) => {
    try {
      await api.orders.markPaid(id, reference);
      setOrders(prev => prev.map(o => o.id === id ? { ...o, paid: true, payment_reference: reference } : o));
      showToast('Payment marked as paid', 'success');
    } catch (error) {
      showToast(error.message, 'error');
      throw error;
    }
  }, []);

  // Toast helper
  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  const value = {
    // Products
    products,
    productsLoading,
    loadProducts,
    createProduct,
    updateProduct,
    deleteProduct,

    // Teams
    teams,
    teamsLoading,
    loadTeams,
    createTeam,
    updateTeam,
    deleteTeam,

    // Customers
    customers,
    customersLoading,
    loadCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,

    // Areas
    areas,
    areasLoading,
    loadAreas,
    createArea,
    updateArea,
    deleteArea,

    // Orders
    orders,
    ordersLoading,
    loadOrders,
    markOrderPaid,

    // Toast
    toast,
    showToast,
    hideToast,
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};
