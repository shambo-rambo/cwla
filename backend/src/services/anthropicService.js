const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

class AnthropicService {
  async generateFrameworkAnalysis(userInput) {
    try {
      const prompt = `You are an expert educational consultant specializing in teaching frameworks and pedagogical approaches. 

User Query: "${userInput}"

Please provide a comprehensive analysis that includes:

1. **Framework Identification**: What teaching/learning frameworks are most relevant to this query?

2. **Pedagogical Approach**: Recommend specific teaching strategies and methodologies

3. **Learning Cycle Integration**: How does this align with the 5-stage learning cycle (Engage, Explore, Explain, Elaborate, Evaluate)?

4. **Practical Implementation**: Concrete steps teachers can take

5. **Assessment Strategies**: How to measure effectiveness

Keep your response structured, practical, and focused on actionable advice for educators.`;

      const response = await anthropic.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1500,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      return {
        success: true,
        response: response.content[0].text
      };
    } catch (error) {
      console.error('Anthropic API Error:', error);
      return {
        success: false,
        error: 'Failed to generate framework analysis'
      };
    }
  }

  async generateLessonPlan(userInput) {
    try {
      const prompt = `You are an expert lesson planner who creates detailed, engaging lesson plans using the 5-stage Teaching and Learning Cycle.

User Request: "${userInput}"

Create a comprehensive lesson plan with the following structure:

**LESSON OVERVIEW**
- Subject/Topic:
- Grade Level:
- Duration:
- Learning Objectives:

**STAGE 1: ENGAGE** (5-10 minutes)
- Hook activity to capture interest
- Prior knowledge activation
- Essential question introduction

**STAGE 2: EXPLORE** (15-20 minutes)
- Hands-on investigation activities
- Student-led discovery tasks
- Collaborative learning opportunities

**STAGE 3: EXPLAIN** (10-15 minutes)
- Clear concept explanations
- Vocabulary introduction
- Teacher-guided instruction

**STAGE 4: ELABORATE** (15-20 minutes)
- Application to new contexts
- Extended learning activities
- Cross-curricular connections

**STAGE 5: EVALUATE** (5-10 minutes)
- Formative assessment strategies
- Student reflection activities
- Success criteria check

**RESOURCES NEEDED**
- Materials list
- Technology requirements
- Preparation notes

**DIFFERENTIATION**
- Support for struggling learners
- Extensions for advanced students
- Accommodations for diverse needs

Make it practical, detailed, and immediately usable by teachers.`;

      const response = await anthropic.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      return {
        success: true,
        response: response.content[0].text
      };
    } catch (error) {
      console.error('Anthropic API Error:', error);
      return {
        success: false,
        error: 'Failed to generate lesson plan'
      };
    }
  }
}

module.exports = new AnthropicService();