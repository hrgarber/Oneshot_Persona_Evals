#!/usr/bin/env python3
"""
Web interface for persona evaluation experiments.
Simple Flask server with research-focused GUI.
"""

import asyncio
import json
import os
import signal
import sys
import uuid
from datetime import datetime
from pathlib import Path
from typing import Dict, List

from flask import Flask, render_template, request, jsonify, send_from_directory
from flask_socketio import SocketIO, emit
import threading
from dotenv import load_dotenv

from persona_harness import PersonaHarness

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = 'research-persona-evals'
socketio = SocketIO(app, cors_allowed_origins="*")

# Signal handler for clean shutdown
def signal_handler(sig, frame):
    print('\nShutting down server...')
    sys.exit(0)

signal.signal(signal.SIGINT, signal_handler)
signal.signal(signal.SIGTERM, signal_handler)

# Global experiment state
current_experiment = None
experiment_results = {}

# Data file paths
DATA_DIR = Path("data")
PERSONAS_FILE = DATA_DIR / "personas.json"
QUESTIONS_FILE = DATA_DIR / "questions.json"
QUESTIONNAIRES_FILE = DATA_DIR / "questionnaires.json"

def ensure_data_dir():
    """Ensure data directory exists."""
    DATA_DIR.mkdir(exist_ok=True)

def load_json_data(file_path: Path, default_data: List = None):
    """Load JSON data from file, return default if file doesn't exist."""
    if default_data is None:
        default_data = []
    
    if not file_path.exists():
        return default_data
    
    try:
        with open(file_path, 'r') as f:
            return json.load(f)
    except (json.JSONDecodeError, IOError):
        return default_data

def save_json_data(file_path: Path, data: List):
    """Save JSON data to file."""
    ensure_data_dir()
    with open(file_path, 'w') as f:
        json.dump(data, f, indent=2)

def load_personas():
    """Load personas from JSON file."""
    return load_json_data(PERSONAS_FILE)

def save_personas(personas: List[Dict]):
    """Save personas to JSON file."""
    save_json_data(PERSONAS_FILE, personas)

def load_questions():
    """Load questions from JSON file."""
    return load_json_data(QUESTIONS_FILE)

def save_questions(questions: List[Dict]):
    """Save questions to JSON file."""
    save_json_data(QUESTIONS_FILE, questions)

def load_questionnaires():
    """Load questionnaires from JSON file."""
    return load_json_data(QUESTIONNAIRES_FILE)

def save_questionnaires(questionnaires: List[Dict]):
    """Save questionnaires to JSON file."""
    save_json_data(QUESTIONNAIRES_FILE, questionnaires)

def load_persona_files():
    """Load all available persona files."""
    persona_dir = Path("test_data")
    personas = []
    
    for file_path in persona_dir.glob("*.md"):
        if file_path.name != "questions.md":
            with open(file_path, 'r') as f:
                content = f.read()
                personas.append({
                    "id": file_path.stem,
                    "name": file_path.stem.replace('_', ' ').title(),
                    "filename": file_path.name,
                    "content": content
                })
    
    return personas

def load_questions():
    """Load questions from questions.md file."""
    questions_file = Path("test_data/questions.md")
    if not questions_file.exists():
        return []
    
    with open(questions_file, 'r') as f:
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

def load_experiment_history():
    """Load previous experiment results."""
    results_dir = Path("results/raw_responses")
    if not results_dir.exists():
        return []
    
    experiments = []
    for file_path in results_dir.glob("*.json"):
        try:
            with open(file_path, 'r') as f:
                data = json.load(f)
                experiments.append({
                    "filename": file_path.name,
                    "persona_name": data.get("persona_name", "Unknown"),
                    "timestamp": data.get("session_timestamp", "Unknown"),
                    "total_questions": data.get("total_questions", 0),
                    "successful_responses": data.get("successful_responses", 0),
                    "model": data.get("model", "Unknown")
                })
        except Exception as e:
            print(f"Error loading {file_path}: {e}")
    
    return sorted(experiments, key=lambda x: x["timestamp"], reverse=True)

@app.route('/')
def index():
    """Main experiment interface."""
    return render_template('index.html')

@app.route('/api/personas')
def get_personas():
    """Get all available personas."""
    return jsonify(load_personas())

@app.route('/api/personas', methods=['POST'])
def create_persona():
    """Create a new persona."""
    data = request.get_json()
    
    if not data or not data.get('name') or not data.get('description'):
        return jsonify({"error": "Name and description are required"}), 400
    
    personas = load_personas()
    
    # Generate unique ID
    persona_id = data.get('id') or f"persona_{uuid.uuid4().hex[:8]}"
    
    # Check if ID already exists
    if any(p['id'] == persona_id for p in personas):
        return jsonify({"error": "Persona ID already exists"}), 400
    
    new_persona = {
        "id": persona_id,
        "name": data['name'],
        "description": data['description'],
        "behavioral_profile": data.get('behavioral_profile', '')
    }
    
    personas.append(new_persona)
    save_personas(personas)
    
    return jsonify(new_persona), 201

