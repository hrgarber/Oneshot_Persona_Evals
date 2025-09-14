// Research-focused persona evaluation interface
class PersonaEvaluationApp {
    constructor() {
        this.socket = io();
        this.currentExperiment = null;
        this.personas = [];
        this.questions = [];
        this.experimentHistory = [];
        
        this.initializeEventListeners();
        this.loadInitialData();
        this.setupSocketListeners();
    }

    initializeEventListeners() {
        // Setup controls
        document.getElementById('select-all-personas').addEventListener('click', () => {
            this.toggleAllCheckboxes('persona-list', true);
        });
        
        document.getElementById('select-all-questions').addEventListener('click', () => {
            this.toggleAllCheckboxes('question-list', true);
        });
        
        document.getElementById('start-experiment').addEventListener('click', () => {
            this.startExperiment();
        });
        
        document.getElementById('stop-experiment').addEventListener('click', () => {
            this.stopExperiment();
        });
        
        // Results controls
        document.getElementById('export-results').addEventListener('click', () => {
            this.exportResults();
        });
        
        document.getElementById('compare-personas').addEventListener('click', () => {
            this.comparePersonas();
        });
        
        document.getElementById('analyze-consistency').addEventListener('click', () => {
            this.analyzeConsistency();
        });
        
        // Modal controls
        document.querySelector('.close').addEventListener('click', () => {
            this.closeModal();
        });
        
        window.addEventListener('click', (event) => {
            const modal = document.getElementById('results-modal');
            if (event.target === modal) {
                this.closeModal();
            }
        });
    }

    setupSocketListeners() {
        this.socket.on('connected', (data) => {
            console.log('Connected to server');
        });
        
        this.socket.on('experiment_status', (data) => {
            this.updateExperimentStatus(data);
        });
        
        this.socket.on('experiment_progress', (data) => {
            this.updateExperimentProgress(data);
        });
        
        this.socket.on('persona_complete', (data) => {
            this.handlePersonaComplete(data);
        });
        
        this.socket.on('experiment_complete', (data) => {
            this.handleExperimentComplete(data);
        });
        
        this.socket.on('experiment_error', (data) => {
            this.handleExperimentError(data);
        });
    }

    async loadInitialData() {
        try {
            // Load personas
            const personasResponse = await fetch('/api/personas');
            this.personas = await personasResponse.json();
            this.renderPersonaList();
            
            // Load questions
            const questionsResponse = await fetch('/api/questions');
            this.questions = await questionsResponse.json();
            this.renderQuestionList();
            
            // Load experiment history
            const historyResponse = await fetch('/api/experiments');
            this.experimentHistory = await historyResponse.json();
            this.renderExperimentHistory();
            
        } catch (error) {
            console.error('Error loading initial data:', error);
            this.showError('Failed to load initial data');
        }
    }

    renderPersonaList() {
        const container = document.getElementById('persona-list');
        container.innerHTML = '';
        
        this.personas.forEach(persona => {
            const item = document.createElement('div');
            item.className = 'checkbox-item';
            
            const preview = persona.content.substring(0, 150) + '...';
            
            item.innerHTML = `
                <input type="checkbox" id="persona-${persona.id}" value="${persona.id}">
                <label for="persona-${persona.id}">
                    <div class="item-title">${persona.name}</div>
                    <div class="item-preview">${preview}</div>
                </label>
            `;
            
            container.appendChild(item);
        });
    }

    renderQuestionList() {
        const container = document.getElementById('question-list');
        container.innerHTML = '';
        
        this.questions.forEach(question => {
            const item = document.createElement('div');
            item.className = 'checkbox-item';
            
            const preview = question.text.substring(0, 100) + '...';
            
            item.innerHTML = `
                <input type="checkbox" id="question-${question.id}" value="${question.id}">
                <label for="question-${question.id}">
                    <div class="item-title">${question.id}</div>
                    <div class="item-preview">${preview}</div>
                </label>
            `;
            
            container.appendChild(item);
        });
    }

