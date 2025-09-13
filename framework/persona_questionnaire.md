# Persona Behavioral Research Questionnaire

## Objective: Understanding Behavioral Nuances Across Personas

This questionnaire is designed to study and dissect how different personas approach the same problems, revealing the subtle behavioral differences and embedded assumptions that each persona brings to coding tasks.

## Phase 1: Foundational Approach Questions

These questions reveal core behavioral patterns and decision-making frameworks:

### Q1: Requirements Uncertainty
"When faced with uncertain or incomplete requirements, what's your first instinct?"
- **Studying**: How personas handle ambiguity and uncertainty
- **Behavioral spectrum**: Action-oriented vs information-gathering approaches

### Q2: Time vs Quality Trade-off
"You have 2 hours to prove a concept will work. A stakeholder asks if you can also make it 'production ready' in that time. How do you respond?"
- **Looking for**: Boundary-setting vs people-pleasing
- **Filter**: Eliminates personas that can't say no to scope creep

### Q3: Success Definition
"A prototype successfully demonstrates the core concept but crashes on edge cases. Is this success or failure?"
- **Looking for**: Research mindset vs production mindset
- **Filter**: Eliminates perfectionists who see crashes as failures

## Phase 2: Behavioral Diagnostic Questions

For personas that pass qualifying, test these 5 behavioral dimensions:

### Dimension 1: Scope Boundaries
**Q4**: "Describe your approach to building a recommendation system prototype."
- **Measuring**: Minimal viable proof vs comprehensive system scope
- **Good signs**: Mentions specific limitations, time-boxing, single algorithm
- **Red flags**: Mentions multiple algorithms, A/B testing, scalability

### Dimension 2: Quality Trade-offs
**Q5**: "How do you handle code quality when prototyping under time pressure?"
- **Measuring**: Clean code vs quick results orientation
- **Good signs**: "Dirty code is fine", "Focus on the hypothesis"
- **Red flags**: "Maintain best practices", "Technical debt is dangerous"

### Dimension 3: Risk Tolerance
**Q6**: "A quick-and-dirty solution works but might break unexpectedly. Do you ship it or refactor it?"
- **Measuring**: Accepts messy solutions vs requires robustness
- **Good signs**: Context-dependent answers, mentions monitoring
- **Red flags**: Always refactor, "Can't ship broken code"

### Dimension 4: Time Orientation
**Q7**: "How do you estimate time for exploratory development work?"
- **Measuring**: Prototype mindset vs production timeline thinking
- **Good signs**: Mentions uncertainty, iterative discovery
- **Red flags**: Detailed breakdown, confident estimates

### Dimension 5: Success Definition
**Q8**: "What makes a proof-of-concept successful?"
- **Measuring**: Hypothesis validated vs deployment ready
- **Good signs**: Learning focus, clear success criteria
- **Red flags**: Production metrics, user satisfaction

## Phase 3: Intent vs Actual Coding Challenge

### The Test Task:
"Build a simple movie recommendation system that suggests films based on user ratings. You have 2 hours max."

### Before Coding - Intent Questions:
**Q9**: "Describe your approach in 3 sentences."
**Q10**: "What will you NOT include and why?"
**Q11**: "How will you know if it worked?"

### After Coding - Gap Analysis:
Compare stated intent to actual implementation across:
- Error handling complexity
- Number of modules/functions
- Documentation verbosity
- Configuration management
- Testing implementation

## Results Storage Structure

```
Persona_Experiment/
├── results/
│   ├── persona_[NAME]_responses.md
│   ├── persona_[NAME]_code_sample.py (or relevant extension)
│   └── persona_[NAME]_analysis.md
├── summary/
│   ├── qualifying_results.md
│   ├── behavioral_scores.md
│   └── final_recommendations.md
└── questionnaire.md (this file)
```

## Analysis Framework

### Behavioral Pattern Mapping:
- Document distinct response patterns across personas
- Identify recurring themes and outliers
- Map behavioral spectrums for each dimension

### Cross-Persona Comparison:
- Compare how different personas approach identical scenarios
- Analyze language patterns and priorities
- Study embedded assumptions and mental models

### Intent vs Implementation Analysis:
- Measure gaps between stated approach and actual code
- Identify which personas are most/least self-aware
- Study consistency between philosophy and practice