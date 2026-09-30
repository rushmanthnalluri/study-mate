import { Subject, ExamNote } from '../types';

export const fallbackSubjects: Subject[] = [
  // CSE
  {
    id: 'cse-os',
    name: 'Operating Systems',
    code: '21CS2104',
    department: 'CSE',
    units: [
      'Unit I: Overview & Process Management',
      'Unit II: CPU Scheduling & Synchronization',
      'Unit III: Deadlocks & Handling Strategies',
      'Unit IV: Memory Management & Paging',
      'Unit V: Storage & File Systems'
    ],
    topics: [
      "Banker's Algorithm for Deadlock Avoidance",
      "Process Synchronization and Semaphores",
      "Page Replacement Algorithms (FIFO, LRU, Optimal)",
      "CPU Scheduling Algorithms (Round Robin, SJF)",
      "Virtual Memory and Thrashing"
    ],
    questionCount: 5,
    questionBank: [
      {
        id: 'q-os-1',
        topic: "Banker's Algorithm for Deadlock Avoidance",
        marks: 10,
        unit: 3,
        paperYear: 'KL End Sem May 2024',
        question: "Explain Banker's algorithm for deadlock avoidance with safety and resource-request algorithms along with a state evaluation example."
      },
      {
        id: 'q-os-2',
        topic: "Page Replacement Algorithms (FIFO, LRU)",
        marks: 10,
        unit: 4,
        paperYear: 'KL End Sem Dec 2023',
        question: "Discuss Virtual Memory Paging. Differentiate between FIFO, LRU, and Optimal page replacement policies with Belady's Anomaly."
      },
      {
        id: 'q-os-3',
        topic: "Process Synchronization and Semaphores",
        marks: 5,
        unit: 2,
        paperYear: 'KL In-Sem 2 2024',
        question: "What is a Semaphore? Explain counting and binary semaphores without busy waiting."
      },
      {
        id: 'q-os-4',
        topic: "Thrashing in Virtual Memory",
        marks: 2,
        unit: 4,
        paperYear: 'KL End Sem May 2024',
        question: "Define Thrashing in virtual memory and write its primary cause."
      }
    ]
  },
  {
    id: 'cse-dsa',
    name: 'Data Structures and Algorithms',
    code: '21CS1202',
    department: 'CSE',
    units: [
      'Unit I: Linear Data Structures',
      'Unit II: Trees & Binary Search Trees',
      'Unit III: Balanced Trees (AVL, B-Trees)',
      'Unit IV: Graphs & Shortest Paths',
      'Unit V: Algorithm Design Techniques'
    ],
    topics: [
      "AVL Tree Rotations and Balancing",
      "Dijkstra's Shortest Path Algorithm",
      "0/1 Knapsack Dynamic Programming",
      "B-Trees and B+ Trees for Indexing",
      "Merge Sort Time Complexity"
    ],
    questionCount: 4,
    questionBank: [
      {
        id: 'q-dsa-1',
        topic: "AVL Tree Rotations and Balancing",
        marks: 10,
        unit: 3,
        paperYear: 'KL End Sem May 2024',
        question: "Explain AVL Trees, the Balance Factor condition, and detail LL, RR, LR, and RL rotations."
      },
      {
        id: 'q-dsa-2',
        topic: "Dijkstra's Algorithm",
        marks: 10,
        unit: 4,
        paperYear: 'KL End Sem Dec 2023',
        question: "Demonstrate Dijkstra's Single Source Shortest Path Algorithm on a directed weighted graph."
      },
      {
        id: 'q-dsa-3',
        topic: "0/1 Knapsack Dynamic Programming",
        marks: 5,
        unit: 5,
        paperYear: 'KL In-Sem 2 2024',
        question: "Derive the Dynamic Programming recurrence relation for 0/1 Knapsack."
      }
    ]
  },
  {
    id: 'cse-dbms',
    name: 'Database Management Systems',
    code: '21CS2205',
    department: 'CSE',
    units: [
      'Unit I: Relational Model & ER Diagrams',
      'Unit II: Relational Algebra & SQL',
      'Unit III: Normalization (1NF to BCNF)',
      'Unit IV: Transactions & Concurrency Control',
      'Unit V: Query Optimization'
    ],
    topics: [
      "Database Normalization (1NF to BCNF)",
      "ACID Properties and Serializability",
      "Two-Phase Locking (2PL) Protocol",
      "ER Modeling to Schema Conversion"
    ],
    questionCount: 4,
    questionBank: [
      {
        id: 'q-dbms-1',
        topic: "Database Normalization (1NF to BCNF)",
        marks: 10,
        unit: 3,
        paperYear: 'KL End Sem May 2024',
        question: "Explain the need for Normalization. Discuss 1NF, 2NF, 3NF, and BCNF with functional dependencies."
      },
      {
        id: 'q-dbms-2',
        topic: "ACID Properties and Serializability",
        marks: 10,
        unit: 4,
        paperYear: 'KL End Sem Dec 2023',
        question: "Explain ACID properties of transactions and conflict serializability."
      }
    ]
  },

  // AIDS
  {
    id: 'aids-ml',
    name: 'Machine Learning',
    code: '21AD2201',
    department: 'AIDS',
    units: [
      'Unit I: Foundations & Linear Models',
      'Unit II: Decision Trees & Classification',
      'Unit III: Ensemble Learning & Random Forests',
      'Unit IV: Support Vector Machines & Kernels',
      'Unit V: Unsupervised Learning & PCA'
    ],
    topics: [
      "Support Vector Machines (SVM) & Kernel Trick",
      "Bias-Variance Tradeoff and Regularization",
      "Principal Component Analysis (PCA)",
      "Random Forest & Gradient Boosting"
    ],
    questionCount: 4,
    questionBank: [
      {
        id: 'q-ml-1',
        topic: "Support Vector Machines (SVM) & Kernel Trick",
        marks: 10,
        unit: 4,
        paperYear: 'KL End Sem May 2024',
        question: "Derive the maximum margin hyperplane optimization for Support Vector Machines (SVM) and explain the Kernel Trick."
      },
      {
        id: 'q-ml-2',
        topic: "Principal Component Analysis (PCA)",
        marks: 10,
        unit: 5,
        paperYear: 'KL End Sem Dec 2023',
        question: "Detail the mathematical procedure of PCA using Covariance Matrix, Eigenvalues, and Eigenvectors."
      },
      {
        id: 'q-ml-3',
        topic: "Bias-Variance Tradeoff",
        marks: 5,
        unit: 1,
        paperYear: 'KL In-Sem 1 2024',
        question: "Explain the Bias-Variance tradeoff curve and L1 vs L2 regularization."
      }
    ]
  },
  {
    id: 'aids-dl',
    name: 'Deep Learning and Neural Networks',
    code: '21AD3103',
    department: 'AIDS',
    units: [
      'Unit I: Neural Fundamentals & Backprop',
      'Unit II: Convolutional Neural Networks',
      'Unit III: RNNs & LSTMs',
      'Unit IV: Transformers & Self-Attention',
      'Unit V: Autoencoders & GANs'
    ],
    topics: [
      "Transformer Architecture & Self-Attention",
      "CNN Architecture and Convolution Operation",
      "LSTM Gates and Mathematical Operations",
      "Vanishing Gradient Problem & Mitigation"
    ],
    questionCount: 4,
    questionBank: [
      {
        id: 'q-dl-1',
        topic: "Transformer Architecture & Self-Attention",
        marks: 10,
        unit: 4,
        paperYear: 'KL End Sem May 2024',
        question: "Explain the Transformer architecture in detail. Derive Scaled Dot-Product Attention."
      },
      {
        id: 'q-dl-2',
        topic: "CNN Architecture and Convolution Operation",
        marks: 10,
        unit: 2,
        paperYear: 'KL End Sem Dec 2023',
        question: "Explain the building blocks of CNN: Convolution layer, stride, padding, and MaxPooling."
      }
    ]
  },

  // ECE
  {
    id: 'ece-dsp',
    name: 'Digital Signal Processing',
    code: '21EC2208',
    department: 'ECE',
    units: [
      'Unit I: Discrete Signals & Z-Transforms',
      'Unit II: DFT & FFT Algorithms',
      'Unit III: IIR Filter Design (Butterworth)',
      'Unit IV: FIR Filter Design (Windowing)',
      'Unit V: Multirate Signal Processing'
    ],
    topics: [
      "Radix-2 DIT FFT Butterfly Algorithm",
      "Bilinear Transformation for IIR Filters",
      "FIR Filter Windowing Techniques",
      "Twiddle Factor in FFT"
    ],
    questionCount: 4,
    questionBank: [
      {
        id: 'q-dsp-1',
        topic: "Radix-2 DIT FFT Butterfly Algorithm",
        marks: 10,
        unit: 2,
        paperYear: 'KL End Sem May 2024',
        question: "Derive 8-point Radix-2 DIT FFT algorithm and draw the complete 3-stage butterfly diagram."
      },
      {
        id: 'q-dsp-2',
        topic: "Bilinear Transformation for IIR Filters",
        marks: 10,
        unit: 3,
        paperYear: 'KL End Sem Dec 2023',
        question: "Explain Bilinear Transformation for designing IIR digital filters and Frequency Warping."
      }
    ]
  },
  {
    id: 'ece-vlsi',
    name: 'VLSI Design',
    code: '21EC3109',
    department: 'ECE',
    units: [
      'Unit I: MOS Transistor Theory',
      'Unit II: CMOS Inverter Characteristics',
      'Unit III: Combinational & Dynamic Logic',
      'Unit IV: Sequential Circuits & Timing',
      'Unit V: FPGA Architecture'
    ],
    topics: [
      "CMOS Inverter VTC and Noise Margins",
      "Stick Diagram using Euler Path",
      "Setup Time and Hold Time in Flip-Flops"
    ],
    questionCount: 3,
    questionBank: [
      {
        id: 'q-vlsi-1',
        topic: "CMOS Inverter VTC and Noise Margins",
        marks: 10,
        unit: 2,
        paperYear: 'KL End Sem May 2024',
        question: "Derive Voltage Transfer Characteristics of static CMOS inverter and define Noise Margins."
      }
    ]
  },

  // EEE
  {
    id: 'eee-ps',
    name: 'Power Systems',
    code: '21EE2207',
    department: 'EEE',
    units: [
      'Unit I: Transmission Line Modeling',
      'Unit II: Load Flow Analysis',
      'Unit III: Fault Analysis',
      'Unit IV: Power System Stability',
      'Unit V: Economic Dispatch'
    ],
    topics: [
      "Newton-Raphson Load Flow Analysis",
      "Equal Area Criterion for Transient Stability",
      "Ferranti Effect in Transmission Lines"
    ],
    questionCount: 3,
    questionBank: [
      {
        id: 'q-ps-1',
        topic: "Newton-Raphson Load Flow Analysis",
        marks: 10,
        unit: 2,
        paperYear: 'KL End Sem May 2024',
        question: "Formulate power flow equations and explain the Newton-Raphson method with Jacobian matrix."
      }
    ]
  },
  {
    id: 'eee-cs',
    name: 'Control Systems',
    code: '21EE2105',
    department: 'EEE',
    units: [
      'Unit I: System Modeling',
      'Unit II: Time-Domain Analysis',
      'Unit III: Root Locus & Stability',
      'Unit IV: Frequency Response (Bode Plot)',
      'Unit V: State Space Modeling'
    ],
    topics: [
      "Root Locus Technique Construction Rules",
      "Bode Plot Stability Margins",
      "PID Controller Effects"
    ],
    questionCount: 3,
    questionBank: [
      {
        id: 'q-cs-1',
        topic: "Root Locus Technique Construction Rules",
        marks: 10,
        unit: 3,
        paperYear: 'KL End Sem May 2024',
        question: "State all the 8 construction rules of Root Locus technique and determine range of K for stability."
      }
    ]
  },

  // Food Technology
  {
    id: 'ft-micro',
    name: 'Food Microbiology',
    code: '21BT2210',
    department: 'Food Technology',
    units: [
      'Unit I: Microorganisms Associated with Food',
      'Unit II: Factors Affecting Microbial Growth',
      'Unit III: Spoilage & Foodborne Pathogens',
      'Unit IV: Thermal Death Kinetics (D, z, F)',
      'Unit V: Fermented Foods'
    ],
    topics: [
      "Thermal Death Kinetics (D, z, F Values)",
      "Gram Staining Mechanism and Procedure",
      "Intrinsic and Extrinsic Factors of Food Spoilage",
      "12D Concept in Thermal Processing"
    ],
    questionCount: 4,
    questionBank: [
      {
        id: 'q-ft-1',
        topic: "Thermal Death Kinetics (D, z, F Values)",
        marks: 10,
        unit: 4,
        paperYear: 'KL End Sem May 2024',
        question: "Mathematically derive D-value, z-value, and F-value in thermal bacteriology and explain the 12D concept in commercial canning."
      },
      {
        id: 'q-ft-2',
        topic: "Gram Staining Mechanism and Procedure",
        marks: 10,
        unit: 1,
        paperYear: 'KL End Sem Dec 2023',
        question: "Explain cell wall differences between Gram-positive and Gram-negative bacteria and detail the staining procedure."
      }
    ]
  },
  {
    id: 'ft-dairy',
    name: 'Dairy Technology',
    code: '21BT3112',
    department: 'Food Technology',
    units: [
      'Unit I: Milk Physical & Chemical Properties',
      'Unit II: Market Milk & Homogenization',
      'Unit III: Pasteurization & UHT',
      'Unit IV: Cheese & Fermented Milks',
      'Unit V: Dried Milk Technology'
    ],
    topics: [
      "HTST Pasteurization System",
      "Milk Homogenization and Stokes' Law",
      "Spray Drying of Milk Powder"
    ],
    questionCount: 3,
    questionBank: [
      {
        id: 'q-ft-d-1',
        topic: "HTST Pasteurization System",
        marks: 10,
        unit: 3,
        paperYear: 'KL End Sem May 2024',
        question: "Describe the High-Temperature Short-Time (HTST) pasteurization system with flow diagram and FDV valve action."
      }
    ]
  }
];