    renderExperimentHistory() {
        const container = document.getElementById('history-list');
        container.innerHTML = '';
        
        if (this.experimentHistory.length === 0) {
            container.innerHTML = '<p>No previous experiments found.</p>';
            return;
        }
        
        this.experimentHistory.forEach(experiment => {
            const item = document.createElement('div');
            item.className = 'history-item';
            item.addEventListener('click', () => this.viewExperimentDetails(experiment.filename));
            
            const successRate = experiment.total_questions > 0 
                ? Math.round((experiment.successful_responses / experiment.total_questions) * 100)
                : 0;
            
            item.innerHTML = `
                <div class="history-info">
                    <h4>${experiment.persona_name}</h4>
                    <div class="history-meta">
                        ${experiment.timestamp} • ${experiment.model}
                    </div>
                </div>
                <div class="history-stats">
                    <div>${experiment.successful_responses}/${experiment.total_questions} responses</div>
                    <div>${successRate}% success rate</div>
                </div>
            `;
            
            container.appendChild(item);
        });
    }

    toggleAllCheckboxes(containerId, checked) {
        const container = document.getElementById(containerId);
        const checkboxes = container.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = checked;
        });
    }

    getSelectedItems(containerId) {
        const container = document.getElementById(containerId);
        const checkboxes = container.querySelectorAll('input[type="checkbox"]:checked');
        return Array.from(checkboxes).map(cb => cb.value);
    }

    async startExperiment() {
        const selectedPersonas = this.getSelectedItems('persona-list');
        const selectedQuestions = this.getSelectedItems('question-list');
        const useOpenAIFallback = document.getElementById('use-openai-fallback').checked;
        
        if (selectedPersonas.length === 0) {
            this.showError('Please select at least one persona');
            return;
        }
        
        if (selectedQuestions.length === 0) {
            this.showError('Please select at least one question');
            return;
        }
        
        try {
            const response = await fetch('/api/start_experiment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    personas: selectedPersonas,
                    questions: selectedQuestions,
                    use_openai_fallback: useOpenAIFallback
                })
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to start experiment');
            }
            
            const result = await response.json();
            this.currentExperiment = result;
            
            // Show progress section
            document.getElementById('progress-section').style.display = 'block';
            document.getElementById('results-section').style.display = 'none';
            
            // Update UI
            document.getElementById('start-experiment').style.display = 'none';
            document.getElementById('stop-experiment').style.display = 'inline-block';
            
            this.showSuccess('Experiment started successfully');
            
        } catch (error) {
            console.error('Error starting experiment:', error);
            this.showError(error.message);
        }
    }

    stopExperiment() {
        // TODO: Implement experiment stopping
        this.showInfo('Experiment stopping is not yet implemented');
    }

    updateExperimentStatus(data) {
        const progressText = document.getElementById('progress-text');
        progressText.textContent = data.message || data.status;
    }

    updateExperimentProgress(data) {
        const progressBar = document.getElementById('progress-bar');
        const progressText = document.getElementById('progress-text');
        
        const percentage = (data.persona_index / data.total_personas) * 100;
        progressBar.style.width = `${percentage}%`;
        
        progressText.textContent = `${data.status} (${data.persona_index}/${data.total_personas})`;
        
        // Update persona progress
        this.updatePersonaProgress(data.current_persona, 'running');
    }

    handlePersonaComplete(data) {
        this.updatePersonaProgress(data.persona_name, 'completed', data);
        
        // Add results to display
        this.addPersonaResults(data);
    }

    handleExperimentComplete(data) {
        // Update UI
        document.getElementById('start-experiment').style.display = 'inline-block';
        document.getElementById('stop-experiment').style.display = 'none';
        document.getElementById('results-section').style.display = 'block';
        
        // Update progress
        const progressBar = document.getElementById('progress-bar');
        const progressText = document.getElementById('progress-text');
        progressBar.style.width = '100%';
        progressText.textContent = 'Experiment completed successfully!';
        
        this.showSuccess('Experiment completed successfully!');
        
        // Reload experiment history
        this.loadInitialData();
    }

    handleExperimentError(data) {
        // Update UI
        document.getElementById('start-experiment').style.display = 'inline-block';
        document.getElementById('stop-experiment').style.display = 'none';
        
        this.showError(`Experiment failed: ${data.error}`);
    }

    updatePersonaProgress(personaName, status, data = null) {
        const container = document.getElementById('persona-progress');
        let statusElement = document.getElementById(`persona-${personaName}`);
        
        if (!statusElement) {
            statusElement = document.createElement('div');
            statusElement.id = `persona-${personaName}`;
            statusElement.className = 'persona-status';
            container.appendChild(statusElement);
        }
        
        statusElement.className = `persona-status ${status}`;
        
        let statusText = '';
        if (status === 'running') {
            statusText = 'Processing...';
        } else if (status === 'completed' && data) {
            statusText = `Completed: ${data.successful}/${data.total} responses`;
        } else if (status === 'error') {
            statusText = 'Failed';
        }
        
        statusElement.innerHTML = `
            <span><strong>${personaName.replace('_', ' ')}</strong></span>
            <span>${statusText}</span>
        `;
    }

    addPersonaResults(data) {
        const container = document.getElementById('results-grid');
        
        const resultCard = document.createElement('div');
        resultCard.className = 'result-card';
        
        const successRate = Math.round((data.successful / data.total) * 100);
        
        resultCard.innerHTML = `
            <div class="result-header">
                <h4>${data.persona_name.replace('_', ' ')}</h4>
                <div class="result-stats">${data.successful}/${data.total} responses (${successRate}%)</div>
            </div>
            <div class="result-content">
                ${this.renderPersonaResponses(data.results)}
            </div>
        `;
        
        container.appendChild(resultCard);
    }

    renderPersonaResponses(results) {
        return results.map(result => {
            if (result.error) {
                return `
                    <div class="question-response">
                        <div class="question-text">${result.question_id}</div>
                        <div class="response-text" style="color: #e74c3c;">Error: ${result.error}</div>
                        <div class="response-meta">${result.timestamp}</div>
                    </div>
                `;
            } else {
                const provider = result.provider === 'openai' ? ' (OpenAI Fallback)' : '';
                return `
                    <div class="question-response">
                        <div class="question-text">${result.question_id}</div>
                        <div class="response-text">${result.response}</div>
                        <div class="response-meta">${result.timestamp} • ${result.model}${provider}</div>
                    </div>
                `;
            }
        }).join('');
    }

    async viewExperimentDetails(filename) {
        try {
            const response = await fetch(`/api/experiment/${filename}`);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to load experiment details');
            }
            
            this.showExperimentModal(data);
            
        } catch (error) {
            console.error('Error loading experiment details:', error);
            this.showError(error.message);
        }
    }

    showExperimentModal(data) {
        const modal = document.getElementById('results-modal');
        const modalBody = document.getElementById('modal-body');
        
        const successRate = Math.round((data.successful_responses / data.total_questions) * 100);
        
        modalBody.innerHTML = `
            <h2>${data.persona_name.replace('_', ' ')} - Experiment Results</h2>
            <div style="margin-bottom: 20px;">
                <strong>Timestamp:</strong> ${data.session_timestamp}<br>
                <strong>Model:</strong> ${data.model}<br>
                <strong>Success Rate:</strong> ${data.successful_responses}/${data.total_questions} (${successRate}%)
            </div>
            <div class="result-content">
                ${this.renderPersonaResponses(data.responses)}
            </div>
        `;
        
        modal.style.display = 'block';
    }

    closeModal() {
        document.getElementById('results-modal').style.display = 'none';
    }

    exportResults() {
        // TODO: Implement results export
        this.showInfo('Results export is not yet implemented');
    }

    comparePersonas() {
        // TODO: Implement persona comparison
        this.showInfo('Persona comparison is not yet implemented');
    }

    analyzeConsistency() {
        // TODO: Implement consistency analysis
        this.showInfo('Consistency analysis is not yet implemented');
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showInfo(message) {
        this.showNotification(message, 'info');
    }

    showNotification(message, type) {
        // Simple notification system
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 4px;
            color: white;
            font-weight: 500;
            z-index: 1001;
            max-width: 400px;
        `;
        
        switch (type) {
            case 'success':
                notification.style.backgroundColor = '#27ae60';
                break;
            case 'error':
                notification.style.backgroundColor = '#e74c3c';
                break;
            case 'info':
                notification.style.backgroundColor = '#3498db';
                break;
        }
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
        
        // Click to dismiss
        notification.addEventListener('click', () => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        });
    }
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new PersonaEvaluationApp();
});