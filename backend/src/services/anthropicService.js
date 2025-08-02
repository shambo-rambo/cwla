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

  // Analyze if the lesson request has sufficient detail
  isLessonRequestComplete(userInput) {
    const input = userInput.toLowerCase();
    
    // Required elements for a complete lesson plan
    const hasSubject = /\b(math|science|english|history|geography|art|music|pe|biology|chemistry|physics|literature|language|social studies|computer|technology)\b/.test(input);
    const hasTopic = input.length > 20; // Basic topic description
    const hasGradeLevel = /\b(year\s*\d+|grade\s*\d+|k-\d+|\d+th\s*grade|primary|secondary|elementary|middle|high|kindergarten)\b/.test(input);
    const hasClassSize = /\b(\d+\s*students?|class\s*of\s*\d+|small\s*group|large\s*class|\d+\s*kids?)\b/.test(input);
    const hasDuration = /\b(\d+\s*minutes?|\d+\s*hours?|\d+\s*days?|\d+\s*weeks?|single\s*lesson|unit|series)\b/.test(input);
    const hasContext = /\b(prior\s*knowledge|previous|experience|background|assessment|ability|level)\b/.test(input);

    // Count how many elements are present
    const completeness = [hasSubject, hasTopic, hasGradeLevel, hasClassSize, hasDuration, hasContext].filter(Boolean).length;
    
    // Require at least 3 out of 6 elements for a complete request
    return completeness >= 3;
  }

  async generateClarifyingQuestions(userInput, conversationHistory = []) {
    try {
      // Build messages array with conversation history
      const messages = conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      messages.push({
        role: 'user',
        content: `I want to create a comprehensive lesson plan, but I need more details to make it perfect for your specific context.

User's request: "${userInput}"

Please ask 3-4 targeted questions to gather the missing information I need to create the best possible lesson plan. Focus on:

1. **Class Context**: How many students? What's their prior knowledge/experience with this topic?
2. **Lesson Scope**: How many lessons in the series? Single lesson or multi-day unit?
3. **Practical Details**: Lesson duration? Any specific learning objectives or assessment requirements?
4. **Student Needs**: Any students with special learning needs? Mixed ability levels?

Format your response as friendly, specific questions that show you understand their request but need these key details to create something truly tailored to their classroom.

Keep it conversational and encouraging - like a helpful colleague asking follow-up questions.`
      });

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 800,
        messages: messages
      });

      return {
        success: true,
        response: response.content[0].text
      };
    } catch (error) {
      console.error('Clarifying questions error:', error);
      return {
        success: false,
        error: `Failed to generate clarifying questions: ${error.message}`
      };
    }
  }

  async generateLessonPlan(userInput, conversationHistory = []) {
    try {
      // Check if this is the first message and if it lacks detail
      if (conversationHistory.length === 0 && !this.isLessonRequestComplete(userInput)) {
        return this.generateClarifyingQuestions(userInput, conversationHistory);
      }

      // Check if we're in a clarifying questions conversation
      const lastAssistantMessage = conversationHistory
        .filter(msg => msg.role === 'assistant')
        .pop();
      
      const isAnsweringQuestions = lastAssistantMessage && 
        (lastAssistantMessage.content.includes('questions') || 
         lastAssistantMessage.content.includes('need more details') ||
         lastAssistantMessage.content.includes('tell me more'));

      // If user is answering questions but still lacks complete info, ask more questions
      if (isAnsweringQuestions && conversationHistory.length > 0 && conversationHistory.length < 6) {
        const allUserInput = conversationHistory
          .filter(msg => msg.role === 'user')
          .map(msg => msg.content)
          .join(' ');
        
        if (!this.isLessonRequestComplete(allUserInput)) {
          return this.generateClarifyingQuestions(userInput, conversationHistory);
        }
      }
      // Gather all user inputs for complete context
      const allUserRequests = conversationHistory
        .filter(msg => msg.role === 'user')
        .map(msg => msg.content)
        .join('\n\nAdditional details: ');

      const fullContext = allUserRequests ? `${userInput}\n\nAdditional details: ${allUserRequests}` : userInput;

      const prompt = `You are an expert lesson planner who creates detailed, engaging lesson plans using the 4-stage Teaching and Learning Cycle (TLC).

Based on all the information provided: "${fullContext}"`

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