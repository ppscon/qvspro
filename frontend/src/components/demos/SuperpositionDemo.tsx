import React, { useState } from 'react';
import { motion } from 'framer-motion';

/**
 * Interactive Superposition Demo
 * Visualizes a qubit in superposition with Bloch sphere and state vector animation.
 * Matches the Qubit demo's layout and container rules.
 */

const states = [
  {
    label: '|0⟩',
    description: 'Classical 0 state.',
    color: 'bg-blue-500',
    vector: [1, 0],
  },
  {
    label: 'Superposition',
    description: 'Equal superposition of 0 and 1.',
    color: 'bg-purple-500',
    vector: [Math.SQRT1_2, Math.SQRT1_2],
  },
  {
    label: '|1⟩',
    description: 'Classical 1 state.',
    color: 'bg-pink-500',
    vector: [0, 1],
  },
];

const SuperpositionDemo: React.FC = () => {
  const [stateIdx, setStateIdx] = useState(1); // Start at superposition
  const state = states[stateIdx];

  const nextState = () => setStateIdx((stateIdx + 1) % states.length);
  const resetState = () => setStateIdx(1);

  return (
    <div className="flex flex-col items-center justify-center gap-4 w-full h-full flex-grow overflow-visible text-center">
      <motion.div
        className={`w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full flex items-center justify-center shadow-lg cursor-pointer ${state.color}`}
        style={{ flexShrink: 0, minWidth: 0, minHeight: 0, maxWidth: '100%' }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
        onClick={nextState}
        tabIndex={0}
        role="button"
        aria-label="Cycle superposition state"
        onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && nextState()}
      >
        <span className="text-2xl font-bold text-white select-none">{state.label}</span>
      </motion.div>
      {/* Bloch sphere visualization placeholder */}
      <div className="w-full max-w-md mx-auto flex flex-col gap-2">
        <div className="flex items-center justify-center gap-2">
          <span className="text-xs text-blue-600 dark:text-blue-300">|0⟩</span>
          <div className="flex-1 h-2 rounded bg-gradient-to-r from-blue-300 via-purple-400 to-pink-400 relative">
            <motion.div
              className="absolute top-0 left-0 h-2 rounded bg-purple-600"
              style={{ width: `${state.vector[0] * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <span className="text-xs text-pink-600 dark:text-pink-300">|1⟩</span>
        </div>
      </div>
      <button
        className="mt-2 px-4 py-1 rounded bg-gray-800 text-white dark:bg-gray-700 dark:text-white text-xs font-semibold hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-400"
        onClick={resetState}
        aria-label="Reset superposition state"
        style={{ alignSelf: 'center', width: 'auto', maxWidth: '100%' }}
      >
        Reset
      </button>
      <span className="text-xs text-gray-400">(Click or press Enter/Space to cycle states)</span>
    </div>
  );
};

export default SuperpositionDemo;