@app.route('/api/personas/<persona_id>', methods=['PUT'])
def update_persona(persona_id):
    """Update an existing persona."""
    data = request.get_json()
    
    if not data or not data.get('name') or not data.get('description'):
        return jsonify({"error": "Name and description are required"}), 400
    
    personas = load_personas()
    
    # Find persona to update
    persona_index = None
    for i, persona in enumerate(personas):
        if persona['id'] == persona_id:
            persona_index = i
            break
    
    if persona_index is None:
        return jsonify({"error": "Persona not found"}), 404
    
    # Update persona
    personas[persona_index].update({
        "name": data['name'],
        "description": data['description'],
        "behavioral_profile": data.get('behavioral_profile', '')
    })
    
    save_personas(personas)
    
    return jsonify(personas[persona_index])

@app.route('/api/personas/<persona_id>', methods=['DELETE'])
def delete_persona(persona_id):
    """Delete a persona."""
    personas = load_personas()
    
    # Find and remove persona
    personas = [p for p in personas if p['id'] != persona_id]
    
    save_personas(personas)
    
    return jsonify({"message": "Persona deleted successfully"})

@app.route('/api/questions')
def get_questions():
    """Get all available questions."""
    return jsonify(load_questions())

@app.route('/api/questions', methods=['POST'])
def create_question():
    """Create a new question."""
    data = request.get_json()
    
    if not data or not data.get('question'):
        return jsonify({"error": "Question text is required"}), 400
    
    questions = load_questions()
    
    # Generate unique ID
    question_id = data.get('id') or f"q{len(questions)+1:02d}_{uuid.uuid4().hex[:8]}"
    
    # Check if ID already exists
    if any(q['id'] == question_id for q in questions):
        return jsonify({"error": "Question ID already exists"}), 400
    
    new_question = {
        "id": question_id,
        "question": data['question']
    }
    
    questions.append(new_question)
    save_questions(questions)
    
    return jsonify(new_question), 201

@app.route('/api/questions/<question_id>', methods=['PUT'])
def update_question(question_id):
    """Update an existing question."""
    data = request.get_json()
    
    if not data or not data.get('question'):
        return jsonify({"error": "Question text is required"}), 400
    
    questions = load_questions()
    
    # Find question to update
    question_index = None
    for i, question in enumerate(questions):
        if question['id'] == question_id:
            question_index = i
            break
    
    if question_index is None:
        return jsonify({"error": "Question not found"}), 404
    
    # Update question
    questions[question_index]['question'] = data['question']
    
    save_questions(questions)
    
    return jsonify(questions[question_index])

@app.route('/api/questions/<question_id>', methods=['DELETE'])
def delete_question(question_id):
    """Delete a question."""
    questions = load_questions()
    
    # Find and remove question
    questions = [q for q in questions if q['id'] != question_id]
    
    save_questions(questions)
    
    return jsonify({"message": "Question deleted successfully"})

@app.route('/api/questionnaires')
def get_questionnaires():
    """Get all available questionnaires."""
    questionnaires = load_questionnaires()
    questions = load_questions()
    
    # Enrich questionnaires with question details
    for questionnaire in questionnaires:
        questionnaire['question_details'] = []
        for q_id in questionnaire.get('questions', []):
            question = next((q for q in questions if q['id'] == q_id), None)
            if question:
                questionnaire['question_details'].append(question)
    
    return jsonify(questionnaires)

@app.route('/api/questionnaires', methods=['POST'])
def create_questionnaire():
    """Create a new questionnaire."""
    data = request.get_json()
    
    if not data or not data.get('name') or not data.get('questions'):
        return jsonify({"error": "Name and questions are required"}), 400
    
    questionnaires = load_questionnaires()
    
    # Generate unique ID
    questionnaire_id = data.get('id') or f"questionnaire_{uuid.uuid4().hex[:8]}"
    
    # Check if ID already exists
    if any(q['id'] == questionnaire_id for q in questionnaires):
        return jsonify({"error": "Questionnaire ID already exists"}), 400
    
    new_questionnaire = {
        "id": questionnaire_id,
        "name": data['name'],
        "description": data.get('description', ''),
        "questions": data['questions'],
        "created_at": datetime.utcnow().isoformat() + 'Z',
        "updated_at": datetime.utcnow().isoformat() + 'Z'
    }
    
    questionnaires.append(new_questionnaire)
    save_questionnaires(questionnaires)
    
    return jsonify(new_questionnaire), 201