export const fallbackGoldAnswers: Record<string, ExamNote> = {
  "Banker's Algorithm for Deadlock Avoidance": {
    topic: "Banker's Algorithm for Deadlock Avoidance",
    subject: "Operating Systems",
    department: "CSE",
    code: "21CS2104",
    unit: "Unit III: Deadlocks & Handling Strategies",
    keywords: ["Deadlock Avoidance", "Safe State", "Available Vector", "Max Matrix", "Allocation Matrix", "Need Matrix", "Need <= Work", "Resource-Request Algorithm"],
    twoMarks: {
      question: "What is Banker's Algorithm?",
      answer: "Banker's Algorithm is a deadlock avoidance algorithm developed by Edsger Dijkstra. It tests for safety by simulating the allocation of predetermined maximum possible amounts of all resources, ensuring the system never enters an unsafe state where deadlock could occur."
    },
    fiveMarks: {
      question: "Explain the Safety Algorithm of Banker's Algorithm with data structures.",
      answer: `### Safety Algorithm Principle
The Safety Algorithm determines whether a system is in a safe state by verifying if there exists a safe execution sequence <P0, P1, ..., Pn-1>.

### Key Data Structures
1. Available[m]: Vector of length m indicating available instances of resource Rj.
2. Allocation[n, m]: Resources currently allocated to each process.
3. Max[n, m]: Maximum demand of each process.
4. Need[n, m]: Calculated as Need[i, j] = Max[i, j] - Allocation[i, j].

### Execution Steps
- Step 1: Initialize Work = Available and Finish[i] = false for all i.
- Step 2: Find index i such that Finish[i] == false and Need_i <= Work. If none exists, go to Step 4.
- Step 3: Work = Work + Allocation_i; Finish[i] = true. Go to Step 2.
- Step 4: If Finish[i] == true for all i, the system is in a Safe State.`
    },
    tenMarks: {
      question: "Explain Banker's Algorithm in detail with Resource-Request and Safety algorithms along with an illustrative example.",
      answer: `### 1. Introduction & Context in KL Exams
In operating systems, deadlock avoidance requires the OS to be given advance information about which resources a process will request during its lifetime. Banker's Algorithm is the classical avoidance protocol for systems with multiple instances of each resource type.

### 2. Core Data Structures & Matrix Formulations
For n processes and m resource types:
- Available Vector: 1 x m array indicating free units.
- Max Matrix: n x m array where Max[i][j] is process Pi's peak claim.
- Allocation Matrix: n x m array indicating current holdings.
- Need Matrix: Derived as Need[i][j] = Max[i][j] - Allocation[i][j].

### 3. Resource-Request Algorithm
When process Pi makes request vector Request_i:
1. If Request_i <= Need_i, proceed to Step 2. Otherwise, raise error (exceeded maximum claim).
2. If Request_i <= Available, proceed to Step 3. Otherwise, Pi must wait (resources busy).
3. Pretend to allocate requested resources:
   Available = Available - Request_i
   Allocation_i = Allocation_i + Request_i
   Need_i = Need_i - Request_i
4. Run the Safety Algorithm. If safe, commit allocation. If unsafe, Pi must wait and restore old state.

### 4. Safety Verification Mechanism
- Maintain temporary vectors Work = Available and Finish[i] = false.
- Repeatedly select Pi where Finish[i] == false and Need_i <= Work.
- When Pi finishes: Work = Work + Allocation_i, Finish[i] = true.
- If all processes finish, sequence <P0, P1, ..., Pn-1> is safe.

### 5. Practical Engineering Trade-offs
- Advantages: Completely prevents deadlock without requiring preemption or aborting jobs.
- Limitations: Requires fixed process count and advance knowledge of maximum resource needs, incurring O(m x n^2) evaluation overhead upon each request.

### 6. KL Evaluator Key Conclusion
In KL semester evaluations, students must clearly write the matrix relation Need = Max - Allocation and show the step-by-step vector addition of Work = Work + Allocation to secure full 10 marks.`
    },
    diagram: {
      type: "mermaid",
      code: `flowchart TD
    Start([Process Request Arrives]) --> Step1{Request <= Need?}
    Step1 -- No --> Err[Error: Exceeded Max Claim]
    Step1 -- Yes --> Step2{Request <= Available?}
    Step2 -- No --> Wait[Process Waits: Resources Busy]
    Step2 -- Yes --> Speculative[Speculative Allocation:<br/>Avail = Avail - Req<br/>Alloc = Alloc + Req<br/>Need = Need - Req]
    Speculative --> RunSafety[Execute Safety Algorithm]
    RunSafety --> IsSafe{Is System in Safe State?}
    IsSafe -- Yes --> Commit([Grant Allocation to Process])
    IsSafe -- No --> Rollback([Rollback Speculative State<br/>Process Must Wait])`
    }
  },
  "Thermal Death Kinetics (D, z, F Values)": {
    topic: "Thermal Death Kinetics (D, z, F Values)",
    subject: "Food Microbiology",
    department: "Food Technology",
    code: "21BT2210",
    unit: "Unit IV: Thermal Death Kinetics (D, z, and F Values)",
    keywords: ["Decimal Reduction Time (D-value)", "Thermal Resistance Constant (z-value)", "Process Lethality (F-value)", "12D Botulinum Cook", "First-Order Kinetics", "Survivor Curve", "Clostridium botulinum", "Commercial Sterility"],
    twoMarks: {
      question: "Define D-value and state its units in thermal food processing.",
      answer: "The D-value (Decimal Reduction Time) is the time in minutes at a given constant temperature required to destroy 90% (or reduce by one log cycle) of a specified microbial population. Its unit is minutes (min)."
    },
    fiveMarks: {
      question: "Differentiate between D-value and z-value with mathematical formulas.",
      answer: `### D-Value vs z-Value Comparison
| Parameter | D-Value ($D_T$) | z-Value ($z$) |
| :--- | :--- | :--- |
| **Definition** | Time in minutes to destroy 90% microbes at constant temperature $T$. | Temperature increase required for a 10-fold (one log cycle) reduction in D-value. |
| **Units** | Minutes (min) | $^\\circ\\text{C}$ or $^\\circ\\text{F}$ |
| **Governing Equation** | $D = \\frac{t}{\\log N_0 - \\log N}$ | $z = \\frac{T_2 - T_1}{\\log D_1 - \\log D_2}$ |
| **Physical Curve** | Semi-log Survivor curve ($\\log N$ vs heating time $t$) | Thermal Death Time (TDT) curve ($\\log D$ vs temperature $T$) |`
    },
    tenMarks: {
      question: "Mathematically derive D-value, z-value, and F-value in thermal bacteriology and explain the 12D concept in commercial canning.",
      answer: `### 1. Introduction & Microbial Inactivation Kinetics
Thermal destruction of bacteria follows first-order reaction kinetics:
$$-\\frac{dN}{dt} = k N$$
Integrating between initial population $N_0$ at $t=0$ and surviving population $N$ at time $t$:
$$\\ln\\left(\\frac{N}{N_0}\\right) = -k t \\implies \\log_{10}\\left(\\frac{N_0}{N}\\right) = \\frac{k}{2.303} t$$

### 2. D-Value (Decimal Reduction Time) Derivation
By definition, when $N = 0.1 N_0$, $t = D$:
$$\\log_{10}(10) = 1 = \\frac{k}{2.303} D \\implies D = \\frac{2.303}{k}$$
Graphically, $D$ is the negative reciprocal slope of the semi-log survivor curve:
$$D = \\frac{t_2 - t_1}{\\log N_1 - \\log N_2}$$

### 3. z-Value (Thermal Resistance Constant)
The $z$-value indicates temperature sensitivity. It is the temperature increase required to reduce the $D$-value by a factor of 10:
$$z = \\frac{T_2 - T_1}{\\log D_1 - \\log D_2}$$
For *Clostridium botulinum* spores, standard $z \\approx 10^\\circ\\text{C}$ ($18^\\circ\\text{F}$).

### 4. F-Value (Process Lethality) & Standard Reference $F_0$
The $F$-value is the equivalent thermal lethality delivered to a product:
$$F = D \\times (\\log N_0 - \\log N)$$
At standard reference temperature $T_{\\text{ref}} = 121.1^\\circ\\text{C}$ ($250^\\circ\\text{F}$) with $z = 10^\\circ\\text{C}$, the lethality is denoted $F_0$:
$$F_0 = \\int_0^t 10^{\\frac{T(t) - 121.1}{z}} dt$$

### 5. The 12D Concept in Commercial Canning
In low-acid canned foods (pH > 4.6), the standard target organism is *Clostridium botulinum* ($D_{121.1} = 0.21\\text{ min}$). A 12D process reduces spore contamination by 12 decimal cycles ($10^{12}$ reduction):
$$F_0 = 12 \\times 0.21 = 2.52\\text{ minutes}$$
This ensures the probability of spore survival is $< 10^{-12}$, guaranteeing commercial sterility and consumer safety.

### 6. KL Evaluator Key Conclusion
In KL exam grading, students must present the survivor curve, write the 12D formula explicitly, and state $D_{121.1} = 0.21\\text{ min}$ for *C. botulinum* to score 10/10 full marks.`
    },
    diagram: {
      type: "mermaid",
      code: `flowchart TD
    Raw["Raw Food Spores: N0 = 10^12 CFU/g"] --> Heat["Steam Retort Heating at 121.1°C"]
    Heat --> D1["1D Reduction (t = 0.21 min) -> 10^11"]
    D1 --> D6["6D Reduction (t = 1.26 min) -> 10^6"]
    D6 --> D12["12D Reduction (F0 = 2.52 min) -> 10^0 = 1 Spore in 10^12 Cans"]
    D12 --> Safe["Commercial Sterility Guaranteed: pH > 4.6 Safe"]`
    }
  }
};
