import React, { useState } from 'react';
import { motion } from 'framer-motion';

/**
 * Interactive Quantum Gate Demo
 * Visualizes basic quantum gates (Hadamard, Pauli-X, Z, etc.) and their effect on a qubit.
 * Matches the Qubit demo's layout and container rules.
 */

const gates = [
  {
    label: 'Hadamard (H)',
    description: 'Puts a qubit into superposition.',
    color: 'bg-purple-500',
    action: '|0⟩ → (|0⟩+|1⟩)/√2',
  },
  {
    label: 'Pauli-X (X)',
    description: 'Bit-flip (quantum NOT gate).',
    color: 'bg-blue-500',
    action: '|0⟩ ↔ |1⟩',
  },
  {
    label: 'Pauli-Z (Z)',
    description: 'Phase-flip gate.',
    color: 'bg-pink-500',
    action: '|0⟩ → |0⟩, |1⟩ → -|1⟩',
  },
];

const QuantumGateDemo: React.FC = () => {
  const [gateIdx, setGateIdx] = useState(0);
  const gate = gates[gateIdx];

  const nextGate = () => setGateIdx((gateIdx + 1) % gates.length);
  const resetGate = () => setGateIdx(0);

  return (
    <div className="flex flex-col items-center justify-center gap-4 w-full h-full flex-grow overflow-visible text-center">
      <motion.div
        className={`w-28 h-20 md:w-40 md:h-24 rounded-lg flex items-center justify-center shadow-lg cursor-pointer ${gate.color}`}
        style={{ flexShrink: 0, minWidth: 0, minHeight: 0, maxWidth: '100%' }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
        onClick={nextGate}
        tabIndex={0}
        role="button"
        aria-label="Cycle quantum gate"
        onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && nextGate()}
      >
        <span className="text-lg font-bold text-white select-none">{gate.label}</span>
      </motion.div>
      <div className="w-full max-w-md mx-auto flex flex-col gap-2">
        <div className="flex items-center justify-center gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-300">{gate.action}</span>
        </div>
      </div>
      <button
        className="mt-2 px-4 py-1 rounded bg-gray-800 text-white dark:bg-gray-700 dark:text-white text-xs font-semibold hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-400"
        onClick={resetGate}
        aria-label="Reset quantum gate"
        style={{ alignSelf: 'center', width: 'auto', maxWidth: '100%' }}
      >
        Reset
      </button>
      <span className="text-xs text-gray-400">(Click or press Enter/Space to cycle gates)</span>
    </div>
  );
};

export default QuantumGateDemo;
