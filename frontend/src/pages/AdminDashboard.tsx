import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiUser, FiShield, FiArrowLeft, FiUserPlus, FiUserX, FiCheck, FiAlertCircle, FiSun, FiMoon, FiBarChart2, FiDatabase, FiCpu, FiSettings } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import Footer from '../components/Footer';
import Header from '../../components/Header';

interface BetaUser {
  id: string;
  email: string;
  status: 'pending' | 'registered' | 'revoked';
  invited_at: string;
  registered_at: string | null;
  user_id: string | null;
  invited_by: string | null;
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [invitedUsers, setInvitedUsers] = useState<BetaUser[]>([]);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [darkMode, setDarkMode] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [scanRecords, setScanRecords] = useState<any[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInvitedUsers();
    
    // Apply dark mode by default
    document.documentElement.classList.add('dark');

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const usersPromise = fetchUsers();
        const scansPromise = fetchScanRecords();
        const metricsPromise = fetchSystemMetrics();
        await Promise.all([usersPromise, scansPromise, metricsPromise]);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Toggle theme
  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const loadInvitedUsers = async () => {
    setFetchLoading(true);
    try {
      const { data, error } = await supabase
        .from('allowed_beta_users')
        .select('*')
        .order('invited_at', { ascending: false });
      
      if (error) throw error;
      setInvitedUsers(data || []);
    } catch (error) {
      console.error('Error loading invited users:', error);
      setMessage({ text: 'Failed to load invited users', type: 'error' });
    } finally {
      setFetchLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { data, error } = await supabase.rpc('invite_beta_user', {
        input_email: email
      });

      if (error) throw error;
      setMessage({ text: `Successfully invited ${email}`, type: 'success' });
      setEmail('');
      loadInvitedUsers();
    } catch (error: any) {
      setMessage({ text: error.message || 'Error inviting user', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeAccess = async (email: string) => {
    try {
      const { data, error } = await supabase.rpc('revoke_beta_access', {
        user_email: email
      });

      if (error) throw error;
      
      setMessage({ text: `Access revoked for ${email}`, type: 'success' });
      loadInvitedUsers();
    } catch (error: any) {
      setMessage({ text: error.message || 'Error revoking access', type: 'error' });
    }
  };

  const handleMakeAdmin = async (userId: string) => {
    try {
      const { data, error } = await supabase.rpc('make_user_admin', {
        user_id: userId
      });

      if (error) throw error;
      
      setMessage({ text: `User promoted to admin`, type: 'success' });
    } catch (error: any) {
      setMessage({ text: error.message || 'Error making user admin', type: 'error' });
    }
  };

  const fetchUsers = async () => {
    const { data: fetchedData, error: fetchError } = await supabase.from('profiles').select('id, username, email, created_at').order('created_at', { ascending: false });
    if (fetchError) throw fetchError;
    setUsers(fetchedData || []);
  };

  const fetchScanRecords = async () => {
    const { data: fetchedData, error: fetchError } = await supabase.from('scan_records').select('id, name, description, created_at, user_id, status').order('created_at', { ascending: false }).limit(20);
    if (fetchError) throw fetchError;
    setScanRecords(fetchedData || []);
  };

  const fetchSystemMetrics = async () => {
    // Placeholder - Replace with actual API call to fetch metrics
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
    const fetchedData = {
      activeUsers: users.length, // Example metric based on fetched users
      totalScans: scanRecords.length, // Example metric based on fetched scans
      cpuUsage: Math.random() * 100, // Mock data
      memoryUsage: Math.random() * 100, // Mock data
      apiVersion: '1.2.0' // Mock data
    };
    setSystemMetrics(fetchedData);
  };

  if (!user) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link to="/">
                <img src="/images/logo-qvs.png" alt="QVS Logo" className="logo-qvs" />
              </Link>
              <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full bg-gray-700 text-yellow-400 hover:bg-gray-600 transition-colors"
                aria-label="Toggle theme"
              >
                {darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
              </button>
              
              <Link 
                to="/dashboard" 
                className="inline-flex items-center text-sm text-blue-400 hover:text-blue-300"
              >
                <FiArrowLeft className="mr-2" /> Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-8 px-4 flex-grow">
        <div className="mb-8 bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-lg font-medium text-white">
              Invite Beta Users
            </h2>
          </div>
          
          <div className="p-6">
            {message && (
              <div className={`p-4 mb-4 text-sm rounded-lg flex items-center ${
                message.type === 'success' 
                  ? 'bg-green-900 text-green-200' 
                  : 'bg-red-900 text-red-200'
              }`}>
                {message.type === 'success' ? (
                  <FiCheck className="mr-2 flex-shrink-0" />
                ) : (
                  <FiAlertCircle className="mr-2 flex-shrink-0" />
                )}
                <span>{message.text}</span>
              </div>
            )}
            
            <form onSubmit={handleInvite} className="flex mb-6">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email to invite"
                required
                className="flex-1 py-2 px-4 border border-gray-600 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
              />
              <button 
                type="submit" 
                disabled={loading}
                className="py-2 px-4 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Invitation'}
              </button>
            </form>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-lg font-medium text-white">
              Beta Users
            </h2>
          </div>
          
          <div className="p-0">
            {fetchLoading ? (
              <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
              </div>
            ) : invitedUsers.length === 0 ? (
              <div className="p-6 text-center text-gray-400">
                <FiUserPlus className="mx-auto mb-4" size={32} />
                <p>No beta users have been invited yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Email
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Invited At
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Registered
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {invitedUsers.map(user => (
                      <tr key={user.id} className="hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${user.status === 'registered' ? 'bg-green-900 text-green-200' : 
                              user.status === 'revoked' ? 'bg-red-900 text-red-200' : 
                              'bg-yellow-900 text-yellow-200'}`}
                          >
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {new Date(user.invited_at).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {user.registered_at ? new Date(user.registered_at).toLocaleString() : 'Not yet'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            {user.status !== 'revoked' && (
                              <button
                                onClick={() => handleRevokeAccess(user.email)}
                                className="text-red-400 hover:text-red-300 flex items-center"
                              >
                                <FiUserX className="mr-1" /> Revoke
                              </button>
                            )}
                            {user.status === 'registered' && user.user_id && (
                              <button
                                onClick={() => handleMakeAdmin(user.user_id!)}
                                className="text-purple-400 hover:text-purple-300 flex items-center"
                              >
                                <FiShield className="mr-1" /> Make Admin
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard; 