/**
 * StudyMate AI Chatbot Engine
 * Supports online Groq / Gemini inference or smart offline academic tutoring grounded in KL University curriculum.
 */

export async function generateChatbotReply({ message, history = [], department = 'Food Technology', subject = 'Food Microbiology', userSettings = {} }) {
  const apiKey = userSettings.geminiApiKey || process.env.GEMINI_API_KEY || userSettings.groqApiKey || process.env.GROQ_API_KEY;
  const provider = userSettings.provider || (process.env.GEMINI_API_KEY ? 'gemini' : process.env.GROQ_API_KEY ? 'groq' : 'offline');

  // Try Online Groq
  if (provider === 'groq' && apiKey) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: userSettings.groqModel || 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: `You are StudyMate AI, the academic tutor and examination guide for KL University students in the Department of ${department}, focusing on ${subject}.
Answer clearly and authoritatively with academic precision. Use equations, step-by-step logic, and specific KL exam tips (e.g. 2M definition format, 5M comparison tables, 10M flowcharts and Critical Control Points). Use Markdown formatting.`
            },
            ...history.slice(-6).map(h => ({ role: h.role, content: h.content })),
            { role: 'user', content: message }
          ],
          temperature: 0.3
        })
      });

      if (response.ok) {
        const data = await response.json();
        const replyText = data.choices[0].message.content;
        return {
          content: replyText,
          provider: 'groq (llama-3.3-70b)',
          suggestedActions: extractSuggestions(message, subject, department)
        };
      }
    } catch (err) {
      console.warn('Groq chatbot call failed, using offline engine:', err.message);
    }
  }

  // Try Online Gemini
  if (provider === 'gemini' && apiKey) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${userSettings.geminiModel || 'gemini-1.5-flash'}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: `You are StudyMate AI, an expert KL University engineering professor for ${department} (${subject}). Explain concepts, clarify doubts, solve numerical problems, and provide exam tips for 2M, 5M, and 10M questions. Use Markdown.` }]
          },
          contents: [
            ...history.slice(-4).map(h => ({
              role: h.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: h.content }]
            })),
            { role: 'user', parts: [{ text: message }] }
          ],
          generationConfig: { temperature: 0.3 }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const replyText = data.candidates[0].content.parts[0].text;
        return {
          content: replyText,
          provider: 'gemini (1.5-flash)',
          suggestedActions: extractSuggestions(message, subject, department)
        };
      }
    } catch (err) {
      console.warn('Gemini chatbot call failed, using offline engine:', err.message);
    }
  }

  // Smart Academic Offline Tutor
  const reply = generateOfflineTutorReply(message, department, subject);
  return {
    content: reply.content,
    provider: 'StudyMate Offline Knowledge Engine',
    suggestedActions: reply.suggestedActions
  };
}

function extractSuggestions(message, subject, department) {
  const suggestions = [];
  const lower = message.toLowerCase();

  if (lower.includes('pasteur') || lower.includes('milk') || lower.includes('dairy')) {
    suggestions.push({ label: 'Generate HTST Pasteurization Notes', actionType: 'notes', payload: 'HTST Pasteurization System' });
    suggestions.push({ label: 'Take Dairy Tech Quiz', actionType: 'flashcards', payload: 'dairy-technology' });
  } else if (lower.includes('kinetics') || lower.includes('d-value') || lower.includes('microb')) {
    suggestions.push({ label: 'Generate Thermal Kinetics Notes', actionType: 'notes', payload: 'Thermal Death Kinetics (D, z, F Values)' });
    suggestions.push({ label: 'Microbiology Practice Quiz', actionType: 'flashcards', payload: 'food-microbiology' });
  } else {
    suggestions.push({ label: 'Generate Comprehensive Notes', actionType: 'notes', payload: subject });
    suggestions.push({ label: 'View Mock Exam Paper', actionType: 'mock-exam', payload: department });
  }
  return suggestions;
}