@app.route('/api/questionnaires/<questionnaire_id>', methods=['PUT'])
def update_questionnaire(questionnaire_id):
    """Update an existing questionnaire."""
    data = request.get_json()
    
    if not data or not data.get('name') or not data.get('questions'):
        return jsonify({"error": "Name and questions are required"}), 400
    
    questionnaires = load_questionnaires()
    
    # Find questionnaire to update
    questionnaire_index = None
    for i, questionnaire in enumerate(questionnaires):
        if questionnaire['id'] == questionnaire_id:
            questionnaire_index = i
            break
    
    if questionnaire_index is None:
        return jsonify({"error": "Questionnaire not found"}), 404
    
    # Update questionnaire
    questionnaires[questionnaire_index].update({
        "name": data['name'],
        "description": data.get('description', ''),
        "questions": data['questions'],
        "updated_at": datetime.utcnow().isoformat() + 'Z'
    })
    
    save_questionnaires(questionnaires)
    
    return jsonify(questionnaires[questionnaire_index])

@app.route('/api/questionnaires/<questionnaire_id>', methods=['DELETE'])
def delete_questionnaire(questionnaire_id):
    """Delete a questionnaire."""
    questionnaires = load_questionnaires()

    # Find and remove questionnaire
    questionnaires = [q for q in questionnaires if q['id'] != questionnaire_id]

    save_questionnaires(questionnaires)

    return jsonify({"message": "Questionnaire deleted successfully"})

@app.route('/api/questionnaires/<questionnaire_id>/full', methods=['GET'])
def get_questionnaire_with_questions(questionnaire_id):
    """Return questionnaire with resolved question texts."""
    try:
        questionnaires = load_questionnaires()
        questions = load_questions()

        # Create question lookup map
        question_map = {q['id']: q for q in questions}

        # Find questionnaire and resolve questions
        questionnaire = next((q for q in questionnaires if q['id'] == questionnaire_id), None)
        if not questionnaire:
            return jsonify({"error": "Questionnaire not found"}), 404

        # Resolve question IDs to full question objects
        resolved_questions = []
        for qid in questionnaire.get('questions', []):
            if qid in question_map:
                resolved_questions.append(question_map[qid])
            else:
                resolved_questions.append({
                    'id': qid,
                    'text': f'Question {qid} not found',
                    'question': f'Question {qid} not found'
                })

        # Return questionnaire with resolved questions
        result = dict(questionnaire)
        result['resolved_questions'] = resolved_questions

        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/experiments')
def get_experiments():
    """Get experiment history."""
    return jsonify(load_experiment_history())

@app.route('/api/openai-key', methods=['GET'])
def get_openai_key():
    """Get the current OpenAI API key (masked for security)."""
    key = os.getenv('OPENAI_API_KEY', '')
    if key:
        # Return masked key for security
        masked_key = key[:8] + '*' * (len(key) - 12) + key[-4:] if len(key) > 12 else '*' * len(key)
        return jsonify({"key": masked_key, "configured": True})
    else:
        return jsonify({"key": "", "configured": False})

@app.route('/api/openai-key', methods=['POST'])
def set_openai_key():
    """Set the OpenAI API key in the .env file."""
    data = request.get_json()
    new_key = data.get('key', '').strip()
    
    if not new_key:
        return jsonify({"error": "API key is required"}), 400
    
    # Update .env file
    env_path = Path('.env')
    env_content = ""
    
    if env_path.exists():
        with open(env_path, 'r') as f:
            lines = f.readlines()
        
        # Update existing OPENAI_API_KEY line or add it
        key_found = False
        for i, line in enumerate(lines):
            if line.startswith('OPENAI_API_KEY='):
                lines[i] = f'OPENAI_API_KEY={new_key}\n'
                key_found = True
                break
        
        if not key_found:
            lines.append(f'OPENAI_API_KEY={new_key}\n')
        
        env_content = ''.join(lines)
    else:
        env_content = f'# OpenAI API Configuration\nOPENAI_API_KEY={new_key}\n'
    
    # Write updated content
    with open(env_path, 'w') as f:
        f.write(env_content)
    
    # Update environment variable for current session
    os.environ['OPENAI_API_KEY'] = new_key
    
    return jsonify({"message": "API key updated successfully", "configured": True})

