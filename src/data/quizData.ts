import { QuizQuestion } from '../types';

export const initialQuizQuestions: QuizQuestion[] = [
  // Food Microbiology
  {
    id: 'quiz-fm-1',
    subject: 'Food Microbiology',
    department: 'Food Technology',
    topic: 'Thermal Death Kinetics',
    question: 'What is the definition of D-value (Decimal Reduction Time) in thermal processing?',
    options: [
      'Time in minutes required to destroy 50% of the microbial population at a specific temperature',
      'Time in minutes at a given temperature to reduce the microbial population by 90% (1 log cycle)',
      'Temperature rise required to increase the inactivation rate by 10-fold',
      'Total lethality equivalent in minutes at 121.1°C'
    ],
    correctAnswerIndex: 1,
    explanation: 'D-value (Decimal Reduction Time) is the heating duration in minutes at a constant temperature needed to kill 90% (or 1 log cycle) of viable microorganisms or spores.',
    difficulty: '2 Marks'
  },
  {
    id: 'quiz-fm-2',
    subject: 'Food Microbiology',
    department: 'Food Technology',
    topic: 'Thermal Death Kinetics',
    question: 'Why is Clostridium botulinum selected as the target index microorganism for low-acid canned foods (pH > 4.5)?',
    options: [
      'It causes vibrant food coloration changes indicating spoilage',
      'It produces heat-labile enterotoxins that are harmless when heated',
      'Its endospores are the most heat-resistant pathogen capable of producing fatal neurotoxin in anaerobic canned environments',
      'It is an obligate aerobe requiring continuous oxygen supply'
    ],
    correctAnswerIndex: 2,
    explanation: 'Clostridium botulinum endospores possess extreme thermal tolerance and germinate anaerobically in low-acid foods (pH > 4.5) to produce botulinum neurotoxin. The standard 12D thermal process guarantees safety.',
    difficulty: '5 Marks'
  },
  {
    id: 'quiz-fm-3',
    subject: 'Food Microbiology',
    department: 'Food Technology',
    topic: 'Microbial Growth Kinetics',
    question: 'In which phase of the bacterial growth curve do cells divide by binary fission at their maximum constant rate?',
    options: [
      'Lag Phase',
      'Log / Exponential Phase',
      'Stationary Phase',
      'Decline / Death Phase'
    ],
    correctAnswerIndex: 1,
    explanation: 'During the Log/Exponential phase, bacteria multiply at a constant logarithmic rate through binary fission, exhibiting maximum metabolic activity and lowest generation time.',
    difficulty: '2 Marks'
  },
  {
    id: 'quiz-fm-4',
    subject: 'Food Microbiology',
    department: 'Food Technology',
    topic: 'Thermal Death Kinetics',
    question: 'What is the mathematical relationship between the z-value and D-value?',
    options: [
      'z is the temperature increase required to change the D-value by 1 log cycle (10-fold)',
      'z is equal to D divided by the holding time in seconds',
      'z is the total number of spores remaining after 12D process',
      'z is independent of temperature'
    ],
    correctAnswerIndex: 0,
    explanation: 'z-value is the temperature increase in °C or °F required to pass through one log cycle on the thermal death time (TDT) curve, reducing the D-value 10-fold.',
    difficulty: '2 Marks'
  },

  // Dairy Technology
  {
    id: 'quiz-dt-1',
    subject: 'Dairy Technology',
    department: 'Food Technology',
    topic: 'Pasteurization',
    question: 'What are the standard temperature-time parameters for HTST (High Temperature Short Time) milk pasteurization?',
    options: [
      '63°C for 30 minutes followed by ambient cooling',
      '71.7°C to 72°C for at least 15 seconds followed immediately by chilling to < 4°C',
      '100°C for 5 minutes',
      '135°C to 150°C for 2 seconds'
    ],
    correctAnswerIndex: 1,
    explanation: 'HTST continuous pasteurization requires 71.7°C - 72°C with a minimum holding time of 15 seconds in the holding tube, followed by immediate regenerative and chilling stages to < 4°C.',
    difficulty: '2 Marks'
  },
  {
    id: 'quiz-dt-2',
    subject: 'Dairy Technology',
    department: 'Food Technology',
    topic: 'Pasteurization Verification',
    question: 'Which enzyme test is universally accepted as the standard legal index for verifying the adequacy of milk pasteurization?',
    options: [
      'Catalase Test',
      'Alkaline Phosphatase (ALP) Test',
      'Methylene Blue Reduction Test (MBRT)',
      'Lactoperoxidase Test'
    ],
    correctAnswerIndex: 1,
    explanation: 'Alkaline Phosphatase has thermal resistance slightly greater than Coxiella burnetii and Mycobacterium tuberculosis. Inactivation of ALP confirms complete destruction of vegetative pathogens.',
    difficulty: '2 Marks'
  },
  {
    id: 'quiz-dt-3',
    subject: 'Dairy Technology',
    department: 'Food Technology',
    topic: 'Homogenization',
    question: 'In a two-stage homogenizer, what is the primary function of the second stage (~500 psi)?',
    options: [
      'To shatter the primary fat globules down to sub-micron size',
      'To break up fat globule clusters/clumps formed in the first stage and prevent emulsion destabilization',
      'To heat the milk up to boiling temperature',
      'To de-aerate dissolved oxygen from the milk stream'
    ],
    correctAnswerIndex: 1,
    explanation: 'The first stage (2000-2500 psi) reduces fat globule size but leads to clumping. The second stage (500 psi) separates and disperses these clumps uniformly.',
    difficulty: '5 Marks'
  },
  {
    id: 'quiz-dt-4',
    subject: 'Dairy Technology',
    department: 'Food Technology',
    topic: 'FSSAI Legal Standards',
    question: 'According to FSSAI standards, what are the minimum legal requirements for fat and SNF in Toned Milk?',
    options: [
      'Minimum 3.0% Milk Fat and 8.5% Solids-Not-Fat (SNF)',
      'Minimum 1.5% Milk Fat and 9.0% Solids-Not-Fat (SNF)',
      'Minimum 4.5% Milk Fat and 8.5% Solids-Not-Fat (SNF)',
      'Minimum 6.0% Milk Fat and 9.0% Solids-Not-Fat (SNF)'
    ],
    correctAnswerIndex: 0,
    explanation: 'Under FSSAI standards: Toned Milk must contain minimum 3.0% Fat and 8.5% SNF. (Double Toned Milk requires 1.5% Fat and 9.0% SNF).',
    difficulty: '2 Marks'
  },

  // Food Processing and Engineering
  {
    id: 'quiz-fpe-1',
    subject: 'Food Processing and Engineering',
    department: 'Food Technology',
    topic: "Planck's Freezing Equation",
    question: "What does Planck's equation estimate in food refrigeration and freezing engineering?",
    options: [
      'The rate of enzymatic browning during ambient storage',
      'The freezing time required to freeze food products of regular geometry (slab, cylinder, sphere)',
      'The Reynolds number for fluid flow in a scraped surface heat exchanger',
      'The decimal reduction time of psychrotrophs'
    ],
    correctAnswerIndex: 1,
    explanation: "Planck's equation computes the time taken to freeze foods by modeling heat conduction through the frozen layer and convection at the food surface.",
    difficulty: '5 Marks'
  },
  {
    id: 'quiz-fpe-2',
    subject: 'Food Processing and Engineering',
    department: 'Food Technology',
    topic: 'Heat Exchanger Design',
    question: 'In food processing, why is SS-316 stainless steel preferred over SS-304 for high-salt or acidic dairy and food processing equipment?',
    options: [
      'SS-316 contains 2-3% molybdenum providing superior resistance to chloride pitting and organic acid corrosion',
      'SS-316 is much cheaper and lighter',
      'SS-316 melts at 60°C for easier casting',
      'SS-316 has magnetic properties required for milk pumping'
    ],
    correctAnswerIndex: 0,
    explanation: 'The addition of 2-3% molybdenum in SS-316 food-grade stainless steel drastically enhances resistance against pitting corrosion caused by chlorides and food acids.',
    difficulty: '2 Marks'
  }
];
