# Persona Experiment

Research experiment to study behavioral differences between AI coding assistant personas using Ollama local models.

## Setup

```bash
# Install dependencies
uv sync

# Activate virtual environment
source .venv/bin/activate
```

## Usage

```bash
# Run pilot test with 2 personas and 2 questions
python main.py
```

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
- `startup_cto.md`, `phd_student.md` - Individual persona definitions
- `questions.md` - Test questions

### `/results/`
Raw outputs from persona testing (generated during tests)
- `raw_responses/` - Individual JSON response files

### Root Files
- `persona_harness.py` - Core testing harness
- `main.py` - Pilot test runner (entry point)
- `pyproject.toml` - UV project configuration