import { Department } from '../types';

export interface Flashcard {
  id: string;
  department: Department;
  subject: string;
  topic: string;
  marks: 2;
  question: string;
  answer: string;
  keywords: string[];
}

export const initialFlashcards: Flashcard[] = [
  // CSE
  {
    id: 'fc-cse-1',
    department: 'CSE',
    subject: 'Operating Systems',
    topic: 'Thrashing',
    marks: 2,
    question: 'What is Thrashing in Virtual Memory and what causes it?',
    answer: 'Thrashing is a condition where the CPU spends more time swapping pages in and out of secondary storage than executing user processes. It occurs when the sum of process working set sizes exceeds total physical memory.',
    keywords: ['Virtual Memory', 'Working Set', 'Page Faults', 'CPU Utilization']
  },
  {
    id: 'fc-cse-2',
    department: 'CSE',
    subject: 'Operating Systems',
    topic: 'Context Switching',
    marks: 2,
    question: 'Define Context Switching and list the state saved.',
    answer: 'Context switching is the mechanism of saving the state of the currently executing process in its Process Control Block (PCB) and loading the saved state of another process to resume execution on the CPU.',
    keywords: ['PCB', 'Program Counter', 'CPU Registers', 'Kernel Mode']
  },
  {
    id: 'fc-cse-3',
    department: 'CSE',
    subject: 'Data Structures and Algorithms',
    topic: 'AVL Balance Factor',
    marks: 2,
    question: 'State the allowable Balance Factor range for an AVL Tree.',
    answer: 'The Balance Factor (BF) of any node in an AVL tree is defined as Height(Left Subtree) - Height(Right Subtree). For an AVL tree to remain balanced, BF must strictly be in {-1, 0, +1}.',
    keywords: ['Balance Factor', 'Height Balanced', '{-1, 0, +1}', 'Rotations']
  },
  {
    id: 'fc-cse-4',
    department: 'CSE',
    subject: 'Database Management Systems',
    topic: 'Lossless Join Decomposition',
    marks: 2,
    question: 'What is the necessary condition for a Lossless-Join Decomposition?',
    answer: 'A decomposition of relation R into R1 and R2 is lossless-join if and only if the intersection (R1 ∩ R2) forms a superkey of either R1 or R2 (i.e., (R1 ∩ R2) -> R1 or (R1 ∩ R2) -> R2).',
    keywords: ['Functional Dependency', 'Superkey', 'R1 ∩ R2', 'Natural Join']
  },

  // AI & DS
  {
    id: 'fc-aids-1',
    department: 'AIDS',
    subject: 'Machine Learning',
    topic: 'Support Vector Machine (SVM)',
    marks: 2,
    question: 'Define Support Vectors and the Maximum Margin concept in SVM.',
    answer: 'Support vectors are the critical data points that lie closest to the decision boundary (hyperplane). The maximum margin is the geometric distance 2/||w|| between the opposing support vectors, which SVM optimizes.',
    keywords: ['Support Vectors', 'Hyperplane', '2/||w||', 'Quadratic Programming']
  },
  {
    id: 'fc-aids-2',
    department: 'AIDS',
    subject: 'Machine Learning',
    topic: 'Curse of Dimensionality',
    marks: 2,
    question: 'What is the Curse of Dimensionality in feature spaces?',
    answer: 'The Curse of Dimensionality refers to the exponential increase in volume of feature space as dimensions increase, causing data to become sparse, distance metrics (e.g. Euclidean) to lose contrast, and risk of overfitting.',
    keywords: ['Sparse Data', 'High Dimensions', 'PCA', 'Overfitting']
  },
  {
    id: 'fc-aids-3',
    department: 'AIDS',
    subject: 'Deep Learning',
    topic: 'Vanishing Gradient Problem',
    marks: 2,
    question: 'What causes the Vanishing Gradient problem and how is it mitigated?',
    answer: 'In deep neural networks using sigmoid or tanh activations, backpropagated gradients shrink exponentially with layer depth because derivatives are < 0.25. It is mitigated by ReLU activations, batch normalization, and residual skip connections.',
    keywords: ['Backpropagation', 'Chain Rule', 'ReLU', 'Residual Connections']
  },

  // ECE
  {
    id: 'fc-ece-1',
    department: 'ECE',
    subject: 'Digital Signal Processing',
    topic: 'Twiddle Factor',
    marks: 2,
    question: 'Define the Twiddle Factor W_N and state its symmetry property.',
    answer: 'The twiddle factor is the complex phase factor W_N = e^(-j 2π / N). Its fundamental symmetry property is W_N^(k + N/2) = -W_N^k, which enables butterfly computational savings in FFT.',
    keywords: ['e^(-j 2π / N)', 'Symmetry', 'Periodicity', 'Butterfly Unit']
  },
  {
    id: 'fc-ece-2',
    department: 'ECE',
    subject: 'VLSI Design',
    topic: 'Setup Time vs Hold Time',
    marks: 2,
    question: 'Differentiate between Setup Time and Hold Time in flip-flops.',
    answer: 'Setup Time (t_setup) is the minimum time data must remain stable BEFORE the active clock edge. Hold Time (t_hold) is the minimum time data must remain stable AFTER the active clock edge to prevent metastability.',
    keywords: ['t_setup', 't_hold', 'Active Clock Edge', 'Metastability']
  },

  // EEE
  {
    id: 'fc-eee-1',
    department: 'EEE',
    subject: 'Power Systems',
    topic: 'Ferranti Effect',
    marks: 2,
    question: 'Explain the Ferranti Effect in high-voltage transmission lines.',
    answer: 'The Ferranti Effect occurs when the receiving-end voltage of a long, lightly loaded or open-circuited transmission line exceeds the sending-end voltage due to the charging current drawn by the line shunt capacitance.',
    keywords: ['Receiving-end Voltage', 'Shunt Capacitance', 'Light Load', 'Shunt Reactor']
  },
  {
    id: 'fc-eee-2',
    department: 'EEE',
    subject: 'Control Systems',
    topic: 'Routh-Hurwitz Stability Criterion',
    marks: 2,
    question: 'State the necessary condition for stability according to Routh-Hurwitz.',
    answer: 'For a continuous-time system to be stable, all coefficients of its characteristic polynomial must be positive and non-zero, and all elements in the first column of the Routh array must have the same sign (no sign changes).',
    keywords: ['First Column', 'No Sign Changes', 'Characteristic Polynomial', 'LHP Poles']
  },

  // Food Technology
  {
    id: 'fc-ft-1',
    department: 'Food Technology',
    subject: 'Food Microbiology',
    topic: 'D-Value (Decimal Reduction Time)',
    marks: 2,
    question: 'Define D-value and state its units in thermal food processing.',
    answer: 'The D-value is the heating time in minutes at a specified constant temperature required to reduce the microbial population by 90% (one log cycle). Its unit is minutes.',
    keywords: ['1 Log Cycle', '90% Inactivation', 'Constant Temperature', 'Minutes']
  },
  {
    id: 'fc-ft-2',
    department: 'Food Technology',
    subject: 'Dairy Technology',
    topic: 'Alkaline Phosphatase Test',
    marks: 2,
    question: 'Why is Alkaline Phosphatase used to verify milk pasteurization?',
    answer: 'Alkaline Phosphatase is a native milk enzyme destroyed at temperatures slightly higher than heat-resistant pathogens like Mycobacterium tuberculosis. A negative phosphatase test confirms adequate pasteurization.',
    keywords: ['Native Enzyme', 'Indicator', 'Pasteurization Verification', 'Negative Test']
  }
];
