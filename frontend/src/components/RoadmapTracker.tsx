import React, { useState, useEffect } from 'react';
import { FiArrowLeft, FiCheckSquare, FiSquare, FiClock, FiStar, FiFlag, FiSun, FiMoon, FiFileText, FiLock } from 'react-icons/fi';
import { Link } from 'react-router-dom';

// Types for roadmap data
interface RoadmapTask {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Not Started' | 'In Progress' | 'Complete';
  phase: number;
  notes: string;
  assignedTo?: string;
  estimatedTime?: string;
}

interface RoadmapCategory {
  id: string;
  title: string;
  description: string;
  tasks: RoadmapTask[];
}

// Sample roadmap data
const initialRoadmapData: RoadmapCategory[] = [
  {
    id: 'auth',
    title: 'Authentication and User Management',
    description: 'User authentication, roles, and access control',
    tasks: [
      {
        id: 'auth-1',
        title: 'Supabase Authentication Integration',
        description: 'Integrate Supabase for user management during limited pilot',
        category: 'auth',
        priority: 'High',
        status: 'In Progress',
        phase: 1,
        notes: 'Currently facing connection timeout issues'
      },
      {
        id: 'auth-2',
        title: 'Role-Based Access Control',
        description: 'Implement admin, security analyst, and developer roles',
        category: 'auth',
        priority: 'Medium',
        status: 'Not Started',
        phase: 2,
        notes: ''
      },
      {
        id: 'auth-3',
        title: 'Organization/Team-Based Permissions',
        description: 'Set up organization structure with team permissions',
        category: 'auth',
        priority: 'Medium',
        status: 'Not Started',
        phase: 3,
        notes: ''
      },
      {
        id: 'auth-4',
        title: 'User Activity Logging',
        description: 'Implement audit trails for user actions',
        category: 'auth',
        priority: 'Low',
        status: 'Not Started',
        phase: 3,
        notes: ''
      }
    ]
  },
  {
    id: 'scanner',
    title: 'Source Code Scanner',
    description: 'Core scanning functionality',
    tasks: [
      {
        id: 'scanner-1',
        title: 'Multi-Language Support',
        description: 'Add support for Java, Python, Go, C++, JavaScript',
        category: 'scanner',
        priority: 'High',
        status: 'Complete',
        phase: 1,
        notes: 'Successfully implemented basic scanning for multiple languages'
      },
      {
        id: 'scanner-2',
        title: 'Cryptographic API Detection',
        description: 'Detect cryptographic API calls and libraries',
        category: 'scanner',
        priority: 'High',
        status: 'Complete',
        phase: 1,
        notes: 'Currently detects common crypto libraries and function calls'
      },
      {
        id: 'scanner-3',
        title: 'Key Size and Algorithm Parameters',
        description: 'Identify key sizes and algorithm parameters',
        category: 'scanner',
        priority: 'Medium',
        status: 'In Progress',
        phase: 2,
        notes: 'Basic identification working, needs refinement'
      },
      {
        id: 'scanner-4',
        title: 'Repository Integration',
        description: 'Support for scanning repository-hosted code',
        category: 'scanner',
        priority: 'Medium',
        status: 'Not Started',
        phase: 2,
        notes: ''
      }
    ]
  },
  {
    id: 'network',
    title: 'Network Traffic Analysis',
    description: 'Live network traffic scanning for quantum-vulnerable cryptography',
    tasks: [
      {
        id: 'network-1',
        title: 'Network Traffic Analysis Feasibility',
        description: 'Assess technical requirements and architecture for network traffic analysis component',
        category: 'network',
        priority: 'High',
        status: 'Complete',
        phase: 3,
        notes: 'Research completed. Implemented basic Network Traffic Analyzer component with UI.'
      },
      {
        id: 'network-2',
        title: 'Cryptographic Protocol Detection',
        description: 'Develop deep packet inspection for TLS, SSH, IPsec, and other protocols',
        category: 'network',
        priority: 'High',
        status: 'In Progress',
        phase: 3,
        notes: 'Basic implementation started with TLS inspection. Other protocols pending.'
      },
      {
        id: 'network-3',
        title: 'Algorithm Identification Engine',
        description: 'Create mapping system for protocol identifiers to cryptographic algorithms',
        category: 'network',
        priority: 'High',
        status: 'In Progress',
        phase: 3,
        notes: 'Started implementation with basic algorithm detection and mapping.'
      },
      {
        id: 'network-4',
        title: 'CBOM Generation for Network Assets',
        description: 'Generate Cryptographic Bills of Materials from live network traffic',
        category: 'network',
        priority: 'Medium',
        status: 'Not Started',
        phase: 4,
        notes: 'Should follow CycloneDX standard for compatibility'
      },
      {
        id: 'network-5',
        title: 'Architectural Decision',
        description: 'Determine if Network Analysis should be a separate product or integrated feature',
        category: 'network',
        priority: 'Critical',
        status: 'Complete',
        phase: 3,
        notes: 'Decision made to build enhanced NTA Module as part of the core product. Implemented comprehensive documentation in Help Center.'
      }
    ]
  },
  {
    id: 'analysis',
    title: 'Analysis and Risk Assessment',
    description: 'Quantum vulnerability analysis and risk assessment',
    tasks: [
      {
        id: 'analysis-1',
        title: 'Quantum Vulnerability Analysis',
        description: "Assess Shor's and Grover's algorithm impacts",
        category: 'analysis',
        priority: 'High',
        status: 'Complete',
        phase: 1,
        notes: 'Basic algorithm impact assessment implemented'
      },
      {
        id: 'analysis-2',
        title: 'Cryptographic Bill of Materials (CBOM)',
        description: 'Generate comprehensive cryptographic inventory',
        category: 'analysis',
        priority: 'High',
        status: 'Complete',
        phase: 1,
        notes: 'CSV export implemented'
      },
      {
        id: 'analysis-3',
        title: 'Risk Prioritization Engine',
        description: 'Score risks based on algorithm type, key size, and context',
        category: 'analysis',
        priority: 'Medium',
        status: 'In Progress',
        phase: 2,
        notes: 'Basic scoring implemented, needs refinement'
      }
    ]
  },
  {
    id: 'remediation',
    title: 'Remediation and Migration Planning',
    description: 'Tools for planning migration to quantum-resistant cryptography',
    tasks: [
      {
        id: 'remediation-1',
        title: 'Recommendation Engine',
        description: 'Suggest PQC algorithm replacements',
        category: 'remediation',
        priority: 'High',
        status: 'In Progress',
        phase: 2,
        notes: 'Basic recommendations working, need to add performance impact assessment'
      },
      {
        id: 'remediation-2',
        title: 'Remediation Guidance',
        description: 'Provide step-by-step remediation instructions',
        category: 'remediation',
        priority: 'Medium',
        status: 'In Progress',
        phase: 2,
        notes: 'Started with basic guidance, need more detailed examples'
      },
      {
        id: 'remediation-3',
        title: 'Compliance Tracking',
        description: 'Monitor progress against migration goals',
        category: 'remediation',
        priority: 'Low',
        status: 'Not Started',
        phase: 3,
        notes: ''
      }
    ]
  },
  {
    id: 'integration',
    title: 'Integration Ecosystem',
    description: 'Integrations with development and security tools',
    tasks: [
      {
        id: 'integration-1',
        title: 'CI/CD Pipeline Plugins',
        description: 'Develop plugins for GitHub Actions, Jenkins, GitLab CI',
        category: 'integration',
        priority: 'Medium',
        status: 'Not Started',
        phase: 3,
        notes: ''
      },
      {
        id: 'integration-2',
        title: 'IDE Extensions',
        description: 'Create extensions for VS Code, IntelliJ IDEA, Eclipse',
        category: 'integration',
        priority: 'Low',
        status: 'Not Started',
        phase: 4,
        notes: ''
      }
    ]
  },
  {
    id: 'ux',
    title: 'User Experience',
    description: 'Dashboard, education portal, and reporting',
    tasks: [
      {
        id: 'ux-1',
        title: 'Interactive Dashboard',
        description: 'Create executive summary view with drill-down',
        category: 'ux',
        priority: 'High',
        status: 'Complete',
        phase: 1,
        notes: 'Basic dashboard implemented with pie charts and tables'
      },
      {
        id: 'ux-2',
        title: 'Education Portal',
        description: 'Build quantum computing educational content',
        category: 'ux',
        priority: 'High',
        status: 'Complete',
        phase: 1,
        notes: "Implemented Shor's algorithm demo, qubit visualization, and PQC explanations"
      },
      {
        id: 'ux-3',
        title: 'Education Quiz',
        description: 'Create interactive quiz for quantum computing topics',
        category: 'ux',
        priority: 'Medium',
        status: 'Complete',
        phase: 1,
        notes: 'Quiz interface with modules implemented'
      },
      {
        id: 'ux-4',
        title: 'Advanced Reporting System',
        description: 'Develop customizable report templates with export options',
        category: 'ux',
        priority: 'Medium',
        status: 'In Progress',
        phase: 2,
        notes: 'Basic CSV export implemented, need to add PDF and JSON'
      },
      {
        id: 'ux-5',
        title: 'Help Center',
        description: 'Create comprehensive in-app documentation and help system',
        category: 'ux',
        priority: 'High',
        status: 'Complete',
        phase: 2,
        notes: 'Implemented Help Center with comprehensive documentation for all product features including detailed NTA Module section.'
      }
    ]
  },
  {
    id: 'advanced',
    title: 'Advanced Features',
    description: 'Testing framework, policy management, and risk modeling',
    tasks: [
      {
        id: 'advanced-1',
        title: 'Automated Testing Framework',
        description: 'Build PQC algorithm performance testing tools',
        category: 'advanced',
        priority: 'Low',
        status: 'Not Started',
        phase: 4,
        notes: ''
      },
      {
        id: 'advanced-2',
        title: 'Policy Management',
        description: 'Create custom policy creation and enforcement tools',
        category: 'advanced',
        priority: 'Low',
        status: 'Not Started',
        phase: 4,
        notes: ''
      },
      {
        id: 'advanced-3',
        title: 'Quantum Risk Modeling',
        description: 'Develop financial impact and risk projection tools',
        category: 'advanced',
        priority: 'Low',
        status: 'Not Started',
        phase: 4,
        notes: ''
      }
    ]
  }
];

