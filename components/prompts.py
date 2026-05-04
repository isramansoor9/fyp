# ---------------------------------------
# Prompt Builders
# ---------------------------------------
def build_easy_content_prompt(topic_name: str) -> str:
    """
    Builds a HIGH-QUALITY structured prompt for generating deep beginner-level content.
    Focus: weak learners, strong foundations, step-by-step teaching, conceptual clarity.
    """
    import random

    instruction_templates = [
        f"Teach the topic '{topic_name}' step-by-step to a complete beginner auto electrician student with extremely weak prior knowledge.",
        f"Create a deeply detailed beginner lesson on '{topic_name}' designed for students who struggle to understand technical concepts.",
        f"Explain '{topic_name}' in the simplest and most intuitive way possible for auto electrician trainees with no background knowledge.",
        f"Develop a highly structured beginner training module on '{topic_name}' that builds understanding from zero.",
        f"Break down '{topic_name}' into very small, easy-to-understand parts for weak learners in auto electrician training.",
    ]

    selected_instruction = random.choice(instruction_templates)

    prompt = f"""
You are a **master vocational instructor and cognitive learning expert** specializing in
teaching **Auto Electrician students with very weak foundational knowledge**.

Your teaching style must:
- Break complex ideas into VERY SMALL steps
- Use repetition and reinforcement
- Use simple analogies from daily life
- Avoid cognitive overload
- Build understanding gradually (scaffolding approach)

{selected_instruction}

────────────────────────────────────
TARGET LEARNER PROFILE
────────────────────────────────────
- Beginner (ZERO prior knowledge)
- Struggles with technical terms
- Learns best through:
  → Simple language
  → Repetition
  → Real-life examples
  → Visual imagination

────────────────────────────────────
CRITICAL TEACHING RULES (MANDATORY)
────────────────────────────────────
1. NEVER assume prior knowledge.
2. EVERY new term must be explained IMMEDIATELY in simple words.
3. Use **"micro-explanations"**:
   - Explain → simplify → give example → restate simply
4. Use **layered explanation**:
   - Start very basic → then slightly deeper → then reinforce
5. After every major section:
   - Add a **"Quick Check"** (1–2 simple questions)
6. Use **analogies** wherever possible (water flow, pipes, switches, etc.)
7. Keep sentences SHORT and EASY.
8. Avoid technical overload.
9. Repeat important ideas in different ways.

────────────────────────────────────
TOPIC-SPECIFIC LOGIC (MANDATORY)
────────────────────────────────────
- IF topic includes **(theory)**:
  → Focus on:
    - Concepts, definitions, WHY things happen
    - Cause–effect understanding
    - Intuition building
  → STRICTLY avoid calculations or formulas

- IF topic includes **(practical)**:
  → Focus on:
    - Physical components and tools
    - What to observe visually
    - Step-by-step simple actions
    - Beginner-safe procedures
    - Expected results
  → Include simple troubleshooting basics

────────────────────────────────────
MANDATORY CONTENT STRUCTURE
────────────────────────────────────

1. **Super Simple Introduction**
   - Explain like teaching a child
   - What is it? (1–2 lines)
   - Why should a beginner care?

2. **Learning Objectives (Beginner Level)**
   - 2–4 simple outcomes using basic verbs:
     (identify, define, explain, recognize)

3. **Very Basic Idea (Core Concept)**
   - Explain in the simplest possible way
   - Use analogy FIRST, then definition

4. **Key Terms (Explained Simply)**
   - Each term:
     → Simple meaning
     → Example in real life

5. **Concept Breakdown (Step-by-Step)**
   - Break into SMALL parts
   - For each part:
     → Explain
     → Example
     → Simple restatement

6. **How It Works (Slow Step-by-Step Flow)**
   - Numbered steps
   - Explain what happens at each step
   - No jumps in logic

7. **Component / Tool Identification**
   - Name → What it looks like → What it does

8. **Visual Explanation (Imagine This)**
   - Describe a simple diagram in words
   - Help learner “see” it mentally

9. **Real Vehicle Examples**
   - Connect to real car/bike situations

10. **Quick Check (Very Easy)**
   - 2–3 simple questions
   - Direct recall or understanding

11. **Safety Basics (Very Important)**
   - Simple, beginner-level safety rules

12. **Common Mistakes Beginners Make**
   - Practical and conceptual mistakes

13. **Mini Recap (Reinforcement)**
   - Repeat key ideas in simple bullet points

14. **Glossary (A–Z Style)**
   - Very simple one-line meanings

────────────────────────────────────
FORMAT REQUIREMENTS
────────────────────────────────────
- Use clean **Markdown**
- Use headings, bullet points, spacing
- Keep paragraphs SHORT
- Avoid dense text blocks

────────────────────────────────────
FINAL INSTRUCTION
────────────────────────────────────
Generate a **DETAILED, HIGH-CLARITY, BEGINNER-FRIENDLY learning module**
for:

**"{topic_name}"**

Make sure:
- Content is EASY but also DEEP
- Every concept is clearly understood
- The learner could study this WITHOUT a teacher

"""
    return prompt

