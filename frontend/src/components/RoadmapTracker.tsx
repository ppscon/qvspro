import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FiLoader, FiPlus, FiAlertTriangle, FiAlertCircle, FiEdit, FiSave, FiX, FiCheck, FiTrash2 } from 'react-icons/fi';

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

interface RoadmapData {
  categories: RoadmapCategory[];
}

// Mock API function to simulate saving data to the server
const saveRoadmapData = async (data: RoadmapData): Promise<boolean> => {
  // In a real application, this would be an API call to save the data
  console.log('Saving roadmap data:', data);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // For demonstration, we'll just return success
  // In a real application, you would handle errors from the API
  return true;
};

const RoadmapTracker: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [roadmapData, setRoadmapData] = useState<RoadmapData | null>(null);
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<RoadmapTask> | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newTaskData, setNewTaskData] = useState<Partial<RoadmapTask>>({
    title: '',
    description: '',
    priority: 'Medium',
    status: 'Not Started',
    phase: 1,
    notes: ''
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  useEffect(() => {
    const fetchRoadmapData = async () => {
      try {
        const response = await fetch('/data/roadmap.json');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch roadmap data: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        setRoadmapData(data);
        setLoading(false);
      } catch (err) {
        console.error('Error loading roadmap data:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setLoading(false);
      }
    };

    fetchRoadmapData();
  }, []);

  const roadmapCategories = useMemo(() => {
    return roadmapData?.categories || [];
  }, [roadmapData]);

  const handleEditClick = useCallback((task: RoadmapTask) => {
    setEditingTask(task.id);
    setEditFormData({ ...task });
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingTask(null);
    setEditFormData(null);
  }, []);

  const handleEditChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!editFormData) return;
    
    const { name, value } = e.target;
    setEditFormData(prev => prev ? { ...prev, [name]: value } : null);
  }, [editFormData]);

  const handleSaveEdit = useCallback(async () => {
    if (!roadmapData || !editFormData || !editingTask) return;
    
    setSaving(true);
    
    const updatedCategories = roadmapData.categories.map(category => {
      const updatedTasks = category.tasks.map(task => {
        if (task.id === editingTask) {
          return { ...task, ...editFormData };
        }
        return task;
      });
      
      return { ...category, tasks: updatedTasks };
    });
    
    const updatedData = { ...roadmapData, categories: updatedCategories };
    
    try {
      const success = await saveRoadmapData(updatedData);
      if (success) {
        setRoadmapData(updatedData);
        setEditingTask(null);
        setEditFormData(null);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Error saving task:', err);
      setError('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  }, [roadmapData, editFormData, editingTask]);

  const handleDeleteTask = useCallback(async (taskId: string, categoryId: string) => {
    if (!roadmapData) return;
    
    if (!window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      return;
    }
    
    setSaving(true);
    
    const updatedCategories = roadmapData.categories.map(category => {
      if (category.id === categoryId) {
        return {
          ...category,
          tasks: category.tasks.filter(task => task.id !== taskId)
        };
      }
      return category;
    });
    
    const updatedData = { ...roadmapData, categories: updatedCategories };
    
    try {
      const success = await saveRoadmapData(updatedData);
      if (success) {
        setRoadmapData(updatedData);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Error deleting task:', err);
      setError('Failed to delete task. Please try again.');
    } finally {
      setSaving(false);
    }
  }, [roadmapData]);

  const handleAddTask = useCallback(() => {
    if (roadmapCategories.length > 0 && !selectedCategory) {
      setSelectedCategory(roadmapCategories[0].id);
    }
    setShowAddModal(true);
  }, [roadmapCategories, selectedCategory]);

  const handleAddTaskChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewTaskData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSaveNewTask = useCallback(async () => {
    if (!roadmapData || !selectedCategory) return;
    
    setSaving(true);
    
    // Generate a unique ID for the new task
    const newTaskId = `task-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    const newTask: RoadmapTask = {
      id: newTaskId,
      title: newTaskData.title || 'New Task',
      description: newTaskData.description || '',
      category: selectedCategory,
      priority: newTaskData.priority as 'Low' | 'Medium' | 'High' | 'Critical' || 'Medium',
      status: newTaskData.status as 'Not Started' | 'In Progress' | 'Complete' || 'Not Started',
      phase: newTaskData.phase || 1,
      notes: newTaskData.notes || ''
    };
    
    const updatedCategories = roadmapData.categories.map(category => {
      if (category.id === selectedCategory) {
        return {
          ...category,
          tasks: [...category.tasks, newTask]
        };
      }
      return category;
    });
    
    const updatedData = { ...roadmapData, categories: updatedCategories };
    
    try {
      const success = await saveRoadmapData(updatedData);
      if (success) {
        setRoadmapData(updatedData);
        setShowAddModal(false);
        setNewTaskData({
          title: '',
          description: '',
          priority: 'Medium',
          status: 'Not Started',
          phase: 1,
          notes: ''
        });
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Error adding task:', err);
      setError('Failed to add task. Please try again.');
    } finally {
      setSaving(false);
    }
  }, [roadmapData, selectedCategory, newTaskData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-800 dark:text-gray-200">
        <FiLoader className="animate-spin mr-2" />
        <span>Loading roadmap data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded relative">
        <div className="flex items-center">
          <FiAlertCircle className="mr-2" />
          <span>Error loading roadmap: {error}</span>
        </div>
        <p className="text-sm mt-2">Please try refreshing the page or contact support if the problem persists.</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white dark:bg-gray-900 min-h-screen">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Roadmap Tracker</h1>
        <div className="flex space-x-2">
          <button 
            onClick={handleAddTask}
            className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            disabled={saving}
          >
            <FiPlus className="inline mr-1" /> Add Task
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="mb-4 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-200 px-4 py-3 rounded flex items-center">
          <FiCheck className="mr-2" />
          <span>Changes saved successfully!</span>
        </div>
      )}

      {roadmapCategories.length === 0 ? (
        <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 text-yellow-700 dark:text-yellow-200 px-4 py-3 rounded">
          <FiAlertTriangle className="inline mr-2" />
          <span>No roadmap data available.</span>
        </div>
      ) : (
        <div className="space-y-8">
          {roadmapCategories.map(category => (
            <div key={category.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">{category.title}</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{category.description}</p>
              
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-700">
                      <th className="px-4 py-2 text-left text-gray-800 dark:text-gray-200">Task</th>
                      <th className="px-4 py-2 text-left text-gray-800 dark:text-gray-200">Status</th>
                      <th className="px-4 py-2 text-left text-gray-800 dark:text-gray-200">Priority</th>
                      <th className="px-4 py-2 text-left text-gray-800 dark:text-gray-200">Phase</th>
                      <th className="px-4 py-2 text-left text-gray-800 dark:text-gray-200">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {category.tasks.map(task => (
                      <tr key={task.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750">
                        {editingTask === task.id ? (
                          // Edit mode
                          <>
                            <td className="px-4 py-3">
                              <input
                                type="text"
                                name="title"
                                value={editFormData?.title || ''}
                                onChange={handleEditChange}
                                className="mb-2 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                              />
                              <textarea
                                name="description"
                                value={editFormData?.description || ''}
                                onChange={handleEditChange}
                                rows={2}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <select
                                name="status"
                                value={editFormData?.status || 'Not Started'}
                                onChange={handleEditChange}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                              >
                                <option value="Not Started">Not Started</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Complete">Complete</option>
                              </select>
                            </td>
                            <td className="px-4 py-3">
                              <select
                                name="priority"
                                value={editFormData?.priority || 'Medium'}
                                onChange={handleEditChange}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                              >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                                <option value="Critical">Critical</option>
                              </select>
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="number"
                                name="phase"
                                value={editFormData?.phase || 1}
                                onChange={handleEditChange}
                                min={1}
                                max={4}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex space-x-2">
                                <button
                                  onClick={handleSaveEdit}
                                  disabled={saving}
                                  className="p-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                                  title="Save changes"
                                >
                                  <FiSave size={18} />
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="p-1 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
                                  title="Cancel editing"
                                >
                                  <FiX size={18} />
                                </button>
                              </div>
                            </td>
                          </>
                        ) : (
                          // View mode
                          <>
                            <td className="px-4 py-3">
                              <div className="font-medium text-gray-800 dark:text-gray-200">{task.title}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">{task.description}</div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                task.status === 'Complete' 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                  : task.status === 'In Progress'
                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                              }`}>
                                {task.status}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                task.priority === 'Critical' 
                                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
                                  : task.priority === 'High'
                                    ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                                    : task.priority === 'Medium'
                                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                              }`}>
                                {task.priority}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                              Phase {task.phase}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleEditClick(task)}
                                  className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                  title="Edit task"
                                >
                                  <FiEdit size={18} />
                                </button>
                                <button
                                  onClick={() => handleDeleteTask(task.id, category.id)}
                                  className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                  title="Delete task"
                                >
                                  <FiTrash2 size={18} />
                                </button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Add New Task</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  {roadmapCategories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={newTaskData.title}
                  onChange={handleAddTaskChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Task title"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={newTaskData.description}
                  onChange={handleAddTaskChange}
                  rows={3}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Task description"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={newTaskData.status}
                    onChange={handleAddTaskChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Complete">Complete</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Priority
                  </label>
                  <select
                    id="priority"
                    name="priority"
                    value={newTaskData.priority}
                    onChange={handleAddTaskChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="phase" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Phase
                  </label>
                  <input
                    type="number"
                    id="phase"
                    name="phase"
                    value={newTaskData.phase}
                    onChange={handleAddTaskChange}
                    min={1}
                    max={4}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={newTaskData.notes}
                  onChange={handleAddTaskChange}
                  rows={2}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Additional notes"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNewTask}
                disabled={saving || !newTaskData.title}
                className={`px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  (saving || !newTaskData.title) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {saving ? 'Saving...' : 'Save Task'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoadmapTracker;