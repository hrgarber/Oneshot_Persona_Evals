#!/usr/bin/env python3
"""
Quick pilot test with 2 personas and 2 questions.
"""

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

def run_pilot(persona_files: list, questions_file: str):
    """Run pilot test with specified persona files and questions."""
    harness = PersonaHarness()
    questions = load_questions(questions_file)

    for persona_file in persona_files:
        persona_name = Path(persona_file).stem
        persona_context = load_persona(persona_file)

        print(f"\nTesting {persona_name}...")
        results = harness.test_persona(
            persona_name=persona_name,
            persona_context=persona_context,
            questions=questions
        )
        print(f"Completed {len(results)} questions")

def main():
    """Run pilot test with 2 personas and 2 questions."""
    run_pilot(
        persona_files=["startup_cto.md", "phd_student.md"],
        questions_file="questions.md"
    )

if __name__ == "__main__":
    main()
