// API utility functions for making HTTP requests

const API_URL = process.env.NODE_ENV === 'production' 
  ? window.location.origin 
  : (process.env.REACT_APP_API_URL || 'http://localhost:3001');

class APIError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = 'APIError';
  }
}

const handleResponse = async (response) => {
  const contentType = response.headers.get('content-type');
  const isJSON = contentType && contentType.includes('application/json');
  
  const data = isJSON ? await response.json() : await response.text();
  
  if (!response.ok) {
    throw new APIError(
      data.error || data.message || 'Request failed',
      response.status,
      data
    );
  }
  
  return data;
};

const api = {
  // Generic request method
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'x-club-id': '1', // Multi-tenant club ID
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(`${API_URL}${endpoint}`, config);
      return await handleResponse(response);
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError('Network error', 0, { originalError: error.message });
    }
  },

  // GET request
  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  },

  // POST request
  post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // PUT request
  put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // DELETE request
  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  },

  // Products
  products: {
    getAll: () => api.get('/api/products'),
    getById: (id) => api.get(`/api/products/${id}`),
    create: (data) => api.post('/api/products', data),
    update: (id, data) => api.put(`/api/products/${id}`, data),
    delete: (id) => api.delete(`/api/products/${id}`),
  },

  // Teams
  teams: {
    getAll: () => api.get('/api/teams'),
    getById: (id) => api.get(`/api/teams/${id}`),
    create: (data) => api.post('/api/teams', data),
    update: (id, data) => api.put(`/api/teams/${id}`, data),
    delete: (id) => api.delete(`/api/teams/${id}`),
  },

  // Customers
  customers: {
    getAll: () => api.get('/api/customers'),
    getById: (id) => api.get(`/api/customers/${id}`),
    create: (data) => api.post('/api/customers', data),
    update: (id, data) => api.put(`/api/customers/${id}`, data),
    delete: (id) => api.delete(`/api/customers/${id}`),
  },

  // Orders
  orders: {
    getAll: () => api.get('/api/orders'),
    getById: (id) => api.get(`/api/orders/${id}`),
    create: (data) => api.post('/api/orders', data),
    markPaid: (id, reference) => api.put(`/api/orders/${id}/mark-paid`, { reference }),
  },

  // Areas (to be implemented in backend)
  areas: {
    getAll: () => api.get('/api/areas'),
    getById: (id) => api.get(`/api/areas/${id}`),
    create: (data) => api.post('/api/areas', data),
    update: (id, data) => api.put(`/api/areas/${id}`, data),
    delete: (id) => api.delete(`/api/areas/${id}`),
    assignTeam: (id, teamId) => api.put(`/api/areas/${id}/assign-team`, { teamId }),
  },

  // Payments
  payments: {
    getAll: () => api.get('/api/payments'),
    getById: (id) => api.get(`/api/payments/${id}`),
    update: (id, data) => api.put(`/api/payments/${id}`, data),
    markPaid: (id, reference) => api.put(`/api/payments/${id}/mark-paid`, { payment_reference: reference }),
    markUnpaid: (id) => api.put(`/api/payments/${id}/mark-unpaid`),
  },
};

export default api;
export { APIError };
