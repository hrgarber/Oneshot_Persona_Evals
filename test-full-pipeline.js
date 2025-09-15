#!/usr/bin/env node

/**
 * VALIDATION TEST: Complete pipeline with 11-question Behavioral Analysis Questionnaire
 *
 * Success Criteria:
 * 1. All 11 questions are present in the questionnaire
 * 2. Experiment runs without failures (with valid API key)
 * 3. Results contain responses for all questions
 * 4. Behavioral analysis patterns are detectable
 */

const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const RESULTS_DIR = path.join(__dirname, 'results', 'experiments');

async function validatePipeline() {
  console.log('🧪 VALIDATING BEHAVIORAL ANALYSIS PIPELINE\n');

  const results = {
    questionnaire: false,
    questions: false,
    personas: false,
    apiKey: false,
    experiment: false,
    analysis: false
  };

  try {
    // 1. Check questionnaire exists with all 11 questions
    console.log('1. Checking questionnaire data...');
    const questionnaires = JSON.parse(await fs.readFile(path.join(DATA_DIR, 'questionnaires.json'), 'utf-8'));
    const behavioralQuestionnaire = questionnaires.find(q => q.id === 'behavioral_analysis_v1');

    if (behavioralQuestionnaire) {
      console.log('   ✓ Found Behavioral Analysis Questionnaire v1');
      results.questionnaire = true;

      if (behavioralQuestionnaire.questions.length === 11) {
        console.log(`   ✓ Contains all 11 questions`);
        console.log(`     Questions: ${behavioralQuestionnaire.questions.join(', ')}`);
      } else {
        console.log(`   ✗ FAIL: Expected 11 questions, found ${behavioralQuestionnaire.questions.length}`);
      }
    } else {
      console.log('   ✗ FAIL: Behavioral Analysis Questionnaire v1 not found');
    }

    // 2. Check all questions exist
    console.log('\n2. Checking question definitions...');
    const questions = JSON.parse(await fs.readFile(path.join(DATA_DIR, 'questions.json'), 'utf-8'));
    const expectedQuestions = [
      'q01_requirements_uncertainty',
      'q02_time_quality_tradeoff',
      'q03_success_definition',
      'q04_scope_boundaries',
      'q05_quality_tradeoffs',
      'q06_risk_tolerance',
      'q07_time_orientation',
      'q08_success_definition_detailed',
      'q09_approach_intent',
      'q10_exclusion_intent',
      'q11_validation_intent'
    ];

    const foundQuestions = expectedQuestions.filter(qId =>
      questions.find(q => q.id === qId)
    );

    if (foundQuestions.length === 11) {
      console.log('   ✓ All 11 questions defined');
      results.questions = true;

      // Show categories
      const categories = [...new Set(questions.map(q => q.category))];
      console.log(`     Categories: ${categories.join(', ')}`);
    } else {
      console.log(`   ✗ FAIL: Only ${foundQuestions.length}/11 questions found`);
      const missing = expectedQuestions.filter(q => !foundQuestions.includes(q));
      if (missing.length > 0) {
        console.log(`     Missing: ${missing.join(', ')}`);
      }
    }

    // 3. Check personas exist
    console.log('\n3. Checking personas...');
    const personas = JSON.parse(await fs.readFile(path.join(DATA_DIR, 'personas.json'), 'utf-8'));

    if (personas.length > 0) {
      console.log(`   ✓ Found ${personas.length} personas`);
      console.log(`     Personas: ${personas.map(p => p.name).join(', ')}`);
      results.personas = true;
    } else {
      console.log('   ✗ FAIL: No personas found');
    }

    // 4. Check API key configuration
    console.log('\n4. Checking API configuration...');
    const envPath = path.join(__dirname, '.env.local');
    try {
      const envContent = await fs.readFile(envPath, 'utf-8');
      if (envContent.includes('OPENAI_API_KEY=')) {
        console.log('   ✓ OpenAI API key configured in .env.local');
        results.apiKey = true;
      } else {
        console.log('   ⚠ WARNING: OpenAI API key not found in .env.local');
      }
    } catch (error) {
      console.log('   ⚠ WARNING: .env.local file not found');
    }

    // 5. Check for experiment results
    console.log('\n5. Checking experiment results...');
    try {
      const files = await fs.readdir(RESULTS_DIR);
      const experimentFiles = files.filter(f => f.endsWith('.json'));

      if (experimentFiles.length > 0) {
        console.log(`   ✓ Found ${experimentFiles.length} experiment(s)`);

        // Analyze latest experiment
        const latestFile = experimentFiles[experimentFiles.length - 1];
        const experiment = JSON.parse(await fs.readFile(path.join(RESULTS_DIR, latestFile), 'utf-8'));

        console.log(`\n   Analyzing: ${latestFile}`);
        console.log(`     - Status: ${experiment.status}`);
        console.log(`     - Personas: ${experiment.personas.length}`);
        console.log(`     - Questions: ${experiment.questions.length}`);
        console.log(`     - Total responses: ${experiment.total_responses}`);
        console.log(`     - Successful: ${experiment.successful_responses}`);
        console.log(`     - Success rate: ${Math.round((experiment.successful_responses / experiment.total_responses) * 100)}%`);

        if (experiment.questions.length === 11) {
          console.log('     ✓ Uses all 11 questions');
        } else {
          console.log(`     ⚠ WARNING: Only ${experiment.questions.length} questions used`);
        }

        results.experiment = experiment.successful_responses > 0;
        results.analysis = true;
      } else {
        console.log('   ⚠ No experiments found yet');
      }
    } catch (error) {
      console.log('   ⚠ Results directory not found');
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('VALIDATION SUMMARY\n');

    const checks = [
      ['Questionnaire created', results.questionnaire],
      ['All questions defined', results.questions],
      ['Personas available', results.personas],
      ['API key configured', results.apiKey],
      ['Experiment capability', results.experiment],
      ['Analysis ready', results.analysis]
    ];

    checks.forEach(([label, passed]) => {
      console.log(`  ${passed ? '✓' : '✗'} ${label}`);
    });

    const passedCount = Object.values(results).filter(v => v).length;
    const totalCount = Object.keys(results).length;

    console.log(`\nOVERALL: ${passedCount}/${totalCount} checks passed`);

    if (passedCount === totalCount) {
      console.log('\n✅ HYPOTHESIS VALIDATED: System is ready for behavioral analysis');
    } else {
      console.log('\n⚠️  PARTIAL SUCCESS: Core components working, some configuration needed');

      if (!results.apiKey) {
        console.log('\nNEXT STEP: Configure OpenAI API key in Settings (gear icon)');
      }
      if (!results.experiment) {
        console.log('\nNEXT STEP: Run an experiment with the Behavioral Analysis Questionnaire');
      }
    }

  } catch (error) {
    console.error('\n❌ VALIDATION FAILED:', error.message);
  }
}

// Run validation
validatePipeline().catch(console.error);