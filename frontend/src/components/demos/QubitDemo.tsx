import React, { useState } from 'react';
import { motion } from 'framer-motion';

/**
 * Interactive Qubit Demo
 * Visualizes a qubit in |0⟩, |1⟩, or superposition state with simple animation and probability bars.
 * Accessible and responsive, no external dependencies beyond framer-motion.
 */

const states = [
  {
    label: '|0⟩',
    description: 'The qubit is in the classical 0 state.',
    color: 'bg-blue-500',
    prob0: 1,
    prob1: 0,
  },
  {
    label: 'Superposition',
    description: 'The qubit is in a superposition of 0 and 1.',
    color: 'bg-purple-500',
    prob0: 0.5,
    prob1: 0.5,
  },
  {
    label: '|1⟩',
    description: 'The qubit is in the classical 1 state.',
    color: 'bg-pink-500',
    prob0: 0,
    prob1: 1,
  },
];

const QubitDemo: React.FC = () => {
  const [stateIdx, setStateIdx] = useState(0);
  const state = states[stateIdx];

  const nextState = () => setStateIdx((stateIdx + 1) % states.length);
  const resetState = () => setStateIdx(0);

  return (
    <div className="flex flex-col items-center justify-center gap-4 w-full h-full flex-grow overflow-visible text-center">
      <motion.div
        className={`w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full flex items-center justify-center shadow-lg cursor-pointer ${state.color}`}
        style={{ flexShrink: 0, minWidth: 0, minHeight: 0, maxWidth: '100%' }}
        whileTap={{ scale: 0.92 }}
        onClick={nextState}
        tabIndex={0}
        role="button"
        aria-label={`Qubit state: ${state.label}. Click to change state.`}
        onKeyPress={e => (e.key === 'Enter' || e.key === ' ') && nextState()}
      >
        <span className="text-3xl md:text-4xl text-white font-bold select-none">{state.label}</span>
      </motion.div>
      <div className="text-center text-sm text-gray-600 dark:text-gray-300 max-w-xs">
        {state.description} <br />
        <span className="text-xs text-gray-400">(Click or press Enter/Space to cycle states)</span>
      </div>
      {/* Probability Bars */}
      <div className="w-full max-w-md mx-auto flex gap-2 mt-2 flex-shrink-0">
        <div className="flex-1 min-w-0 overflow-hidden">
          <div className="text-xs text-center text-blue-600 dark:text-blue-300">P(0)</div>
          <div className="h-2 bg-blue-200 dark:bg-blue-900 rounded">
            <motion.div
              className="h-2 bg-blue-500 dark:bg-blue-400 rounded"
              animate={{ width: `${state.prob0 * 100}%` }}
              style={{ width: `${state.prob0 * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
        <div className="flex-1 min-w-0 overflow-hidden">
          <div className="text-xs text-center text-pink-600 dark:text-pink-300">P(1)</div>
          <div className="h-2 bg-pink-200 dark:bg-pink-900 rounded">
            <motion.div
              className="h-2 bg-pink-500 dark:bg-pink-400 rounded"
              animate={{ width: `${state.prob1 * 100}%` }}
              style={{ width: `${state.prob1 * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>
      <button
        className="mt-2 px-4 py-1 rounded bg-gray-800 text-white dark:bg-gray-700 dark:text-white text-xs font-semibold hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-400"
        onClick={resetState}
        aria-label="Reset qubit state"
        style={{ alignSelf: 'center', width: 'auto', maxWidth: '100%' }}
      >
        Reset
      </button>
    </div>
  );
};

export default QubitDemo;
