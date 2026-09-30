import fs from 'fs';
import path from 'path';

const ftRoot = path.resolve('knowledge-base', 'Food Technology');

if (!fs.existsSync(ftRoot)) {
  fs.mkdirSync(ftRoot, { recursive: true });
}

const foodTechSubjects = [
  {
    id: 'ft-micro',
    name: 'Food Microbiology',
    code: '21BT2210',
    description: 'Study of microorganisms in food spoilage, foodborne pathogens, microbiological examination, and thermal death kinetics (D, z, F values) ensuring commercial sterility and safety.',
    department: 'Food Technology',
    units: [
      'Unit I: Microorganisms in Food & Bacterial Cell Morphology',
      'Unit II: Intrinsic & Extrinsic Factors Governing Microbial Growth',
      'Unit III: Microbial Food Spoilage & Foodborne Pathogens',
      'Unit IV: Thermal Death Kinetics (D, z, and F Values)',
      'Unit V: Industrial Fermentations & Probiotic Starters'
    ],
    topics: [
      'Thermal Death Kinetics (D, z, F Values)',
      'Gram Staining Mechanism and Procedure',
      '12D Concept in Commercial Canning',
      'Intrinsic and Extrinsic Factors of Food Spoilage',
      'Clostridium botulinum vs Salmonella in Food Processing'
    ],
    questions: [
      {
        id: 'q-ft-m1',
        topic: 'Thermal Death Kinetics (D, z, F Values)',
        marks: 10,
        unit: 4,
        paperYear: 'KL End Sem May 2024',
        question: 'Mathematically derive D-value, z-value, and F-value in thermal bacteriology and explain the 12D Botulinum Cook concept in commercial canning.'
      },
      {
        id: 'q-ft-m2',
        topic: 'Gram Staining Mechanism and Procedure',
        marks: 10,
        unit: 1,
        paperYear: 'KL End Sem Dec 2023',
        question: 'Explain structural differences between Gram-positive and Gram-negative bacterial cell walls. Describe step-by-step Gram staining with chemical reagents and color transitions.'
      },
      {
        id: 'q-ft-m3',
        topic: 'Intrinsic and Extrinsic Factors of Food Spoilage',
        marks: 5,
        unit: 2,
        paperYear: 'KL In-Sem 1 2024',
        question: 'Explain how Water Activity (aw), pH, and Redox Potential (Eh) interact to inhibit foodborne spoilage pathogens.'
      },
      {
        id: 'q-ft-m4',
        topic: '12D Concept in Thermal Processing',
        marks: 2,
        unit: 4,
        paperYear: 'KL End Sem May 2024',
        question: 'What is the 12D Botulinum Cook concept in low-acid canned food sterilization?'
      },
      {
        id: 'q-ft-m5',
        topic: 'D-Value (Decimal Reduction Time)',
        marks: 2,
        unit: 4,
        paperYear: 'KL In-Sem 2 2024',
        question: 'Define D-value and state its units in thermal food processing.'
      }
    ]
  },
  {
    id: 'ft-dairy',
    name: 'Dairy Technology',
    code: '21BT3112',
    description: 'Comprehensive study of bovine milk chemistry, market milk processing, pasteurization kinetics (HTST/UHT), homogenization mechanics, cheese manufacturing, and spray drying.',
    department: 'Food Technology',
    units: [
      'Unit I: Physical & Chemical Composition of Bovine Milk',
      'Unit II: Market Milk Processing & Homogenization',
      'Unit III: HTST Pasteurization & UHT Sterilization',
      'Unit IV: Cheddar Cheese Manufacturing & Rennet Coagulation',
      'Unit V: Spray Drying of Skim Milk Powder & Cyclone Recovery'
    ],
    topics: [
      'HTST Pasteurization System and Flow Diversion Valve',
      'Milk Homogenization and Stokes\' Law',
      'Spray Drying of Milk Powder and Cyclone Separation',
      'Cheddar Cheese Manufacturing and Rennet Coagulation',
      'Cleaning-in-Place (CIP) Cleaning Cycles for Dairy Equipment'
    ],
    questions: [
      {
        id: 'q-ft-d1',
        topic: 'HTST Pasteurization System',
        marks: 10,
        unit: 3,
        paperYear: 'KL End Sem May 2024',
        question: 'Describe the High-Temperature Short-Time (HTST) pasteurization system with a complete engineering flow diagram. Explain the Flow Diversion Valve (FDV) fail-safe action and 90% thermal regeneration.'
      },
      {
        id: 'q-ft-d2',
        topic: 'Milk Homogenization and Stokes\' Law',
        marks: 10,
        unit: 2,
        paperYear: 'KL End Sem Dec 2023',
        question: 'Explain the principle and mechanical mechanism of two-stage milk homogenization. Derive fat globule creaming velocity using Stokes\' Law and explain cavitation-shear droplet breakup.'
      },
      {
        id: 'q-ft-d3',
        topic: 'Spray Drying of Milk Powder',
        marks: 5,
        unit: 5,
        paperYear: 'KL In-Sem 2 2024',
        question: 'Illustrate the co-current spray drying process for whole milk powder with atomization, drying chamber droplet evaporation, and cyclone powder collection.'
      },
      {
        id: 'q-ft-d4',
        topic: 'Alkaline Phosphatase Test',
        marks: 2,
        unit: 3,
        paperYear: 'KL End Sem Dec 2023',
        question: 'Why is Alkaline Phosphatase used as the indicator enzyme to verify adequate milk pasteurization?'
      }
    ]
  },
  {
    id: 'ft-chem',
    name: 'Food Chemistry and Nutrition',
    code: '21BT2108',
    description: 'Exploration of food macro/micronutrients, water activity (aw), carbohydrate functionality, protein denaturation, lipid auto-oxidation, and Maillard browning reactions.',
    department: 'Food Technology',
    units: [
      'Unit I: Water Chemistry, Sorption Isotherms & Water Activity (aw)',
      'Unit II: Carbohydrate Functionality, Starch Gelatinization & Retrogradation',
      'Unit III: Protein Structure, Denaturation & Functional Properties',
      'Unit IV: Lipid Oxidation, Auto-oxidation Kinetics & Antioxidants',
      'Unit V: Food Enzymology, Browning Reactions & Micronutrient Bioavailability'
    ],
    topics: [
      'Maillard Reaction Mechanism and Stages',
      'Lipid Auto-oxidation and Free Radical Chain Mechanism',
      'Starch Gelatinization and Retrogradation',
      'Moisture Sorption Isotherms (BET Equation)',
      'Enzymatic Browning and Polyphenol Oxidase (PPO)'
    ],
    questions: [
      {
        id: 'q-ft-c1',
        topic: 'Maillard Reaction Mechanism and Stages',
        marks: 10,
        unit: 5,
        paperYear: 'KL End Sem May 2024',
        question: 'Explain the chemistry of Non-Enzymatic Browning (Maillard Reaction) in foods. Detail Initial, Intermediate (Amadori rearrangement), and Final stages (Melanoidin pigments) with reaction schemes.'
      },
      {
        id: 'q-ft-c2',
        topic: 'Lipid Auto-oxidation and Free Radical Chain Mechanism',
        marks: 10,
        unit: 4,
        paperYear: 'KL End Sem Dec 2023',
        question: 'Detail the free-radical mechanism of Lipid Auto-oxidation (Initiation, Propagation, and Termination). Explain how synthetic and natural antioxidants (BHA, BHT, Tocopherols) inhibit rancidity.'
      },
      {
        id: 'q-ft-c3',
        topic: 'Starch Gelatinization and Retrogradation',
        marks: 5,
        unit: 2,
        paperYear: 'KL In-Sem 1 2024',
        question: 'Differentiate between Starch Gelatinization and Retrogradation. Explain their roles in bread staling and syneresis in food gels.'
      },
      {
        id: 'q-ft-c4',
        topic: 'Water Activity (aw) Definition',
        marks: 2,
        unit: 1,
        paperYear: 'KL End Sem May 2024',
        question: 'Define Water Activity (aw) and state its relationship with Equilibrium Relative Humidity (ERH).'
      }
    ]
  },
  {
    id: 'ft-eng',
    name: 'Food Processing and Engineering',
    code: '21BT2205',
    description: 'Engineering principles in food manufacturing, fluid mechanics, heat transfer equipment, drying kinetics, evaporation, refrigeration thermodynamics, and mass transfer operations.',
    department: 'Food Technology',
    units: [
      'Unit I: Fluid Flow in Food Systems & Rheology',
      'Unit II: Heat Transfer in Food Processing (Conduction, Convection, Radiation)',
      'Unit III: Thermal Processing Calculations & General Method',
      'Unit IV: Freezing, Cryogenic Freezing & Planck\'s Equation',
      'Unit V: Extrusion Technology, Membrane Separation (UF, RO) & Dehydration'
    ],
    topics: [
      'Planck\'s Equation for Freezing Time Calculation',
      'Single and Twin-Screw Food Extrusion Cooking',
      'Membrane Separation: Ultrafiltration vs Reverse Osmosis',
      'Fluid Flow and Non-Newtonian Food Rheology',
      'Freeze Drying (Lyophilization) Sublimation Kinetics'
    ],
    questions: [
      {
        id: 'q-ft-e1',
        topic: 'Single and Twin-Screw Food Extrusion Cooking',
        marks: 10,
        unit: 5,
        paperYear: 'KL End Sem May 2024',
        question: 'Explain the working principle and mechanical zones of a food extruder (Feed, Kneading, Transition, and Die zones). Compare Single-Screw vs Twin-Screw extruders for expanded snacks.'
      },
      {
        id: 'q-ft-e2',
        topic: 'Planck\'s Equation for Freezing Time Calculation',
        marks: 10,
        unit: 4,
        paperYear: 'KL End Sem Dec 2023',
        question: 'Derive Planck\'s equation for predicting freezing time of food slabs. State all engineering assumptions and define thermal parameters.'
      },
      {
        id: 'q-ft-e3',
        topic: 'Membrane Separation: Ultrafiltration vs Reverse Osmosis',
        marks: 5,
        unit: 5,
        paperYear: 'KL In-Sem 2 2024',
        question: 'Compare Ultrafiltration (UF) and Reverse Osmosis (RO) in terms of pore size, transmembrane pressure, and applications in whey processing.'
      },
      {
        id: 'q-ft-e4',
        topic: 'Triple Point of Water in Freeze Drying',
        marks: 2,
        unit: 5,
        paperYear: 'KL End Sem May 2024',
        question: 'State the temperature and pressure values of the Triple Point of Water essential for sublimation during freeze-drying.'
      }
    ]
  },
  {
    id: 'ft-pres',
    name: 'Food Preservation and Packaging',
    code: '21BT3115',
    description: 'Preservation technologies including thermal processing, freezing, dehydration, modified atmosphere packaging (MAP), active packaging, barrier materials, and shelf-life extension.',
    department: 'Food Technology',
    units: [
      'Unit I: Principles of Food Preservation & Hurdle Technology',
      'Unit II: Thermal Canning Operations, Exhausting & Retort Processing',
      'Unit III: Modified Atmosphere Packaging (MAP) & Controlled Atmosphere (CAP)',
      'Unit IV: Flexible Packaging Materials (LDPE, HDPE, EVOH, Metallized Films)',
      'Unit V: Active and Intelligent Packaging Technologies'
    ],
    topics: [
      'Modified Atmosphere Packaging (MAP) for Fresh Meat and Produce',
      'Hurdle Technology Principle and Synergistic Preservation',
      'Canning Operations: Exhausting, Seaming, and Retort Retorting',
      'Oxygen Scavengers and Moisture Absorbers in Active Packaging',
      'Barrier Properties of EVOH vs PVDC Packaging Films'
    ],
    questions: [
      {
        id: 'q-ft-p1',
        topic: 'Modified Atmosphere Packaging (MAP)',
        marks: 10,
        unit: 3,
        paperYear: 'KL End Sem May 2024',
        question: 'Explain the principle, gas combinations (O2, CO2, N2), and shelf-life extension mechanism of Modified Atmosphere Packaging (MAP) for fresh red meat and respiring fresh produce.'
      },
      {
        id: 'q-ft-p2',
        topic: 'Hurdle Technology Principle',
        marks: 10,
        unit: 1,
        paperYear: 'KL End Sem Dec 2023',
        question: 'Discuss Leistner\'s Hurdle Technology concept. Explain how multiple sub-lethal hurdles (temperature, pH, aw, redox potential, preservatives) inhibit microbial homeostasis without degrading sensory quality.'
      },
      {
        id: 'q-ft-p3',
        topic: 'Active Packaging Oxygen Scavengers',
        marks: 5,
        unit: 5,
        paperYear: 'KL In-Sem 2 2024',
        question: 'Explain the working mechanism of iron-based chemical oxygen scavenging sachets in active food packaging.'
      },
      {
        id: 'q-ft-p4',
        topic: 'Function of Exhausting in Canning',
        marks: 2,
        unit: 2,
        paperYear: 'KL End Sem Dec 2023',
        question: 'Why is thermal or vacuum exhausting mandatory prior to can double seaming in commercial food canning?'
      }
    ]
  },
  {
    id: 'ft-haccp',
    name: 'Food Quality and HACCP',
    code: '21BT3218',
    description: 'Implementation of food safety management systems, HACCP 7 core principles, CCP determination, ISO 22000, FSSAI regulations, and statistical process quality control.',
    department: 'Food Technology',
    units: [
      'Unit I: Food Quality Assurance Fundamentals & TQM',
      'Unit II: Hazard Analysis Critical Control Point (HACCP) 7 Principles',
      'Unit III: ISO 22000 Food Safety Management Systems & Pre-Requisite Programs (PRPs)',
      'Unit IV: FSSAI Regulations, Food Safety Audits & Food Adulteration Testing',
      'Unit V: Sensory Evaluation Methods (Triangle, Hedonic, Descriptive Analysis)'
    ],
    topics: [
      'The 7 Principles of HACCP and CCP Decision Tree',
      'Critical Control Points in Fruit Juice Processing',
      'Sensory Evaluation: Difference Testing (Triangle Test Method)',
      'FSSAI Food Safety and Standards Act Regulatory Structure',
      'Good Manufacturing Practices (GMP) and Good Hygiene Practices (GHP)'
    ],
    questions: [
      {
        id: 'q-ft-q1',
        topic: 'The 7 Principles of HACCP and CCP Decision Tree',
        marks: 10,
        unit: 2,
        paperYear: 'KL End Sem May 2024',
        question: 'State and explain all 7 Principles of HACCP in sequence. Demonstrate how the Codex CCP Decision Tree identifies Critical Control Points in food processing operations.'
      },
      {
        id: 'q-ft-q2',
        topic: 'Critical Control Points in Fruit Juice Processing',
        marks: 10,
        unit: 2,
        paperYear: 'KL End Sem Dec 2023',
        question: 'Develop a comprehensive HACCP plan for a packaged mango juice processing plant. Identify biological, chemical, and physical hazards; establish critical limits, monitoring procedures, and corrective actions.'
      },
      {
        id: 'q-ft-q3',
        topic: 'Sensory Evaluation: Triangle Test Method',
        marks: 5,
        unit: 5,
        paperYear: 'KL In-Sem 1 2024',
        question: 'Explain the sensory evaluation Triangle Test protocol. Detail sample presentation, statistical hypothesis, and probability calculation (p = 1/3).'
      },
      {
        id: 'q-ft-q4',
        topic: 'Difference between Critical Limit and Operational Limit',
        marks: 2,
        unit: 2,
        paperYear: 'KL End Sem May 2024',
        question: 'Distinguish between a Critical Limit (CL) and an Operational Limit (OL) in HACCP verification.'
      }
    ]
  }
];

