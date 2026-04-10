# ---------------------------------------
# Prompt Builders
# ---------------------------------------
def build_easy_content_prompt(topic_name: str) -> str:
    """
    Builds a structured prompt for generating easy base content.
    Focus on basic concepts, simple language, beginner-friendly.
    """
    import random
    instruction_templates = [
        f"Explain the topic '{topic_name}' comprehensively for auto electrician students at beginner level with very weak basic concepts.",
        f"Create a detailed educational lesson about '{topic_name}' for auto electrician training that covers basics for beginners.",
        f"Teach auto electrician students about '{topic_name}' with explanations suitable for beginners learners with very weak basic concepts.",
        f"Provide a comprehensive explanation of '{topic_name}' for auto electrician students at beginner level, including fundamental concepts.",
        f"Generate educational content about '{topic_name}' for auto electrician students that adapts to beginner learning levels.",
    ]
    selected_instruction = random.choice(instruction_templates)
    
    prompt = f"""
You are an expert vocational education content creator and certified Auto Electrician Instructor,
specializing in beginner-level automotive electrical systems training.

{selected_instruction}

Target Learner:
- Auto electrician student with VERY BASIC or NO prior knowledge
- Learning Level: BEGINNER
- Purpose: Build strong foundational understanding


Your Task:
Create a COMPLETE, beginner-friendly learning module for the topic:
**"{topic_name}"**


────────────────────────────────────
TOPIC-SPECIFIC LOGIC (MANDATORY)
────────────────────────────────────
- IF the topic name includes **(theory)**:
  → Focus heavily on:
    - Definitions and concepts
    - Basic principles and "why it works"
    - Cause–effect relationships
    - Simple physics explanations using analogies
    - Conceptual understanding (NOT formulas or calculations)

- IF the topic name includes **(practical)**:
  → Focus heavily on:
    - Identifying physical components and tools
    - Basic safety rules for beginners
    - Very simple, observation-based steps
    - What the learner should SEE / RECOGNIZE
    - What a correct outcome looks like
  → Must include hands-on execution, troubleshooting, or testing procedures

────────────────────────────────────
CONTENT RULES
────────────────────────────────────
1. Assume ZERO prior knowledge.
2. Explain EVERY technical term before using it.
3. Use simple, clear language suitable for first-time learners.
4. Use real automotive examples familiar to beginners (battery, bulb, wire, fuse).
5. Avoid jargon unless clearly explained.
6. Emphasize safety awareness at a basic level.

────────────────────────────────────
MANDATORY CONTENT STRUCTURE
────────────────────────────────────
Your content MUST be structured as follows:

1. **Introduction**
   - What is this topic in the simplest terms?
   - Why is it important for a beginner auto electrician?

2. **Learning Objectives**
   - List 2-3 clear learning outcomes
   - State what students will be able to do after learning this topic
   - Try to use Remember & Understand verbs
   - Example: define, identify, explain, list

3. **Key Terms & Definitions**
   - Simple glossary of essential terms
   - One-line beginner-friendly definitions

4. **Basic Concepts Explained Simply**
   - Clear explanations using analogies
   - No formulas or calculations
   - Focus on "what it is" and "why it matters"

5. **Component / Tool Identification**
   - List basic components or tools
   - Explain each item's basic role

6. **How It Works (Beginner View)**
   - Step-by-step conceptual flow
   - Explain what happens, not how to fix or test

7. **Visual Explanation (Text-Based)**
   - Describe simple diagrams or images
   - Example: "A simple circuit with a battery, wire, and bulb"

8. **Simple Real-World Automotive Examples**
   - Relate the concept to common vehicle situations

9. **Safety First (Beginner Level)**
   - Fundamental precautions only
   - No advanced workshop procedures

10. **Common Beginner Misunderstandings**
    - Simple misconceptions or safety mistakes to avoid

11. **Short Summary & Recap**
    - 3–5 key points the learner must remember

12. **Glossary of Terms**
    - Alphabetical list of key beginner terms

────────────────────────────────────
FORMAT REQUIREMENTS
────────────────────────────────────
- Output in clean, well-structured **Markdown**
- Use headings, bullet points, and short paragraphs
- No advanced math, diagnostics, or repair steps

────────────────────────────────────
FINAL INSTRUCTION
────────────────────────────────────
Now generate the COMPLETE beginner-level learning module
strictly following all rules above for topic **"{topic_name}"**.

"""
    return prompt

