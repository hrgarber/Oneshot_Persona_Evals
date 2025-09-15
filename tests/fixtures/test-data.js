// Test data fixtures for consistent testing

const testData = {
  personas: {
    valid: {
      name: 'Test Persona',
      description: 'A test persona for automated testing',
      behavioral_profile: 'Analytical, detail-oriented, methodical in decision making'
    },
    minimal: {
      name: 'Minimal Persona',
      description: 'Basic test persona'
    }
  },

  questionnaires: {
    valid: {
      name: 'Test Questionnaire',
      description: 'Automated test questionnaire for validation'
    },
    withQuestions: {
      name: 'Full Test Questionnaire',
      description: 'Complete questionnaire with selected questions',
      expectedQuestionCount: 5
    }
  },

  searchTerms: {
    requirements: 'requirements',
    decision: 'decision',
    invalid: 'zxcvbnmasdf123456'  // Should return no results
  },

  expectedElements: {
    tabs: ['Create', 'Manage', 'Run', 'Results', 'Analysis'],
    manageTabs: ['Personas', 'Questionnaires'],
    questionCategories: [
      'Personal Decision Making',
      'Team Collaboration',
      'Problem Solving',
      'Communication Style',
      'Leadership Approach'
    ]
  }
};

module.exports = testData;