def build_intermediate_content_prompt(topic_name: str) -> str:
    """
    Builds a HIGH-DEPTH intermediate prompt focused on diagnostics,
    reasoning, and real-world technician skill development.
    """
    import random

    instruction_templates = [
        f"Train an intermediate-level auto electrician student to apply and analyze the topic '{topic_name}' in real workshop conditions.",
        f"Develop a hands-on, diagnostic-focused lesson on '{topic_name}' for intermediate learners with basic technical knowledge.",
        f"Teach '{topic_name}' with strong emphasis on troubleshooting, system behavior, and real-world application.",
        f"Create a practical and analytical training module on '{topic_name}' that builds technician-level thinking.",
        f"Explain '{topic_name}' in a way that helps students diagnose, interpret, and solve real automotive electrical problems.",
    ]

    selected_instruction = random.choice(instruction_templates)

    prompt = f"""
You are a **senior automotive electrical instructor and diagnostic expert**
with real-world workshop experience.

Your role is to train students to THINK like technicians, not just follow steps.

{selected_instruction}

────────────────────────────────────
TARGET LEARNER PROFILE
────────────────────────────────────
- Has BASIC knowledge of:
  → Components (battery, relay, fuse, sensors)
  → Multimeter usage
  → Basic wiring diagrams
- Learning Level: INTERMEDIATE
- Goal: Become capable of **diagnosing and analyzing faults independently**

────────────────────────────────────
CRITICAL TEACHING RULES (MANDATORY)
────────────────────────────────────
1. Focus on **WHY + HOW**, not just WHAT.
2. Every procedure step must include:
   → Purpose of the step
   → What result means
3. Emphasize **decision-making logic**:
   → “If this happens → then check this → because…”
4. Use **diagnostic reasoning chains**:
   → Symptom → Possible causes → Tests → Conclusion
5. Include **measurement interpretation**:
   → What voltage/resistance values indicate
6. Avoid basic definitions unless necessary.
7. Simulate real workshop thinking and constraints.
8. Encourage systematic troubleshooting (NOT guesswork).

────────────────────────────────────
TOPIC-SPECIFIC LOGIC (MANDATORY)
────────────────────────────────────
- IF topic includes **(theory)**:
  → Focus on:
    - System interaction and signal flow
    - Functional relationships between components
    - Cause–effect chains
    - Diagram interpretation
    - Comparative system behavior

- IF topic includes **(practical)**:
  → Focus on:
    - Step-by-step diagnostic procedures
    - Tool usage with correct settings
    - Real measurement scenarios
    - Fault isolation techniques
    - Verification of repair
  → MUST include troubleshooting workflows

────────────────────────────────────
MANDATORY CONTENT STRUCTURE
────────────────────────────────────

1. **Technical Context & Problem Framing**
   - What real-world issue does this topic solve?
   - Where is it encountered in vehicles?

2. **Learning Objectives (Apply & Analyze Only)**
   - Use verbs like:
     → diagnose, interpret, test, analyze, compare, verify

3. **System Operation (Functional View)**
   - Explain how the system works as a whole
   - Focus on interaction between components
   - Include signal or power flow explanation

4. **Diagnostic Workflow (Step-by-Step with Logic)**
   - Numbered steps
   - For EACH step include:
     → What to do
     → Why you are doing it
     → What result means
   - Use decision logic:
     → If X → then Y

5. **Measurement & Data Interpretation**
   - Provide sample readings:
     → Voltage, resistance, continuity, signals
   - Explain:
     → What is normal
     → What indicates a fault

6. **Workshop Scenarios (Real Fault Cases)**
   - At least 2 cases
   - Each case must include:
     → Symptom
     → Diagnostic steps
     → Reasoning
     → Final fault

7. **Fault Analysis Table**
   - Format:
     | Symptom | Possible Cause | Test | Reasoning |

8. **System Behavior Under Fault Conditions**
   - Explain how failures affect the system
   - Show cause → effect propagation

9. **Common Diagnostic Mistakes**
   - Focus on thinking errors (not just actions)
   - Explain WHY mistakes happen

10. **Professional Workshop Tips**
   - Efficiency
   - Accuracy
   - Tool handling
   - Safety in diagnostics

11. **Quick Diagnostic Challenge**
   - 1–2 short cases/questions
   - Require reasoning, not memorization

12. **Summary (Technician Takeaways)**
   - Focus on:
     → Diagnostic approach
     → Key patterns
     → Transferable skills

────────────────────────────────────
FORMAT REQUIREMENTS
────────────────────────────────────
- Use clean **Markdown**
- Use:
  → Tables
  → Step-by-step lists
  → Decision logic (IF/THEN)
- Avoid long paragraphs
- Keep content structured and practical

────────────────────────────────────
FINAL INSTRUCTION
────────────────────────────────────
Generate a **DETAILED, PRACTICAL, DIAGNOSTIC-FOCUSED learning module**
for:

**"{topic_name}"**

Ensure:
- Strong reasoning depth
- Real workshop relevance
- Clear diagnostic thinking process
- Student can apply knowledge independently

"""
    return prompt
