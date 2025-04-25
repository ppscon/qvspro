import React, { useState } from 'react';
import { motion } from 'framer-motion';

/**
 * Interactive Entanglement Demo
 * Visualizes two entangled qubits and their measurement outcomes.
 * Matches the Qubit demo's layout and container rules.
 */

const states = [
  {
    label: 'Bell |Φ+⟩',
    description: 'Both qubits are in a superposition and perfectly correlated.',
    color: 'bg-purple-500',
    outcomes: ['00', '11'],
    probs: [0.5, 0.5],
  },
  {
    label: 'Bell |Ψ+⟩',
    description: 'Both qubits are in a superposition and perfectly anti-correlated.',
    color: 'bg-pink-500',
    outcomes: ['01', '10'],
    probs: [0.5, 0.5],
  },
];

const EntanglementDemo: React.FC = () => {
  const [stateIdx, setStateIdx] = useState(0);
  const state = states[stateIdx];

  const nextState = () => setStateIdx((stateIdx + 1) % states.length);
  const resetState = () => setStateIdx(0);

  return (
    <div className="flex flex-col items-center justify-center gap-4 w-full h-full flex-grow overflow-visible text-center">
      <motion.div
        className={`w-28 h-20 md:w-40 md:h-24 rounded-lg flex items-center justify-center shadow-lg cursor-pointer ${state.color}`}
        style={{ flexShrink: 0, minWidth: 0, minHeight: 0, maxWidth: '100%' }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
        onClick={nextState}
        tabIndex={0}
        role="button"
        aria-label="Cycle entanglement state"
        onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && nextState()}
      >
        <span className="text-lg font-bold text-white select-none">{state.label}</span>
      </motion.div>
      <div className="w-full max-w-md mx-auto flex flex-col gap-2">
        <div className="flex items-center justify-center gap-2">
          {state.outcomes.map((outcome, i) => (
            <div key={outcome} className="flex flex-col items-center flex-1 min-w-0">
              <motion.div
                className={`h-2 rounded bg-purple-400 dark:bg-purple-700 mt-1 mb-1 w-full`}
                style={{ width: `${state.probs[i] * 100}%` }}
                transition={{ duration: 0.3 }}
              />
              <span className="text-xs text-gray-400">{Math.round(state.probs[i] * 100)}%</span>
            </div>
          ))}
        </div>
      </div>
      <button
        className="mt-2 px-4 py-1 rounded bg-gray-800 text-white dark:bg-gray-700 dark:text-white text-xs font-semibold hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-400"
        onClick={resetState}
        aria-label="Reset entanglement state"
        style={{ alignSelf: 'center', width: 'auto', maxWidth: '100%' }}
      >
        Reset
      </button>
      <span className="text-xs text-gray-400">(Click or press Enter/Space to cycle states)</span>
    </div>
  );
};

export default EntanglementDemo;
