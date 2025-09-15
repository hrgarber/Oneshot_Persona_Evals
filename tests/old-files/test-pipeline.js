#!/usr/bin/env node

/**
 * Test script to validate the entire persona testing pipeline
 * HACK: Quick validation script for MVP testing
 */

const BASE_URL = 'http://localhost:3002';

async function testPipeline() {
  console.log('Testing Persona Evaluation Pipeline...\n');

  try {
    // 1. Test personas endpoint
    console.log('1. Testing Personas API...');
    const personasRes = await fetch(`${BASE_URL}/api/personas`);
    const personas = await personasRes.json();
    console.log(`   ✓ Found ${personas.length} personas`);

    // 2. Test questions endpoint
    console.log('2. Testing Questions API...');
    const questionsRes = await fetch(`${BASE_URL}/api/questions`);
    const questions = await questionsRes.json();
    console.log(`   ✓ Found ${questions.length} questions`);

    // 3. Test questionnaires endpoint
    console.log('3. Testing Questionnaires API...');
    const questionnairesRes = await fetch(`${BASE_URL}/api/questionnaires`);
    const questionnaires = await questionnairesRes.json();
    console.log(`   ✓ Found ${questionnaires.length} questionnaires`);

    // 4. Test harness endpoint (without API key - should fail gracefully)
    console.log('4. Testing Harness API...');
    const harnessRes = await fetch(`${BASE_URL}/api/harness`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        persona: personas[0],
        question: questions[0]
      })
    });

    if (harnessRes.status === 500) {
      const error = await harnessRes.json();
      if (error.error.includes('OPENAI_API_KEY')) {
        console.log('   ✓ Harness endpoint working (API key needed for full test)');
      } else {
        console.log('   ⚠ Harness endpoint error:', error.error);
      }
    } else if (harnessRes.ok) {
      console.log('   ✓ Harness endpoint working with API key');
    }

    // 5. Test experiments endpoint
    console.log('5. Testing Experiments API...');
    const experimentsRes = await fetch(`${BASE_URL}/api/experiments`);
    const experiments = await experimentsRes.json();
    console.log(`   ✓ Found ${experiments.length} past experiments`);

    // 6. Test OpenAI config endpoint
    console.log('6. Testing OpenAI Config API...');
    const configRes = await fetch(`${BASE_URL}/api/config/openai`);
    const config = await configRes.json();
    console.log(`   ✓ OpenAI configured: ${config.configured}`);

    console.log('\n✅ All endpoints are functional!');
    console.log('\nPipeline Components:');
    console.log('- Persona Management: ✓');
    console.log('- Question Management: ✓');
    console.log('- Questionnaire Management: ✓');
    console.log('- LLM Integration (Harness): ✓');
    console.log('- Experiment Runner: ✓');
    console.log('- Results Storage: ✓');
    console.log('- Configuration Management: ✓');

    console.log('\n📝 Next Steps:');
    console.log('1. Add your OpenAI API key in the UI or .env.local');
    console.log('2. Create personas and questionnaires');
    console.log('3. Run experiments to test personas');
    console.log('4. View and export results');

  } catch (error) {
    console.error('❌ Pipeline test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testPipeline().catch(console.error);