console.log('Populating complete KL Food Technology Knowledge Base...');

for (const subj of foodTechSubjects) {
  const subjDir = path.join(ftRoot, subj.name);
  if (!fs.existsSync(subjDir)) {
    fs.mkdirSync(subjDir, { recursive: true });
  }

  // 1. Course materials
  const courseMaterials = `# ${subj.name} (${subj.code})
**Department:** Food Technology | **University:** KL University (KLU)
**Curriculum Regulation:** 2021-2026 | **Program:** B.Tech Food Technology

## Course Overview & Objectives
This core course equips KL Food Technology engineering undergraduates with foundational scientific principles, quantitative mathematical derivations, and industrial process applications compliant with FSSAI, ISO 22000, and global food processing codes.

## Course Units (Mapped to Bloom's Taxonomy Levels 1 to 4)
${subj.units.map((u) => `### ${u}\n- **Key Competencies:** Technical terminology, governing equations, industrial unit operations, and laboratory correlations.\n- **Primary Textbook Reference:** Standard KL Food Technology Lecture Handout & Industrial Food Engineering Compendium.\n`).join('\n')}

## Recommended Reference Materials
1. Fellows, P.J. *Food Processing Technology: Principles and Practice*, 4th Edition, Woodhead Publishing.
2. Frazier, W.C. & Westhoff, D.C. *Food Microbiology*, 5th Edition, McGraw Hill.
3. Potter, N.N. & Hotchkiss, J.H. *Food Science*, 5th Edition, Springer.
4. Official KL University Course Handout & End-Semester Grading Compendium.
`;
  fs.writeFileSync(path.join(subjDir, 'course-materials.md'), courseMaterials, 'utf8');

  // 2. Previous papers
  const prevPapers = `# Previous Examination Papers — ${subj.name}
**Department of Food Technology, KL University**

## Official Question Papers Mapped to Bloom's Taxonomy
- **KL End-Semester Examination May 2024 (Regular & Supplementary)**
- **KL End-Semester Examination Dec 2023 (Odd Semester Regular)**
- **KL In-Semester Examination 1 (Mid-Term 2024)**
- **KL In-Semester Examination 2 (Mid-Term 2024)**

## Evaluation Rubric Structure
- **Part A:** 5 mandatory questions $\\times$ 2 marks = 10 marks (Direct scientific definitions, parameters, units).
- **Part B:** 5 descriptive questions $\\times$ 5 marks = 25 marks (Structured subheadings, 4-5 bulleted mechanisms, mini-flowchart).
- **Part C:** 4 comprehensive essay questions $\\times$ 10 marks = 40 marks (Detailed derivation, full process engineering flowchart, industrial applications, evaluator takeaways).
`;
  fs.writeFileSync(path.join(subjDir, 'previous-papers.md'), prevPapers, 'utf8');

  // 3. Question bank
  fs.writeFileSync(path.join(subjDir, 'question-bank.json'), JSON.stringify(subj.questions, null, 2), 'utf8');

  // 4. Marks pattern
  const marksPattern = `# KL University Marks Pattern & Grading Rubric
**Subject:** ${subj.name} (${subj.code}) | **Department:** Food Technology

## 2 Marks Questions (Cognitive Level: Remember / Understand)
- **Target Word Count:** 20 - 40 words (2 to 3 concise sentences).
- **Evaluation Criteria:**
  - Clear, mathematically/scientifically precise definition.
  - Formula, standard SI units, or one concrete food industry example.
  - Zero fluff or redundant introduction.

## 5 Marks Questions (Cognitive Level: Understand / Apply)
- **Target Word Count:** 120 - 180 words.
- **Evaluation Criteria:**
  - 1 Mark: Precise definition and scientific concept.
  - 2 Marks: 4 to 5 bulleted core points explaining processing mechanism or kinetics.
  - 1 Mark: ASCII/Mermaid block flowchart or schematic diagram.
  - 1 Mark: Real-world food industry plant application.

## 10 Marks Questions (Cognitive Level: Apply / Analyze / Evaluate)
- **Target Word Count:** 350 - 500 words.
- **Evaluation Criteria:**
  - 1 Mark: Definition & Food Technology Context.
  - 2 Marks: Working Principle, Governing Laws & Equations.
  - 3 Marks: Step-by-Step Processing Mechanism / Staged Execution.
  - 2 Marks: Clear labeled architectural diagram or process flowchart.
  - 1 Mark: Practical Food Industry Applications and Quality Controls.
  - 1 Mark: Merits, Demerits / Critical Control Points and KL Evaluator Conclusion.
`;
  fs.writeFileSync(path.join(subjDir, 'marks-pattern.md'), marksPattern, 'utf8');

  // 5. Answer style
  const answerStyle = `# KL University Food Technology Examiner Answer Style Guide
**Department:** Food Technology | **Subject:** ${subj.name}

## What KL Evaluators Expect to Award Full Marks:
1. **Highlight Scientific Terminology First:** Bold essential technical vocabulary in the very first sentence (e.g., *decimal reduction time*, *homogenization valve*, *Amadori rearrangement*, *sublimation*).
2. **Use Clear Headings:** Evaluators scan answers quickly. Use structured subheadings: *Definition*, *Scientific Principle*, *Working Mechanism*, *Flowchart*, *Industrial Applications*.
3. **Flowcharts Are Mandatory for 5 & 10 Marks:** Always enclose a neat box diagram or flowchart with labeled temperature, pressure, inputs, outputs, and control parameters.
4. **Equations Must Have Legend:** Define every variable (e.g., $D_{121}$, $z$, $aw$, $\\mu$) with explicit units.
5. **No Generalities:** Do not provide generic conversational text; provide exam-ready, high-density food engineering facts.
`;
  fs.writeFileSync(path.join(subjDir, 'answer-style.md'), answerStyle, 'utf8');

  // 6. Syllabus / Metadata
  const syllabus = {
    id: subj.id,
    name: subj.name,
    code: subj.code,
    description: subj.description,
    department: subj.department,
    units: subj.units,
    topics: subj.topics,
    questionCount: subj.questions.length,
    updatedAt: '2026-09-30'
  };
  fs.writeFileSync(path.join(subjDir, 'syllabus.json'), JSON.stringify(syllabus, null, 2), 'utf8');

  // 7. Standard Grounded Resources Manifest with full descriptions
  const resources = [
    {
      id: `res-${subj.id}-cm`,
      title: `${subj.name} Official Lecture Handouts & Course Material`,
      resourceType: 'course-materials',
      fileName: 'course-materials.md',
      unit: 'Units I - V',
      description: `Comprehensive reading materials, fundamental scientific equations, unit operations, and textbook citations for ${subj.name}.`,
      author: 'KL Department Faculty',
      updatedAt: '2026-09-30'
    },
    {
      id: `res-${subj.id}-pp`,
      title: `KL University Previous Semester Exam Papers`,
      resourceType: 'previous-papers',
      fileName: 'previous-papers.md',
      unit: 'All Units',
      description: `Archived End-Sem and In-Sem university examination papers (May 2024, Dec 2023) mapped to Bloom's Taxonomy.`,
      author: 'KL Exam Cell',
      updatedAt: '2026-09-30'
    },
    {
      id: `res-${subj.id}-qb`,
      title: `Graded Question Bank (2M, 5M, 10M)`,
      resourceType: 'question-bank',
      fileName: 'question-bank.json',
      unit: 'Units I - V',
      description: `Curated repository of ${subj.questions.length} questions categorized strictly by mark weightage and Bloom's Taxonomy.`,
      author: 'Board of Studies',
      updatedAt: '2026-09-30'
    },
    {
      id: `res-${subj.id}-mp`,
      title: `KL University Marks Pattern & Evaluation Scheme`,
      resourceType: 'marks-pattern',
      fileName: 'marks-pattern.md',
      unit: 'All Units',
      description: `Word-count criteria, essential keywords weighting, and marks breakdown for 2, 5, and 10 mark questions.`,
      author: 'Controller of Examinations',
      updatedAt: '2026-09-30'
    },
    {
      id: `res-${subj.id}-as`,
      title: `Examiner Evaluation Style & Answer Presentation Guide`,
      resourceType: 'answer-style',
      fileName: 'answer-style.md',
      unit: 'All Units',
      description: `Guidelines on answer structure, underlining technical nomenclature, mandatory process flowcharts, and scoring 10/10.`,
      author: 'Senior Evaluators Panel',
      updatedAt: '2026-09-30'
    },
    {
      id: `res-${subj.id}-syl`,
      title: `Official Syllabus & Unit Learning Outcomes`,
      resourceType: 'syllabus',
      fileName: 'syllabus.json',
      unit: 'Units I - V',
      description: `Official KL academic course structure, course outcomes (COs), program outcomes (POs), and unit breakdown.`,
      author: 'KL Academic Council',
      updatedAt: '2026-09-30'
    }
  ];
  fs.writeFileSync(path.join(subjDir, 'resources.json'), JSON.stringify(resources, null, 2), 'utf8');
}

console.log('KL Food Technology Knowledge Base successfully seeded with all 6 subjects and 6 files each!');
