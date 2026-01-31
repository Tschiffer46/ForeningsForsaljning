import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// Auth Context
const AuthContext = React.createContext();

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [token, setToken] = useState(null);
  const [clubId, setClubId] = useState(null);
  const [clubName, setClubName] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedRole = localStorage.getItem('role');
    const storedToken = localStorage.getItem('token');
    const storedClubId = localStorage.getItem('clubId');
    const storedClubName = localStorage.getItem('clubName');
    
    if (storedUser && storedRole && storedToken) {
      setUser(JSON.parse(storedUser));
      setRole(storedRole);
      setToken(storedToken);
      setClubId(storedClubId);
      setClubName(storedClubName);
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      axios.defaults.headers.common['x-user-role'] = storedRole;
      if (storedClubId) {
        axios.defaults.headers.common['x-club-id'] = storedClubId;
      }
    }
  }, []);

  const login = (userData, userRole, authToken, userClubId, userClubName) => {
    setUser(userData);
    setRole(userRole);
    setToken(authToken);
    setClubId(userClubId);
    setClubName(userClubName);
    
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('role', userRole);
    localStorage.setItem('token', authToken);
    if (userClubId) localStorage.setItem('clubId', userClubId);
    if (userClubName) localStorage.setItem('clubName', userClubName);
    
    axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
    axios.defaults.headers.common['x-user-role'] = userRole;
    if (userClubId) {
      axios.defaults.headers.common['x-club-id'] = userClubId;
    }
  };

  const logout = () => {
    setUser(null);
    setRole(null);
    setToken(null);
    setClubId(null);
    setClubName(null);
    
    localStorage.clear();
    delete axios.defaults.headers.common['Authorization'];
    delete axios.defaults.headers.common['x-user-role'];
    delete axios.defaults.headers.common['x-club-id'];
  };

  return (
    <AuthContext.Provider value={{ user, role, token, clubId, clubName, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Login Component
function Login() {
  const [userType, setUserType] = useState('team');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const auth = React.useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        username,
        password,
        userType
      });
      
      const { user, role, token, club_id, club_name } = response.data;
      auth.login(user, role, token, club_id, club_name);
      
      if (role === 'super_admin') {
        navigate('/super-admin');
      } else if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/team');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>FöreningsFörsäljning</h1>
        <p className="subtitle">Multi-Tenant Sales Platform</p>
        
        <div className="user-type-selector">
          <button 
            className={userType === 'super_admin' ? 'active' : ''}
            onClick={() => setUserType('super_admin')}
          >
            Super Admin
          </button>
          <button 
            className={userType === 'admin' ? 'active' : ''}
            onClick={() => setUserType('admin')}
          >
            Club Admin
          </button>
          <button 
            className={userType === 'team' ? 'active' : ''}
            onClick={() => setUserType('team')}
          >
            Team
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={userType === 'super_admin' ? 'superadmin' : userType === 'admin' ? 'admin.stockholm' : 'norrmalm'}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={userType === 'super_admin' ? 'superadmin123' : 'demo123 or team123'}
              required
            />
          </div>
          {error && <div className="error">{error}</div>}
          <button type="submit" className="btn-primary">Login</button>
        </form>

        <div className="demo-credentials">
          <p><small><strong>Demo Accounts:</strong></small></p>
          <p><small>Super Admin: superadmin / superadmin123</small></p>
          <p><small>Club Admin: admin.stockholm / demo123</small></p>
          <p><small>Team: norrmalm / team123</small></p>
        </div>
      </div>
    </div>
  );
}

// Super Admin Dashboard
function SuperAdminDashboard() {
  const auth = React.useContext(AuthContext);
  const [clubs, setClubs] = useState([]);
  const [showCreateClub, setShowCreateClub] = useState(false);
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [newClub, setNewClub] = useState({ name: '', slug: '', geographic_area: '', contact_name: '', contact_email: '' });
  const [newAdmin, setNewAdmin] = useState({ club_id: '', username: '', password: '', full_name: '', email: '' });

  useEffect(() => {
    loadClubs();
  }, []);

  const loadClubs = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/super-admin/clubs`);
      setClubs(response.data);
    } catch (err) {
      console.error('Error loading clubs:', err);
    }
  };

  const handleCreateClub = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/super-admin/clubs`, newClub);
      alert('Club created successfully!');
      setShowCreateClub(false);
      setNewClub({ name: '', slug: '', geographic_area: '', contact_name: '', contact_email: '' });
      loadClubs();
    } catch (err) {
      alert('Error creating club: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/super-admin/club-admins`, newAdmin);
      alert('Club admin created successfully!');
      setShowCreateAdmin(false);
      setNewAdmin({ club_id: '', username: '', password: '', full_name: '', email: '' });
    } catch (err) {
      alert('Error creating admin: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="dashboard">
      <nav className="navbar">
        <h2>Super Admin Dashboard - {auth.user?.full_name}</h2>
        <button onClick={() => auth.logout()}>Logout</button>
      </nav>

      <div className="container">
        <h3>Platform Clubs</h3>
        
        <div className="button-group">
          <button onClick={() => setShowCreateClub(!showCreateClub)} className="btn-primary">
            {showCreateClub ? 'Cancel' : 'Create New Club'}
          </button>
          <button onClick={() => setShowCreateAdmin(!showCreateAdmin)} className="btn-secondary">
            {showCreateAdmin ? 'Cancel' : 'Create Club Admin'}
          </button>
        </div>

        {showCreateClub && (
          <div className="form-section">
            <h4>Create New Club</h4>
            <form onSubmit={handleCreateClub}>
              <input
                type="text"
                placeholder="Club Name"
                value={newClub.name}
                onChange={(e) => setNewClub({...newClub, name: e.target.value})}
                required
              />
              <input
                type="text"
                placeholder="Slug (e.g., stockholm-if)"
                value={newClub.slug}
                onChange={(e) => setNewClub({...newClub, slug: e.target.value})}
                required
              />
              <input
                type="text"
                placeholder="Geographic Area (e.g., Stockholm County)"
                value={newClub.geographic_area}
                onChange={(e) => setNewClub({...newClub, geographic_area: e.target.value})}
                required
              />
              <input
                type="text"
                placeholder="Contact Name"
                value={newClub.contact_name}
                onChange={(e) => setNewClub({...newClub, contact_name: e.target.value})}
              />
              <input
                type="email"
                placeholder="Contact Email"
                value={newClub.contact_email}
                onChange={(e) => setNewClub({...newClub, contact_email: e.target.value})}
              />
              <button type="submit" className="btn-primary">Create Club</button>
            </form>
          </div>
        )}

        {showCreateAdmin && (
          <div className="form-section">
            <h4>Create Club Admin</h4>
            <form onSubmit={handleCreateAdmin}>
              <select
                value={newAdmin.club_id}
                onChange={(e) => setNewAdmin({...newAdmin, club_id: e.target.value})}
                required
              >
                <option value="">Select Club</option>
                {clubs.map(club => (
                  <option key={club.id} value={club.id}>{club.name}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Username (e.g., admin.city)"
                value={newAdmin.username}
                onChange={(e) => setNewAdmin({...newAdmin, username: e.target.value})}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={newAdmin.password}
                onChange={(e) => setNewAdmin({...newAdmin, password: e.target.value})}
                required
              />
              <input
                type="text"
                placeholder="Full Name"
                value={newAdmin.full_name}
                onChange={(e) => setNewAdmin({...newAdmin, full_name: e.target.value})}
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={newAdmin.email}
                onChange={(e) => setNewAdmin({...newAdmin, email: e.target.value})}
              />
              <button type="submit" className="btn-primary">Create Admin</button>
            </form>
          </div>
        )}

        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Geographic Area</th>
              <th>Status</th>
              <th>Monthly Fee</th>
            </tr>
          </thead>
          <tbody>
            {clubs.map(club => (
              <tr key={club.id}>
                <td>{club.id}</td>
                <td>{club.name}</td>
                <td>{club.geographic_area}</td>
                <td>
                  <span className={`status-badge ${club.subscription_status}`}>
                    {club.subscription_status}
                  </span>
                </td>
                <td>{club.monthly_fee} kr/month</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Club Admin Dashboard
function ClubAdminDashboard() {
  const auth = React.useContext(AuthContext);
  const [teams, setTeams] = useState([]);
  const [orders, setOrders] = useState([]);
  const [pallets, setPallets] = useState([]);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [newTeam, setNewTeam] = useState({ name: '', username: '', password: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [teamsRes, ordersRes, palletsRes] = await Promise.all([
        axios.get(`${API_URL}/api/teams`),
        axios.get(`${API_URL}/api/orders`),
        axios.get(`${API_URL}/api/admin/pallet-requirements?quarter=Q1&year=2026`)
      ]);
      setTeams(teamsRes.data);
      setOrders(ordersRes.data);
      setPallets(palletsRes.data);
    } catch (err) {
      console.error('Error loading data:', err);
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/teams`, newTeam);
      alert('Team created successfully!');
      setShowCreateTeam(false);
      setNewTeam({ name: '', username: '', password: '' });
      loadData();
    } catch (err) {
      alert('Error creating team: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="dashboard">
      <nav className="navbar">
        <div>
          <h2>{auth.clubName}</h2>
          <p className="subtitle">Club Admin - {auth.user?.full_name}</p>
        </div>
        <button onClick={() => auth.logout()}>Logout</button>
      </nav>

      <div className="container">
        <section>
          <h3>Teams</h3>
          <button onClick={() => setShowCreateTeam(!showCreateTeam)} className="btn-primary">
            {showCreateTeam ? 'Cancel' : 'Create New Team'}
          </button>

          {showCreateTeam && (
            <div className="form-section">
              <form onSubmit={handleCreateTeam}>
                <input
                  type="text"
                  placeholder="Team Name"
                  value={newTeam.name}
                  onChange={(e) => setNewTeam({...newTeam, name: e.target.value})}
                  required
                />
                <input
                  type="text"
                  placeholder="Username"
                  value={newTeam.username}
                  onChange={(e) => setNewTeam({...newTeam, username: e.target.value})}
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={newTeam.password}
                  onChange={(e) => setNewTeam({...newTeam, password: e.target.value})}
                  required
                />
                <button type="submit" className="btn-primary">Create Team</button>
              </form>
            </div>
          )}

          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Team Name</th>
                <th>Username</th>
              </tr>
            </thead>
            <tbody>
              {teams.map(team => (
                <tr key={team.id}>
                  <td>{team.id}</td>
                  <td>{team.name}</td>
                  <td>{team.username}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section>
          <h3>Recent Orders</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Team</th>
                <th>Quarter</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 10).map(order => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.customer_name}</td>
                  <td>{order.team_name}</td>
                  <td>{order.quarter} {order.year}</td>
                  <td>{order.total_amount} kr</td>
                  <td>{order.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section>
          <h3>Pallet Requirements (Q1 2026)</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Total Sacks</th>
                <th>Sacks/Pallet</th>
                <th>Pallets Needed</th>
              </tr>
            </thead>
            <tbody>
              {pallets.map(pallet => (
                <tr key={pallet.product_id}>
                  <td>{pallet.product_name}</td>
                  <td>{pallet.total_sacks || 0}</td>
                  <td>{pallet.sacks_per_pallet}</td>
                  <td><strong>{pallet.pallets_needed || 0}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}

// Team Dashboard
function TeamDashboard() {
  const auth = React.useContext(AuthContext);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [showCreateOrder, setShowCreateOrder] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    customer_number: 'CUST' + Date.now(),
    name: '',
    address: '',
    postal_address: '',
    phone_number: '',
    email: ''
  });
  const [newOrder, setNewOrder] = useState({
    customer_id: '',
    quarter: 'Q1',
    year: 2026,
    items: []
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [customersRes, productsRes] = await Promise.all([
        axios.get(`${API_URL}/api/customers`),
        axios.get(`${API_URL}/api/products`)
      ]);
      setCustomers(customersRes.data);
      setProducts(productsRes.data);
    } catch (err) {
      console.error('Error loading data:', err);
    }
  };

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/customers`, newCustomer);
      alert('Customer added successfully!');
      setShowAddCustomer(false);
      setNewCustomer({
        customer_number: 'CUST' + Date.now(),
        name: '',
        address: '',
        postal_address: '',
        phone_number: '',
        email: ''
      });
      loadData();
    } catch (err) {
      alert('Error adding customer: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (newOrder.items.length === 0) {
      alert('Please add at least one product');
      return;
    }
    try {
      await axios.post(`${API_URL}/api/orders`, newOrder);
      alert('Order created successfully!');
      setShowCreateOrder(false);
      setNewOrder({ customer_id: '', quarter: 'Q1', year: 2026, items: [] });
      loadData();
    } catch (err) {
      alert('Error creating order: ' + (err.response?.data?.error || err.message));
    }
  };

  const addProductToOrder = (productId) => {
    const existing = newOrder.items.find(item => item.product_id === productId);
    if (existing) {
      setNewOrder({
        ...newOrder,
        items: newOrder.items.map(item =>
          item.product_id === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      });
    } else {
      setNewOrder({
        ...newOrder,
        items: [...newOrder.items, { product_id: productId, quantity: 1, is_subscription: false }]
      });
    }
  };

  return (
    <div className="dashboard">
      <nav className="navbar">
        <div>
          <h2>{auth.clubName}</h2>
          <p className="subtitle">Team: {auth.user?.name}</p>
        </div>
        <button onClick={() => auth.logout()}>Logout</button>
      </nav>

      <div className="container">
        <section>
          <h3>Customers</h3>
          <div className="button-group">
            <button onClick={() => setShowAddCustomer(!showAddCustomer)} className="btn-primary">
              {showAddCustomer ? 'Cancel' : 'Add Customer'}
            </button>
            <button onClick={() => setShowCreateOrder(!showCreateOrder)} className="btn-secondary">
              {showCreateOrder ? 'Cancel' : 'Create Order'}
            </button>
          </div>

          {showAddCustomer && (
            <div className="form-section">
              <h4>Add New Customer</h4>
              <form onSubmit={handleAddCustomer}>
                <input type="text" placeholder="Customer Number" value={newCustomer.customer_number} readOnly />
                <input
                  type="text"
                  placeholder="Name *"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                  required
                />
                <input
                  type="text"
                  placeholder="Address *"
                  value={newCustomer.address}
                  onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})}
                  required
                />
                <input
                  type="text"
                  placeholder="Postal Address *"
                  value={newCustomer.postal_address}
                  onChange={(e) => setNewCustomer({...newCustomer, postal_address: e.target.value})}
                  required
                />
                <input
                  type="tel"
                  placeholder="Phone Number *"
                  value={newCustomer.phone_number}
                  onChange={(e) => setNewCustomer({...newCustomer, phone_number: e.target.value})}
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                />
                <button type="submit" className="btn-primary">Add Customer</button>
              </form>
            </div>
          )}

          {showCreateOrder && (
            <div className="form-section">
              <h4>Create Order</h4>
              <form onSubmit={handleCreateOrder}>
                <select
                  value={newOrder.customer_id}
                  onChange={(e) => setNewOrder({...newOrder, customer_id: e.target.value})}
                  required
                >
                  <option value="">Select Customer</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} - {customer.address}
                    </option>
                  ))}
                </select>
                
                <div className="products-grid">
                  {products.map(product => (
                    <div key={product.id} className="product-card">
                      <h5>{product.name}</h5>
                      <p>{product.price} kr ({product.subscription_price} kr subscription)</p>
                      <button type="button" onClick={() => addProductToOrder(product.id)} className="btn-small">
                        Add
                      </button>
                    </div>
                  ))}
                </div>

                {newOrder.items.length > 0 && (
                  <div className="order-summary">
                    <h5>Order Items:</h5>
                    {newOrder.items.map((item, idx) => {
                      const product = products.find(p => p.id === item.product_id);
                      return (
                        <div key={idx}>
                          {product?.name} x {item.quantity}
                        </div>
                      );
                    })}
                  </div>
                )}

                <button type="submit" className="btn-primary">Create Order</button>
              </form>
            </div>
          )}

          <table className="data-table">
            <thead>
              <tr>
                <th>Customer #</th>
                <th>Name</th>
                <th>Address</th>
                <th>Phone</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(customer => (
                <tr key={customer.id}>
                  <td>{customer.customer_number}</td>
                  <td>{customer.name}</td>
                  <td>{customer.address}</td>
                  <td>{customer.phone_number}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}

// Protected Route Component
function ProtectedRoute({ children, allowedRoles }) {
  const auth = React.useContext(AuthContext);
  
  if (!auth.user) {
    return <Navigate to="/" />;
  }
  
  if (allowedRoles && !allowedRoles.includes(auth.role)) {
    return <Navigate to="/" />;
  }
  
  return children;
}

// Main App Component
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/super-admin" element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <SuperAdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ClubAdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/team" element={
            <ProtectedRoute allowedRoles={['team']}>
              <TeamDashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
