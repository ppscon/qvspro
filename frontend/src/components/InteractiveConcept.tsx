import React from 'react';
import QubitDemo from './demos/QubitDemo';
import SuperpositionDemo from './demos/SuperpositionDemo';
import EntanglementDemo from './demos/EntanglementDemo';
import QuantumGateDemo from './demos/QuantumGateDemo';
import MeasurementDemo from './demos/MeasurementDemo';
import { motion } from 'framer-motion';
import { GlossaryEntry } from './glossaryData';

interface InteractiveConceptProps {
  concept: GlossaryEntry;
  index: number;
  setActiveTerm: (term: GlossaryEntry) => void;
}

const InteractiveConcept: React.FC<InteractiveConceptProps> = ({ concept, index, setActiveTerm }) => {
  // TODO: Add interactive visualizations for key concepts
  const renderInteractiveElement = () => {
    switch (concept.visualKey) {
      case 'Qubit':
        return <QubitDemo />;
      case 'Superposition':
        return <SuperpositionDemo />;
      case 'Entanglement':
        return <EntanglementDemo />;
      case 'QuantumGate':
        return <QuantumGateDemo />;
      case 'Measurement':
        return <MeasurementDemo />;
      default:
        // Elegant fallback card with concept name and simple explanation
        let explanation = '';
        switch (concept.visualKey) {
          case 'Decoherence':
            explanation = 'Decoherence is what happens when a quantum system loses its "quantumness" by interacting with the outside world. The delicate quantum information fades away, and the system starts behaving like ordinary objects. Imagine a spinning coin that, when touched, quickly falls and shows either heads or tails—its uncertainty is lost.';
            break;
          case 'QuantumErrorCorrection':
            explanation = 'Quantum error correction is a set of clever techniques that protect fragile quantum data from noise and mistakes. By spreading information across several qubits, it allows a quantum computer to keep working reliably, even when some qubits are disturbed. It’s like using multiple backup copies to recover a corrupted file.';
            break;
          case 'QuantumFourierTransform':
            explanation = 'The Quantum Fourier Transform (QFT) is a quantum version of the classic Fourier transform, used to reveal hidden patterns in data. It is a key building block for powerful quantum algorithms like Shor’s algorithm for factoring large numbers. Think of it as a special lens that lets quantum computers see the structure within complex information.';
            break;
          case 'NoCloningTheorem':
            explanation = 'The No-Cloning Theorem says you cannot make a perfect copy of an unknown quantum state. This rule is fundamental to quantum security and makes quantum information unique. It’s as if you could never photocopy a secret message without changing or destroying the original.';
            break;
          case 'QuantumTeleportation':
            explanation = 'Quantum teleportation is a way to transfer the state of a qubit from one place to another, using entanglement and classical communication. No physical particle moves—just the information, instantly and securely. It’s like faxing the exact state of a coin, heads or tails, to someone far away, without sending the actual coin.';
            break;
          case 'QuantumSupremacy':
            explanation = 'Quantum supremacy is the milestone where a quantum computer solves a problem that would take even the fastest classical supercomputer thousands of years. It shows that quantum machines can do things that were previously impossible. This moment marks a new era in computing power.';
            break;
          default:
            explanation = concept.simpleExplanation || concept.definition || 'This concept does not have an interactive demo yet.';
        }
        return (
          <div className="flex flex-col items-center justify-center w-full h-full p-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 max-w-lg mx-auto text-center">
              <h4 className="text-lg font-semibold mb-3 text-purple-700 dark:text-purple-300">{concept.term}</h4>
              <p className="text-gray-700 dark:text-gray-200 text-sm leading-relaxed">{explanation}</p>
            </div>
          </div>
        );
    }
  }

  // Only show the heading if the concept has a demo
  const hasDemo = [
    'Qubit',
    'Superposition',
    'Entanglement',
    'QuantumGate',
    'Measurement',
  ].includes(concept.visualKey || '');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.3 }}
      className="w-full min-w-0"
      data-testid="interactive-concept"
    >
      <div className="w-full min-w-0">
        {renderInteractiveElement()}
      </div>
    </motion.div>
  );
};

export default InteractiveConcept;
