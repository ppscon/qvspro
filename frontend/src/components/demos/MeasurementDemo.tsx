import React, { useState } from 'react';
import { motion } from 'framer-motion';

/**
 * Interactive Measurement Demo
 * Visualizes quantum measurement: collapse of a qubit to |0⟩ or |1⟩.
 * Matches the Qubit demo's layout and container rules.
 */

const initialStates = [
  {
    label: 'Superposition',
    description: 'Qubit is in superposition.',
    color: 'bg-purple-500',
    prob0: 0.5,
    prob1: 0.5,
  },
  {
    label: '|0⟩',
    description: 'Measured as 0.',
    color: 'bg-blue-500',
    prob0: 1,
    prob1: 0,
  },
  {
    label: '|1⟩',
    description: 'Measured as 1.',
    color: 'bg-pink-500',
    prob0: 0,
    prob1: 1,
  },
];

const MeasurementDemo: React.FC = () => {
  const [stateIdx, setStateIdx] = useState(0); // Start in superposition
  const [measured, setMeasured] = useState<null | 0 | 1>(null);

  const measure = () => {
    const result = Math.random() < 0.5 ? 0 : 1;
    setStateIdx(result === 0 ? 1 : 2);
    setMeasured(result);
  };
  const reset = () => {
    setStateIdx(0);
    setMeasured(null);
  };
  const state = initialStates[stateIdx];

  return (
    <div className="flex flex-col items-center justify-center gap-4 w-full h-full flex-grow overflow-visible text-center">
      <motion.div
        className={`w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full flex items-center justify-center shadow-lg cursor-pointer ${state.color}`}
        style={{ flexShrink: 0, minWidth: 0, minHeight: 0, maxWidth: '100%' }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
        onClick={measured === null ? measure : undefined}
        tabIndex={0}
        role="button"
        aria-label="Measure qubit"
        onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && measured === null && measure()}
      >
        <span className="text-2xl font-bold text-white select-none">{state.label}</span>
      </motion.div>
      <div className="w-full max-w-md mx-auto flex flex-col gap-2">
        <div className="flex items-center justify-center gap-2">
          <div className="flex-1 h-2 rounded bg-blue-200 dark:bg-blue-900 relative">
            <motion.div
              className="absolute top-0 left-0 h-2 rounded bg-blue-600"
              style={{ width: `${state.prob0 * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <span className="text-xs text-pink-600 dark:text-pink-300">P(1)</span>
          <div className="flex-1 h-2 rounded bg-pink-200 dark:bg-pink-900 relative">
            <motion.div
              className="absolute top-0 left-0 h-2 rounded bg-pink-600"
              style={{ width: `${state.prob1 * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>
      <button
        className="mt-2 px-4 py-1 rounded bg-gray-800 text-white dark:bg-gray-700 dark:text-white text-xs font-semibold hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-400"
        onClick={reset}
        aria-label="Reset measurement demo"
        style={{ alignSelf: 'center', width: 'auto', maxWidth: '100%' }}
      >
        Reset
      </button>
      <span className="text-xs text-gray-400">{measured === null ? '(Click or press Enter/Space to measure)' : 'Measured!'}</span>
    </div>
  );
};

export default MeasurementDemo;
