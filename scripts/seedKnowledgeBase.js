import fs from 'fs';
import path from 'path';

const kbRoot = path.resolve('knowledge-base');

const departmentsData = {
  CSE: [
    {
      id: 'cse-os',
      name: 'Operating Systems',
      code: '21CS2104',
      units: [
        'Unit I: Operating System Overview & Process Management',
        'Unit II: CPU Scheduling & Process Synchronization',
        'Unit III: Deadlocks & Handling Strategies',
        'Unit IV: Memory Management & Virtual Memory',
        'Unit V: Storage Management & File Systems'
      ],
      topics: [
        'Process Synchronization and Critical Section Problem',
        'Banker\'s Algorithm for Deadlock Avoidance',
        'Virtual Memory Paging and Page Replacement Algorithms (FIFO, LRU, Optimal)',
        'CPU Scheduling Algorithms (FCFS, SJF, Priority, Round Robin)',
        'Semaphores and Classical Synchronization Problems (Dining Philosophers, Producer-Consumer)'
      ],
      questions: [
        {
          id: 'q-os-1',
          topic: 'Banker\'s Algorithm for Deadlock Avoidance',
          marks: 10,
          unit: 3,
          paperYear: 'KL End Semester May 2024 / 2023',
          question: 'Explain Banker\'s algorithm for deadlock avoidance with safety and resource-request algorithms along with a state evaluation example.'
        },
        {
          id: 'q-os-2',
          topic: 'Page Replacement Algorithms (FIFO, LRU)',
          marks: 10,
          unit: 4,
          paperYear: 'KL End Semester Dec 2023',
          question: 'Discuss Virtual Memory Paging. Differentiate between FIFO, LRU, and Optimal page replacement policies with reference string simulation and Belady\'s Anomaly.'
        },
        {
          id: 'q-os-3',
          topic: 'Process Synchronization and Semaphores',
          marks: 5,
          unit: 2,
          paperYear: 'KL assessment Exam 2, 2024',
          question: 'What is a Semaphore? Explain how counting and binary semaphores solve the critical section problem without busy waiting.'
        },
        {
          id: 'q-os-4',
          topic: 'Thrashing in Virtual Memory',
          marks: 2,
          unit: 4,
          paperYear: 'KL End Semester May 2024',
          question: 'Define Thrashing in virtual memory and write its primary cause.'
        },
        {
          id: 'q-os-5',
          topic: 'Context Switching',
          marks: 2,
          unit: 1,
          paperYear: 'KL assessment Exam 1, 2024',
          question: 'What is Context Switching? Mention the state information preserved in PCB.'
        }
      ]
    },
    {
      id: 'cse-dsa',
      name: 'Data Structures and Algorithms',
      code: '21CS1202',
      units: [
        'Unit I: Linear Data Structures (Stacks, Queues, Linked Lists)',
        'Unit II: Trees and Binary Search Trees',
        'Unit III: Balanced Search Trees (AVL, Red-Black, B-Trees)',
        'Unit IV: Graphs and Shortest Path Algorithms',
        'Unit V: Algorithm Design Techniques (Greedy, DP, Divide & Conquer)'
      ],
      topics: [
        'AVL Tree Rotations and Height Balancing',
        'Dijkstra\'s Shortest Path Algorithm',
        '0/1 Knapsack Problem using Dynamic Programming',
        'B-Trees and B+ Trees for Indexing',
        'Merge Sort and Quick Sort Time Complexity Analysis'
      ],
      questions: [
        {
          id: 'q-dsa-1',
          topic: 'AVL Tree Rotations and Balancing',
          marks: 10,
          unit: 3,
          paperYear: 'KL End Semester May 2024',
          question: 'Explain AVL Trees, the Balance Factor condition, and detail LL, RR, LR, and RL rotations with step-by-step tree insertion diagrams.'
        },
        {
          id: 'q-dsa-2',
          topic: 'Dijkstra\'s Algorithm',
          marks: 10,
          unit: 4,
          paperYear: 'KL End Semester Dec 2023',
          question: 'Demonstrate Dijkstra\'s Single Source Shortest Path Algorithm on a directed weighted graph. State its greedy principle and time complexity.'
        },
        {
          id: 'q-dsa-3',
          topic: '0/1 Knapsack Dynamic Programming',
          marks: 5,
          unit: 5,
          paperYear: 'KL assessment Exam 2, 2024',
          question: 'Derive the Dynamic Programming recurrence relation for the 0/1 Knapsack problem with a memoization table.'
        },
        {
          id: 'q-dsa-4',
          topic: 'Balance Factor in AVL Tree',
          marks: 2,
          unit: 3,
          paperYear: 'KL End Semester Dec 2023',
          question: 'State the allowable Balance Factor values for an AVL Tree.'
        }
      ]
    },
    {
      id: 'cse-dbms',
      name: 'Database Management Systems',
      code: '21CS2205',
      units: [
        'Unit I: Relational Model and ER Diagrams',
        'Unit II: SQL and Relational Algebra',
        'Unit III: Normalization and Functional Dependencies',
        'Unit IV: Transaction Processing and Concurrency Control',
        'Unit V: Indexing and Query Optimization'
      ],
      topics: [
        'Database Normalization (1NF, 2NF, 3NF, BCNF)',
        'ACID Properties and Transaction States',
        'Two-Phase Locking (2PL) Protocol',
        'ER Model to Relational Schema Conversion',
        'B+ Tree Indexing in Relational Databases'
      ],
      questions: [
        {
          id: 'q-dbms-1',
          topic: 'Database Normalization (1NF to BCNF)',
          marks: 10,
          unit: 3,
          paperYear: 'KL End Semester May 2024',
          question: 'Explain the need for Normalization. Discuss 1NF, 2NF, 3NF, and BCNF with functional dependencies and decomposition examples.'
        },
        {
          id: 'q-dbms-2',
          topic: 'ACID Properties and Serializability',
          marks: 10,
          unit: 4,
          paperYear: 'KL End Semester Dec 2023',
          question: 'Explain the ACID properties of database transactions. How does Conflict Serializability ensure database consistency during concurrent execution?'
        },
        {
          id: 'q-dbms-3',
          topic: 'Two-Phase Locking (2PL)',
          marks: 5,
          unit: 4,
          paperYear: 'KL assessment Exam 2, 2024',
          question: 'Describe Strict and Rigorous 2-Phase Locking (2PL) protocols and how they avoid cascading aborts.'
        },
        {
          id: 'q-dbms-4',
          topic: 'Lossless Join Decomposition',
          marks: 2,
          unit: 3,
          paperYear: 'KL End Semester May 2024',
          question: 'State the necessary condition for a relational decomposition to be lossless-join.'
        }
      ]
    }
  ],
  AIDS: [
    {
      id: 'aids-ml',
      name: 'Machine Learning',
      code: '21AD2201',
      units: [
        'Unit I: Foundations of Machine Learning & Linear Models',
        'Unit II: Classification & Decision Trees',
        'Unit III: Ensemble Learning & Random Forests',
        'Unit IV: Support Vector Machines & Kernel Methods',
        'Unit V: Unsupervised Learning & Dimensionality Reduction'
      ],
      topics: [
        'Support Vector Machines (SVM) and Kernel Trick',
        'Bias-Variance Tradeoff and Regularization (L1/L2)',
        'Principal Component Analysis (PCA)',
        'Random Forest and Gradient Boosted Decision Trees',
        'Logistic Regression vs Linear Regression'
      ],
      questions: [
        {
          id: 'q-ml-1',
          topic: 'Support Vector Machines (SVM) & Kernel Trick',
          marks: 10,
          unit: 4,
          paperYear: 'KL End Semester May 2024',
          question: 'Derive the maximum margin hyperplane optimization for Support Vector Machines (SVM). Explain the Kernel Trick (RBF, Polynomial) for non-linear decision boundaries.'
        },
        {
          id: 'q-ml-2',
          topic: 'Principal Component Analysis (PCA)',
          marks: 10,
          unit: 5,
          paperYear: 'KL End Semester Dec 2023',
          question: 'Detail the mathematical procedure of Principal Component Analysis (PCA) through Covariance Matrix, Eigenvalues, and Eigenvectors with dimensionality reduction steps.'
        },
        {
          id: 'q-ml-3',
          topic: 'Bias-Variance Tradeoff',
          marks: 5,
          unit: 1,
          paperYear: 'KL assessment Exam 1, 2024',
          question: 'Explain the Bias-Variance tradeoff curve and demonstrate how L1 (Lasso) and L2 (Ridge) regularization control model complexity.'
        },
        {
          id: 'q-ml-4',
          topic: 'Curse of Dimensionality',
          marks: 2,
          unit: 5,
          paperYear: 'KL End Semester Dec 2023',
          question: 'Define the Curse of Dimensionality in high-dimensional feature spaces.'
        }
      ]
    },
    {
      id: 'aids-dl',
      name: 'Deep Learning and Neural Networks',
      code: '21AD3103',
      units: [
        'Unit I: Neural Network Fundamentals & Backpropagation',
        'Unit II: Convolutional Neural Networks (CNNs)',
        'Unit III: Recurrent Neural Networks (RNN) and LSTMs',
        'Unit IV: Transformer Architecture and Attention Mechanisms',
        'Unit V: Generative Models and Autoencoders'
      ],
      topics: [
        'Convolutional Neural Network (CNN) Architecture & Pooling',
        'Transformer Architecture & Multi-Head Self-Attention',
        'Backpropagation Algorithm & Gradient Descent',
        'Long Short-Term Memory (LSTM) Cell Operations',
        'Vanishing and Exploding Gradient Problem'
      ],
      questions: [
        {
          id: 'q-dl-1',
          topic: 'Transformer Architecture & Self-Attention',
          marks: 10,
          unit: 4,
          paperYear: 'KL End Semester May 2024',
          question: 'Explain the Transformer architecture in detail. Derive the Scaled Dot-Product Attention equation and illustrate the Multi-Head Attention block diagram.'
        },
        {
          id: 'q-dl-2',
          topic: 'CNN Architecture and Convolution Operation',
          marks: 10,
          unit: 2,
          paperYear: 'KL End Semester Dec 2023',
          question: 'Explain the building blocks of Convolutional Neural Networks (CNN): Convolution layer, stride, padding, ReLU activation, and MaxPooling with receptive field diagram.'
        },
        {
          id: 'q-dl-3',
          topic: 'LSTM Gates and Operations',
          marks: 5,
          unit: 3,
          paperYear: 'KL assessment Exam 2, 2024',
          question: 'Illustrate the architecture of an LSTM cell and explain the mathematical equations of the Forget, Input, and Output gates.'
        },
        {
          id: 'q-dl-4',
          topic: 'Vanishing Gradient Problem',
          marks: 2,
          unit: 1,
          paperYear: 'KL End Semester May 2024',
          question: 'What is the Vanishing Gradient problem and how do ReLU activations mitigate it?'
        }
      ]
    }
  ],
  ECE: [
    {
      id: 'ece-dsp',
      name: 'Digital Signal Processing',
      code: '21EC2208',
      units: [
        'Unit I: Discrete-Time Signals, Systems & Z-Transforms',
        'Unit II: Discrete Fourier Transform (DFT) & FFT Algorithms',
        'Unit III: IIR Filter Design (Butterworth & Chebyshev)',
        'Unit IV: FIR Filter Design (Windowing & Frequency Sampling)',
        'Unit V: Finite Word Length Effects & Multirate Signal Processing'
      ],
      topics: [
        'Radix-2 Decimation-in-Time (DIT) FFT Algorithm',
        'IIR Filter Design using Bilinear Transformation',
        'FIR Filter Design using Hamming and Hanning Windows',
        'Discrete Fourier Transform (DFT) Properties',
        'Nyquist Sampling Theorem and Aliasing'
      ],
      questions: [
        {
          id: 'q-dsp-1',
          topic: 'Radix-2 DIT FFT Butterfly Algorithm',
          marks: 10,
          unit: 2,
          paperYear: 'KL End Semester May 2024',
          question: 'Derive the 8-point Radix-2 Decimation-in-Time (DIT) FFT algorithm. Draw the complete 3-stage butterfly diagram and calculate computational complexity savings.'
        },
        {
          id: 'q-dsp-2',
          topic: 'Bilinear Transformation for IIR Filters',
          marks: 10,
          unit: 3,
          paperYear: 'KL End Semester Dec 2023',
          question: 'Explain the Bilinear Transformation Method for designing IIR digital filters. Derive the relationship between analog and digital frequencies and explain Frequency Warping.'
        },
        {
          id: 'q-dsp-3',
          topic: 'FIR Filter Windowing Techniques',
          marks: 5,
          unit: 4,
          paperYear: 'KL assessment Exam 2, 2024',
          question: 'Compare Rectangular, Hamming, and Blackman windows for FIR filter design in terms of main-lobe width and peak side-lobe attenuation.'
        },
        {
          id: 'q-dsp-4',
          topic: 'Twiddle Factor in FFT',
          marks: 2,
          unit: 2,
          paperYear: 'KL End Semester Dec 2023',
          question: 'Define the Twiddle Factor W_N and state its periodicity and symmetry properties.'
        }
      ]
    },
    {
      id: 'ece-vlsi',
      name: 'VLSI Design',
      code: '21EC3109',
      units: [
        'Unit I: MOS Transistor Theory & CMOS Fabrication',
        'Unit II: CMOS Inverter DC Characteristics & Switching Speed',
        'Unit III: Combinational & Dynamic Logic Circuit Design',
        'Unit IV: Sequential Circuit Design & Static Timing Analysis',
        'Unit V: FPGA Architecture & Verilog HDL'
      ],
      topics: [
        'CMOS Inverter Voltage Transfer Characteristics (VTC)',
        'Dynamic CMOS Logic and Domino Logic',
        'Stick Diagrams and Euler Path Method',
        'Static Timing Analysis (Setup and Hold Times)',
        'Propagation Delay and RC Delay Modeling (Elmore Delay)'
      ],
      questions: [
        {
          id: 'q-vlsi-1',
          topic: 'CMOS Inverter VTC and Noise Margins',
          marks: 10,
          unit: 2,
          paperYear: 'KL End Semester May 2024',
          question: 'Derive the Voltage Transfer Characteristics (VTC) of a static CMOS inverter. Clearly mark regions of transistor operation (Cutoff, Linear, Saturation) and define Noise Margins (NML, NMH).'
        },
        {
          id: 'q-vlsi-2',
          topic: 'Stick Diagram using Euler Path',
          marks: 10,
          unit: 3,
          paperYear: 'KL End Semester Dec 2023',
          question: 'Design the static CMOS logic circuit for Y = ((A+B).C)\'. Construct the PMOS and NMOS graphs, find the Euler path, and draw the color-coded stick diagram.'
        },
        {
          id: 'q-vlsi-3',
          topic: 'Setup Time and Hold Time in Flip-Flops',
          marks: 5,
          unit: 4,
          paperYear: 'KL assessment Exam 2, 2024',
          question: 'Define Setup Time (t_setup) and Hold Time (t_hold). Derive the maximum clock frequency condition in a synchronous digital pipeline.'
        },
        {
          id: 'q-vlsi-4',
          topic: 'Channel Length Modulation in MOSFET',
          marks: 2,
          unit: 1,
          paperYear: 'KL End Semester May 2024',
          question: 'What is Channel Length Modulation in short-channel MOSFETs and how does it affect saturation drain current?'
        }
      ]
    }
  ],
  EEE: [
    {
      id: 'eee-ps',
      name: 'Power Systems',
      code: '21EE2207',
      units: [
        'Unit I: Transmission Line Parameters & Modeling',
        'Unit II: Load Flow Analysis (Gauss-Seidel & Newton-Raphson)',
        'Unit III: Symmetrical & Unsymmetrical Fault Analysis',
        'Unit IV: Power System Stability & Swing Equation',
        'Unit V: Economic Dispatch & Automatic Generation Control'
      ],
      topics: [
        'Newton-Raphson Load Flow Method and Jacobian Matrix',
        'Equal Area Criterion for Transient Stability',
        'Symmetrical Fault Analysis using Thevenin Equivalent',
        'Unsymmetrical Faults (LG, LL, LLG) using Symmetrical Components',
        'Ferranti Effect in Long Transmission Lines'
      ],
      questions: [
        {
          id: 'q-ps-1',
          topic: 'Newton-Raphson Load Flow Analysis',
          marks: 10,
          unit: 2,
          paperYear: 'KL End Semester May 2024',
          question: 'Formulate the power flow equations for a power system. Explain the step-by-step procedure of the Newton-Raphson method with Jacobian matrix derivation.'
        },
        {
          id: 'q-ps-2',
          topic: 'Equal Area Criterion for Transient Stability',
          marks: 10,
          unit: 4,
          paperYear: 'KL End Semester Dec 2023',
          question: 'Derive the Swing Equation of a synchronous machine connected to an infinite bus. Apply the Equal Area Criterion to determine the Critical Clearing Angle during a 3-phase fault.'
        },
        {
          id: 'q-ps-3',
          topic: 'Ferranti Effect in Transmission Lines',
          marks: 5,
          unit: 1,
          paperYear: 'KL assessment Exam 1, 2024',
          question: 'Explain the Ferranti Effect in medium and long transmission lines under no-load or light-load conditions with a phasor diagram.'
        },
        {
          id: 'q-ps-4',
          topic: 'Slack Bus in Load Flow Studies',
          marks: 2,
          unit: 2,
          paperYear: 'KL End Semester Dec 2023',
          question: 'What is a Slack / Reference Bus and why is it essential in power flow analysis?'
        }
      ]
    },
    {
      id: 'eee-cs',
      name: 'Control Systems',
      code: '21EE2105',
      units: [
        'Unit I: Mathematical Modeling of Physical Systems',
        'Unit II: Time-Domain Analysis & Transient Response',
        'Unit III: Stability Analysis (Routh-Hurwitz & Root Locus)',
        'Unit IV: Frequency Response (Bode Plot & Nyquist Criterion)',
        'Unit V: State Space Analysis & Compensator Design'
      ],
      topics: [
        'Root Locus Technique and Construction Rules',
        'Bode Plot for Gain Margin and Phase Margin',
        'Routh-Hurwitz Stability Criterion and Special Cases',
        'Nyquist Stability Criterion for Closed-Loop Systems',
        'PID Controller Tuning and Effects on System Response'
      ],
      questions: [
        {
          id: 'q-cs-1',
          topic: 'Root Locus Technique Construction Rules',
          marks: 10,
          unit: 3,
          paperYear: 'KL End Semester May 2024',
          question: 'State all the 8 construction rules of the Root Locus technique. Sketch the root locus for G(s)H(s) = K / [s(s+2)(s+4)] and determine the range of K for stability.'
        },
        {
          id: 'q-cs-2',
          topic: 'Bode Plot Stability Margins',
          marks: 10,
          unit: 4,
          paperYear: 'KL End Semester Dec 2023',
          question: 'Explain the frequency domain specifications: Gain Margin (GM) and Phase Margin (PM). Detail the construction of Magnitude and Phase plots on semi-log graph paper.'
        },
        {
          id: 'q-cs-3',
          topic: 'PID Controller Effects',
          marks: 5,
          unit: 2,
          paperYear: 'KL assessment Exam 2, 2024',
          question: 'Discuss the individual effects of Proportional (P), Integral (I), and Derivative (D) control actions on steady-state error, rise time, and maximum overshoot.'
        },
        {
          id: 'q-cs-4',
          topic: 'Routh-Hurwitz Stability Condition',
          marks: 2,
          unit: 3,
          paperYear: 'KL End Semester May 2024',
          question: 'State the necessary and sufficient conditions for system stability according to the Routh-Hurwitz criterion.'
        }
      ]
    }
  ],
};