const RoadmapTracker: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [roadmapData, setRoadmapData] = useState<RoadmapCategory[]>(initialRoadmapData);
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>(roadmapData.map(category => category.id));
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<RoadmapTask | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [filterPhase, setFilterPhase] = useState<number | null>(null);
  
  // Get data from localStorage on initial load
  useEffect(() => {
    const storedData = localStorage.getItem('roadmapData');
    if (storedData) {
      setRoadmapData(JSON.parse(storedData));
    }
    
    // Check if dark mode is preferred
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);
  
  // Save data to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('roadmapData', JSON.stringify(roadmapData));
  }, [roadmapData]);
  
  // Toggle theme
  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };
  
  // Simple password validation (for demo purposes only)
  const validatePassword = () => {
    // In a real app, use proper authentication
    // This is just for demo to protect the internal roadmap
    if (password === 'qvspro') {
      setAuthenticated(true);
    }
  };
  
  // Toggle category expansion
  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };
  
  // Update task status
  const updateTaskStatus = (categoryId: string, taskId: string, newStatus: 'Not Started' | 'In Progress' | 'Complete') => {
    setRoadmapData(prevData => 
      prevData.map(category => 
        category.id === categoryId 
          ? {
              ...category,
              tasks: category.tasks.map(task => 
                task.id === taskId 
                  ? { ...task, status: newStatus }
                  : task
              )
            }
          : category
      )
    );
  };
  
  // Update task notes
  const updateTaskNotes = (categoryId: string, taskId: string, notes: string) => {
    setRoadmapData(prevData => 
      prevData.map(category => 
        category.id === categoryId 
          ? {
              ...category,
              tasks: category.tasks.map(task => 
                task.id === taskId 
                  ? { ...task, notes }
                  : task
              )
            }
          : category
      )
    );
  };
  
  // Count tasks by status
  const getStatusCounts = () => {
    const counts = {
      total: 0,
      completed: 0,
      inProgress: 0,
      notStarted: 0
    };
    
    roadmapData.forEach(category => {
      category.tasks.forEach(task => {
        counts.total++;
        if (task.status === 'Complete') counts.completed++;
        else if (task.status === 'In Progress') counts.inProgress++;
        else counts.notStarted++;
      });
    });
    
    return counts;
  };
  
  // Get completion percentage
  const getCompletionPercentage = () => {
    const counts = getStatusCounts();
    return Math.round((counts.completed / counts.total) * 100);
  };
  
  // Filter tasks
  const getFilteredTasks = () => {
    let filteredData = [...roadmapData];
    
    if (filterStatus) {
      filteredData = filteredData.map(category => ({
        ...category,
        tasks: category.tasks.filter(task => 
          filterStatus === 'All' || task.status === filterStatus
        )
      }));
    }
    
    if (filterPhase !== null) {
      filteredData = filteredData.map(category => ({
        ...category,
        tasks: category.tasks.filter(task => 
          task.phase === filterPhase
        )
      }));
    }
    
    // Remove empty categories
    filteredData = filteredData.filter(category => category.tasks.length > 0);
    
    return filteredData;
  };
  
  const filteredRoadmap = getFilteredTasks();
  const statusCounts = getStatusCounts();
  
  // Authentication screen
  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <div className="flex justify-center mb-6">
            <FiLock className="w-12 h-12 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">
            QVS-Pro Internal Roadmap
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
            This area is password protected. Please enter the password to continue.
          </p>
          <div className="mb-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <button
            onClick={validatePassword}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition duration-200"
          >
            Access Roadmap
          </button>
          <div className="text-center mt-4">
            <Link to="/" className="text-blue-600 hover:underline">
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <img src="/images/logo-qvs.png" alt="QVS-Pro Logo" className="logo-qvs" />
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Roadmap Tracker</h1>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                {darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
              </button>
              <Link
                to="/"
                className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                <FiArrowLeft className="mr-1" /> Back to App
              </Link>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Dashboard summary */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-4">Overall Progress</h2>
            <div className="flex items-center">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mr-2">
                <div 
                  className="bg-blue-600 h-4 rounded-full" 
                  style={{ width: `${getCompletionPercentage()}%` }}
                ></div>
              </div>
              <span className="text-lg font-bold">{getCompletionPercentage()}%</span>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-2">Task Status</h2>
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center">
                <div className="text-green-500 font-bold text-xl">{statusCounts.completed}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Complete</div>
              </div>
              <div className="text-center">
                <div className="text-yellow-500 font-bold text-xl">{statusCounts.inProgress}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">In Progress</div>
              </div>
              <div className="text-center">
                <div className="text-gray-500 font-bold text-xl">{statusCounts.notStarted}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Not Started</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 md:col-span-2">
            <h2 className="text-lg font-semibold mb-2">Filters</h2>
            <div className="flex flex-wrap gap-2">
              <select
                value={filterStatus || 'All'}
                onChange={(e) => setFilterStatus(e.target.value === 'All' ? null : e.target.value)}
                className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-1"
              >
                <option value="All">All Statuses</option>
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Complete">Complete</option>
              </select>
              
              <select
                value={filterPhase !== null ? filterPhase : 'All'}
                onChange={(e) => setFilterPhase(e.target.value === 'All' ? null : Number(e.target.value))}
                className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-1"
              >
                <option value="All">All Phases</option>
                <option value="1">Phase 1</option>
                <option value="2">Phase 2</option>
                <option value="3">Phase 3</option>
                <option value="4">Phase 4</option>
              </select>
              
              <button
                onClick={() => {
                  setFilterStatus(null);
                  setFilterPhase(null);
                }}
                className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 px-3 py-1 rounded"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
        
        {/* Roadmap Categories */}
        <div className="space-y-6">
          {filteredRoadmap.map(category => (
            <div key={category.id} className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
              <div 
                className="px-4 py-3 bg-gray-50 dark:bg-gray-700 cursor-pointer flex justify-between items-center"
                onClick={() => toggleCategory(category.id)}
              >
                <h2 className="text-lg font-semibold">{category.title}</h2>
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">
                    {category.tasks.filter(t => t.status === 'Complete').length} / {category.tasks.length}
                  </span>
                  <span className={`transform transition-transform ${expandedCategories.includes(category.id) ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </div>
              </div>
              
              {expandedCategories.includes(category.id) && (
                <div className="p-4">
                  <p className="text-gray-600 dark:text-gray-400 mb-4">{category.description}</p>
                  
                  <div className="space-y-4">
                    {category.tasks.map(task => (
                      <div key={task.id} className="border dark:border-gray-700 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium">{task.title}</h3>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              task.priority === 'Critical' ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300' :
                              task.priority === 'High' ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300' :
                              task.priority === 'Medium' ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300' :
                              'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300'
                            }`}>
                              {task.priority}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              task.status === 'Complete' ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300' :
                              task.status === 'In Progress' ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300' :
                              'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                            }`}>
                              {task.status}
                            </span>
                            <span className="px-2 py-1 text-xs rounded-full bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300">
                              Phase {task.phase}
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                          {task.description}
                        </p>
                        
                        <div className="flex flex-col space-y-4">
                          <div>
                            <h4 className="text-sm font-medium mb-1">Status</h4>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => updateTaskStatus(category.id, task.id, 'Not Started')}
                                className={`flex items-center px-2 py-1 text-xs rounded ${
                                  task.status === 'Not Started' 
                                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white' 
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                }`}
                              >
                                {task.status === 'Not Started' ? <FiCheckSquare className="mr-1" /> : <FiSquare className="mr-1" />}
                                Not Started
                              </button>
                              
                              <button
                                onClick={() => updateTaskStatus(category.id, task.id, 'In Progress')}
                                className={`flex items-center px-2 py-1 text-xs rounded ${
                                  task.status === 'In Progress'
                                    ? 'bg-yellow-200 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                }`}
                              >
                                {task.status === 'In Progress' ? <FiCheckSquare className="mr-1" /> : <FiSquare className="mr-1" />}
                                In Progress
                              </button>
                              
                              <button
                                onClick={() => updateTaskStatus(category.id, task.id, 'Complete')}
                                className={`flex items-center px-2 py-1 text-xs rounded ${
                                  task.status === 'Complete'
                                    ? 'bg-green-200 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                }`}
                              >
                                {task.status === 'Complete' ? <FiCheckSquare className="mr-1" /> : <FiSquare className="mr-1" />}
                                Complete
                              </button>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium mb-1">Notes</h4>
                            <textarea
                              value={task.notes}
                              onChange={(e) => updateTaskNotes(category.id, task.id, e.target.value)}
                              className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
                              rows={2}
                              placeholder="Add notes about this task..."
                            ></textarea>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default RoadmapTracker; 