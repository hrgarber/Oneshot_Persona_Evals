// HACK: Simple keyword-based behavioral analysis for POC
// In production, would use NLP or ML for proper analysis

interface BehavioralTraits {
  timeOrientation: 'urgent' | 'balanced' | 'thorough';
  riskTolerance: 'high' | 'medium' | 'low';
  scopeFocus: 'minimal' | 'balanced' | 'comprehensive';
  qualityApproach: 'pragmatic' | 'balanced' | 'rigorous';
  validationMethod: 'user-feedback' | 'metrics' | 'technical';
}

export function analyzeBehavioralProfile(responses: Record<string, string>): {
  profile: string;
  traits: BehavioralTraits;
} {
  const traits: BehavioralTraits = {
    timeOrientation: 'balanced',
    riskTolerance: 'medium',
    scopeFocus: 'balanced',
    qualityApproach: 'balanced',
    validationMethod: 'metrics',
  };

  // Analyze time orientation (q02, q07)
  const timeResponses = [responses.q02_time_quality_tradeoff, responses.q07_time_orientation].join(' ').toLowerCase();
  if (timeResponses.includes('minimum') || timeResponses.includes('quick') || timeResponses.includes('2 hour')) {
    traits.timeOrientation = 'urgent';
  } else if (timeResponses.includes('thorough') || timeResponses.includes('complete')) {
    traits.timeOrientation = 'thorough';
  }

  // Analyze risk tolerance (q03, q06)
  const riskResponses = [responses.q03_success_definition, responses.q06_risk_tolerance].join(' ').toLowerCase();
  if (riskResponses.includes('ship') || riskResponses.includes('success') && riskResponses.includes('crash')) {
    traits.riskTolerance = 'high';
  } else if (riskResponses.includes('refactor') || riskResponses.includes('failure')) {
    traits.riskTolerance = 'low';
  }

  // Analyze scope focus (q04, q09, q10)
  const scopeResponses = [responses.q04_scope_boundaries, responses.q09_approach_intent, responses.q10_exclusion_intent].join(' ').toLowerCase();
  if (scopeResponses.includes('minimum') || scopeResponses.includes('simple') || scopeResponses.includes('not include')) {
    traits.scopeFocus = 'minimal';
  } else if (scopeResponses.includes('comprehensive') || scopeResponses.includes('complete')) {
    traits.scopeFocus = 'comprehensive';
  }

  // Analyze quality approach (q05)
  const qualityResponse = (responses.q05_quality_tradeoffs || '').toLowerCase();
  if (qualityResponse.includes('good enough') || qualityResponse.includes('working')) {
    traits.qualityApproach = 'pragmatic';
  } else if (qualityResponse.includes('clean') || qualityResponse.includes('proper')) {
    traits.qualityApproach = 'rigorous';
  }

  // Analyze validation method (q08, q11)
  const validationResponses = [responses.q08_success_definition_detailed, responses.q11_validation_intent].join(' ').toLowerCase();
  if (validationResponses.includes('user') || validationResponses.includes('feedback')) {
    traits.validationMethod = 'user-feedback';
  } else if (validationResponses.includes('technical') || validationResponses.includes('code')) {
    traits.validationMethod = 'technical';
  }

  // Generate profile description based on traits
  const profileParts = [];

  if (traits.timeOrientation === 'urgent') {
    profileParts.push('Extreme time pressure');
  } else if (traits.timeOrientation === 'thorough') {
    profileParts.push('Methodical approach');
  }

  if (traits.riskTolerance === 'high') {
    profileParts.push('high risk tolerance');
  } else if (traits.riskTolerance === 'low') {
    profileParts.push('risk-averse');
  }

  if (traits.scopeFocus === 'minimal') {
    profileParts.push('scope minimalism');
  } else if (traits.scopeFocus === 'comprehensive') {
    profileParts.push('comprehensive coverage');
  }

  if (traits.qualityApproach === 'pragmatic') {
    profileParts.push('pragmatic quality');
  } else if (traits.qualityApproach === 'rigorous') {
    profileParts.push('quality-focused');
  }

  if (traits.validationMethod === 'user-feedback') {
    profileParts.push('user-driven validation');
  } else if (traits.validationMethod === 'technical') {
    profileParts.push('technical validation');
  }

  const profile = profileParts.length > 0
    ? profileParts.join(', ')
    : 'Balanced approach across all dimensions';

  return { profile, traits };
}