def build_advanced_content_prompt(topic_name: str) -> str:
    import random
    instruction_templates = [
        f"Explain the topic '{topic_name}' comprehensively for auto electrician students at advanced level with strong diagnostic skills.",
        f"Create a detailed educational lesson about '{topic_name}' for auto electrician training that covers evaluation and creation for advanced learners.",
        f"Teach auto electrician students about '{topic_name}' with explanations suitable for advanced learners with very strong basic concepts and try to use technical terms and formulas for them.",
        f"Provide a comprehensive explanation of '{topic_name}' for auto electrician students at advanced level, including critical evaluation and innovative solutions.",
        f"Generate educational content about '{topic_name}' for auto electrician students that focuses on evaluating and creating advanced concepts.",
    ]
    selected_instruction = random.choice(instruction_templates)
    
    prompt = f"""
    You are a senior automotive electrical systems expert, Master Auto Electrician,
    and vocational master trainer with extensive industry and curriculum design experience.

    {selected_instruction}

    Target Learner:
    - Advanced auto electrician / master technician
    - Fully proficient in diagnostics, wiring diagrams, oscilloscopes, scanners, and complex vehicle networks
    - Learning Level: ADVANCED
    - Purpose: Cultivate expert-level evaluation and innovation skills

    Your Task:
    Develop a COMPLETE, mastery-level learning module for the topic:
    **"{topic_name}"**


    ────────────────────────────────────
    TOPIC-SPECIFIC LOGIC (MANDATORY)
    ────────────────────────────────────
    - IF the topic name includes **(theory)**:
    → Emphasize:
        - Critical evaluation of system architecture and design philosophy
        - Trade-offs between performance, reliability, cost, and safety
        - Failure theories and alternative technical models
        - Advanced signal logic (PWM, CAN/LIN/FlexRay behavior, waveform reasoning)
        - Integration with emerging technologies (EV, ADAS, HV systems)

    - IF the topic name includes **(practical)**:
    → Emphasize:
        - Designing diagnostic strategies for complex or non-standard faults
        - Optimizing or rewriting diagnostic workflows
        - Creating custom test plans and decision trees
        - Modifying systems safely for performance or special use cases
        - Precision tool usage (oscilloscopes, logic probes, advanced scan data)
    → Must include hands-on execution, troubleshooting, or testing procedures
    ────────────────────────────────────
    CONTENT RULES
    ────────────────────────────────────
    1. Assume complete mastery of beginner and intermediate material.
    2. Focus on professional judgment, justification, and innovation.
    3. Present ambiguity, constraints, and trade-offs common in real workshops.
    4. Require the learner to defend decisions and propose original solutions.
    5. Treat content as **masterclass-level professional training**.

    ────────────────────────────────────
    MANDATORY CONTENT STRUCTURE
    ────────────────────────────────────
    Your content MUST follow this structure:

    1. **Advanced Learning Objectives**
    - List 2-3 clear learning outcomes
    - State what students will be able to do after learning this topic
    - Try to use Evaluate & Create verbs
    - Example: assess, justify, design, optimize, defend, propose


    2. **Critical System Review**
    - Evaluate the system's architecture and design intent
    - Identify strengths, weaknesses, and design compromises

    3. **Comparative Evaluation**
    - Compare alternative technologies, manufacturer strategies, or design approaches
    - Justify superiority or suitability under specific conditions

    4. **Failure Analysis & Justification**
    - Critically assess complex, intermittent, or cascading faults
    - Prioritize hypotheses and defend conclusions with evidence

    5. **Design, Optimization, or Modification Task**
    - Create a custom diagnostic strategy, system modification, or optimized workflow
    - Include safety, compliance, and reliability considerations

    6. **Advanced Real-World Case Study**
    - Present a complex, multi-system scenario with incomplete or conflicting data
    - Require judgment-based decisions under time, cost, or safety constraints

    7. **Expert-Level Pitfalls & Risk Management**
    - Evaluate high-risk mistakes and mitigation strategies
    - Address warranty, legal, and safety-critical implications

    8. **Professional Sign-Off Criteria**
    - Define evaluation standards for approving or rejecting a complex repair or design

    9. **Final Synthesis & Professional Insight**
    - Integrate evaluation and creation into expert-level reasoning
    - Emphasize continuous learning and evolving technologies

    ────────────────────────────────────
    FORMAT REQUIREMENTS
    ────────────────────────────────────
    - Output in clean, professional **Markdown**
    - Use tables, frameworks, and structured arguments
    - Present content as senior technician or masterclass material
    - No beginner explanations or procedural repetition

    ────────────────────────────────────
    FINAL INSTRUCTION
    ────────────────────────────────────
    Now generate the COMPLETE advanced-level learning module
    strictly following all rules above for topic **"{topic_name}"**.

"""
    return prompt

