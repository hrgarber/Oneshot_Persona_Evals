# Claude Code Persona Testing Framework - Full Conversation

## Initial Problem Discovery

**User Issue**: Claude Code consistently provides overly comprehensive, production-ready solutions when the user needs quick proof-of-concept (POC) or MVP-style implementations for data science work.

**Key Frustration**: Coming from a data science background focused on rapid experimentation and validation, the user finds Claude Code's default "enterprise readiness" approach misaligned with their needs.

## Core Insights Discovered

### The Fundamental Misalignment

**Claude Code's Default**: "Enterprise readiness" thinking - full error handling, scalability considerations, best practices, production-ready systems.

**User's Need**: "Research mode" thinking - rapid experimentation, hypothesis validation, minimal viable proof concepts.

### The Semantic Gap

- **To the user**: A working POC that crashes on bad input is still successful research
- **To Claude Code**: A solution must be production-ready and handle all edge cases
- **The divergence**: Different stakeholder perspectives on what constitutes "done"

#### Stakeholder Perspectives on "Done":
- **Researcher**: Hypothesis validated
- **Product Manager**: User value demonstrated  
- **Engineer**: Deployment ready (Claude Code's default)
- **Business**: ROI demonstrated
- **Academic**: Publishable results

## Current Workaround Attempts

**Negative Prompting**: User has found some success with words like:
- "concise"
- "terse" 
- "minimal"
- "not comprehensive"
- "not overdone"

**Limitation**: Only knows what NOT to do, not what TO do.

## Proposed Solutions Framework

### 1. Hypothesis-Driven Prompting
Instead of: "Build me a recommendation system"
Use: "Test whether collaborative filtering can predict user preferences with this dataset - spend maximum 2 hours, accept dirty code if it proves the concept"

**Key Elements**:
- Explicit time constraints (as forcing functions, not accurate estimates)
- Success criteria defined upfront
- Scientist mode framing
- Permission for "dirty code"
- Focus on proof over polish

### 2. Qualitative Constraints Over Quantitative
**Problem**: Claude Code's time estimates are consistently inaccurate
**Solution**: Use descriptive constraints that communicate mindset:
- "quick and dirty"
- "hackathon style" 
- "bare minimum approach"
- "throw-away code acceptable"
- "scrappy prototype"
- "proof-of-concept only"

### 3. Persona-Based Approach

**Theory**: Persona prompts might be more powerful than explicit constraints because they shift the entire contextual frame and embedded assumptions.

**Advantage**: Changes defaults rather than fighting against them
**Disadvantage**: Less transparent, "black box magic"

## Persona Diagnostic Framework

### Phase 1: Qualifying Questions (Jury Selection Style)
Quick filters to eliminate personas that fundamentally won't work:
- "When faced with uncertain requirements, do you gather more information or start building?"
- Deal-breaker trait identification
- Fundamental approach compatibility

### Phase 2: Behavioral Diagnostic Categories
For personas that pass initial qualification, test these dimensions:

1. **Scope Boundaries**: Minimal viable proof vs comprehensive system
2. **Quality Trade-offs**: Clean code vs quick results  
3. **Risk Tolerance**: Accepts messy solutions vs requires robustness
4. **Time Orientation**: Prototype mindset vs production timeline
5. **Success Definition**: Hypothesis validated vs deployment ready

### Phase 3: Intent vs Actual Analysis
- Ask persona to explain approach before coding
- Compare stated intent to actual implementation
- Gap analysis reveals what persona actually means to AI vs what it thinks it means

## Candidate Personas for Testing

**Target**: Roles that regularly make technical trade-offs under constraints

**Good Candidates**:
- Early-stage startup founder
- Research lab PhD student  
- Consulting firm senior analyst
- Product engineer at growth company
- Hackathon participant (with caveats about depth)

**Avoid**: Pure executives or pure academics who don't live in the messy middle ground

## Observable Behavioral Markers

To measure persona effectiveness without subjective interpretation:
- Count of error handling blocks
- Number of modules/functions created
- Presence of config files
- Code organization patterns
- Logging implementation
- Documentation verbosity

## Advanced Technique: Contextual Backstory

**Concept**: Add specific experiential context to personas
**Example**: "You're a startup CTO who just got burned by over-engineering your last product and missed market timing"

**Benefits**: 
- Creates specific behavioral anchors
- Leverages model's pattern matching about real scenarios
- More precise than generic titles

**Recommendation**: Test basic personas first, then add this layer

## Implementation Steps

### Immediate Next Actions:
1. **Two-Step Testing Process**:
   - Run 3-4 candidate personas through qualifying questions
   - Keep survivors for diagnostic testing
   - Test diagnostic categories on remaining personas
   - Select 1-2 that match desired behavior patterns

2. **Create Reusable Framework**:
   - Document qualifying questions that work
   - Map persona responses to behavioral patterns
   - Build lookup table for future use

### Testing Approach:
- Use same simple coding task across all personas
- Focus on observable behavioral differences
- Prioritize "quick AND smart" over just fast or just thorough

## Key Principles Established

1. **Persona shifts may be more fundamental than explicit constraints**
2. **Time constraints work as forcing functions regardless of accuracy**
3. **Language is about pointing toward actual behavior, not precise meaning**
4. **Observable behaviors reveal more than stated intentions**
5. **Different personas embed different success criteria and risk tolerances**

## Open Questions for Further Testing

- Which qualifying questions most effectively filter personas?
- Do personas + explicit constraints reinforce each other?
- How much contextual backstory optimally influences behavior?
- Which observable markers most reliably predict user satisfaction?

---

*This framework represents a systematic approach to aligning AI coding assistants with rapid prototyping and research-oriented development needs, moving beyond generic prompting to persona-based behavioral modification.*