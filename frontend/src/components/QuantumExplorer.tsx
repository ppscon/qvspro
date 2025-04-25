import React, { useState, useEffect } from 'react';
import { FiSearch, FiBook, FiInfo, FiZap, FiLink, FiLayers } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import EducationHeader from './EducationHeader';
import EducationFooter from './EducationFooter';
import CardView from './CardView';
import MindMapView from './MindMapView';
import LearningJourneyView from './LearningJourneyView';
import TermDetailModal from './TermDetailModal';
import { GlossaryEntry, glossaryEntries } from './glossaryData';

const QuantumExplorer: React.FC = () => {
  const [activeView, setActiveView] = useState<'cards' | 'mind-map' | 'journey'>('cards');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeTerm, setActiveTerm] = useState<GlossaryEntry | null>(null);
  const [filteredEntries, setFilteredEntries] = useState<GlossaryEntry[]>(glossaryEntries);

  useEffect(() => {
    let filtered = glossaryEntries;
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(entry => entry.category === selectedCategory);
    }
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        entry =>
          entry.term.toLowerCase().includes(search) ||
          entry.definition.toLowerCase().includes(search)
      );
    }
    filtered = [...filtered].sort((a, b) => a.term.localeCompare(b.term));
    setFilteredEntries(filtered);
  }, [searchTerm, selectedCategory]);

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 transition-colors duration-300 dark">
      <EducationHeader 
        title="Quantum Explorer" 
      />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500">
              Quantum Explorer
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Discover the fascinating world of quantum computing and post-quantum cryptography through interactive visualizations and explanations.
            </p>
          </div>
          {/* View Selector */}
          <div className="flex justify-center mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-full shadow-md p-1 flex">
              <button 
                onClick={() => setActiveView('cards')}
                className={`px-4 py-2 rounded-full ${activeView === 'cards' 
                  ? 'bg-purple-600 text-white' 
                  : 'text-gray-700 dark:text-gray-300'}`}
              >
                <span className="flex items-center"><FiLayers className="mr-2" /> Card View</span>
              </button>
              <button 
                onClick={() => setActiveView('mind-map')}
                className={`px-4 py-2 rounded-full ${activeView === 'mind-map' 
                  ? 'bg-purple-600 text-white' 
                  : 'text-gray-700 dark:text-gray-300'}`}
              >
                <span className="flex items-center"><FiLink className="mr-2" /> Mind Map</span>
              </button>
              <button 
                onClick={() => setActiveView('journey')}
                className={`px-4 py-2 rounded-full ${activeView === 'journey' 
                  ? 'bg-purple-600 text-white' 
                  : 'text-gray-700 dark:text-gray-300'}`}
              >
                <span className="flex items-center"><FiZap className="mr-2" /> Learning Journey</span>
              </button>
            </div>
          </div>
          {/* Search and Filter */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
              <div className="flex-1 mb-4 md:mb-0">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Search quantum terms..."
                    className="w-full pl-10 pr-4 py-2 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              <div>
                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  className="rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-200 px-4 py-2"
                >
                  <option value="all">All Categories</option>
                  <option value="quantum">Quantum Computing</option>
                  <option value="cryptography">Cryptography</option>
                  <option value="algorithm">Algorithm</option>
                  <option value="threat">Threat</option>
                </select>
              </div>
            </div>
          </div>
          {/* Content Views */}
          <AnimatePresence>
            {activeView === 'cards' && (
              <CardView 
                entries={filteredEntries} 
                setActiveTerm={setActiveTerm} 
              />
            )}
            {activeView === 'mind-map' && (
              <MindMapView 
                entries={glossaryEntries} 
                selectedCategory={selectedCategory}
                setActiveTerm={setActiveTerm}
              />
            )}
            {activeView === 'journey' && (
              <LearningJourneyView 
                entries={glossaryEntries}
                setActiveTerm={setActiveTerm}
              />
            )}
          </AnimatePresence>
          {/* Term Detail Modal */}
          {activeTerm && (
            <TermDetailModal 
              term={activeTerm} 
              onClose={() => setActiveTerm(null)} 
            />
          )}
        </div>
      </main>
      <EducationFooter />
    </div>
  );
};

export default QuantumExplorer;