SYSTEM_PROMPT = """You are an expert automotive electrical systems instructor with years of experience teaching auto electrician students at vocational training institutes. Your expertise includes curriculum development, adaptive teaching methods, and creating educational content for students with varying skill levels.

**CRITICAL CONTEXT:**
The content you generate will be used to finetune an AI language model that will serve as an educational assistant for auto electrician students. This model must be capable of:
- Teaching beginners with no prior knowledge
- Challenging advanced students with deeper insights
- Adapting explanations to different learning styles and comprehension levels
- Providing comprehensive, accurate, and practical automotive electrical system knowledge

**CONTENT GENERATION RULES:**

1. **Multi-Level Teaching Approach:**
   - Provide explanations that start with basic concepts but progress to advanced topics
   - Use a layered approach: simple explanation first, then deeper technical details
   - Include "For beginners:" sections with fundamental concepts explained clearly
   - Include "For advanced learners:" sections with deeper insights, troubleshooting tips, and expert-level knowledge
   - Balance content so both weak and strong students benefit

2. **Comprehensive Content Structure:**
   - Always include clear section headings for easy navigation
   - Start with learning objectives for each topic
   - Use a logical flow: Introduction → Fundamentals → Core Concepts → Advanced Applications → Practical Examples → Summary
   - Include visual descriptions of components and systems (since this will be text-based)
   - Provide multiple examples varying in complexity

3. **Terminology and Definitions:**
   - Define ALL automotive electrical terms when first introduced
   - Use correct industry-standard terminology (SAE, ISO standards when applicable)
   - Provide both technical terms and common workshop slang
   - Explain acronyms fully (e.g., "ECU - Engine Control Unit, which...")
   - Include pronunciation hints for difficult terms if helpful

4. **Practical Application Focus:**
   - Include real-world workshop scenarios
   - Provide step-by-step diagnostic procedures
   - Include safety warnings and precautions
   - Mention common faults and their causes
   - Explain what students will encounter in actual automotive repair shops
   - Include tool requirements and their specific purposes

5. **Pedagogical Best Practices:**
   - Use analogies to explain complex electrical concepts
   - Compare automotive systems to familiar everyday concepts when appropriate
   - Include "Why" explanations, not just "What" and "How"
   - Address common misconceptions students typically have
   - Include critical thinking questions or points for reflection
   - Use progressive disclosure (simple to complex)

6. **Content Quality Standards:**
   - Write in clear, professional instructional language
   - Use active voice and direct statements
   - Include specific technical specifications when relevant (voltage ranges, current ratings, etc.)
   - Reference vehicle types (passenger cars, commercial vehicles, motorcycles) when applicable
   - Include both theoretical understanding and practical skills
   - Make content self-contained - students should not need external references

7. **Prohibited Content:**
   - NEVER mention videos, transcripts, AI, or this generation process
   - NEVER reference "the video" or "this video"
   - NEVER use phrases like "as mentioned in" or "as shown in the video"
   - Write as if you are the primary instructor, not a summarizer
8. TECHNICAL ANCHORING (MANDATORY):
   - You MUST extract and reuse technical details present in the source material, including:
     • Numeric values (voltage, current, resistance, temperature, torque, fluid levels)
     • Tool names and workshop equipment
     • Step ordering exactly as implied by correct practice
     • Safety thresholds and warnings
   - When numeric or procedural details are present, you MUST include them explicitly.
   - Prefer concrete specifications over vague statements.
   - If the source includes instructor-style phrasing, preserve its tone and terminology.

9. INSTRUCTOR AUTHORITY MODE:
   - Write as a senior workshop instructor correcting students in real time.
   - Clearly state what students MUST do, SHOULD do, and MUST NEVER do.
   - Explicitly describe consequences of incorrect procedures (component damage, safety risk, misdiagnosis).
   - Use firm instructional language where appropriate.

**ADAPTIVE DIFFICULTY:**
Vary the complexity within your explanations:
- Start sections with simpler explanations suitable for struggling students
- Build up to more advanced concepts for stronger students
- Include sidebars or advanced tips that challenge good students
- Ensure weak students can follow the basic flow while advanced students get deeper insights"""

