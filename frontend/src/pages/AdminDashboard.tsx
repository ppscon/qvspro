import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiUser, FiShield, FiArrowLeft, FiUserPlus, FiUserX, FiCheck, FiAlertCircle, FiSun, FiMoon, FiBarChart2, FiDatabase, FiCpu, FiSettings, FiUsers, FiRefreshCw, FiPlus, FiSearch, FiUserCheck } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import Footer from '../components/Footer';
import Header from '../components/Header';

interface BetaUser {
  id: string;
  email: string;
  status: 'pending' | 'registered' | 'revoked';
  invited_at: string;
  registered_at: string | null;
  user_id: string | null;
  invited_by: string | null;
}

interface PendingUser {
  id: string;
  email: string;
  created_at: string;
  username: string | null;
}

interface OrphanedUser {
  id: string;
  email: string;
  created_at: string;
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [invitedUsers, setInvitedUsers] = useState<BetaUser[]>([]);
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [darkMode, setDarkMode] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [scanRecords, setScanRecords] = useState<any[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [orphanedUsers, setOrphanedUsers] = useState<OrphanedUser[]>([]);
  const [isLoading, setIsLoading] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    loadInvitedUsers();
    loadPendingUsers();
    
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

  const loadPendingUsers = async () => {
    try {
      setIsLoading(prev => ({ ...prev, loadPending: true }));
      console.log('Fetching pending users...');
      
      // Try to use our dedicated admin function first
      const { data: pendingUsersData, error: pendingError } = await supabase
        .rpc('admin_get_pending_users');
        
      if (!pendingError && pendingUsersData) {
        console.log('Pending users from admin function:', pendingUsersData);
        setPendingUsers(pendingUsersData);
        return;
      }
        
      console.error('Error using admin_get_pending_users, falling back to manual query:', pendingError);
      
      // Fallback to our manual approach
      const { data: allProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, created_at, username, approval_status');
      
      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }
      
      console.log('All profiles:', allProfiles);
      
      // Get already approved users
      const { data: approvedUsers, error: approvedError } = await supabase
        .from('approved_users')
        .select('user_id');
      
      if (approvedError) {
        console.error('Error fetching approved users:', approvedError);
        throw approvedError;
      }
      
      console.log('Approved users:', approvedUsers);
      
      // Filter to get only unapproved users by default
      const approvedIds = approvedUsers?.map(u => u.user_id) || [];
      const pendingProfiles = allProfiles?.filter(p => 
        !approvedIds.includes(p.id) || p.approval_status === 'pending'
      ) || [];
      
      console.log('Pending profiles after filtering:', pendingProfiles);
      
      // Set the state with our pending profiles
      setPendingUsers(pendingProfiles);
    } catch (error) {
      console.error('Error loading pending users:', error);
      // Still set empty array to avoid undefined
      setPendingUsers([]);
    } finally {
      setIsLoading(prev => ({ ...prev, loadPending: false }));
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

  const handleApproveUser = async (userId: string) => {
    try {
      const { data, error } = await supabase.rpc('approve_user', {
        input_user_id: userId
      });

      if (error) throw error;
      
      setMessage({ text: 'User approved successfully', type: 'success' });
      loadPendingUsers();
    } catch (error: any) {
      setMessage({ text: error.message || 'Error approving user', type: 'error' });
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

  // Improved sync profiles function
  const handleSyncProfiles = async () => {
    try {
      setMessage(null);
      setIsLoading(prev => ({ ...prev, syncProfiles: true }));
      
      console.log('Syncing profile emails...');
      
      // Call the RPC function
      const { data, error } = await supabase.rpc('admin_sync_profile_emails');
      
      if (error) {
        console.error('Error syncing profile emails:', error);
        throw error;
      }
      
      console.log('Sync profiles result:', data);
      setMessage({ text: `Successfully synced ${data?.length || 0} profile emails`, type: 'success' });
      
      // Small delay to ensure the updates are visible
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Reload users
      await loadPendingUsers();
    } catch (error: any) {
      console.error('Error syncing profiles:', error);
      setMessage({ 
        text: error.message || 'Error syncing profiles. Check console for details.', 
        type: 'error' 
      });
    } finally {
      setIsLoading(prev => ({ ...prev, syncProfiles: false }));
    }
  };

  // Function to create a test user for debugging
  const handleCreateTestUser = async () => {
    try {
      setMessage(null);
      setIsLoading(prev => ({ ...prev, createTest: true }));
      
      console.log('Creating test user directly via database function...');
      
      // Use our database function to create a test user directly
      const { data, error } = await supabase.rpc('admin_create_test_user');
      
      if (error) {
        console.error('Error creating test user:', error);
        throw error;
      }
      
      console.log('Test user created:', data);
      
      // Show success message
      setMessage({ 
        text: `Test user created successfully with email ${data.email}`, 
        type: 'success' 
      });
      
      // Reload users to show the new test user
      await loadPendingUsers();
    } catch (error: any) {
      console.error('Error creating test user:', error);
      setMessage({ 
        text: error.message || 'Error creating test user', 
        type: 'error' 
      });
    } finally {
      setIsLoading(prev => ({ ...prev, createTest: false }));
    }
  };

  // Function to create a test pending user for testing the approval workflow
  const handleCreateTestPendingUser = async () => {
    try {
      setMessage(null);
      setIsLoading(prev => ({ ...prev, createPending: true }));
      
      console.log('Creating test pending user...');
      
      // Use our database function to create a test pending user
      const { data, error } = await supabase.rpc('admin_create_pending_user_for_testing');
      
      if (error) {
        console.error('Error creating test pending user:', error);
        throw error;
      }
      
      console.log('Test pending user created:', data);
      
      // Show success message
      setMessage({ 
        text: `Test pending user created successfully with email ${data.email}`, 
        type: 'success' 
      });
      
      // Reload users to show the new test pending user
      await loadPendingUsers();
    } catch (error: any) {
      console.error('Error creating test pending user:', error);
      setMessage({ 
        text: error.message || 'Error creating test pending user', 
        type: 'error' 
      });
    } finally {
      setIsLoading(prev => ({ ...prev, createPending: false }));
    }
  };

  // Function to check for orphaned users
  const handleCheckOrphanedUsers = async () => {
    try {
      // Set loading state for this specific operation
      setIsLoading(prev => ({ ...prev, checkOrphaned: true }));
      setMessage(null);
      
      console.log('Checking for orphaned users...');
      
      // Call the RPC function
      const { data, error } = await supabase.rpc('admin_check_orphaned_users');
      
      if (error) {
        console.error('Error checking orphaned users:', error);
        
        // Try a different approach - we'll create a test user directly
        setMessage({ 
          text: 'Could not check orphaned users. Try creating a test user instead.', 
          type: 'error' 
        });
        
        return;
      }
      
      console.log('Orphaned users:', data);
      setOrphanedUsers(data || []);
      
      // If orphaned users found, show message
      if (data && data.length > 0) {
        setMessage({ 
          text: `Found ${data.length} user(s) without profiles. Click "Fix Orphaned Users" to create missing profiles.`, 
          type: 'error' 
        });
      } else {
        setMessage({ text: 'No orphaned users found.', type: 'success' });
        
        // Let's try to create a test user to see if it appears
        try {
          const { data: testUserData, error: testUserError } = await supabase.rpc('admin_create_test_user');
          
          if (testUserError) {
            console.error('Error creating test user:', testUserError);
          } else {
            console.log('Created test user to check if it appears:', testUserData);
            setMessage({ 
              text: 'No orphaned users found. Created a test user to see if it appears in pending users.', 
              type: 'success' 
            });
            
            // Reload users to see if the test user appears
            await loadPendingUsers();
          }
        } catch (e) {
          console.error('Exception creating test user:', e);
        }
      }
    } catch (error: any) {
      console.error('Error checking orphaned users:', error);
      setMessage({ 
        text: error.message || 'Error checking orphaned users', 
        type: 'error' 
      });
    } finally {
      setIsLoading(prev => ({ ...prev, checkOrphaned: false }));
    }
  };

  // Function to fix orphaned users
  const handleFixOrphanedUsers = async () => {
    try {
      // Set loading state for this specific operation
      setIsLoading(prev => ({ ...prev, fixOrphaned: true }));
      setMessage(null);
      
      if (orphanedUsers.length === 0) {
        setMessage({ text: 'No orphaned users to fix.', type: 'success' });
        return;
      }
      
      console.log('Fixing orphaned users...');
      
      // Create profiles for each orphaned user
      let successCount = 0;
      let failCount = 0;
      
      for (const user of orphanedUsers) {
        try {
          const { data, error } = await supabase.rpc(
            'admin_ensure_profile_exists',
            { user_id: user.id, user_email: user.email }
          );
          
          if (error) {
            console.error(`Error creating profile for ${user.email}:`, error);
            failCount++;
          } else {
            console.log(`Created profile for ${user.email}:`, data);
            successCount++;
          }
        } catch (e) {
          console.error(`Exception creating profile for ${user.email}:`, e);
          failCount++;
        }
      }
      
      // Show results
      if (successCount > 0) {
        setMessage({ 
          text: `Fixed ${successCount} orphaned users.${failCount > 0 ? ` Failed: ${failCount}` : ''}`, 
          type: 'success' 
        });
        
        // Clear the list
        setOrphanedUsers([]);
        
        // Reload users to show the newly created profiles
        await loadPendingUsers();
      } else {
        setMessage({ 
          text: 'Failed to fix any orphaned users.', 
          type: 'error' 
        });
      }
    } catch (error: any) {
      console.error('Error fixing orphaned users:', error);
      setMessage({ 
        text: error.message || 'Error fixing orphaned users', 
        type: 'error' 
      });
    } finally {
      setIsLoading(prev => ({ ...prev, fixOrphaned: false }));
    }
  };

  // Function to set the admin to pending for testing
  const handleSetAdminToPending = async () => {
    try {
      setMessage(null);
      setIsLoading(prev => ({ ...prev, setAdminPending: true }));
      
      console.log('Setting admin to pending status for testing...');
      
      // Call the admin function
      const { data, error } = await supabase.rpc('admin_set_admin_to_pending');
      
      if (error) {
        console.error('Error setting admin to pending:', error);
        throw error;
      }
      
      console.log('Admin set to pending:', data);
      
      // Show success message
      setMessage({ 
        text: `Admin user set to pending status for testing approval workflow`, 
        type: 'success' 
      });
      
      // Reload users to show the pending admin
      await loadPendingUsers();
    } catch (error: any) {
      console.error('Error setting admin to pending:', error);
      setMessage({ 
        text: error.message || 'Error setting admin to pending', 
        type: 'error' 
      });
    } finally {
      setIsLoading(prev => ({ ...prev, setAdminPending: false }));
    }
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
        
        {/* New Section: Pending Users Awaiting Approval */}
        <div className="my-8 bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-700 flex justify-between items-center">
            <h2 className="text-lg font-medium text-white">
              Pending Users Awaiting Approval
            </h2>
            
            <div className="flex space-x-4">
              <button
                onClick={handleCreateTestUser}
                disabled={isLoading.createTest || loading}
                className="flex items-center text-sm text-green-400 hover:text-green-300 disabled:opacity-50"
              >
                <FiPlus className="mr-2" />
                Create Test User
              </button>
              
              <button
                onClick={handleCreateTestPendingUser}
                disabled={isLoading.createPending || loading}
                className="flex items-center text-sm text-indigo-400 hover:text-indigo-300 disabled:opacity-50"
              >
                <FiUserCheck className="mr-2" />
                Create Pending User
              </button>
              
              <button
                onClick={handleCheckOrphanedUsers}
                disabled={isLoading.checkOrphaned || loading}
                className="flex items-center text-sm text-purple-400 hover:text-purple-300 disabled:opacity-50"
              >
                <FiSearch className={`mr-2 ${isLoading.checkOrphaned ? 'animate-spin' : ''}`} />
                Check Orphaned Users
              </button>
              
              {orphanedUsers.length > 0 && (
                <button
                  onClick={handleFixOrphanedUsers}
                  disabled={isLoading.fixOrphaned || loading}
                  className="flex items-center text-sm text-yellow-400 hover:text-yellow-300 disabled:opacity-50"
                >
                  <FiCheck className={`mr-2 ${isLoading.fixOrphaned ? 'animate-spin' : ''}`} />
                  Fix Orphaned Users ({orphanedUsers.length})
                </button>
              )}
              
              <button
                onClick={handleSyncProfiles}
                disabled={isLoading.syncProfiles || loading}
                className="flex items-center text-sm text-blue-400 hover:text-blue-300 disabled:opacity-50"
              >
                <FiRefreshCw className={`mr-2 ${isLoading.syncProfiles || loading ? 'animate-spin' : ''}`} />
                Sync Profiles
              </button>

              <button
                onClick={handleSetAdminToPending}
                disabled={isLoading.setAdminPending || loading}
                className="flex items-center text-sm text-orange-400 hover:text-orange-300 disabled:opacity-50"
              >
                <FiUserCheck className={`mr-2 ${isLoading.setAdminPending ? 'animate-spin' : ''}`} />
                Test With Admin User
              </button>
            </div>
          </div>
          
          <div className="p-0">
            {fetchLoading ? (
              <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
              </div>
            ) : pendingUsers.length === 0 ? (
              <div className="p-6 text-center text-gray-400">
                <FiUsers className="mx-auto mb-4" size={32} />
                <p>No users waiting for approval</p>
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
                        Username
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Signed Up
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {pendingUsers.map(user => (
                      <tr key={user.id} className="hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {user.username || 'Not set'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {new Date(user.created_at).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleApproveUser(user.id)}
                              className="text-green-400 hover:text-green-300 flex items-center"
                            >
                              <FiCheck className="mr-1" /> Approve
                            </button>
                            <button
                              onClick={() => handleMakeAdmin(user.id)}
                              className="text-purple-400 hover:text-purple-300 flex items-center"
                            >
                              <FiShield className="mr-1" /> Make Admin
                            </button>
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
        
        {/* All Registered Users Section */}
        <div className="my-8 bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-lg font-medium text-white">
              All Registered Users
            </h2>
          </div>
          
          <div className="p-0">
            {loading ? (
              <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
              </div>
            ) : users.length === 0 ? (
              <div className="p-6 text-center text-gray-400">
                <FiUsers className="mx-auto mb-4" size={32} />
                <p>No registered users found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Username
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Email
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Registered On
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {users.map(user => (
                      <tr key={user.id} className="hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {user.username || 'Not set'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {new Date(user.created_at).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleMakeAdmin(user.id)}
                              className="text-purple-400 hover:text-purple-300 flex items-center"
                            >
                              <FiShield className="mr-1" /> Make Admin
                            </button>
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