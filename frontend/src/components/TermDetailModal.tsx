import React from 'react';
import { motion } from 'framer-motion';
import { GlossaryEntry } from './glossaryData';
import InteractiveConcept from './InteractiveConcept';
import { 
  FiX, 
  FiExternalLink, 
  FiLink, 
  FiBookOpen,
  FiShare2
} from 'react-icons/fi';

interface TermDetailModalProps {
  term: GlossaryEntry;
  onClose: () => void;
}

const TermDetailModal: React.FC<TermDetailModalProps> = ({ term, onClose }) => {
  if (!term) return null;
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold">{term.term}</h2>
              <div className="mt-1">
                <span className={getCategoryBadge(term.category)}>
                  {term.category}
                </span>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>
          
          <div className="md:flex">
            <div className="md:w-1/2 md:pr-6">
              <div className="prose dark:prose-invert max-w-none">
                <h3 className="text-lg font-semibold mb-3">Overview</h3>
                <p>{term.definition}</p>
                
                {term.simpleExplanation && (
                  <>
                    <h3 className="text-lg font-semibold mt-6 mb-3">In Simple Terms</h3>
                    <p>{term.simpleExplanation}</p>
                  </>
                )}
                
                {term.importance && (
                  <>
                    <h3 className="text-lg font-semibold mt-6 mb-3">Why It Matters</h3>
                    <p>{term.importance}</p>
                  </>
                )}
              </div>
            </div>
            
            <div className="md:w-1/2 mt-6 md:mt-0">
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">Interactive Demonstration</h3>
                <div className="h-64 flex items-center justify-center">
                  <InteractiveConcept concept={term} index={0} setActiveTerm={() => {}} />
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Related Concepts</h3>
                <div className="flex flex-wrap gap-2">
                  {term.relatedTerms?.map(relatedTerm => (
                    <button 
                      key={relatedTerm}
                      className="px-3 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 rounded-full text-sm hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                    >
                      {relatedTerm}
                    </button>
                  )) || (
                    <p className="text-gray-500">No related concepts available</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4">Additional Resources</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a 
                href={`https://en.wikipedia.org/wiki/${term.term.replace(/ /g, '_')}`}
                target="_blank"
                rel="noopener noreferrer" 
                className="p-4 border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <FiBookOpen className="text-purple-500" />
                <div>
                  <h4 className="font-medium mb-1">Wikipedia</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Learn more about {term.term}
                  </p>
                </div>
              </a>
              <a 
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`${term.term} quantum computing`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <FiExternalLink className="text-purple-500" />
                <div>
                  <h4 className="font-medium mb-1">Video Explanation</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Visual explanation of {term.term}
                  </p>
                </div>
              </a>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 flex justify-between rounded-b-xl">
          <button 
            className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md transition-colors"
            onClick={onClose}
          >
            <FiX /> Close
          </button>
          
          <div className="flex gap-2">
            <button 
              className="flex items-center gap-1 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md transition-colors"
              title="Share"
            >
              <FiShare2 />
            </button>
            <button 
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              <FiLink /> Related Terms
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Helper function to get category badge styling
const getCategoryBadge = (category: string) => {
  switch (category) {
    case 'quantum':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 px-2 py-1 rounded-full text-xs font-semibold';
    case 'cryptography':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-1 rounded-full text-xs font-semibold';
    case 'algorithm':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 px-2 py-1 rounded-full text-xs font-semibold';
    case 'threat':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 px-2 py-1 rounded-full text-xs font-semibold';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300 px-2 py-1 rounded-full text-xs font-semibold';
  }
};

export default TermDetailModal;
