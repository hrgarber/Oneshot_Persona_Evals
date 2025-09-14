#!/usr/bin/env python3
"""
Simple harness for testing personas against questions.
"""

import asyncio
import json
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional

from openai import AsyncOpenAI


class PersonaHarness:
    def __init__(self, 
                 model_name: str = "qwen3-coder", 
                 base_url: str = "http://localhost:11434/v1",
                 openai_api_key: Optional[str] = None,
                 openai_model: str = "gpt-4o-2024-08-06"):
        """Initialize with Ollama configuration and OpenAI fallback."""
        # Primary client (Ollama)
        self.client = AsyncOpenAI(
            base_url=base_url,
            api_key="ollama",
            max_retries=2,
            timeout=300.0  # 5 minutes for Ollama
        )
        self.model_name = model_name
        
        # Fallback client (OpenAI)
        self.openai_client = None
        self.openai_model = openai_model
        if openai_api_key:
            self.openai_client = AsyncOpenAI(
                api_key=openai_api_key,
                max_retries=3,
                timeout=120.0  # 2 minutes for OpenAI
            )
        
        self.results_dir = Path("results")
        self._setup_directories()

    def _setup_directories(self):
        """Create results directory structure."""
        (self.results_dir / "raw_responses").mkdir(parents=True, exist_ok=True)

    async def _ask_question(self, persona_name: str, persona_context: str, question: Dict[str, str]) -> Dict:
        """Ask a single question to a persona asynchronously with OpenAI fallback."""
        system_prompt = f"""You are roleplaying as: {persona_name}

{persona_context}

Respond to questions from this persona's perspective. Be authentic to this role."""

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": question["text"]}
        ]

        # Try Ollama first
        try:
            response = await self.client.chat.completions.create(
                model=self.model_name,
                messages=messages,
                temperature=0.1
            )

            result = {
                "persona_name": persona_name,
                "question_id": question["id"],
                "question_text": question["text"],
                "response": response.choices[0].message.content,
                "timestamp": datetime.now().isoformat(),
                "model": self.model_name,
                "provider": "ollama"
            }

            print(f"✓ Ollama: {persona_name} - {question['id']}")
            return result

        except Exception as ollama_error:
            print(f"⚠ Ollama failed for {persona_name} - {question['id']}: {ollama_error}")
            
            # Try OpenAI fallback if available
            if self.openai_client:
                try:
                    print(f"🔄 Trying OpenAI fallback for {persona_name} - {question['id']}")
                    response = await self.openai_client.chat.completions.create(
                        model=self.openai_model,
                        messages=messages,
                        temperature=0.1
                    )

                    result = {
                        "persona_name": persona_name,
                        "question_id": question["id"],
                        "question_text": question["text"],
                        "response": response.choices[0].message.content,
                        "timestamp": datetime.now().isoformat(),
                        "model": self.openai_model,
                        "provider": "openai",
                        "fallback_reason": str(ollama_error)
                    }

                    print(f"✓ OpenAI: {persona_name} - {question['id']}")
                    return result

                except Exception as openai_error:
                    print(f"❌ Both providers failed for {persona_name} - {question['id']}")
                    return {
                        "persona_name": persona_name,
                        "question_id": question["id"],
                        "question_text": question["text"],
                        "error": f"Ollama: {ollama_error}; OpenAI: {openai_error}",
                        "timestamp": datetime.now().isoformat(),
                        "provider": "failed"
                    }
            else:
                print(f"❌ No fallback available for {persona_name} - {question['id']}")
                return {
                    "persona_name": persona_name,
                    "question_id": question["id"],
                    "question_text": question["text"],
                    "error": f"Ollama failed: {ollama_error}; No OpenAI fallback configured",
                    "timestamp": datetime.now().isoformat(),
                    "provider": "failed"
                }

    async def test_persona(self, persona_name: str, persona_context: str, questions: List[Dict[str, str]]) -> List[Dict]:
        """Test a persona against a list of questions concurrently."""
        print(f"Starting concurrent testing for {persona_name} with {len(questions)} questions...")

        # Create all tasks for concurrent execution
        tasks = [
            self._ask_question(persona_name, persona_context, question)
            for question in questions
        ]

        # Execute all questions concurrently
        results = await asyncio.gather(*tasks)

        # Filter out error results for successful responses count
        successful_results = [r for r in results if "error" not in r]

        # Save single session file with all responses
        session_timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        session_filename = f"{persona_name}_session_{session_timestamp}.json"
        session_filepath = self.results_dir / "raw_responses" / session_filename

        session_data = {
            "persona_name": persona_name,
            "session_timestamp": session_timestamp,
            "model": self.model_name,
            "total_questions": len(questions),
            "successful_responses": len(successful_results),
            "responses": results
        }

        with open(session_filepath, 'w') as f:
            json.dump(session_data, f, indent=2)

        print(f"Session saved: {session_filename} ({len(successful_results)}/{len(questions)} successful)")
        return results

    async def test_all_personas_sequential(self, personas_data: List[Dict], questions: List[Dict[str, str]]) -> Dict:
        """Test personas one at a time for mental continuity, with concurrent questions per persona."""
        total_requests = len(personas_data) * len(questions)
        print(f"Starting sequential persona testing: {len(personas_data)} personas × {len(questions)} questions = {total_requests} total requests")
        print(f"Processing one persona at a time for mental continuity")

        start_time = datetime.now()
        persona_results = {}

        for i, persona_data in enumerate(personas_data, 1):
            persona_name = persona_data["name"]
            print(f"\n=== Processing Persona {i}/{len(personas_data)}: {persona_name} ===")

            # Run all questions for this persona concurrently
            results = await self.test_persona(
                persona_name=persona_name,
                persona_context=persona_data["context"],
                questions=questions
            )

            persona_results[persona_name] = results
            successful_count = sum(1 for r in results if "error" not in r)
            print(f"✓ {persona_name} complete: {successful_count}/{len(questions)} successful")

        end_time = datetime.now()

        # Calculate summary statistics
        duration = end_time - start_time
        all_results = [result for results in persona_results.values() for result in results]
        total_successful = sum(len([r for r in results if "error" not in r]) for results in persona_results.values())

        summary = {
            "total_requests": len(all_results),
            "successful_requests": total_successful,
            "duration_seconds": duration.total_seconds(),
            "personas_tested": len(persona_results),
            "questions_per_persona": len(questions)
        }

        print(f"\n=== SEQUENTIAL PERSONA TESTING COMPLETE ===")
        print(f"Total requests: {summary['total_requests']}")
        print(f"Successful: {summary['successful_requests']}")
        print(f"Duration: {summary['duration_seconds']:.2f} seconds")
        print(f"Speed: {summary['successful_requests'] / summary['duration_seconds']:.2f} successful/second")

        return summary