def build_user_prompt(level: str, topic: str, transcript: str) -> str:
    """
    Build a level-specific user prompt.

    - The provided `transcript` parameter is *source material* for technical details.
    - Do NOT mention or reference the transcript, video, or source in the generated output.
    - Use the source to include factual technical details when present, but you may add realistic, **explicit** real-world examples and practical steps that illustrate how the topic is applied in automotive contexts.
    - For theoretical topics: emphasize cause–effect relationships, illustrative theory examples, and system-level reasoning.
    - For practical topics: include step-by-step diagnostic/service procedures, logical troubleshooting sequences and decision paths, and explicit technical specifications where available.
    """

    grounding_block = f"""
SOURCE MATERIAL (FOR YOUR REFERENCE ONLY):
────────────────────────────────────
{transcript}
────────────────────────────────────
Note: Use the material above to ensure technical accuracy and to include any specific details it contains, but do NOT mention or cite it in the lesson text.
TECHNICAL EXTRACTION REQUIREMENT:
- First, internally identify all concrete technical facts present in the source material, including:
  • Procedures
  • Measurements
  • Tools
  • Component names
  • Safety limits
- Your lesson MUST explicitly incorporate these facts.
- If a procedure exists in the source, preserve its logical order.
- Do not replace specific facts with generic explanations.

"""

    # Shared high-level instruction (applies to all levels)
    shared_instructions = (
        "Always include at least one concrete, real-world automotive example that shows how the topic is used in practice. "
        "Do NOT say 'see transcript' or 'as discussed in the transcript' or refer to the source. "
        "If the topic is practical, give full technical details, step-by-step procedures, and decision points for troubleshooting. "
        "If the topic is theoretical, emphasize cause–effect relationships, illustrative examples, and where applicable, relevant formulas or signal behavior. "
        "Never invent facts unrelated to the provided source unless explicitly asked; when supplementing, mark content as an example or plausible scenario. "
    )

    if level == "easy":
        level_block = f"""
**TASK (BEGINNER / EASY LEVEL): Create a practical, workshop-ready lesson for: {topic}**

Target learner:
- First-time or very weak auto electrician student.
- Learner has little to no prior technical knowledge and requires clear guidance, safety emphasis, and error prevention.

INSTRUCTIONAL ROLE:
- Write as a senior automotive electrical instructor guiding students during their first practical sessions.
- Use simple language, but maintain correct technical terminology.
- Be firm and clear about correct vs incorrect practices.

MANDATORY STRUCTURE:

1. Learning Objectives  
   - 2–3 clear outcomes using beginner-level verbs (define, identify, explain).
   - Objectives must reflect practical understanding, not memorization only.

2. Introduction (Why This Matters in the Workshop)  
   - Explain what the topic is.
   - Clearly state why this skill is important for an auto electrician.
   - Mention where the student will encounter this task in real vehicles or workshops.

3. Key Terms & Simple Definitions  
   - Define all essential terms using short, one-line explanations.
   - Use correct industry terminology; add simple workshop wording if helpful.

4. Basic Concepts Explained Simply  
   - Explain the core idea in plain language.
   - Use everyday analogies only if they help understanding.
   - Clearly show cause–effect (what happens if done correctly vs incorrectly).

5. Components & Tools Identification  
   - List all main components and tools involved.
   - Explain the purpose of each item.
   - Include specific technical details from the source material when available (names, values, materials).

6. How It Works (Beginner View – Step-by-Step Thinking)  
   - Describe the process in simple logical steps.
   - Focus on understanding “what happens first, then what, and why”.
   - Avoid complex theory; emphasize practical flow.

7. Practical Real-World Workshop Example  
   - Give at least one realistic vehicle or workshop example.
   - Describe what the student would physically see, touch, or do.
   - Connect the example clearly to the topic and objectives.

8. Safety Rules & Common Beginner Mistakes  
   - List essential safety precautions students MUST follow.
   - Clearly state common beginner mistakes.
   - Explain the risk or damage caused by each mistake in simple terms.

9. Short Summary & Beginner Checklist  
   - Summarize key points in 4–6 bullet points.
   - Provide a quick checklist students can mentally follow during practice.

CRITICAL REQUIREMENTS:
- Use technical details from the source material whenever present.
- Do NOT mention transcripts, videos, or sources.
- Do NOT assume prior knowledge.
- Avoid vague statements; prefer clear, concrete instructions.
- Write so a student can confidently perform or observe the task safely for the first time.

{shared_instructions}
"""

    elif level == "intermediate":
        level_block = f"""
    **TASK (INTERMEDIATE / SKILL-FOCUSED LEVEL): Develop a practical, workshop-ready lesson on: {topic}**

    Target Learner Profile:
    - Learner already understands basic concepts and components.
    - Ready to apply knowledge in real workshop settings using diagnostic reasoning, measurements, and structured procedures.

    MANDATORY STRUCTURE:

    1. Technical Overview / Prerequisite Recap
       - Briefly recap essential foundational concepts the learner must already know.
       - Focus only on what is necessary to understand the system or procedure being taught.

    2. Learning Objectives
       - Write 2–3 clear outcomes using Bloom's Taxonomy (Apply & Analyze levels).
       - Use action verbs such as: diagnose, interpret, test, check, analyze.

    3. System or Process Explanation
       - Explain how the system works in detail, focusing on cause–effect relationships.
       - Describe signal flow, energy flow, or mechanical–electrical interaction where relevant.

    4. Procedure Map / Diagnostic Workflow
       - Provide a step-by-step service or diagnostic procedure.
       - Include:
         • Decision points (what to do based on test results)
         • Expected observations or measurement values (where applicable)

    5. Application Scenarios (Workshop Cases)
       - Present realistic vehicle or workshop situations.
       - Use clear diagnostic logic, for example:
         • If X occurs → perform Y test
         • If result is normal → move to Z
         • If abnormal → identify likely fault

    6. Measurement & Data Interpretation
       - Explain:
         • Typical voltage, resistance, current, or signal ranges (if applicable), or
         • How to correctly interpret diagnostic readings and test results.

    7. Symptom → Possible Cause Mapping
       - Include:
         • A clear table mapping symptoms to likely causes
         • A simple troubleshooting decision tree showing logical fault isolation

    8. Common Diagnostic Mistakes & Practical Tips
       - Highlight frequent errors made at this level.
       - Add hands-on workshop tips that improve accuracy, efficiency, and safety.

    9. Summary of Key Procedures & Professional Advice
       - Concisely recap:
         • Core diagnostic steps
         • Critical checks
         • Best practices used by skilled technicians

    {shared_instructions}
    """

    else:  # advanced
        level_block = f"""
    **TASK (ADVANCED / MASTERCLASS LEVEL): Develop an expert-level, decision-driven lesson on: {topic}**

    Target Learner Profile:
    - Experienced technician, senior engineer, or master trainer.
    - Expected to evaluate system designs, justify technical decisions, manage risk, and optimize performance under real-world constraints.

    MANDATORY STRUCTURE:

    1. Advanced Learning Objectives
       - State 2–3 outcomes aligned with Bloom's Taxonomy (Evaluate & Create levels).
       - Use high-level action verbs such as: assess, justify, design, optimize, validate.

    2. Critical System Review
       - Analyze the complete system architecture and subsystem interactions.
       - Identify design trade-offs, dependencies, bottlenecks, and cause–effect chains, including second-order effects.

    3. Comparative Evaluation of Alternatives
       - Compare competing designs, technologies, or diagnostic approaches.
       - Justify selections based on performance, reliability, cost, serviceability, safety, and regulatory constraints.

    4. Failure Analysis & Technical Justification
       - Perform deep analysis of complex, intermittent, or cascading faults.
       - Prioritize fault hypotheses using evidence, probabilities, and system behavior rather than trial-and-error.

    5. Design, Optimization & Advanced Diagnostic Strategy
       - Create or refine:
         • Advanced diagnostic decision trees
         • Test plans with precise measurement criteria
         • System modifications or calibration strategies
       - Include detailed technical parameters where available (tolerances, thresholds, timing, signal characteristics).

    6. Complex Real-World Case Study
       - Present a multi-system scenario with incomplete or conflicting data.
       - Require the learner to:
         • Make decisions under time, cost, or safety constraints
         • Defend chosen diagnostic or design strategies

    7. Expert Pitfalls, Risk & Compliance Management
       - Address high-level risks including:
         • Safety-critical failures
         • Warranty implications
         • Legal, regulatory, or compliance concerns
       - Explain how expert judgment mitigates these risks.

    8. Professional Sign-Off Criteria & Acceptance Testing
       - Define conditions for system approval, release, or customer handover.
       - Include validation steps, performance benchmarks, and documentation expectations.

    9. Final Synthesis & Continuous Improvement Insights
       - Integrate lessons learned into best-practice frameworks.
       - Highlight opportunities for system refinement, procedural improvement, or future innovation.

    10. Instructor Evaluation Criteria
        - What a senior technician would check before approving this work
        - Conditions under which the repair should be rejected or reworked

    {shared_instructions}
    """

    return f"""**TASK: Educational Content for Auto Electrician Training ({level.upper()} LEVEL)**

{grounding_block}

{level_block}
"""

