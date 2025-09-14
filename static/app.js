// Persona Evaluation Research Tool - Enhanced with CRUD Management
class PersonaEvalApp {
    constructor() {
        this.socket = io();
        this.currentExperiment = null;
        this.personas = [];
        this.questions = [];
        this.questionnaires = [];
        this.currentEditingPersona = null;
        this.currentEditingQuestionnaire = null;
        this.currentEditingQuestion = null;
        
        this.initializeEventListeners();
        this.loadInitialData();
    }

    initializeEventListeners() {
        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // API Key management
        document.getElementById('save-api-key').addEventListener('click', () => this.saveApiKey());
        document.getElementById('openai-api-key').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.saveApiKey();
        });

        // Experiment controls
        document.getElementById('start-experiment').addEventListener('click', () => this.startExperiment());
        document.getElementById('stop-experiment').addEventListener('click', () => this.stopExperiment());
        document.getElementById('select-all-personas').addEventListener('click', () => this.selectAllPersonas());

        // Persona management
        document.getElementById('add-persona').addEventListener('click', () => this.showPersonaModal());
        document.getElementById('persona-form').addEventListener('submit', (e) => this.savePersona(e));
        document.getElementById('persona-cancel').addEventListener('click', () => this.hidePersonaModal());
        document.getElementById('persona-modal-close').addEventListener('click', () => this.hidePersonaModal());

        // Questionnaire management
        document.getElementById('add-questionnaire').addEventListener('click', () => this.showQuestionnaireModal());
        document.getElementById('questionnaire-form').addEventListener('submit', (e) => this.saveQuestionnaire(e));
        document.getElementById('questionnaire-cancel').addEventListener('click', () => this.hideQuestionnaireModal());
        document.getElementById('questionnaire-modal-close').addEventListener('click', () => this.hideQuestionnaireModal());

        // Question management (will be added to questionnaire modal)
        document.getElementById('question-form').addEventListener('submit', (e) => this.saveQuestion(e));
        document.getElementById('question-cancel').addEventListener('click', () => this.hideQuestionModal());
        document.getElementById('question-modal-close').addEventListener('click', () => this.hideQuestionModal());

        // Socket events
        this.socket.on('experiment_status', (data) => this.handleExperimentStatus(data));
        this.socket.on('experiment_progress', (data) => this.handleExperimentProgress(data));
        this.socket.on('persona_complete', (data) => this.handlePersonaComplete(data));
        this.socket.on('experiment_complete', (data) => this.handleExperimentComplete(data));

        // Modal click outside to close
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });
    }

    async loadInitialData() {
        try {
            await Promise.all([
                this.loadPersonas(),
                this.loadQuestions(),
                this.loadQuestionnaires(),
                this.loadExperimentHistory(),
                this.loadApiKeyStatus()
            ]);
            this.renderAll();
        } catch (error) {
            console.error('Error loading initial data:', error);
        }
    }

    async loadPersonas() {
        const response = await fetch('/api/personas');
        this.personas = await response.json();
    }

    async loadQuestions() {
        const response = await fetch('/api/questions');
        this.questions = await response.json();
    }

    async loadQuestionnaires() {
        const response = await fetch('/api/questionnaires');
        this.questionnaires = await response.json();
    }

    async loadExperimentHistory() {
        const response = await fetch('/api/experiments');
        this.experimentHistory = await response.json();
    }

    renderAll() {
        this.renderPersonaList();
        this.renderQuestionnaireList();
        this.renderPersonaManagement();
        this.renderQuestionnaireManagement();
        this.renderExperimentHistory();
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');

        // Load data if needed
        if (tabName === 'history') {
            this.loadExperimentHistory().then(() => this.renderExperimentHistory());
        }
    }

    renderPersonaList() {
        const container = document.getElementById('persona-list');
        container.innerHTML = this.personas.map(persona => `
            <label class="checkbox-label">
                <input type="checkbox" value="${persona.id}" data-persona-id="${persona.id}">
                <div>
                    <strong>${persona.name}</strong>
                    <div class="persona-preview">${persona.behavioral_profile}</div>
                </div>
            </label>
        `).join('');
    }

    renderQuestionnaireList() {
        const container = document.getElementById('questionnaire-list');
        container.innerHTML = this.questionnaires.map(questionnaire => `
            <label class="radio-label">
                <input type="radio" name="questionnaire" value="${questionnaire.id}">
                <div class="questionnaire-info">
                    <div class="questionnaire-name">${questionnaire.name}</div>
                    <div class="questionnaire-description">${questionnaire.description}</div>
                    <div class="questionnaire-meta">${questionnaire.questions.length} questions</div>
                </div>
            </label>
        `).join('');
    }

    renderPersonaManagement() {
        const container = document.getElementById('personas-management');
        container.innerHTML = this.personas.map(persona => `
            <div class="management-item">
                <div class="management-item-header">
                    <h4 class="management-item-title">${persona.name}</h4>
                    <div class="management-item-actions">
                        <button class="btn btn-small btn-edit" onclick="app.editPersona('${persona.id}')">Edit</button>
                        <button class="btn btn-small btn-delete" onclick="app.deletePersona('${persona.id}')">Delete</button>
                    </div>
                </div>
                <div class="management-item-description">${persona.description}</div>
                <div class="management-item-meta">
                    <strong>Behavioral Profile:</strong> ${persona.behavioral_profile}
                </div>
            </div>
        `).join('');
    }

    renderQuestionnaireManagement() {
        const container = document.getElementById('questionnaires-management');
        container.innerHTML = this.questionnaires.map(questionnaire => `
            <div class="management-item">
                <div class="management-item-header">
                    <h4 class="management-item-title">${questionnaire.name}</h4>
                    <div class="management-item-actions">
                        <button class="btn btn-small btn-edit" onclick="app.editQuestionnaire('${questionnaire.id}')">Edit</button>
                        <button class="btn btn-small btn-delete" onclick="app.deleteQuestionnaire('${questionnaire.id}')">Delete</button>
                    </div>
                </div>
                <div class="management-item-description">${questionnaire.description}</div>
                <div class="questionnaire-questions">
                    <h5>Questions (${questionnaire.questions.length}):</h5>
                    <ul>
                        ${questionnaire.question_details ? questionnaire.question_details.map(q => 
                            `<li>${q.question}</li>`
                        ).join('') : ''}
                    </ul>
                </div>
                <div class="management-item-meta">
                    Created: ${new Date(questionnaire.created_at).toLocaleDateString()}
                </div>
            </div>
        `).join('');
    }

    renderExperimentHistory() {
        const container = document.getElementById('experiment-history');
        if (!this.experimentHistory || this.experimentHistory.length === 0) {
            container.innerHTML = '<p>No experiments found.</p>';
            return;
        }

        container.innerHTML = `
            <div class="history-list">
                ${this.experimentHistory.map(exp => `
                    <div class="history-item" onclick="app.viewExperimentDetails('${exp.filename}')">
                        <div class="history-info">
                            <h4>${exp.persona_name}</h4>
                            <div class="history-meta">${exp.timestamp} | ${exp.model}</div>
                        </div>
                        <div class="history-stats">
                            ${exp.successful_responses}/${exp.total_questions} successful
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    selectAllPersonas() {
        const checkboxes = document.querySelectorAll('#persona-list input[type="checkbox"]');
        const allChecked = Array.from(checkboxes).every(cb => cb.checked);
        checkboxes.forEach(cb => cb.checked = !allChecked);
    }

    async startExperiment() {
        const selectedPersonas = Array.from(document.querySelectorAll('#persona-list input:checked'))
            .map(cb => cb.value);
        const selectedQuestionnaire = document.querySelector('#questionnaire-list input:checked')?.value;
        const useOpenAI = document.getElementById('use-openai-fallback').checked;

        if (selectedPersonas.length === 0) {
            alert('Please select at least one persona');
            return;
        }

        if (!selectedQuestionnaire) {
            alert('Please select a questionnaire');
            return;
        }

        try {
            const response = await fetch('/api/start_experiment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    personas: selectedPersonas,
                    questionnaire: selectedQuestionnaire,
                    use_openai_fallback: useOpenAI
                })
            });

            const result = await response.json();
            if (response.ok) {
                this.currentExperiment = result.experiment_id;
                document.getElementById('start-experiment').style.display = 'none';
                document.getElementById('stop-experiment').style.display = 'inline-block';
                document.getElementById('progress-section').style.display = 'block';
            } else {
                alert(result.error || 'Failed to start experiment');
            }
        } catch (error) {
            console.error('Error starting experiment:', error);
            alert('Failed to start experiment');
        }
    }

    stopExperiment() {
        // Implementation for stopping experiment
        this.currentExperiment = null;
        document.getElementById('start-experiment').style.display = 'inline-block';
        document.getElementById('stop-experiment').style.display = 'none';
        document.getElementById('progress-section').style.display = 'none';
    }

    // Persona CRUD operations
    showPersonaModal(persona = null) {
        this.currentEditingPersona = persona;
        const modal = document.getElementById('persona-modal');
        const title = document.getElementById('persona-modal-title');
        
        if (persona) {
            title.textContent = 'Edit Persona';
            document.getElementById('persona-name').value = persona.name;
            document.getElementById('persona-description').value = persona.description;
            document.getElementById('persona-behavioral-profile').value = persona.behavioral_profile || '';
        } else {
            title.textContent = 'Add New Persona';
            document.getElementById('persona-form').reset();
        }
        
        modal.style.display = 'block';
    }

    hidePersonaModal() {
        document.getElementById('persona-modal').style.display = 'none';
        this.currentEditingPersona = null;
    }

    async savePersona(e) {
        e.preventDefault();
        
        const data = {
            name: document.getElementById('persona-name').value,
            description: document.getElementById('persona-description').value,
            behavioral_profile: document.getElementById('persona-behavioral-profile').value
        };

        try {
            let response;
            if (this.currentEditingPersona) {
                response = await fetch(`/api/personas/${this.currentEditingPersona.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
            } else {
                response = await fetch('/api/personas', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
            }

            if (response.ok) {
                await this.loadPersonas();
                this.renderPersonaList();
                this.renderPersonaManagement();
                this.hidePersonaModal();
            } else {
                const error = await response.json();
                alert(error.error || 'Failed to save persona');
            }
        } catch (error) {
            console.error('Error saving persona:', error);
            alert('Failed to save persona');
        }
    }

    editPersona(personaId) {
        const persona = this.personas.find(p => p.id === personaId);
        if (persona) {
            this.showPersonaModal(persona);
        }
    }

    async deletePersona(personaId) {
        if (!confirm('Are you sure you want to delete this persona?')) {
            return;
        }

        try {
            const response = await fetch(`/api/personas/${personaId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                await this.loadPersonas();
                this.renderPersonaList();
                this.renderPersonaManagement();
            } else {
                alert('Failed to delete persona');
            }
        } catch (error) {
            console.error('Error deleting persona:', error);
            alert('Failed to delete persona');
        }
    }

    // Questionnaire CRUD operations
    showQuestionnaireModal(questionnaire = null) {
        this.currentEditingQuestionnaire = questionnaire;
        const modal = document.getElementById('questionnaire-modal');
        const title = document.getElementById('questionnaire-modal-title');
        
        // Render questions checkboxes
        const questionsContainer = document.getElementById('questionnaire-questions');
        questionsContainer.innerHTML = this.questions.map(question => `
            <label class="checkbox-label">
                <input type="checkbox" value="${question.id}" 
                    ${questionnaire && questionnaire.questions.includes(question.id) ? 'checked' : ''}>
                ${question.question}
            </label>
        `).join('');
        
        if (questionnaire) {
            title.textContent = 'Edit Questionnaire';
            document.getElementById('questionnaire-name').value = questionnaire.name;
            document.getElementById('questionnaire-description').value = questionnaire.description;
        } else {
            title.textContent = 'Add New Questionnaire';
            document.getElementById('questionnaire-form').reset();
        }
        
        modal.style.display = 'block';
    }

    hideQuestionnaireModal() {
        document.getElementById('questionnaire-modal').style.display = 'none';
        this.currentEditingQuestionnaire = null;
    }

    async saveQuestionnaire(e) {
        e.preventDefault();
        
        const selectedQuestions = Array.from(document.querySelectorAll('#questionnaire-questions input:checked'))
            .map(cb => cb.value);

        if (selectedQuestions.length === 0) {
            alert('Please select at least one question');
            return;
        }

        const data = {
            name: document.getElementById('questionnaire-name').value,
            description: document.getElementById('questionnaire-description').value,
            questions: selectedQuestions
        };

        try {
            let response;
            if (this.currentEditingQuestionnaire) {
                response = await fetch(`/api/questionnaires/${this.currentEditingQuestionnaire.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
            } else {
                response = await fetch('/api/questionnaires', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
            }

            if (response.ok) {
                await this.loadQuestionnaires();
                this.renderQuestionnaireList();
                this.renderQuestionnaireManagement();
                this.hideQuestionnaireModal();
            } else {
                const error = await response.json();
                alert(error.error || 'Failed to save questionnaire');
            }
        } catch (error) {
            console.error('Error saving questionnaire:', error);
            alert('Failed to save questionnaire');
        }
    }

    editQuestionnaire(questionnaireId) {
        const questionnaire = this.questionnaires.find(q => q.id === questionnaireId);
        if (questionnaire) {
            this.showQuestionnaireModal(questionnaire);
        }
    }

    async deleteQuestionnaire(questionnaireId) {
        if (!confirm('Are you sure you want to delete this questionnaire?')) {
            return;
        }

        try {
            const response = await fetch(`/api/questionnaires/${questionnaireId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                await this.loadQuestionnaires();
                this.renderQuestionnaireList();
                this.renderQuestionnaireManagement();
            } else {
                alert('Failed to delete questionnaire');
            }
        } catch (error) {
            console.error('Error deleting questionnaire:', error);
            alert('Failed to delete questionnaire');
        }
    }

    // Question CRUD operations (for future use)
    showQuestionModal(question = null) {
        this.currentEditingQuestion = question;
        const modal = document.getElementById('question-modal');
        const title = document.getElementById('question-modal-title');
        
        if (question) {
            title.textContent = 'Edit Question';
            document.getElementById('question-text').value = question.question;
        } else {
            title.textContent = 'Add New Question';
            document.getElementById('question-form').reset();
        }
        
        modal.style.display = 'block';
    }

    hideQuestionModal() {
        document.getElementById('question-modal').style.display = 'none';
        this.currentEditingQuestion = null;
    }

    async saveQuestion(e) {
        e.preventDefault();
        
        const data = {
            question: document.getElementById('question-text').value
        };

        try {
            let response;
            if (this.currentEditingQuestion) {
                response = await fetch(`/api/questions/${this.currentEditingQuestion.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
            } else {
                response = await fetch('/api/questions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
            }

            if (response.ok) {
                await this.loadQuestions();
                this.hideQuestionModal();
            } else {
                const error = await response.json();
                alert(error.error || 'Failed to save question');
            }
        } catch (error) {
            console.error('Error saving question:', error);
            alert('Failed to save question');
        }
    }

    // Experiment event handlers
    handleExperimentStatus(data) {
        console.log('Experiment status:', data);
        document.getElementById('progress-info').innerHTML = `
            <div class="progress-text">${data.message}</div>
        `;
    }

    handleExperimentProgress(data) {
        console.log('Experiment progress:', data);
        const progressPercent = (data.persona_index / data.total_personas) * 100;
        document.getElementById('progress-bar').style.width = `${progressPercent}%`;
        document.getElementById('progress-info').innerHTML = `
            <div class="progress-text">Processing ${data.current_persona} (${data.persona_index}/${data.total_personas})</div>
        `;
    }

    handlePersonaComplete(data) {
        console.log('Persona complete:', data);
        // Update persona status in UI
    }

    handleExperimentComplete(data) {
        console.log('Experiment complete:', data);
        this.stopExperiment();
        alert('Experiment completed successfully!');
        this.loadExperimentHistory().then(() => this.renderExperimentHistory());
    }

    async viewExperimentDetails(filename) {
        try {
            const response = await fetch(`/api/experiment/${filename}`);
            const data = await response.json();
            
            // Show detailed results in modal or new section
            console.log('Experiment details:', data);
        } catch (error) {
            console.error('Error loading experiment details:', error);
        }
    }

    // API Key Management Methods
    async loadApiKeyStatus() {
        try {
            const response = await fetch('/api/openai-key');
            const data = await response.json();
            this.updateApiKeyStatus(data);
        } catch (error) {
            console.error('Error loading API key status:', error);
            this.updateApiKeyStatus({ configured: false, key: '' });
        }
    }

    async saveApiKey() {
        const keyInput = document.getElementById('openai-api-key');
        const apiKey = keyInput.value.trim();
        
        if (!apiKey) {
            alert('Please enter an API key');
            return;
        }

        try {
            const response = await fetch('/api/openai-key', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ key: apiKey })
            });

            const data = await response.json();
            
            if (response.ok) {
                this.updateApiKeyStatus({ configured: true, key: apiKey });
                keyInput.value = ''; // Clear the input for security
                alert('API key saved successfully!');
            } else {
                alert('Error saving API key: ' + data.error);
            }
        } catch (error) {
            console.error('Error saving API key:', error);
            alert('Error saving API key. Please try again.');
        }
    }

    updateApiKeyStatus(data) {
        const statusElement = document.getElementById('api-key-status');
        const keyInput = document.getElementById('openai-api-key');
        
        if (data.configured) {
            statusElement.textContent = 'Configured ✓';
            statusElement.className = 'status-indicator configured';
            keyInput.placeholder = 'API key is configured (enter new key to update)';
        } else {
            statusElement.textContent = 'Not configured';
            statusElement.className = 'status-indicator not-configured';
            keyInput.placeholder = 'Enter your OpenAI API key';
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new PersonaEvalApp();
});