@app.route('/api/experiment/<filename>')
def get_experiment_details(filename):
    """Get detailed results for a specific experiment."""
    file_path = Path("results/raw_responses") / filename
    if not file_path.exists():
        return jsonify({"error": "Experiment not found"}), 404
    
    try:
        with open(file_path, 'r') as f:
            data = json.load(f)
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/start_experiment', methods=['POST'])
def start_experiment():
    """Start a new experiment."""
    global current_experiment
    
    if current_experiment and current_experiment.get('status') == 'running':
        return jsonify({"error": "Experiment already running"}), 400
    
    data = request.json
    selected_personas = data.get('personas', [])
    selected_questionnaire = data.get('questionnaire', None)
    use_openai_fallback = data.get('use_openai_fallback', True)
    
    if not selected_personas or not selected_questionnaire:
        return jsonify({"error": "Must select at least one persona and one questionnaire"}), 400
    
    # Start experiment in background thread
    experiment_id = datetime.now().strftime("%Y%m%d_%H%M%S")
    current_experiment = {
        "id": experiment_id,
        "status": "running",
        "personas": selected_personas,
        "questionnaire": selected_questionnaire,
        "use_openai_fallback": use_openai_fallback,
        "start_time": datetime.now().isoformat(),
        "progress": {}
    }
    
    # Run experiment in background
    thread = threading.Thread(target=run_experiment_background, args=(current_experiment,))
    thread.daemon = True
    thread.start()
    
    return jsonify({"experiment_id": experiment_id, "status": "started"})

def run_experiment_background(experiment_config):
    """Run experiment in background thread."""
    global current_experiment, experiment_results
    
    try:
        # Create new event loop for this thread
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        # Initialize harness
        openai_api_key = None
        if experiment_config['use_openai_fallback']:
            openai_api_key = os.getenv('OPENAI_API_KEY')
        
        harness = PersonaHarness(
            openai_api_key=openai_api_key,
            openai_model="gpt-4o-2024-08-06"
        )
        
        # Load persona data
        all_personas = load_personas()
        personas_data = []
        for persona_id in experiment_config['personas']:
            persona = next((p for p in all_personas if p['id'] == persona_id), None)
            if persona:
                personas_data.append({
                    "name": persona['id'],
                    "context": persona['description']
                })
        
        # Load questionnaire and questions
        all_questionnaires = load_questionnaires()
        questionnaire = next((q for q in all_questionnaires if q['id'] == experiment_config['questionnaire']), None)
        if not questionnaire:
            raise Exception(f"Questionnaire {experiment_config['questionnaire']} not found")
        
        all_questions = load_questions()
        questions_data = []
        for question_id in questionnaire['questions']:
            question = next((q for q in all_questions if q['id'] == question_id), None)
            if question:
                questions_data.append(question)
        
        # Run experiment
        socketio.emit('experiment_status', {
            'status': 'running',
            'message': f'Starting experiment with {len(personas_data)} personas and questionnaire "{questionnaire["name"]}" ({len(questions_data)} questions)'
        })
        
        # Run personas sequentially
        for i, persona_data in enumerate(personas_data):
            persona_name = persona_data["name"]
            
            socketio.emit('experiment_progress', {
                'current_persona': persona_name,
                'persona_index': i + 1,
                'total_personas': len(personas_data),
                'status': f'Processing {persona_name}...'
            })
            
            # Run all questions for this persona
            results = loop.run_until_complete(
                harness.test_persona(
                    persona_name=persona_name,
                    persona_context=persona_data["context"],
                    questions=questions_data
                )
            )
            
            # Store results
            experiment_results[persona_name] = results
            
            # Emit progress update
            successful_count = sum(1 for r in results if "error" not in r)
            socketio.emit('persona_complete', {
                'persona_name': persona_name,
                'successful': successful_count,
                'total': len(questions_data),
                'results': results
            })
        
        # Experiment complete
        current_experiment['status'] = 'completed'
        current_experiment['end_time'] = datetime.now().isoformat()
        
        socketio.emit('experiment_complete', {
            'status': 'completed',
            'results': experiment_results,
            'experiment_id': experiment_config['id']
        })
        
    except Exception as e:
        current_experiment['status'] = 'error'
        current_experiment['error'] = str(e)
        
        socketio.emit('experiment_error', {
            'status': 'error',
            'error': str(e)
        })
    
    finally:
        loop.close()

@app.route('/api/experiment_status')
def get_experiment_status():
    """Get current experiment status."""
    global current_experiment
    return jsonify(current_experiment or {"status": "none"})

@socketio.on('connect')
def handle_connect():
    """Handle client connection."""
    emit('connected', {'status': 'connected'})

if __name__ == '__main__':
    # Create templates directory if it doesn't exist
    os.makedirs('templates', exist_ok=True)
    os.makedirs('static', exist_ok=True)
    
    print("Starting Persona Evaluation Web Interface...")
    print("Access the interface at: http://localhost:9000")
    
    socketio.run(app, host='0.0.0.0', port=9000, debug=True, allow_unsafe_werkzeug=True)