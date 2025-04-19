import math
import fractions
from qiskit import QuantumCircuit, QuantumRegister, ClassicalRegister, transpile
from qiskit_aer import Aer
from qiskit.visualization import plot_histogram
import matplotlib.pyplot as plt


def qft_dagger(n):
    qc = QuantumCircuit(n)
    for qubit in range(n // 2):
        qc.swap(qubit, n - qubit - 1)
    for j in range(n):
        for m in range(j):
            qc.cp(-math.pi / float(2 ** (j - m)), m, j)
        qc.h(j)
    return qc


def c_amod15(a, power):
    if a not in [2, 4, 7, 8, 11, 13]:
        raise ValueError("'a' must be 2,4,7,8,11 or 13")
    U = QuantumCircuit(4)
    for iteration in range(power):
        if a in [2, 13]:
            U.swap(2, 3)
            U.swap(1, 2)
            U.swap(0, 1)
        if a in [7, 8]:
            U.swap(0, 1)
            U.swap(1, 2)
            U.swap(2, 3)
        if a in [4, 11]:
            U.swap(1, 3)
            U.swap(0, 2)
        if a in [7, 11, 13]:
            for q in range(4):
                U.x(q)
    return U


def shor_circuit(a, n):
    n_count = math.ceil(math.log(n, 2))
    counting_qubits = QuantumRegister(n_count, 'c')
    target_qubits = QuantumRegister(4, 't')
    c = ClassicalRegister(n_count, 'cl')
    qc = QuantumCircuit(counting_qubits, target_qubits, c)

    for qubit in counting_qubits:
        qc.h(qubit)

    qc.x(target_qubits[0])

    for i, qubit in enumerate(counting_qubits):
        qc.append(c_amod15(a, 2 ** i).control(1), [qubit] + target_qubits[:])

    qc.append(qft_dagger(n_count), counting_qubits)
    qc.measure(counting_qubits, c)

    return qc


def shors_algorithm_demo(N, trials=5):
    print(f"Attempting to factor {N}...")

    a = 7  # Ensure a is coprime to N

    if math.gcd(a, N) != 1:
        return f"Found factor by chance: {math.gcd(a, N)}"

    # Multiple trials to ensure all factors are found
    factors = set()
    for trial in range(trials):
        qc = shor_circuit(a, N)
        print(f"\nQuantum Circuit for Trial {trial + 1}:")
        print(qc)

        backend = Aer.get_backend('qasm_simulator')
        transpiled_qc = transpile(qc, backend)
        result = backend.run(transpiled_qc, shots=1000).result()
        counts = result.get_counts()

        # Visualize the results for each trial
        plot_histogram(counts)
        plt.title(f"Measurement Results (Trial {trial + 1})")
        plt.show()

        measured_phases = [int(output, 2) / (2 ** len(output)) for output in counts.keys()]
        frac = [fractions.Fraction(phase).limit_denominator(N) for phase in measured_phases]

        for f in frac:
            if f.denominator % 2 == 0:
                r = f.denominator
                guesses = [math.gcd(a ** (r // 2) - 1, N), math.gcd(a ** (r // 2) + 1, N)]
                for guess in guesses:
                    if guess > 1 and guess != N:
                        factors.add(guess)

    if factors:
        # Include both found factors and corresponding co-factors
        final_factors = set(factors)
        for factor in factors:
            cofactor = N // factor
            if cofactor > 1:
                final_factors.add(cofactor)
        return f"Factors found: {final_factors}"
    else:
        return "Factors not found, try again"


# Test the function with N = ?
print(shors_algorithm_demo(100))