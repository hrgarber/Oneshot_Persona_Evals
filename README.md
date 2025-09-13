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