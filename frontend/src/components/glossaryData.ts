// Quantum glossary data model and entries (extended for Quantum Explorer)

export interface GlossaryEntry {
  term: string;
  definition: string;
  category: 'quantum' | 'cryptography' | 'algorithm' | 'threat';
  simpleExplanation?: string;
  importance?: string;
  relatedTerms?: string[];
  visualKey?: string;
}

export const glossaryEntries: GlossaryEntry[] = [
  {
    term: 'Quantum Computer',
    definition:
      'A computing device that uses quantum-mechanical phenomena such as superposition and entanglement to perform operations on data. Unlike classical computers that use bits (0s and 1s), quantum computers use quantum bits or qubits.',
    category: 'quantum',
    simpleExplanation:
      'A computer that uses the weird rules of quantum physics to process information in ways classical computers cannot.',
    importance:
      'Quantum computers could solve problems impossible for classical computers, but also threaten current cryptography.',
    relatedTerms: ['Qubit', 'Superposition', 'Entanglement', 'Quantum Gate'],
    visualKey: 'QuantumComputer',
  },
  {
    term: 'Qubit',
    definition:
      'The basic unit of quantum information, analogous to a bit in classical computing. Unlike classical bits, qubits can exist in a superposition of states, representing both 0 and 1 simultaneously.',
    category: 'quantum',
    simpleExplanation:
      'A quantum bit that can be both 0 and 1 at the same time until measured.',
    importance:
      'Qubits are the foundation of quantum computing, enabling superposition and entanglement.',
    relatedTerms: ['Quantum Computer', 'Superposition', 'Entanglement'],
    visualKey: 'Qubit',
  },
  {
    term: 'Superposition',
    definition:
      'A fundamental principle of quantum mechanics where quantum systems can exist in multiple states simultaneously. For qubits, this means they can represent both 0 and 1 at the same time, enabling quantum computers to process multiple possibilities simultaneously.',
    category: 'quantum',
    simpleExplanation:
      'A quantum property where something can be in two (or more) states at once.',
    importance:
      'Superposition enables quantum computers to process more information than classical computers.',
    relatedTerms: ['Qubit', 'Quantum Computer'],
    visualKey: 'Superposition',
  },
  {
    term: 'Entanglement',
    definition:
      'A quantum phenomenon where two or more qubits become correlated in such a way that the quantum state of each particle cannot be described independently of the others, regardless of the distance separating them.',
    category: 'quantum',
    simpleExplanation:
      'When two qubits are linked so that the state of one instantly affects the other, even far apart.',
    importance:
      'Entanglement is essential for quantum communication and many quantum algorithms.',
    relatedTerms: ['Qubit', 'Quantum Computer', 'Superposition'],
    visualKey: 'Entanglement',
  },
  {
    term: 'Quantum Supremacy',
    definition:
      'The point at which a quantum computer can solve a problem that would be practically impossible for classical computers to solve in a reasonable timeframe.',
    category: 'quantum',
    simpleExplanation:
      'When a quantum computer does something no classical computer can do in a reasonable time.',
    importance:
      'Marks a milestone in quantum computing progress.',
    relatedTerms: ['Quantum Computer'],
    visualKey: 'QuantumSupremacy',
  },
  {
    term: 'Quantum Volume',
    definition:
      'A metric used to measure the performance of quantum computers, taking into account both the number of qubits and their error rates.',
    category: 'quantum',
    simpleExplanation:
      'A score that measures how powerful a quantum computer really is.',
    importance:
      'Higher quantum volume means a more capable quantum computer.',
    relatedTerms: ['Quantum Computer'],
    visualKey: 'QuantumVolume',
  },
  {
    term: 'Quantum Gate',
    definition:
      'The quantum computing equivalent of a logic gate in classical computing. Quantum gates manipulate qubits and are the building blocks of quantum circuits.',
    category: 'quantum',
    simpleExplanation:
      'A basic operation that changes the state of a qubit.',
    importance:
      'Quantum gates are the building blocks of quantum algorithms.',
    relatedTerms: ['Qubit', 'Quantum Computer'],
    visualKey: 'QuantumGate',
  },
  {
    term: 'Quantum Fourier Transform',
    definition:
      "A quantum algorithm that transforms a quantum state into its Fourier transform. It is a key component in many quantum algorithms, including Shor's algorithm.",
    category: 'algorithm',
    simpleExplanation:
      'A quantum version of the Fourier transform, used in important algorithms.',
    importance:
      'Essential for Shor’s algorithm and other quantum algorithms.',
    relatedTerms: ["Shor's Algorithm", 'Quantum Algorithm'],
    visualKey: 'QuantumFourierTransform',
  },
  {
    term: "Shor's Algorithm",
    definition:
      "A quantum algorithm developed by Peter Shor in 1994 that efficiently factors large integers in polynomial time, threatening RSA and other public-key cryptosystems that rely on the difficulty of factoring large numbers.",
    category: 'algorithm',
    simpleExplanation:
      'A quantum algorithm that can break RSA encryption by factoring big numbers quickly.',
    importance:
      'Threatens classical cryptography like RSA.',
    relatedTerms: ['Quantum Fourier Transform', 'RSA', 'Quantum Computer'],
    visualKey: 'ShorsAlgorithm',
  },
  {
    term: "Grover's Algorithm",
    definition:
      "A quantum algorithm that provides a quadratic speedup for searching unsorted databases. It can be used to attack symmetric encryption by reducing the effective key length by half.",
    category: 'algorithm',
    simpleExplanation:
      'A quantum search algorithm that can find things faster than classical computers.',
    importance:
      'Can weaken symmetric encryption by making brute-force attacks faster.',
    relatedTerms: ['Quantum Computer', 'Symmetric Encryption'],
    visualKey: 'GroversAlgorithm',
  },
  {
    term: 'NIST PQC Standardization',
    definition:
      'A process by the National Institute of Standards and Technology to evaluate, select, and standardize quantum-resistant cryptographic algorithms to replace those vulnerable to quantum computing attacks.',
    category: 'cryptography',
    simpleExplanation:
      'The official process to pick new encryption methods safe from quantum attacks.',
    importance:
      'Ensures we have secure cryptography for the quantum era.',
    relatedTerms: ['Post-Quantum Cryptography (PQC)', 'Lattice-Based Cryptography'],
    visualKey: 'NISTPQC',
  },
  {
    term: 'Post-Quantum Cryptography (PQC)',
    definition:
      'Cryptographic algorithms believed to be secure against attacks from both classical and quantum computers. These include lattice-based, hash-based, code-based, multivariate, and isogeny-based cryptography.',
    category: 'cryptography',
    simpleExplanation:
      'Encryption methods designed to resist quantum computer attacks.',
    importance:
      'Needed to protect data in a future with quantum computers.',
    relatedTerms: ['Lattice-Based Cryptography', 'Hash-Based Cryptography', 'Code-Based Cryptography', 'Multivariate Cryptography', 'Isogeny-Based Cryptography'],
    visualKey: 'PQC',
  },
  {
    term: 'Cryptographic Agility',
    definition:
      'The ability of a system to easily transition between different cryptographic algorithms, protocols, or key sizes without significant modifications to the system architecture.',
    category: 'cryptography',
    simpleExplanation:
      'The ability to quickly switch to new encryption methods if needed.',
    importance:
      'Helps organizations respond to new threats or broken algorithms.',
    relatedTerms: ['Post-Quantum Cryptography (PQC)'],
    visualKey: 'CryptoAgility',
  },
  {
    term: 'Lattice-Based Cryptography',
    definition:
      'A family of cryptographic constructions based on the hardness of problems in lattices, such as Learning With Errors (LWE) and Ring-LWE. Examples include ML-KEM (Kyber) and ML-DSA (Dilithium).',
    category: 'cryptography',
    simpleExplanation:
      'A kind of encryption based on hard math problems involving grids (lattices).',
    importance:
      'Considered strong against quantum attacks; used in new standards.',
    relatedTerms: ['ML-KEM (Kyber)', 'ML-DSA (Dilithium)', 'FN-DSA (Falcon)'],
    visualKey: 'LatticeCrypto',
  },
  {
    term: 'Hash-Based Cryptography',
    definition:
      'A cryptographic approach that relies on the security properties of hash functions. Hash-based signatures like SPHINCS+ (SLH-DSA) are considered quantum-resistant.',
    category: 'cryptography',
    simpleExplanation:
      'Encryption and signatures based on hash functions, not factoring or lattices.',
    importance:
      'Some hash-based signatures are already standardized for quantum resistance.',
    relatedTerms: ['SLH-DSA (SPHINCS+)'],
    visualKey: 'HashCrypto',
  },
  {
    term: 'Code-Based Cryptography',
    definition:
      'A cryptographic system based on error-correcting codes, where the difficulty lies in decoding a random linear code. Examples include McEliece and HQC.',
    category: 'cryptography',
    simpleExplanation:
      'Encryption based on the difficulty of decoding error-correcting codes.',
    importance:
      'McEliece is a classic code-based scheme believed to be quantum-safe.',
    relatedTerms: ['McEliece', 'HQC'],
    visualKey: 'CodeCrypto',
  },
  {
    term: 'Multivariate Cryptography',
    definition:
      'Cryptographic systems based on the difficulty of solving systems of multivariate polynomials over finite fields.',
    category: 'cryptography',
    simpleExplanation:
      'Encryption based on hard math problems involving many variables.',
    importance:
      'Some schemes are candidates for post-quantum cryptography.',
    relatedTerms: [],
    visualKey: 'MultivariateCrypto',
  },
  {
    term: 'Isogeny-Based Cryptography',
    definition:
      'A cryptographic approach based on finding isogenies between elliptic curves. SIKE was a prominent example before being broken by classical attacks.',
    category: 'cryptography',
    simpleExplanation:
      'Encryption based on math involving elliptic curves and their relationships.',
    importance:
      'Once promising, but now less favored after SIKE was broken.',
    relatedTerms: ['SIKE'],
    visualKey: 'IsogenyCrypto',
  },
  {
    term: 'Quantum Key Distribution (QKD)',
    definition:
      'A method to securely distribute cryptographic keys using properties of quantum mechanics. It enables two parties to produce a shared random secret key without an eavesdropper being able to learn the key.',
    category: 'cryptography',
    simpleExplanation:
      'A way to share secret keys using quantum physics so no one can eavesdrop.',
    importance:
      'QKD is already used in some secure communication systems.',
    relatedTerms: ['Quantum Cryptography'],
    visualKey: 'QKD',
  },
  {
    term: 'Harvest Now, Decrypt Later (HNDL)',
    definition:
      'A threat scenario where adversaries collect and store currently encrypted data with the intention of decrypting it later when quantum computers become available.',
    category: 'threat',
    simpleExplanation:
      'Attackers save encrypted data now, planning to break it with quantum computers in the future.',
    importance:
      'A real risk for sensitive long-lived data.',
    relatedTerms: ['Q-Day', 'CRQC'],
    visualKey: 'HNDL',
  },
  {
    term: 'Q-Day',
    definition:
      'A theoretical future date when a quantum computer becomes powerful enough to break widely used public-key cryptography.',
    category: 'threat',
    simpleExplanation:
      'The day quantum computers can break today’s encryption.',
    importance:
      'A major milestone for cybersecurity risk.',
    relatedTerms: ['CRQC'],
    visualKey: 'QDay',
  },
  {
    term: 'Cryptographically Relevant Quantum Computer (CRQC)',
    definition:
      'A quantum computer with sufficient qubits and low enough error rates to pose a threat to current cryptographic systems.',
    category: 'threat',
    simpleExplanation:
      'A quantum computer powerful enough to break real-world encryption.',
    importance:
      'The threshold at which quantum computers become a real security threat.',
    relatedTerms: ['Q-Day'],
    visualKey: 'CRQC',
  },
  {
    term: 'ML-KEM (Kyber)',
    definition:
      'A lattice-based Key Encapsulation Mechanism selected by NIST for standardization as the primary quantum-resistant key establishment algorithm.',
    category: 'cryptography',
    simpleExplanation:
      'A new standard for quantum-safe key exchange.',
    importance:
      'Chosen by NIST as a primary quantum-resistant algorithm.',
    relatedTerms: ['Lattice-Based Cryptography'],
    visualKey: 'Kyber',
  },
  {
    term: 'ML-DSA (Dilithium)',
    definition:
      'A lattice-based Digital Signature Algorithm selected by NIST for standardization as a quantum-resistant signature scheme.',
    category: 'cryptography',
    simpleExplanation:
      'A new standard for quantum-safe digital signatures.',
    importance:
      'Chosen by NIST as a quantum-resistant signature scheme.',
    relatedTerms: ['Lattice-Based Cryptography'],
    visualKey: 'Dilithium',
  },
  {
    term: 'SLH-DSA (SPHINCS+)',
    definition:
      'A stateless hash-based signature scheme standardized by NIST that derives its security from the properties of cryptographic hash functions.',
    category: 'cryptography',
    simpleExplanation:
      'A quantum-resistant signature scheme based on hash functions.',
    importance:
      'Standardized by NIST for quantum-safe signatures.',
    relatedTerms: ['Hash-Based Cryptography'],
    visualKey: 'SPHINCS+',
  },
  {
    term: 'FN-DSA (Falcon)',
    definition:
      'A lattice-based signature scheme based on NTRU lattices, selected by NIST for standardization.',
    category: 'cryptography',
    simpleExplanation:
      'A quantum-resistant signature scheme based on lattices.',
    importance:
      'Chosen by NIST for quantum-safe signatures.',
    relatedTerms: ['Lattice-Based Cryptography'],
    visualKey: 'Falcon',
  },
  {
    term: 'Quantum Random Number Generator (QRNG)',
    definition:
      'A device that generates random numbers using quantum processes, which are fundamentally random according to quantum mechanics.',
    category: 'quantum',
    simpleExplanation:
      'A device that uses quantum physics to make truly random numbers.',
    importance:
      'Provides stronger randomness for cryptography.',
    relatedTerms: ['Quantum Computer'],
    visualKey: 'QRNG',
  },
  {
    term: 'Quantum Error Correction',
    definition:
      'Techniques to protect quantum information from errors due to decoherence and other quantum noise, essential for building practical quantum computers.',
    category: 'quantum',
    simpleExplanation:
      'Ways to fix mistakes in quantum computers caused by noise and errors.',
    importance:
      'Crucial for making large-scale quantum computers work.',
    relatedTerms: ['Logical Qubit'],
    visualKey: 'QuantumErrorCorrection',
  },
  {
    term: 'Logical Qubit',
    definition:
      'A qubit that is protected against errors using quantum error correction, typically requiring multiple physical qubits.',
    category: 'quantum',
    simpleExplanation:
      'A qubit made reliable by combining several physical qubits and error correction.',
    importance:
      'Needed for practical, reliable quantum computers.',
    relatedTerms: ['Quantum Error Correction', 'Qubit'],
    visualKey: 'LogicalQubit',
  },
  {
    term: 'Hybrid Cryptography',
    definition:
      'The practice of combining both classical and post-quantum algorithms during the transition period to ensure security against both classical and quantum attacks.',
    category: 'cryptography',
    simpleExplanation:
      'Using both old and new encryption methods together for extra security.',
    importance:
      'Helps organizations transition safely to post-quantum security.',
    relatedTerms: ['Post-Quantum Cryptography (PQC)'],
    visualKey: 'HybridCrypto',
  },
];
