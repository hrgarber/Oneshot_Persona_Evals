# Persona Experiment

Research experiment to study behavioral differences between AI coding assistant personas using Ollama local models.

## Overview

Tests 6 different personas (startup CTO, PhD student, consulting analyst, ML engineer, data scientist, product engineer) against 11 behavioral questions to understand how different professional contexts influence AI responses.

## Setup

```bash
# Install dependencies
uv sync

# Ensure Ollama is running with qwen3-coder model
ollama pull qwen3-coder
ollama serve
```

## Usage

```bash
# Run complete experiment with all personas and questions
uv run main.py
```

**Processing Approach:**
- One persona at a time for mental continuity
- All 11 questions per persona run concurrently for efficiency
- Results saved as individual session files per persona

## Folder Structure

### `/framework/`
Core research design and methodology
- `persona_questionnaire.md` - Questions to test each persona
- `candidate_personas.md` - Personas selected for testing
- `research_outcomes_framework.md` - How to extract value from results
- `test_approach_analysis.md` - Technical approach analysis
- `original_conversation.md` - Original conversation that inspired this experiment

### `/test_data/`
Test inputs - individual persona and question files
- `startup_cto.md`, `phd_student.md`, `consulting_analyst.md`, etc. - Individual persona definitions
- `questions.md` - Complete 11-question behavioral questionnaire

### `/results/`
Raw outputs from persona testing (generated during tests)
- `raw_responses/` - Individual JSON session files per persona

### Root Files
- `persona_harness.py` - Core async testing harness with concurrency control
- `main.py` - Sequential persona test runner (entry point)
- `pyproject.toml` - UV project configuration

## Results

Each persona generates a session file containing:
- All 11 question responses
- Timestamps and model information
- Success/failure counts
- Individual response metadata

Files named: `{persona_name}_session_{timestamp}.json`

## Procedural Narrative: How This Repository Came to Be

This repository represents a systematic exploration into AI persona behavioral differences, born from a practical frustration with AI coding assistants that consistently over-engineered solutions when rapid prototyping was needed.

### The Problem Discovery

The journey began with a user working in data science who found Claude Code's default "enterprise readiness" approach fundamentally misaligned with their needs for quick proof-of-concept development. While Claude Code excelled at production-ready solutions, it struggled with the "good enough" mindset required for research and rapid experimentation.

### Research Framework Development

Through extensive conversation and iteration, we developed a comprehensive research framework to study this phenomenon:

1. **Identified the Core Issue**: Different stakeholder perspectives on what constitutes "done"
   - Researcher: Hypothesis validated
   - Engineer: Deployment ready
   - Product Manager: User value demonstrated
   - Business: ROI demonstrated

2. **Designed Behavioral Dimensions**: Five key areas where personas might differ
   - Scope boundaries (minimal vs comprehensive)
   - Quality trade-offs (speed vs robustness)
   - Risk tolerance (ship broken vs perfect)
   - Time orientation (sprint vs marathon)
   - Success definition (hypothesis vs deployment)

3. **Created Systematic Testing Approach**: 11-question behavioral questionnaire covering:
   - Foundational approach questions (3)
   - Behavioral diagnostic questions (5)
   - Intent vs implementation questions (3)

### Technical Implementation

The implementation evolved through several iterations:

**Phase 1: Basic Sequential Testing**
- Simple harness with synchronous OpenAI SDK
- Individual question files, hardcoded personas
- Sequential processing (slow, but working)

**Phase 2: Concurrent Optimization**
- Switched to AsyncOpenAI for performance
- Attempted full concurrency (66 simultaneous requests)
- Hit timeout issues with local Ollama models

**Phase 3: Smart Batching**
- Implemented controlled concurrency (3 requests at a time)
- Better error handling and progress tracking
- Still mixed personas and questions together

**Phase 4: Mental Continuity Focus**
- **Key insight**: Process one persona at a time for consistent thinking
- Each persona answers all 11 questions concurrently
- Maintains persona mental state while optimizing efficiency
- Perfect balance of performance and response quality

### Persona Selection and Testing

We carefully selected 6 personas representing different professional contexts that regularly make trade-offs under constraints:

- **Startup CTO**: Extreme time pressure, runway concerns
- **PhD Research Student**: Hypothesis-driven, experimental mindset
- **Consulting Analyst**: Client-focused, deadline-driven
- **ML Engineer**: Model-focused, iterative development
- **Data Scientist**: Analysis-driven, messy exploration comfortable
- **Product Engineer**: Growth-focused, strategic shortcuts

Each persona was tested against the complete 11-question behavioral questionnaire using the qwen3-coder model through Ollama.

### Analysis and Validation

Using parallel agent analysis, we discovered:

**Clear Behavioral Spectrum**: Personas arranged perfectly from execution-first (1.2/5) to research-first (4.8/5), confirming our hypothesis that professional context fundamentally shapes technical decision-making.

**Consistent Language Patterns**: Each persona developed distinct vocabulary, decision frameworks, and activation/deactivation words that can be used for targeted prompting.

**Hypothesis Validation**: All personas performed as expected, with some showing even more sophistication than anticipated in their reasoning and meta-cognitive awareness.

### Practical Applications

This research provides a foundation for:

1. **Targeted AI Prompting**: Know which persona to activate for different types of work
2. **Language Optimization**: Use specific words and phrases that trigger desired behaviors
3. **Context Investment Guidelines**: Understand when rich persona backstories add value
4. **Prompt Engineering Playbook**: Systematic approach to persona selection and activation

### Methodological Insights

The experiment revealed several important principles:

- **Persona consistency matters more than speed**: Sequential processing per persona yields better behavioral coherence
- **Professional context is a powerful behavioral modifier**: More effective than explicit constraints alone
- **Mental continuity**: Processing all questions for one persona together maintains consistent reasoning patterns
- **Observable behaviors reveal embedded assumptions**: What personas do matters more than what they say they'll do

This repository demonstrates that AI persona research can be both systematic and practically applicable, providing concrete tools for improving human-AI collaboration in technical contexts.