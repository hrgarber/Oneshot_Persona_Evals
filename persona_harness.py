#!/usr/bin/env python3
"""
Simple harness for testing personas against questions.
"""

import json
from datetime import datetime
from pathlib import Path
from typing import Dict, List

from openai import OpenAI


class PersonaHarness:
    def __init__(self, model_name: str = "gpt-oss:latest", base_url: str = "http://localhost:11434/v1"):
        """Initialize with Ollama configuration."""
        self.client = OpenAI(
            base_url=base_url,
            api_key="ollama"
        )
        self.model_name = model_name
        self.results_dir = Path("results")
        self._setup_directories()

    def _setup_directories(self):
        """Create results directory structure."""
        (self.results_dir / "raw_responses").mkdir(parents=True, exist_ok=True)

    def test_persona(self, persona_name: str, persona_context: str, questions: List[Dict[str, str]]) -> List[Dict]:
        """Test a persona against a list of questions."""
        system_prompt = f"""You are roleplaying as: {persona_name}

{persona_context}

Respond to questions from this persona's perspective. Be authentic to this role."""

        session_timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        results = []

        for question in questions:
            try:
                response = self.client.chat.completions.create(
                    model=self.model_name,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": question["text"]}
                    ],
                    temperature=0.1
                )

                result = {
                    "persona_name": persona_name,
                    "question_id": question["id"],
                    "question_text": question["text"],
                    "response": response.choices[0].message.content,
                    "timestamp": datetime.now().isoformat(),
                    "model": self.model_name
                }

                # Save individual response
                filename = f"{persona_name}_{question['id']}_{session_timestamp}.json"
                filepath = self.results_dir / "raw_responses" / filename

                with open(filepath, 'w') as f:
                    json.dump(result, f, indent=2)

                results.append(result)
                print(f"Saved: {filename}")

            except Exception as e:
                print(f"Error with {question['id']}: {e}")

        return results