function generateOfflineTutorReply(query, dept, subj) {
  const q = query.toLowerCase();

  // D-value, z-value, F-value kinetics
  if (q.includes('d value') || q.includes('d-value') || q.includes('z value') || q.includes('f value') || q.includes('thermal death') || q.includes('botulinum')) {
    return {
      content: `### 🔬 Thermal Death Kinetics (KL Exam Guide)

In **Food Microbiology & Thermal Processing**, evaluators at KL University look for three governing parameters and their mathematical definitions:

#### 1. D-value (Decimal Reduction Time)
- **Definition:** The exposure time in minutes at a given constant temperature ($T$) required to reduce a specific microbial population by **90%** (or **1 log cycle**).
- **Governing Formula:**
  $$\\log_{10}\\left(\\frac{N_1}{N_2}\\right) = \\frac{t_2 - t_1}{D}$$
  where $N_1$ and $N_2$ are viable cell counts at times $t_1$ and $t_2$.
- **Standard Unit:** Minutes (min).
- **Benchmark:** *Clostridium botulinum* endospores have $D_{121.1^\\circ\\text{C}} = 0.21\\text{ min}$.

#### 2. z-value (Thermal Sensitivity Index)
- **Definition:** The temperature increase (in $^\\circ\\text{C}$ or $^\\circ\\text{F}$) required to effect a **10-fold (1 log)** change in the D-value.
- **Formula:**
  $$z = \\frac{T_2 - T_1}{\\log D_1 - \\log D_2}$$
- **Typical Value:** $z = 10^\\circ\\text{C}$ ($18^\\circ\\text{F}$) for *C. botulinum*.

#### 3. F-value & 12D "Botulinum Cook"
- **F-value:** The total equivalent lethality delivered to the slowest heating point (cold point) at $121.1^\\circ\\text{C}$ ($250^\\circ\\text{F}$).
- **12D Concept:** For low-acid canned foods ($\\text{pH} > 4.5$), safety requires reducing initial spore load from $10^{12}$ to $10^0$ (1 spore):
  $$F_0 = 12 \\times D_{121.1} = 12 \\times 0.21 = 2.52 \\approx 3.0\\text{ minutes}$$

> **KL In-Sem Tip:** In a 10-mark question, always plot the **Thermal Death Time (TDT)** semilog graph with $\\log D$ on the y-axis and Temperature on the x-axis!`,
      suggestedActions: [
        { label: 'Generate 10M Thermal Kinetics Notes', actionType: 'notes', payload: 'Thermal Death Kinetics (D, z, F Values)' },
        { label: 'Take Microbiology Practice Quiz', actionType: 'flashcards', payload: 'food-microbiology' }
      ]
    };
  }

  // Pasteurization & Dairy
  if (q.includes('pasteur') || q.includes('htst') || q.includes('milk') || q.includes('homogeniz') || q.includes('fdv')) {
    return {
      content: `### 🥛 HTST Pasteurization & Quality Assurance (Dairy Technology)

In KL University Dairy Technology examinations, **HTST Pasteurization** is a high-frequency 10-mark question:

#### 1. Core Operating Conditions
- **Temperature & Holding Time:** **$71.7^\\circ\\text{C}$ to $72^\\circ\\text{C}$ for at least 15 seconds** (or $63^\\circ\\text{C}$ for 30 minutes in batch LTLT).
- **Target Index Pathogen:** *Coxiella burnetii* (most heat-tolerant non-spore former) and *Mycobacterium tuberculosis*.
- **Post-Pasteurization Chilling:** Immediate rapid cooling to **$< 4^\\circ\\text{C}$** in the chilling section to prevent thermophilic spore outgrowth.

#### 2. Plate Heat Exchanger (PHE) Flow Architecture
1. **Balance Tank @ $4^\\circ\\text{C}$** $\\rightarrow$ Raw milk feed
2. **Regeneration Section I:** Incoming raw milk is pre-heated by outgoing hot pasteurized milk (achieves **$> 85\\%$ thermal energy recovery**).
3. **Heating Section ($72^\\circ\\text{C}$):** Hot water/steam brings milk to target temperature.
4. **Holding Tube (15 seconds):** Calibrated length guaranteeing minimum residence time.
5. **Flow Diversion Valve (FDV):** Automated fail-safe solenoid valve. If RTD sensor reads $< 71.7^\\circ\\text{C}$, the valve automatically diverts stream back to balance tank.
6. **Regeneration Section II & Chilling Section:** Rapidly chilled to $< 4^\\circ\\text{C}$ with chilled water/glycol.

#### 3. Verification & Legal Standards
- **Alkaline Phosphatase (ALP) Test:** Standard legal test under FSSAI. ALP enzyme is destroyed just above pasteurization threshold; negative ALP confirms adequate processing.
- **FSSAI Standards:**
  - *Toned Milk:* Min $3.0\\%$ Milk Fat, $8.5\\%$ SNF.
  - *Double Toned Milk:* Min $1.5\\%$ Milk Fat, $9.0\\%$ SNF.`,
      suggestedActions: [
        { label: 'Generate Full Pasteurization Notes', actionType: 'notes', payload: 'HTST Pasteurization System' },
        { label: 'Test Dairy Tech Flashcards', actionType: 'flashcards', payload: 'dairy-technology' }
      ]
    };
  }

  // Freezing & Planck's Equation
  if (q.includes('freez') || q.includes('planck') || q.includes('refrigerat') || q.includes('cold storage')) {
    return {
      content: `### ❄️ Planck's Freezing Equation (Food Process Engineering)

**Planck's Equation** estimates the freezing time ($t_f$) required to freeze food products of regular geometric shapes:

#### Governing Equation:
$$t_f = \\frac{\\rho \\cdot \\Delta H}{T_f - T_a} \\left[ \\frac{P \\cdot a}{h} + \\frac{R \\cdot a^2}{k_f} \\right]$$

#### Parameters & Physical Significance:
- $\\rho$: Density of the frozen food ($\\text{kg/m}^3$)
- $\\Delta H$: Latent heat of fusion of water ($\\approx 333.2\\text{ kJ/kg}$)
- $T_f$: Initial freezing temperature of food (usually $-0.5$ to $-2^\\circ\\text{C}$)
- $T_a$: Ambient freezing medium temperature (e.g., blast air @ $-35^\\circ\\text{C}$)
- $a$: Characteristic dimension (thickness for slab, diameter for cylinder/sphere)
- $h$: Surface convective heat transfer coefficient ($\\text{W/m}^2\\cdot\\text{K}$)
- $k_f$: Thermal conductivity of frozen food layer ($\\approx 1.5 - 2.2\\text{ W/m}\\cdot\\text{K}$)
- $P$ & $R$: Geometric shape constants:
  - **Infinite Flat Slab:** $P = \\frac{1}{2}, R = \\frac{1}{8}$
  - **Infinite Cylinder:** $P = \\frac{1}{4}, R = \\frac{1}{16}$
  - **Sphere:** $P = \\frac{1}{6}, R = \\frac{1}{24}$

> **Exam Tip:** Spherical shapes freeze fastest due to the lowest volume-to-surface area ratio ($P=1/6, R=1/24$).`,
      suggestedActions: [
        { label: 'Generate Food Process Eng Notes', actionType: 'notes', payload: 'Food Processing and Engineering' },
        { label: 'View In-Sem Question Paper', actionType: 'pdf-analyzer', payload: 'Food Technology' }
      ]
    };
  }

  // General Exam & Rubric Advice
  return {
    content: `### 🎓 StudyMate AI Academic Assistant

Hello! I am your AI academic tutor aligned with the **KL University curriculum for ${dept}** (current focus: *${subj}*).

#### How to Structure Answers for Maximum Marks in KL Exams:
1. **2-Mark Questions (20–40 words):**
   - Provide exact standard definition.
   - Include SI/engineering units and mathematical expression if applicable.
   - Mention reference standard (e.g. FSSAI, IEEE, ISO).
2. **5-Mark Questions (120–180 words):**
   - Heading + 2-line introduction.
   - 3 structured sub-points explaining working principle.
   - A **3-column comparison table** (Parameter, Traditional Approach, Modern Optimized Approach).
3. **10-Mark Questions (350–500 words):**
   - Synopsis / Theoretical principle with governing kinetics.
   - Clearly labeled **Mermaid or ASCII process flowchart**.
   - Critical Control Points (CCPs) or boundary safety thresholds.
   - Practical engineering application in industrial systems.

What topic or problem would you like to explore today? You can ask me to derive a formula, write an answer, or quiz you!`,
    suggestedActions: [
      { label: `Study ${subj}`, actionType: 'notes', payload: subj },
      { label: 'Take Practice Quiz', actionType: 'flashcards', payload: subj },
      { label: 'Check KL LMS Attendance', actionType: 'topic', payload: 'lms-sync' }
    ]
  };
}
