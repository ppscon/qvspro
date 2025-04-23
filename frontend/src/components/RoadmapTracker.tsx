import React, { useState, useEffect, useMemo } from 'react';
import { FiLoader, FiPlus, FiAlertTriangle, FiAlertCircle } from 'react-icons/fi';

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

const RoadmapTracker: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [roadmapData, setRoadmapData] = useState<RoadmapData | null>(null);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FiLoader className="animate-spin mr-2" />
        <span>Loading roadmap data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
        <div className="flex items-center">
          <FiAlertCircle className="mr-2" />
          <span>Error loading roadmap: {error}</span>
        </div>
        <p className="text-sm mt-2">Please try refreshing the page or contact support if the problem persists.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Roadmap Tracker</h1>
        <div className="flex space-x-2">
          <button className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            <FiPlus className="inline mr-1" /> Add Task
          </button>
        </div>
      </div>

      {roadmapCategories.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
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
                    </tr>
                  </thead>
                  <tbody>
                    {category.tasks.map(task => (
                      <tr key={task.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750">
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RoadmapTracker;