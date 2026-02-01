import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';

// Use production URL when deployed, localhost for development
const API_URL = process.env.NODE_ENV === 'production' 
  ? window.location.origin 
  : (process.env.REACT_APP_API_URL || 'http://localhost:3001');

// Auth Context
const AuthContext = React.createContext();

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedRole = localStorage.getItem('role');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedRole && storedToken) {
      setUser(JSON.parse(storedUser));
      setRole(storedRole);
      setToken(storedToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      axios.defaults.headers.common['x-user-role'] = storedRole;
    }
  }, []);

  const login = (userData, userRole, authToken) => {
    setUser(userData);
    setRole(userRole);
    setToken(authToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('role', userRole);
    localStorage.setItem('token', authToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
    axios.defaults.headers.common['x-user-role'] = userRole;
  };

  const logout = () => {
    setUser(null);
    setRole(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    delete axios.defaults.headers.common['x-user-role'];
  };

  return (
    <AuthContext.Provider value={{ user, role, token, login, logout }}>
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
      auth.login(response.data.user, response.data.role, response.data.token);
      navigate(response.data.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>FöreningsFörsäljning</h1>
        <p className="subtitle">Sales Organization System</p>
        
        <div className="user-type-selector">
          <button 
            className={userType === 'team' ? 'active' : ''}
            onClick={() => setUserType('team')}
          >
            Team Login
          </button>
          <button 
            className={userType === 'admin' ? 'active' : ''}
            onClick={() => setUserType('admin')}
          >
            Admin Login
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="error">{error}</div>}
          <button type="submit" className="btn-primary">Login</button>
        </form>

        <div className="public-links">
          <Link to="/customer-order">Place Order as Customer</Link>
        </div>
        
        <div className="demo-credentials">
          <p><small>Demo: Admin login - username: <strong>admin</strong>, password: <strong>admin123</strong></small></p>
        </div>
      </div>
    </div>
  );
}

// Dashboard Component (for Teams)
function Dashboard() {
  const auth = React.useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <div className="dashboard">
      <nav className="navbar">
        <h2>FöreningsFörsäljning - {auth.user?.name}</h2>
        <button onClick={() => auth.logout()}>Logout</button>
      </nav>

      <div className="dashboard-grid">
        <div className="dashboard-card" onClick={() => navigate('/customers')}>
          <h3>👥 Customers</h3>
          <p>Manage customer information</p>
        </div>
        <div className="dashboard-card" onClick={() => navigate('/orders')}>
          <h3>📦 Orders</h3>
          <p>View and create orders</p>
        </div>
        <div className="dashboard-card" onClick={() => navigate('/products')}>
          <h3>📋 Products</h3>
          <p>View product catalog</p>
        </div>
        <div className="dashboard-card" onClick={() => navigate('/delivery')}>
          <h3>🚚 Delivery</h3>
          <p>Delivery summaries</p>
        </div>
      </div>
    </div>
  );
}

// Admin Dashboard
function AdminDashboard() {
  const auth = React.useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [quarter, setQuarter] = useState('Q1');
  const [year, setYear] = useState(new Date().getFullYear());

  const loadStats = React.useCallback(async () => {
    try {
      const [teamStats, palletStats] = await Promise.all([
        axios.get(`${API_URL}/api/admin/orders-by-team?quarter=${quarter}&year=${year}`),
        axios.get(`${API_URL}/api/admin/pallet-requirements?quarter=${quarter}&year=${year}`)
      ]);
      setStats({ teams: teamStats.data, pallets: palletStats.data });
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  }, [quarter, year]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return (
    <div className="dashboard">
      <nav className="navbar">
        <h2>Admin Dashboard - {auth.user?.full_name}</h2>
        <button onClick={() => auth.logout()}>Logout</button>
      </nav>

      <div className="filter-bar">
        <select value={quarter} onChange={(e) => setQuarter(e.target.value)}>
          <option value="Q1">Q1</option>
          <option value="Q2">Q2</option>
          <option value="Q3">Q3</option>
          <option value="Q4">Q4</option>
        </select>
        <input 
          type="number" 
          value={year} 
          onChange={(e) => setYear(e.target.value)}
          min="2020"
          max="2030"
        />
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card" onClick={() => navigate('/admin/teams')}>
          <h3>👥 Manage Teams</h3>
          <p>Create and manage teams</p>
        </div>
        <div className="dashboard-card" onClick={() => navigate('/admin/areas')}>
          <h3>🗺️ Geographic Areas</h3>
          <p>Define team territories</p>
        </div>
        <div className="dashboard-card" onClick={() => navigate('/admin/products')}>
          <h3>📋 Manage Products</h3>
          <p>Add, edit, and price products</p>
        </div>
        <div className="dashboard-card" onClick={() => navigate('/admin/payments')}>
          <h3>💰 Payment Tracking</h3>
          <p>Mark payments as paid/unpaid</p>
        </div>
      </div>

      {stats && (
        <>
          <div className="stats-section">
            <h3>Orders by Team ({quarter} {year})</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Team</th>
                  <th>Orders</th>
                  <th>Total Revenue</th>
                  <th>Paid Amount</th>
                  <th>Outstanding</th>
                </tr>
              </thead>
              <tbody>
                {stats.teams.map(team => (
                  <tr key={team.team_id}>
                    <td>{team.team_name}</td>
                    <td>{team.order_count || 0}</td>
                    <td>{(team.total_revenue || 0).toFixed(2)} kr</td>
                    <td>{(team.paid_amount || 0).toFixed(2)} kr</td>
                    <td>{((team.total_revenue || 0) - (team.paid_amount || 0)).toFixed(2)} kr</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="stats-section">
            <h3>Pallet Requirements ({quarter} {year})</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Total Sacks</th>
                  <th>Sacks per Pallet</th>
                  <th>Pallets Needed</th>
                </tr>
              </thead>
              <tbody>
                {stats.pallets.map(product => (
                  <tr key={product.product_id}>
                    <td>{product.product_name}</td>
                    <td>{product.total_sacks || 0}</td>
                    <td>{product.sacks_per_pallet}</td>
                    <td><strong>{product.pallets_needed || 0}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

// Customer Order Form (Public - No Login Required)
function CustomerOrderForm() {
  const [step, setStep] = useState(1);
  const [customerInfo, setCustomerInfo] = useState({
    customer_number: 'CUST' + Date.now(),
    name: '',
    address: '',
    postal_address: '',
    phone_number: '',
    email: ''
  });
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const [paymentRef, setPaymentRef] = useState('');
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();

  const loadProducts = React.useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/api/products`);
      setProducts(response.data);
    } catch (err) {
      console.error('Error loading products:', err);
      alert('Unable to load products. Please try again.');
    }
  }, []);

  const calculateTotal = React.useCallback(() => {
    const sum = cart.reduce((acc, item) => {
      const product = products.find(p => p.id === item.product_id);
      if (!product) return acc;
      const price = item.is_subscription ? product.subscription_price : product.price;
      return acc + (price * item.quantity);
    }, 0);
    setTotal(sum);
  }, [cart, products]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    calculateTotal();
  }, [calculateTotal]);

  const addToCart = (productId, quantity, isSubscription) => {
    const existingIndex = cart.findIndex(item => 
      item.product_id === productId && item.is_subscription === isSubscription
    );
    
    if (existingIndex >= 0) {
      const newCart = [...cart];
      newCart[existingIndex].quantity += quantity;
      setCart(newCart);
    } else {
      setCart([...cart, { product_id: productId, quantity, is_subscription: isSubscription }]);
    }
  };

  const removeFromCart = (index) => {
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);
  };

  const handleSwishPayment = () => {
    setProcessing(true);
    const mockRef = 'SWISH-' + Date.now();
    setPaymentRef(mockRef);
    
    // Simulate Swish payment processing (2 seconds)
    setTimeout(() => {
      submitOrder(mockRef);
    }, 2000);
  };

  const submitOrder = async (ref) => {
    try {
      // Create customer (no auth required for public endpoint)
      const customerResponse = await axios.post(`${API_URL}/api/customers`, customerInfo);
      
      // Create order
      const orderResponse = await axios.post(`${API_URL}/api/orders`, {
        customer_id: customerResponse.data.id,
        quarter: 'Q' + Math.ceil((new Date().getMonth() + 1) / 3),
        year: new Date().getFullYear(),
        items: cart
      });

      // Find the payment record and mark as paid
      const orderId = orderResponse.data.id;
      // We need to get the payment ID first
      const orderDetails = await axios.get(`${API_URL}/api/orders/${orderId}`);
      if (orderDetails.data.payment) {
        await axios.put(`${API_URL}/api/payments/${orderDetails.data.payment.id}/mark-paid`, {
          payment_reference: ref
        });
      }

      setProcessing(false);
      setStep(4);
    } catch (err) {
      setProcessing(false);
      console.error('Error:', err);
      alert('Error submitting order: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="customer-order-container">
      <div className="customer-order-box">
        <h1>🛒 Place Your Order</h1>
        <div className="progress-bar">
          <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>1. Info</div>
          <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>2. Products</div>
          <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>3. Payment</div>
          <div className={`progress-step ${step >= 4 ? 'active' : ''}`}>4. Complete</div>
        </div>

        {step === 1 && (
          <div className="form-section">
            <h3>Your Information</h3>
            <div className="form-group">
              <label>Customer Number (auto-generated)</label>
              <input 
                value={customerInfo.customer_number}
                disabled
              />
            </div>
            <div className="form-group">
              <label>Name *</label>
              <input 
                value={customerInfo.name}
                onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Address *</label>
              <input 
                value={customerInfo.address}
                onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Postal Address *</label>
              <input 
                value={customerInfo.postal_address}
                onChange={(e) => setCustomerInfo({...customerInfo, postal_address: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Phone Number *</label>
              <input 
                value={customerInfo.phone_number}
                onChange={(e) => setCustomerInfo({...customerInfo, phone_number: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input 
                type="email"
                value={customerInfo.email}
                onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
              />
            </div>
            <div className="button-group">
              <button onClick={() => navigate('/')} className="btn-secondary">Cancel</button>
              <button 
                onClick={() => setStep(2)} 
                className="btn-primary"
                disabled={!customerInfo.name || !customerInfo.address || !customerInfo.postal_address || !customerInfo.phone_number}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="form-section">
            <h3>Select Products</h3>
            <div className="product-list">
              {products.map(product => (
                <ProductSelector 
                  key={product.id} 
                  product={product} 
                  onAdd={addToCart}
                />
              ))}
            </div>
            
            {cart.length > 0 && (
              <div className="cart-preview">
                <h4>Your Cart</h4>
                {cart.map((item, index) => {
                  const product = products.find(p => p.id === item.product_id);
                  const price = item.is_subscription ? product.subscription_price : product.price;
                  return (
                    <div key={index} className="cart-item">
                      <span>{product.name} x {item.quantity} {item.is_subscription && '(Subscription)'}</span>
                      <span>{(price * item.quantity).toFixed(2)} kr</span>
                      <button onClick={() => removeFromCart(index)} className="btn-remove">✕</button>
                    </div>
                  );
                })}
                <div className="cart-total">
                  <strong>Total: {total.toFixed(2)} kr</strong>
                </div>
              </div>
            )}
            
            <div className="button-group">
              <button onClick={() => setStep(1)} className="btn-secondary">Back</button>
              <button 
                onClick={() => setStep(3)} 
                className="btn-primary" 
                disabled={cart.length === 0}
              >
                Proceed to Payment
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="form-section">
            <h3>💳 Payment via Swish</h3>
            <div className="payment-summary">
              <h2>Total: {total.toFixed(2)} kr</h2>
              <div className="mock-qr">
                <div className="qr-placeholder">
                  <p>📱 Swish QR Code</p>
                  <div className="qr-box">
                    {/* Mock QR code representation */}
                    <div style={{fontSize: '8px', lineHeight: '8px', letterSpacing: '2px'}}>
                      ████████████<br/>
                      ██ ██ ██ ██<br/>
                      ██ ██ ██ ██<br/>
                      ████████████<br/>
                    </div>
                  </div>
                  <p>Amount: {total.toFixed(2)} kr</p>
                  <p className="small-text">⚠️ MOCK PAYMENT - In production, real Swish QR code will appear here</p>
                </div>
              </div>
            </div>
            <div className="button-group">
              <button onClick={() => setStep(2)} className="btn-secondary" disabled={processing}>Back</button>
              <button 
                onClick={handleSwishPayment} 
                className="btn-primary"
                disabled={processing}
              >
                {processing ? 'Processing Payment...' : 'Simulate Swish Payment'}
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="form-section success-section">
            <div className="success-icon">✅</div>
            <h3>Order Complete!</h3>
            <p>Your order has been placed and payment received.</p>
            <div className="order-summary">
              <p><strong>Customer:</strong> {customerInfo.name}</p>
              <p><strong>Total Amount:</strong> {total.toFixed(2)} kr</p>
              <p><strong>Payment Reference:</strong> {paymentRef}</p>
              <p><strong>Quarter:</strong> Q{Math.ceil((new Date().getMonth() + 1) / 3)} {new Date().getFullYear()}</p>
            </div>
            <p className="delivery-note">📦 Your order will be delivered according to the quarterly schedule.</p>
            <button onClick={() => navigate('/')} className="btn-primary">Done</button>
          </div>
        )}
      </div>
    </div>
  );
}

function ProductSelector({ product, onAdd }) {
  const [quantity, setQuantity] = useState(1);
  const [isSubscription, setIsSubscription] = useState(false);

  const handleAdd = () => {
    if (quantity > 0) {
      onAdd(product.id, quantity, isSubscription);
      setQuantity(1);
      setIsSubscription(false);
    }
  };

  const price = isSubscription ? product.subscription_price : product.price;
  const savings = product.price - product.subscription_price;

  return (
    <div className="product-selector">
      <div className="product-header">
        <h4>{product.name}</h4>
        <div className="price-display">
          <span className="price">{price.toFixed(2)} kr</span>
          {!isSubscription && product.subscription_price && (
            <span className="price-note">or {product.subscription_price.toFixed(2)} kr with subscription</span>
          )}
        </div>
      </div>
      <div className="product-controls">
        <div className="quantity-control">
          <label>Quantity:</label>
          <input 
            type="number" 
            min="1" 
            max="100"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
          />
        </div>
        <label className="subscription-checkbox">
          <input 
            type="checkbox" 
            checked={isSubscription}
            onChange={(e) => setIsSubscription(e.target.checked)}
          />
          <span>Subscription (Save {savings.toFixed(2)} kr/sack)</span>
        </label>
        <button onClick={handleAdd} className="btn-add">Add to Cart</button>
      </div>
    </div>
  );
}

// Protected Route Component
function ProtectedRoute({ children, adminOnly = false }) {
  const auth = React.useContext(AuthContext);
  
  if (!auth.user) {
    return <Navigate to="/" />;
  }
  
  if (adminOnly && auth.role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
}

// Placeholder pages
function PlaceholderPage({ title }) {
  const navigate = useNavigate();
  const auth = React.useContext(AuthContext);
  
  return (
    <div className="dashboard">
      <nav className="navbar">
        <h2>FöreningsFörsäljning - {title}</h2>
        <button onClick={() => auth.logout()}>Logout</button>
      </nav>
      <div className="placeholder-page">
        <h2>{title}</h2>
        <p>This feature is coming soon...</p>
        <button onClick={() => navigate(-1)} className="btn-primary">Go Back</button>
      </div>
    </div>
  );
}

// Main App Component
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/customer-order" element={<CustomerOrderForm />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute adminOnly={true}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/customers" element={
            <ProtectedRoute>
              <PlaceholderPage title="Customers" />
            </ProtectedRoute>
          } />
          <Route path="/orders" element={
            <ProtectedRoute>
              <PlaceholderPage title="Orders" />
            </ProtectedRoute>
          } />
          <Route path="/products" element={
            <ProtectedRoute>
              <PlaceholderPage title="Products" />
            </ProtectedRoute>
          } />
          <Route path="/delivery" element={
            <ProtectedRoute>
              <PlaceholderPage title="Delivery" />
            </ProtectedRoute>
          } />
          <Route path="/admin/teams" element={
            <ProtectedRoute adminOnly={true}>
              <PlaceholderPage title="Manage Teams" />
            </ProtectedRoute>
          } />
          <Route path="/admin/areas" element={
            <ProtectedRoute adminOnly={true}>
              <PlaceholderPage title="Geographic Areas" />
            </ProtectedRoute>
          } />
          <Route path="/admin/products" element={
            <ProtectedRoute adminOnly={true}>
              <PlaceholderPage title="Manage Products" />
            </ProtectedRoute>
          } />
          <Route path="/admin/payments" element={
            <ProtectedRoute adminOnly={true}>
              <PlaceholderPage title="Payment Tracking" />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
