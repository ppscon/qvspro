import React, { useState, useEffect, useCallback } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { FiUser, FiSettings, FiShield, FiList, FiPlus, FiCheck, FiUserPlus } from 'react-icons/fi';
import { BiGitCompare } from 'react-icons/bi';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { ScanRecord } from '../types';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Dashboard: React.FC = () => {
  const { user, profile, isAdmin } = useAuth();
  const [scanRecords, setScanRecords] = useState<ScanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedScans, setSelectedScans] = useState<string[]>([]);
  const history = useHistory();
  const [darkMode, setDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });
  const [helpVisible, setHelpVisible] = useState(false);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const toggleHelp = () => {
    setHelpVisible(!helpVisible);
  };

  const fetchScanRecords = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('scan_records')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setScanRecords(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchScanRecords();
  }, [fetchScanRecords]);

  const toggleScanSelection = (scanId: string) => {
    setSelectedScans(prevSelected => {
      if (prevSelected.includes(scanId)) {
        return prevSelected.filter(id => id !== scanId);
      } else {
        // Only allow two scans to be selected at once
        if (prevSelected.length < 2) {
          return [...prevSelected, scanId];
        }
        // If already have 2 selected, replace the oldest selection
        return [prevSelected[1], scanId];
      }
    });
  };

  const compareScans = () => {
    if (selectedScans.length === 2) {
      history.push(`/compare/${selectedScans[0]}/${selectedScans[1]}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Header darkMode={darkMode} toggleTheme={toggleTheme} toggleHelp={toggleHelp} />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 flex-grow">
        {/* Welcome Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome, {profile?.profile_name || profile?.full_name || profile?.username || user?.email?.split('@')[0]}!
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your quantum vulnerability scans and access your profile information.
          </p>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link to="/app" className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full mr-4">
                <FiShield className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">New Scan</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Start a new vulnerability scan</p>
              </div>
            </div>
          </Link>
          
          <Link to="/profile" className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full mr-4">
                <FiUser className="text-green-600 dark:text-green-400" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Profile</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Manage your profile</p>
              </div>
            </div>
          </Link>
          
          {isAdmin ? (
            <Link to="/admin" className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full mr-4">
                  <FiUserPlus className="text-purple-600 dark:text-purple-400" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Admin Dashboard</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Manage beta users and permissions</p>
                </div>
              </div>
            </Link>
          ) : (
            <Link to="/settings" className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full mr-4">
                  <FiSettings className="text-purple-600 dark:text-purple-400" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Settings</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Configure your preferences</p>
                </div>
              </div>
            </Link>
          )}
        </div>

        {/* Recent Scans */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Recent Scans
            </h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  setCompareMode(!compareMode);
                  if (!compareMode) {
                    setSelectedScans([]);
                  }
                }}
                className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md 
                  ${compareMode 
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                <BiGitCompare className="mr-1" /> {compareMode ? 'Cancel Compare' : 'Compare Scans'}
              </button>
              
              {compareMode && selectedScans.length === 2 && (
                <button
                  onClick={compareScans}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md bg-green-600 text-white hover:bg-green-700"
                >
                  Compare Selected
                </button>
              )}
              
              <Link 
                to="/app" 
                className="inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              >
                <FiPlus className="mr-1" /> New Scan
              </Link>
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="p-6 text-center text-red-600 dark:text-red-400">{error}</div>
          ) : scanRecords.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <FiList className="mx-auto mb-4" size={32} />
              <p>You haven't performed any scans yet.</p>
              <Link 
                to="/app" 
                className="inline-flex items-center mt-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Start Your First Scan
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    {compareMode && (
                      <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Select
                      </th>
                    )}
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {scanRecords.map((record) => (
                    <tr key={record.id} className={compareMode && selectedScans.includes(record.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''}>
                      {compareMode && (
                        <td className="px-3 py-4 whitespace-nowrap">
                          <button
                            onClick={() => toggleScanSelection(record.id)}
                            className={`w-6 h-6 rounded flex items-center justify-center ${
                              selectedScans.includes(record.id)
                                ? 'bg-blue-500 text-white'
                                : 'border border-gray-300 dark:border-gray-600 text-gray-400'
                            }`}
                          >
                            {selectedScans.includes(record.id) && <FiCheck size={14} />}
                          </button>
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link 
                          to={`/scan/${record.id}`}
                          className="block"
                        >
                          <div className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400">
                            {record.name}
                          </div>
                          {record.description && (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {record.description}
                            </div>
                          )}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(record.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${record.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                            record.status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 
                            record.status === 'running' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 
                            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}`}
                        >
                          {record.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <Link 
                          to={`/scan/${record.id}`} 
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard; 