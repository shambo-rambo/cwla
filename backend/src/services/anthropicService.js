const Anthropic = require('@anthropic-ai/sdk');

// Debug: Check if API key exists
console.log('Anthropic API Key exists:', !!process.env.ANTHROPIC_API_KEY);
console.log('API Key length:', process.env.ANTHROPIC_API_KEY ? process.env.ANTHROPIC_API_KEY.length : 'undefined');

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
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1200, // Reduced for faster response
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
        error: `Failed to generate framework analysis: ${error.message}`
      };
    }
  }

  async generateLessonPlan(userInput, conversationHistory = []) {
    try {
      const prompt = `You are an expert lesson planner who creates detailed, engaging lesson plans using the 4-stage Teaching and Learning Cycle (TLC).

User Request: "${userInput}"

Create a comprehensive lesson plan with the following structure:

**LESSON OVERVIEW**
- Subject/Topic:
- Grade Level:
- Duration:
- Learning Objectives:

**STAGE 1: BUILDING THE FIELD** (15-20% of lesson time)
- Activate prior knowledge and build context
- Introduce key vocabulary and concepts
- Explore the topic through discussion and shared activities
- Set the purpose for learning

**STAGE 2: MODELING AND DECONSTRUCTION** (25-30% of lesson time)  
- Teacher demonstrates or models the skill/concept
- Break down examples step-by-step
- Identify key features and patterns
- Joint analysis of mentor texts or examples

**STAGE 3: JOINT CONSTRUCTION** (30-35% of lesson time)
- Teacher and students work together
- Guided practice with scaffolding
- Collaborative problem-solving or writing
- Strategic questioning and feedback

**STAGE 4: INDEPENDENT CONSTRUCTION** (20-25% of lesson time)
- Students work independently
- Apply learning to new contexts
- Individual assessment tasks
- Self-reflection and peer feedback

**RESOURCES NEEDED**
- Materials list
- Technology requirements
- Preparation notes

**DIFFERENTIATION**
- Support for struggling learners
- Extensions for advanced students
- Accommodations for diverse needs

Make it practical, detailed, and immediately usable by teachers.`;

      // Build messages array with conversation history + system prompt
      const messages = conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      messages.push({
        role: 'user',
        content: prompt
      });

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1800, // Reduced for faster response
        messages: messages
      });

      return {
        success: true,
        response: response.content[0].text
      };
    } catch (error) {
      console.error('Anthropic API Error:', error);
      return {
        success: false,
        error: `Failed to generate lesson plan: ${error.message}`
      };
    }
  }
}

module.exports = new AnthropicService();