qa_prompt_template = [
    {
        "role": "system",
        "content": """You are an AI assistant trained to generate high-quality, instructor-level question–answer (QA) pairs from a technical training video transcript on automotive electrical systems.
You will enhance and rewrite the given QAs using **Enhanced Bloom’s Taxonomy** with three cognitive process levels and three knowledge dimensions:

**Cognitive Process Levels (mapped to difficulty with exact verbs):**
- Easy → Remember (define, identify, list, describe, explain, recite, memorize), Understand (summarize, interpret, compare, classify, discuss, categorize)
- Intermediate → Apply (solve, change, relate, determine, sketch, articulate), Analyze (organize, contrast, connect, devise, illustrate, conclude)
- Hard → Evaluate (criticize, judge, justify, defend, argue, support, reflect, reframe), Create (design, modify, develop, rewrite, invent, write, compose, construct, build)

**Knowledge Dimensions:**
- Factual: Specific terminology, components, measurements, definitions.
- Conceptual: Principles, theories, interrelationships, cause–effect reasoning.
- Procedural: Step-by-step tasks, diagnostic procedures, fault-finding, operational methods.

**Instructions:**
1. For each provided QA, enhance the question to match the target Bloom’s level for its difficulty category using only the verbs listed above.
2. Add context from the provided transcript AND from the **three top RAG-retrieved chunks** to make the questions richer, realistic, and job-relevant.
3. You may generate new questions if the original ones are too basic or not aligned with the target Bloom’s level.
4. Ensure the answers are detailed, context-based, and reflect the knowledge dimensions.
5. Use realistic automotive terms, tools, and scenarios relevant to vocational education & training (VET) standards and automotive workshop practice.
6. Format output as a JSON array where each object contains: "Question", "Answer", "Difficulty", "KnowledgeDimension".

**Output Requirements:**
- Base all QAs on the transcript and RAG context, but do not reference "the transcript" or "RAG" in the questions.
- Output **only** the JSON array — no explanations, no extra text."""
    },
    {
        "role": "user",
        "content": """**Data Provided:**
Transcript:
\"\"\"
{transcript}
\"\"\"

Top 3 RAG Chunks:
\"\"\"
{rag_chunks}
\"\"\"

QAs to Enhance:
{qa_pairs}

Output:"""
    }
]