console.log('Seeding KL Knowledge Base for all departments...');

for (const [dept, subjects] of Object.entries(departmentsData)) {
  const deptDir = path.join(kbRoot, dept);
  if (!fs.existsSync(deptDir)) {
    fs.mkdirSync(deptDir, { recursive: true });
  }

  for (const subj of subjects) {
    const subjDir = path.join(deptDir, subj.name);
    if (!fs.existsSync(subjDir)) {
      fs.mkdirSync(subjDir, { recursive: true });
    }

    // 1. Course materials
    const courseMaterials = `# ${subj.name} (${subj.code})
**Department:** ${dept} | **University:** KL University (KLU)

## Course Overview & Objectives
This course prepares students for university and semester examinations following the official KL Academic Curriculum and Bloom's Taxonomy. It grounds students in both theoretical mechanisms, mathematical formulations, and engineering/industrial applications.

## Course Units
${subj.units.map(u => `### ${u}\n- Comprehensive lecture notes, textbook references, and laboratory correlations.\n`).join('\n')}

## Recommended Textbooks & Reference Materials
1. Primary KL Course Handout & Lecture Compendium
2. Standard Reference Texts mapped to KL Bloom's Taxonomy Level 1-4
3. Standard Engineering & Applied Sciences Handbooks
`;
    fs.writeFileSync(path.join(subjDir, 'course-materials.md'), courseMaterials, 'utf8');

    // 2. Previous papers
    const prevPapers = `# Previous Examination Papers — ${subj.name}
**Department of ${dept}, KL University**

## Semester Examination Papers Catalog
- **KL End-Semester May 2024 (Regular & Supplementary)**
- **KL End-Semester Dec 2023 (Odd Semester)**
- **KL assessmentester Examination 1 (Mid-Term 2024)**
- **KL assessmentester Examination 2 (Mid-Term 2024)**

## Key Exam Patterns Observed
- **Part A:** 5 mandatory questions $\\times$ 2 marks = 10 marks (Direct definitions, fundamental laws, no fluff).
- **Part B:** 5 descriptive questions $\\times$ 5 marks = 25 marks (Structured points, subheadings, mini-flowchart).
- **Part C:** 4 comprehensive essay questions $\\times$ 10 marks = 40 marks (Detailed derivation, architectural/flow diagram, industrial/practical applications).
`;
    fs.writeFileSync(path.join(subjDir, 'previous-papers.md'), prevPapers, 'utf8');

    // 3. Question bank
    fs.writeFileSync(path.join(subjDir, 'question-bank.json'), JSON.stringify(subj.questions, null, 2), 'utf8');

    // 4. Marks pattern
    const marksPattern = `# KL University Marks Pattern & Grading Rubric
**Subject:** ${subj.name} (${subj.code}) | **Department:** ${dept}

## 2 Marks Questions (Cognitive Level: Remember / Understand)
- **Target Word Count:** 20 - 40 words (2 to 3 concise sentences).
- **Evaluation Criteria:**
  - Clear, mathematically/scientifically precise definition.
  - Formula, standard SI units, or one concrete example.
  - Zero fluff or redundant introduction.

## 5 Marks Questions (Cognitive Level: Understand / Apply)
- **Target Word Count:** 120 - 180 words.
- **Evaluation Criteria:**
  - 1 Mark: Clear introduction and definition.
  - 2 Marks: 4 to 5 bulleted core points explaining working principle or algorithm.
  - 1 Mark: ASCII/Mermaid block flowchart or schematic diagram.
  - 1 Mark: Numerical example or real-world system application.

## 10 Marks Questions (Cognitive Level: Apply / Analyze / Evaluate)
- **Target Word Count:** 350 - 500 words.
- **Evaluation Criteria:**
  - 1 Mark: Precise Definition & Contextual Background.
  - 2 Marks: Working Principle, Governing Laws & Equations.
  - 3 Marks: Step-by-Step Mechanism / Algorithm Execution.
  - 2 Marks: Clear labeled architectural diagram or process flowchart.
  - 1 Mark: Practical / Industrial Applications and Use Cases.
  - 1 Mark: Merits, Demerits / Trade-offs and KL Evaluator Conclusion.
`;
    fs.writeFileSync(path.join(subjDir, 'marks-pattern.md'), marksPattern, 'utf8');

    // 5. Answer style
    const answerStyle = `# KL University Examiner Answer Style Guide
**Department:** ${dept} | **Subject:** ${subj.name}

## What KL Evaluators Expect to Award Full Marks:
1. **Highlight Keywords First:** Bold essential technical vocabulary in the very first sentence.
2. **Use Clear Headings:** Evaluators scan answers quickly. Use structured subheadings: *Definition*, *Principle*, *Working Mechanism*, *Diagram*, *Applications*.
3. **Diagrams Are Mandatory for 5 & 10 Marks:** Always enclose a neat box diagram or flowchart with labeled inputs, outputs, and control parameters.
4. **Equations Must Have Legend:** Define every variable (e.g., $D_{121}$, $\\alpha$, $V_{out}$) with units.
5. **No Generalities:** Do not provide generic conversational text; provide exam-ready, high-density technical facts.
`;
    fs.writeFileSync(path.join(subjDir, 'answer-style.md'), answerStyle, 'utf8');

    // 6. Syllabus / Metadata
    const syllabus = {
      id: subj.id,
      name: subj.name,
      code: subj.code,
      department: dept,
      units: subj.units,
      topics: subj.topics,
      questionCount: subj.questions.length,
      updatedAt: '2026-09-30'
    };
    fs.writeFileSync(path.join(subjDir, 'syllabus.json'), JSON.stringify(syllabus, null, 2), 'utf8');
  }
}

console.log('KL Knowledge Base successfully populated for all departments!');
