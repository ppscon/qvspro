import React from 'react';
import { motion } from 'framer-motion';
import { GlossaryEntry } from './glossaryData';
import { 
  FiCpu, 
  FiLock, 
  FiActivity, 
  FiAlertTriangle, 
  FiCode 
} from 'react-icons/fi';

interface CardViewProps {
  entries: GlossaryEntry[];
  setActiveTerm: (term: GlossaryEntry) => void;
}

const CardView: React.FC<CardViewProps> = ({ entries, setActiveTerm }) => {
  // Get the appropriate icon for each category
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'quantum':
        return <FiCpu className="w-8 h-8 text-quantum-500" />;
      case 'cryptography':
        return <FiLock className="w-8 h-8 text-blue-500" />;
      case 'algorithm':
        return <FiCode className="w-8 h-8 text-green-500" />;
      case 'threat':
        return <FiAlertTriangle className="w-8 h-8 text-red-500" />;
      default:
        return <FiActivity className="w-8 h-8 text-gray-500" />;
    }
  };

  // Get appropriate category badge styling
  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'quantum':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'cryptography':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'algorithm':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'threat':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {entries.map((entry, index) => (
        <motion.div
          key={entry.term}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: index * 0.05 }}
          className="flip-card cursor-pointer"
          onClick={() => setActiveTerm(entry)}
          whileHover={{ y: -5 }}
        >
          <div className="flip-card-inner">
            <div className="flip-card-front bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md h-full">
              <div className="flex justify-between items-start mb-4">
                <div className="category-icon">
                  {getCategoryIcon(entry.category)}
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getCategoryBadge(entry.category)}`}>
                  {entry.category}
                </span>
              </div>
              <h3 className="text-xl font-bold mb-2">{entry.term}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {entry.definition.substring(0, 120)}
                {entry.definition.length > 120 && '...'}
              </p>
            </div>
            <div className="flip-card-back bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-6 rounded-xl shadow-md h-full">
              <div className="concept-illustration mb-4 flex justify-center">
                {getCategoryIcon(entry.category)}
              </div>
              <h3 className="text-xl font-bold mb-2">{entry.term}</h3>
              <p className="mb-4 text-sm">{entry.simpleExplanation || entry.definition.substring(0, 150)}</p>
              <button className="px-4 py-2 bg-white text-purple-600 rounded-full text-sm font-medium hover:bg-purple-50 transition-colors duration-200">
                Learn More
              </button>
              {entry.relatedTerms && entry.relatedTerms.length > 0 && (
                <div className="mt-4 pt-3 border-t border-white/20">
                  <p className="text-xs opacity-75 mb-1">Related Terms:</p>
                  <div className="flex flex-wrap gap-1">
                    {(entry.relatedTerms || []).slice(0, 2).map(term => (
                      <span key={term} className="text-xs bg-white/20 px-2 py-1 rounded-full">
                        {term}
                      </span>
                    ))}
                    {(entry.relatedTerms || []).length > 2 && (
                      <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                        +{(entry.relatedTerms || []).length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default CardView;
