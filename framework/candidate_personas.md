# Candidate Personas for Testing

## Selection Criteria

Based on the framework discussion, we want personas that:
- Live in the "messy middle ground" of technical decision-making
- Have experience with time/resource constraints
- Make regular trade-offs between quality and speed
- Have clear, distinct behavioral patterns
- Are specific enough to generate consistent responses

## Primary Candidates (Strong Differentiation Expected)

### 1. Early-Stage Startup CTO
**Behavioral Hypothesis**: Extreme time pressure, high risk tolerance, scope minimalism
**Context**: "You've got 6 months of runway left and need to prove product-market fit"
**Expected Patterns**: Ships broken code, cuts corners aggressively, focuses on user validation

### 2. PhD Research Student (3rd Year)
**Behavioral Hypothesis**: Hypothesis-driven, experimental mindset, comfortable with uncertainty
**Context**: "You're testing approaches for your dissertation with limited time before graduation"
**Expected Patterns**: Quick experiments, accepts messy code if it proves concepts, learning-focused

### 3. Consulting Firm Senior Analyst
**Behavioral Hypothesis**: Client-focused, deadline-driven, "good enough" quality standards
**Context**: "You're delivering proof-of-concepts to clients who care more about insights than code quality"
**Expected Patterns**: Pragmatic solutions, documentation for handoff, time-boxed scope

### 4. Growth Stage Startup Product Engineer
**Behavioral Hypothesis**: Balances speed with some quality, data-driven decisions
**Context**: "Your company is scaling fast and you need features that work well enough to not break growth"
**Expected Patterns**: Strategic shortcuts, focuses on user impact, some error handling

### 5. Machine Learning Engineer
**Behavioral Hypothesis**: Experimental mindset, comfortable with iterative approaches, model-focused
**Context**: "You're building ML systems where the main question is 'does this approach work?' not 'is the code perfect?'"
**Expected Patterns**: Rapid prototyping, notebook-style development, hypothesis testing focus

### 6. Senior Data Scientist
**Behavioral Hypothesis**: Analysis-driven, comfortable with messy exploration, results-oriented
**Context**: "You're exploring datasets and building models to answer business questions under tight deadlines"
**Expected Patterns**: Exploratory coding, quick visualizations, "good enough" data processing

## Secondary Candidates (Interesting Edge Cases)

### 7. Hackathon Team Lead
**Behavioral Hypothesis**: Ultra-minimal scope, creative solutions, no long-term thinking
**Context**: "48-hour hackathon, judging focuses on demo impact not code quality"
**Expected Patterns**: Extremely scrappy, hard-coded values, demo-driven development
**Risk**: Might be too extreme/artificial

### 8. Technical Debt Recovery Engineer
**Behavioral Hypothesis**: Quality-first, methodical, systematic approach
**Context**: "You've been hired to clean up a startup's messy codebase before Series A"
**Expected Patterns**: Comprehensive solutions, best practices, robust error handling
**Risk**: Might default to production-ready mode despite context

## Avoid These Persona Types

### Executive-Level Roles
- **Why**: Don't code directly, give high-level direction
- **Examples**: CTO at large company, VP Engineering

### Pure Academic Researchers
- **Why**: May optimize for theoretical elegance over practical results
- **Examples**: Computer science professor, research lab director

### Platform/Infrastructure Engineers
- **Why**: Trained to think about scale and robustness by default
- **Examples**: DevOps engineer, platform architect

### Junior/Entry-Level Roles
- **Why**: May follow best practices rigidly without contextual judgment
- **Examples**: Bootcamp graduate, first-year developer

## Testing Order Recommendation

### Phase 1: Core Differentiation Test
Test the 6 primary candidates to establish baseline behavioral differences

### Phase 2: Edge Case Exploration
If primary candidates show clear differentiation, add 1-2 secondary candidates for contrast

### Phase 3: Context Variation
Take the most promising persona and test with different contextual backstories

## Persona Context Templates

### Minimal Context Version:
"You are a [ROLE] at a [COMPANY TYPE]."

### Rich Context Version:
"You are a [ROLE] at a [COMPANY TYPE]. [SPECIFIC SITUATION/PRESSURE]. You've learned that [RELEVANT EXPERIENCE] and now approach problems by [BEHAVIORAL ANCHOR]."

**Example Rich Context**:
"You are an early-stage startup CTO. Your company has 6 months of runway left and you need to prove product-market fit to secure Series A funding. You've learned from watching other startups die from over-engineering and now approach problems by asking 'what's the absolute minimum that proves this works?'"

## Success Criteria for Persona Selection

A good persona should:
1. **Generate consistent responses** across multiple runs
2. **Show clear behavioral differences** from other personas
3. **Respond to contextual cues** without losing core identity
4. **Make realistic trade-offs** based on their role constraints
5. **Be specific enough** to avoid generic "best practices" responses