#!/usr/bin/env python3
"""
Concurrent persona testing with all personas and questions.
"""

import asyncio
from pathlib import Path
from persona_harness import PersonaHarness

def load_persona(persona_file: str) -> str:
    """Load persona context from markdown file."""
    with open(f"test_data/{persona_file}", 'r') as f:
        return f.read()

def load_questions(questions_file: str) -> list:
    """Load questions from markdown file."""
    with open(f"test_data/{questions_file}", 'r') as f:
        content = f.read()

    questions = []
    sections = content.split('## ')[1:]  # Skip the header

    for section in sections:
        lines = section.strip().split('\n')
        question_id = lines[0]
        question_text = '\n'.join(lines[1:]).strip()
        questions.append({
            "id": question_id,
            "text": question_text
        })

    return questions

async def run_sequential_test(persona_files: list, questions_file: str):
    """Run test processing one persona at a time for mental continuity."""
    harness = PersonaHarness()
    questions = load_questions(questions_file)

    # Load all persona data
    personas_data = []
    for persona_file in persona_files:
        persona_name = Path(persona_file).stem
        persona_context = load_persona(persona_file)
        personas_data.append({
            "name": persona_name,
            "context": persona_context
        })

    # Run personas sequentially (one at a time) for mental continuity
    summary = await harness.test_all_personas_sequential(personas_data, questions)
    return summary

def main():
    """Run concurrent test with all personas and all questions."""
    persona_files = [
        "startup_cto.md",
        "phd_student.md",
        "consulting_analyst.md",
        "ml_engineer.md",
        "data_scientist.md",
        "product_engineer.md"
    ]

    print("Starting sequential persona testing for mental continuity...")
    # Process one persona at a time (all their questions concurrently)
    summary = asyncio.run(run_sequential_test(persona_files, "questions.md"))
    print(f"Testing complete! Check results/ directory for output files.")

if __name__ == "__main__":
    main()