def build_intermediate_content_prompt(topic_name: str) -> str:
    import random
    instruction_templates = [
        f"Explain the topic '{topic_name}' comprehensively for auto electrician students at intermediate level with basic foundational knowledge.",
        f"Create a detailed educational lesson about '{topic_name}' for auto electrician training that covers application and analysis for intermediate learners.",
        f"Teach auto electrician students about '{topic_name}' with explanations suitable for intermediate learners who can identify components and use basic tools.",
        f"Provide a comprehensive explanation of '{topic_name}' for auto electrician students at intermediate level, including practical applications and diagnostics.",
        f"Generate educational content about '{topic_name}' for auto electrician students that focuses on applying and analyzing concepts.",
    ]
    selected_instruction = random.choice(instruction_templates)
    
    prompt = f"""
    You are an expert vocational education content creator and automotive electrical systems specialist
    with strong hands-on workshop and diagnostic experience.

    {selected_instruction}

    Target Learner:
    - Auto electrician student with BASIC foundational knowledge
    - Can identify components, read simple wiring diagrams, and use a multimeter safely
    - Learning Level: INTERMEDIATE
    - Purpose: Develop practical skills and analytical thinking

    Your Task:
    Create a COMPLETE, skill-focused learning module for the topic:
    **"{topic_name}"**



    ────────────────────────────────────
    TOPIC-SPECIFIC LOGIC (MANDATORY)
    ────────────────────────────────────
    - IF the topic name includes **(theory)**:
    → Emphasize:
        - How components and subsystems interact
        - Signal flow and operational logic
        - Cause–effect relationships within the system
        - Comparative analysis of similar circuits or architectures
        - Interpretation of diagrams, graphs, or data

    - IF the topic name includes **(practical)**:
    → Emphasize:
        - Step-by-step diagnostic or service procedures
        - Logical troubleshooting sequences and decision paths
        - Correct tool selection and settings
        - Interpreting measurements (voltage, resistance, continuity, data signals)
        - Differentiating symptoms from root causes
    → Must include hands-on execution, troubleshooting, or testing procedures

    ────────────────────────────────────
    CONTENT RULES
    ────────────────────────────────────
    1. Assume prerequisite knowledge is already known (basic terms, symbols, safety).
    2. Avoid basic definitions unless clarification is necessary for application.
    3. Focus on **doing**, **interpreting**, and **reasoning**, not memorizing.
    4. Use realistic automotive workshop contexts and constraints.
    5. Present information as if training a technician for real-world jobs.

    ────────────────────────────────────
    MANDATORY CONTENT STRUCTURE
    ────────────────────────────────────
    Your content MUST follow this structure:

    1. **Technical Overview / Prerequisite Recap**
    - Brief recap of relevant prior knowledge
    - Define the real-world problem this topic addresses

    2. **Learning Objectives**
    - Use ONLY Apply & Analyze verbs
    - Example: diagnose, calculate, interpret, compare, troubleshoot

    2. **Learning Objectives**
   - List 2-3 clear learning outcomes
   - State what students will be able to do after learning this topic
   - Try to use Apply & Analyze verbs
    - Example: diagnose, calculate, interpret, compare, troubleshoot

    3. **System-Level Explanation / Operational Logic**
    - Explain how the system works as a whole
    - Show interactions between components or modules

    4. **Procedure Map or Diagnostic Workflow**
    - Step-by-step application or troubleshooting sequence
    - Use logical order and decision points

    5.Must include **Application Scenarios (Workshop-Based)**
    - Present realistic vehicle fault cases
    - Guide the learner through applying procedures or principles

    6. **Analysis Exercises**
    - Compare two systems, methods, or circuit types
    - Interpret sample data (multimeter readings, diagrams, waveforms)

    7. **Component Interaction & Fault Analysis**
    - Explain how faults propagate through the system
    - Include tables such as:
        - Symptom | Possible Cause | Reasoning

    8. **Common Diagnostic Mistakes & Why They Occur**
    - Focus on reasoning errors and misinterpretation of data

    9. **Practical Workshop Tips**
    - Efficiency, accuracy, and professional best practices

    10. **Summary of Key Takeaways**
        - Focus on transferable procedures and analytical frameworks

    ────────────────────────────────────
    FORMAT REQUIREMENTS
    ────────────────────────────────────
    - Output in clean, well-structured **Markdown**
    - Use tables, flowcharts (text-based), and bullet points where helpful
    - Include decision-based logic (e.g., "If voltage is present → analyze ground path")
    - No beginner explanations or procedural repetition

    ────────────────────────────────────
    FINAL INSTRUCTION
    ────────────────────────────────────
    Now generate the COMPLETE intermediate-level learning module
    strictly following all rules above for topic **"{topic_name}"**.

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
