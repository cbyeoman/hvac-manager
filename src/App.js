import React, { useState, useEffect } from 'react';
import { Calendar, Users, Wrench, DollarSign, Package, Plus, Search, Phone, Mail, MapPin, Clock, CheckCircle, AlertCircle, Camera, BarChart3, Repeat, Timer, Eye, XCircle, LogOut } from 'lucide-react';

// Supabase configuration
const SUPABASE_URL = 'https://vntympygvscumvmjnhmg.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZudHltcHlndnNjdW12bWpuaG1nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2OTg5MDUsImV4cCI6MjA4NDI3NDkwNX0.uCvYZlFcqfzgwi2Vnn7hYC36-tNdvqZFN0BmRFf3xks';

// Supabase API helper functions
const supabaseAuth = {
  signUp: async (email, password) => {
    try {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      return { data, error: data.error || null };
    } catch (error) {
      return { data: null, error };
    }
  },

  signIn: async (email, password) => {
    try {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      return data;
    } catch (error) {
      return { error };
    }
  },

  signOut: async (token) => {
    try {
      await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'apikey': SUPABASE_KEY }
      });
    } catch (error) {
      console.error('Sign out error:', error);
    }
  },

  getUser: async (token) => {
    try {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
        headers: { 'Authorization': `Bearer ${token}`, 'apikey': SUPABASE_KEY }
      });
      return await res.json();
    } catch (error) {
      return { error };
    }
  }
};

const supabaseDB = {
  select: async (table, token) => {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*`, {
        headers: { 'Authorization': `Bearer ${token}`, 'apikey': SUPABASE_KEY }
      });
      const data = await res.json();
      return { data, error: null };
    } catch (error) {
      return { data: [], error };
    }
  },

  insert: async (table, newData, token) => {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'apikey': SUPABASE_KEY,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(newData)
      });
      const data = await res.json();
      return { data: Array.isArray(data) ? data : [data], error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  update: async (table, id, updates, token) => {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'apikey': SUPABASE_KEY,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      return { data: Array.isArray(data) ? data : [data], error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
};

const HVACApp = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      supabaseAuth.getUser(token).then(data => {
        if (data.id) {
          setUser(data);
        } else {
          localStorage.removeItem('token');
          setToken(null);
        }
        setLoading(false);
      }).catch(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [token]);

  const handleSignOut = async () => {
    await supabaseAuth.signOut(token);
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center"><div className="text-xl">Loading...</div></div>;
  }

  if (!user) {
    return <AuthScreen setUser={setUser} setToken={setToken} />;
  }

  return <MainApp user={user} token={token} onSignOut={handleSignOut} />;
};

const AuthScreen = ({ setUser, setToken }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        const { error } = await supabaseAuth.signUp(email, password);
        if (error) {
          setError(error.message || 'Sign up failed');
        } else {
          alert('Check your email to confirm your account!');
          setIsSignUp(false);
        }
      } else {
        const data = await supabaseAuth.signIn(email, password);
        if (data.access_token) {
          localStorage.setItem('token', data.access_token);
          setToken(data.access_token);
          setUser(data.user);
        } else {
          setError('Invalid credentials');
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-2">HVAC Manager</h1>
        <p className="text-gray-600 text-center mb-8">Professional Business Management</p>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full border p-3 rounded-lg"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full border p-3 rounded-lg"
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
          <button
            onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
            className="w-full text-blue-600 text-sm hover:underline"
          >
            {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
          </button>
        </div>
      </div>
    </div>
  );
};

const MainApp = ({ user, token, onSignOut }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [customers, setCustomers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [recurringJobs, setRecurringJobs] = useState([]);
  const [timeEntries, setTimeEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [cust, job, tech, inv, invoice, equip, recurring, time] = await Promise.all([
        supabaseDB.select('customers', token),
        supabaseDB.select('jobs', token),
        supabaseDB.select('technicians', token),
        supabaseDB.select('inventory', token),
        supabaseDB.select('invoices', token),
        supabaseDB.select('equipment', token),
        supabaseDB.select('recurring_jobs', token),
        supabaseDB.select('time_entries', token)
      ]);

      setCustomers(cust.data || []);
      setJobs(job.data || []);
      setTechnicians(tech.data || []);
      setInventory(inv.data || []);
      setInvoices(invoice.data || []);
      setEquipment(equip.data || []);
      setRecurringJobs(recurring.data || []);
      setTimeEntries(time.data || []);
    } catch (error) {
      console.error('Load error:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [token]);

  const addCustomer = async (data) => {
    const result = await supabaseDB.insert('customers', { ...data, user_id: user.id }, token);
    if (result.data) {
      setCustomers([...customers, result.data[0]]);
      return true;
    }
    return false;
  };

  const addJob = async (data) => {
    const result = await supabaseDB.insert('jobs', { ...data, user_id: user.id }, token);
    if (result.data) {
      setJobs([...jobs, result.data[0]]);
      return true;
    }
    return false;
  };

  const updateJob = async (id, updates) => {
    const result = await supabaseDB.update('jobs', id, updates, token);
    if (result.data) {
      setJobs(jobs.map(j => j.id === id ? result.data[0] : j));
      await loadData();
    }
  };

  const addTechnician = async (data) => {
    const result = await supabaseDB.insert('technicians', { ...data, user_id: user.id }, token);
    if (result.data) {
      setTechnicians([...technicians, result.data[0]]);
      return true;
    }
    return false;
  };

  const addEquipment = async (data) => {
    const result = await supabaseDB.insert('equipment', { ...data, user_id: user.id }, token);
    if (result.data) {
      setEquipment([...equipment, result.data[0]]);
      return true;
    }
    return false;
  };

  const addRecurring = async (data) => {
    const result = await supabaseDB.insert('recurring_jobs', { ...data, user_id: user.id }, token);
    if (result.data) {
      setRecurringJobs([...recurringJobs, result.data[0]]);
      return true;
    }
    return false;
  };

  const addInventory = async (data) => {
    const result = await supabaseDB.insert('inventory', { ...data, user_id: user.id }, token);
    if (result.data) {
      setInventory([...inventory, result.data[0]]);
      return true;
    }
    return false;
  };

  const addInvoice = async (data) => {
    const result = await supabaseDB.insert('invoices', { ...data, user_id: user.id }, token);
    if (result.data) {
      setInvoices([...invoices, result.data[0]]);
      return true;
    }
    return false;
  };

  const updateInvoice = async (id, updates) => {
    const result = await supabaseDB.update('invoices', id, updates, token);
    if (result.data) {
      setInvoices(invoices.map(i => i.id === id ? result.data[0] : i));
    }
  };

  const addTimeEntry = async (data) => {
    const result = await supabaseDB.insert('time_entries', { ...data, user_id: user.id }, token);
    if (result.data) {
      setTimeEntries([...timeEntries, result.data[0]]);
      return result.data[0];
    }
    return null;
  };

  const updateTimeEntry = async (id, updates) => {
    const result = await supabaseDB.update('time_entries', id, updates, token);
    if (result.data) {
      setTimeEntries(timeEntries.map(e => e.id === id ? result.data[0] : e));
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center"><div className="text-xl">Loading your data...</div></div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-blue-600 text-white p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">HVAC Business Manager</h1>
            <p className="text-sm text-blue-100">{user.email}</p>
          </div>
          <button onClick={onSignOut} className="flex items-center gap-2 bg-blue-700 px-4 py-2 rounded hover:bg-blue-800">
            <LogOut className="w-4 h-4" />Sign Out
          </button>
        </div>
      </div>

      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto">
          <nav className="flex overflow-x-auto">
            {['dashboard', 'customers', 'jobs', 'recurring', 'technicians', 'inventory', 'invoices', 'reports'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={'px-6 py-4 font-medium capitalize whitespace-nowrap ' + (activeTab === tab ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600')}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {activeTab === 'dashboard' && <Dashboard customers={customers} jobs={jobs} invoices={invoices} recurringJobs={recurringJobs} technicians={technicians} />}
        {activeTab === 'customers' && <Customers customers={customers} addCustomer={addCustomer} equipment={equipment} addEquipment={addEquipment} jobs={jobs} />}
        {activeTab === 'jobs' && <Jobs jobs={jobs} addJob={addJob} updateJob={updateJob} customers={customers} technicians={technicians} timeEntries={timeEntries} addTimeEntry={addTimeEntry} updateTimeEntry={updateTimeEntry} />}
        {activeTab === 'recurring' && <Recurring recurringJobs={recurringJobs} addRecurring={addRecurring} customers={customers} technicians={technicians} />}
        {activeTab === 'technicians' && <Technicians technicians={technicians} addTechnician={addTechnician} jobs={jobs} />}
        {activeTab === 'inventory' && <Inventory inventory={inventory} addInventory={addInventory} />}
        {activeTab === 'invoices' && <Invoices invoices={invoices} addInvoice={addInvoice} updateInvoice={updateInvoice} customers={customers} jobs={jobs} />}
        {activeTab === 'reports' && <Reports jobs={jobs} invoices={invoices} timeEntries={timeEntries} technicians={technicians} customers={customers} />}
      </div>
    </div>
  );
};

// Dashboard Component (simplified for space)
const Dashboard = ({ customers, jobs, invoices, recurringJobs, technicians }) => {
  const today = new Date().toDateString();
  const todaysJobs = jobs.filter(j => new Date(j.date).toDateString() === today);
  const completed = jobs.filter(j => j.status === 'completed').length;
  const revenue = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + parseFloat(i.amount || 0), 0);
  const pending = invoices.filter(i => i.status === 'unpaid').length;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Dashboard</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-500 text-white p-6 rounded-lg">
          <Calendar className="w-8 h-8 mb-2" />
          <p className="text-2xl font-bold">{todaysJobs.length}</p>
          <p>Today's Jobs</p>
        </div>
        <div className="bg-green-500 text-white p-6 rounded-lg">
          <CheckCircle className="w-8 h-8 mb-2" />
          <p className="text-2xl font-bold">{completed}</p>
          <p>Completed</p>
        </div>
        <div className="bg-purple-500 text-white p-6 rounded-lg">
          <DollarSign className="w-8 h-8 mb-2" />
          <p className="text-2xl font-bold">${revenue.toFixed(0)}</p>
          <p>Revenue</p>
        </div>
        <div className="bg-yellow-500 text-white p-6 rounded-lg">
          <AlertCircle className="w-8 h-8 mb-2" />
          <p className="text-2xl font-bold">{pending}</p>
          <p>Pending</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="font-bold mb-4">Today's Schedule</h3>
        {todaysJobs.map(job => {
          const customer = customers.find(c => c.id === job.customer_id);
          const tech = technicians.find(t => t.id === job.technician_id);
          return (
            <div key={job.id} className="border-l-4 border-blue-500 pl-3 py-2 mb-2">
              <p className="font-semibold">{customer?.name}</p>
              <p className="text-sm text-gray-600">{job.service_type} • {tech?.name} • {job.time}</p>
            </div>
          );
        })}
        {todaysJobs.length === 0 && <p className="text-gray-500">No jobs today</p>}
      </div>
    </div>
  );
};

// Simplified component versions for remaining features
const Customers = ({ customers, addCustomer, equipment, addEquipment, jobs }) => {
  const [form, setForm] = useState(false);
  const [data, setData] = useState({ name: '', phone: '', email: '', address: '' });

  const handleAdd = async () => {
    if (!data.name || !data.phone) {
      alert('Name and Phone required');
      return;
    }
    const success = await addCustomer(data);
    if (success) {
      setData({ name: '', phone: '', email: '', address: '' });
      setForm(false);
      alert('Customer added!');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h2 className="text-2xl font-bold">Customers</h2>
        <button onClick={() => setForm(!form)} className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <Plus className="w-5 h-5" />Add Customer
        </button>
      </div>

      {form && (
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <input type="text" placeholder="Name *" value={data.name} onChange={e => setData({...data, name: e.target.value})} className="border p-2 rounded" />
            <input type="tel" placeholder="Phone *" value={data.phone} onChange={e => setData({...data, phone: e.target.value})} className="border p-2 rounded" />
            <input type="email" placeholder="Email" value={data.email} onChange={e => setData({...data, email: e.target.value})} className="border p-2 rounded" />
            <input type="text" placeholder="Address" value={data.address} onChange={e => setData({...data, address: e.target.value})} className="border p-2 rounded" />
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} className="bg-blue-500 text-white px-4 py-2 rounded">Save</button>
            <button onClick={() => setForm(false)} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {customers.map(c => (
          <div key={c.id} className="bg-white border p-4 rounded">
            <h3 className="font-bold">{c.name}</h3>
            <p className="text-sm text-gray-600">{c.phone}</p>
            {c.email && <p className="text-sm text-gray-600">{c.email}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};

// Add simplified versions of other components (Jobs, Technicians, etc.)
const Jobs = ({ jobs, addJob, updateJob, customers, technicians, timeEntries, addTimeEntry, updateTimeEntry }) => {
  return <div className="bg-white p-6 rounded shadow"><h2 className="text-2xl font-bold">Jobs - Under Development</h2><p>Full job management coming in next update</p></div>;
};

const Recurring = () => <div className="bg-white p-6 rounded shadow"><h2 className="text-2xl font-bold">Recurring Jobs - Under Development</h2></div>;
const Technicians = () => <div className="bg-white p-6 rounded shadow"><h2 className="text-2xl font-bold">Technicians - Under Development</h2></div>;
const Inventory = () => <div className="bg-white p-6 rounded shadow"><h2 className="text-2xl font-bold">Inventory - Under Development</h2></div>;
const Invoices = () => <div className="bg-white p-6 rounded shadow"><h2 className="text-2xl font-bold">Invoices - Under Development</h2></div>;
const Reports = () => <div className="bg-white p-6 rounded shadow"><h2 className="text-2xl font-bold">Reports - Under Development</h2></div>;

export default HVACApp;
