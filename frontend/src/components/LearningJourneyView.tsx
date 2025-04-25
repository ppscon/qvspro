import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GlossaryEntry } from './glossaryData';
import InteractiveConcept from './InteractiveConcept';

interface LearningJourneyViewProps {
  entries: GlossaryEntry[];
  setActiveTerm: (term: GlossaryEntry) => void;
}

const LearningJourneyView: React.FC<LearningJourneyViewProps> = ({ entries, setActiveTerm }) => {
  const [currentStage, setCurrentStage] = useState(0);
  const stages = [
    { title: 'Quantum Basics', concepts: ['Quantum Computer', 'Qubit', 'Superposition', 'Entanglement'] },
    { title: 'Quantum Algorithms', concepts: ["Quantum Fourier Transform", "Shor's Algorithm", "Grover's Algorithm"] },
    { title: 'The Quantum Threat', concepts: ['Harvest Now, Decrypt Later', 'Q-Day', 'Cryptographically Relevant Quantum Computer'] },
    { title: 'Post-Quantum Solutions', concepts: ['Post-Quantum Cryptography (PQC)', 'Cryptographic Agility', 'NIST PQC Standardization'] },
  ];

  const currentConcepts = stages[currentStage].concepts.map(c => entries.find(e => e.term === c)).filter(Boolean) as GlossaryEntry[];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
    >
      {/* Journey Progress */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {stages.map((stage, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentStage(idx)}
              className={`px-4 py-2 rounded-full text-sm ${
                idx === currentStage
                  ? 'bg-purple-600 text-white'
                  : idx < currentStage
                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                  : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
              }`}
            >
              {stage.title}
            </button>
          ))}
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full">
          <div
            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStage / (stages.length - 1)) * 100}%` }}
          />
        </div>
      </div>
      {/* Stage Content */}
      <div className="stage-content">
        <h2 className="text-2xl font-bold mb-6">{stages[currentStage].title}</h2>
        <div className="space-y-8">
          {currentConcepts.map((concept, idx) => (
            <div key={concept.term} className="concept-card">
              <InteractiveConcept concept={concept} index={idx} setActiveTerm={setActiveTerm} />
            </div>
          ))}
        </div>
        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-6 border-t dark:border-gray-700">
          <button
            onClick={() => setCurrentStage(Math.max(0, currentStage - 1))}
            disabled={currentStage === 0}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentStage(Math.min(stages.length - 1, currentStage + 1))}
            disabled={currentStage === stages.length - 1}
            className="px-4 py-2 bg-purple-600 text-white rounded-md disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default LearningJourneyView;
