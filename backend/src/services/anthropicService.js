const Anthropic = require('@anthropic-ai/sdk');
const unifiedKnowledge = require('./unifiedKnowledgeService');

// Debug: Check if API key exists
console.log('Anthropic API Key exists:', !!process.env.ANTHROPIC_API_KEY);
console.log('API Key length:', process.env.ANTHROPIC_API_KEY ? process.env.ANTHROPIC_API_KEY.length : 'undefined');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

class AnthropicService {
  
  /**
   * Extract lesson context from user input to provide relevant knowledge
   */
  extractLessonContext(fullContext) {
    const contextLower = fullContext.toLowerCase();
    
    // Extract subject
    let subject = null;
    if (contextLower.includes('english') || contextLower.includes('language arts')) {
      subject = 'english';
    } else if (contextLower.includes('science') || contextLower.includes('biology') || contextLower.includes('chemistry') || contextLower.includes('physics')) {
      subject = 'science';
    } else if (contextLower.includes('math') || contextLower.includes('mathematics')) {
      subject = 'mathematics';
    } else if (contextLower.includes('history') || contextLower.includes('social studies')) {
      subject = 'history';
    }
    
    // Extract challenges
    const challenges = [];
    if (contextLower.includes('engagement') || contextLower.includes('participation') || contextLower.includes('motivation')) {
      challenges.push('engagement');
    }
    if (contextLower.includes('discussion') || contextLower.includes('talk') || contextLower.includes('sharing')) {
      challenges.push('discussion');
    }
    if (contextLower.includes('writing') || contextLower.includes('independent work')) {
      challenges.push('writing');
    }
    
    // Extract student needs
    const studentNeeds = [];
    if (contextLower.includes('eal') || contextLower.includes('esl') || contextLower.includes('english language') || contextLower.includes('second language')) {
      studentNeeds.push('eal/d support');
    }
    if (contextLower.includes('learning difficult') || contextLower.includes('support') || contextLower.includes('struggling')) {
      studentNeeds.push('learning difficulties');
    }
    if (contextLower.includes('advanced') || contextLower.includes('gifted') || contextLower.includes('extension') || contextLower.includes('challenge')) {
      studentNeeds.push('advanced learners');
    }
    
    return {
      subject,
      challenges: challenges.length > 0 ? challenges : null,
      studentNeeds: studentNeeds.length > 0 ? studentNeeds : null
    };
  }

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
        max_tokens: 600, // Optimized for speed
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
    // Make smart questioning mandatory - always return false for initial requests
    // This ensures users always go through the clarifying questions process
    return false;
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

  async generateWorkflowSelection(userInput, conversationHistory = []) {
    try {
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 600,
        messages: [
          {
            role: 'user',
            content: `You are a lesson planning assistant. A teacher wants help with: "${userInput}"

CRITICAL INSTRUCTION: ABSOLUTELY NO EMOJIS ALLOWED. No robot emoji, no handshake emoji, no person emoji, no decorative characters of any kind. Text only.

Present them with three workflow options using the gradual release of responsibility model. Copy this exact text without any modifications or additions:

**Welcome to the Lesson Planner!**

I can help you in three different ways based on how much support you'd like:

**WORKFLOW OPTIONS:**

\`\`\`interactive-options
- **"I Do"** - I'll create the complete lesson plan for you
- **"We Do"** - We'll collaborate through guided questions  
- **"You Do"** - You provide your lesson draft, I'll give feedback
\`\`\`

**Choose your preferred workflow:**

- **"I Do"**: Perfect when you're short on time or want a complete lesson plan created from scratch
- **"We Do"**: Great for collaborative planning where you want input on specific decisions
- **"You Do"**: Ideal when you have a lesson draft and want expert feedback and improvements

Which workflow would work best for your needs today?`
          }
        ]
      });

      return {
        success: true,
        response: response.content[0].text
      };
    } catch (error) {
      console.error('Workflow selection error:', error);
      return {
        success: false,
        error: `Failed to generate workflow selection: ${error.message}`
      };
    }
  }

  async generateIDoResponse(userInput, conversationHistory = []) {
    try {
      // Get the original lesson request from the first message
      const originalRequest = conversationHistory.find(msg => msg.role === 'user')?.content || userInput;
      
      // Get TLC knowledge for enhanced lesson creation
      const tlcKnowledge = unifiedKnowledge.getKnowledgeForLessonPlanning();
      const knowledgeContext = this.extractLessonContext(originalRequest);
      const contextualKnowledge = unifiedKnowledge.getContextualKnowledge(knowledgeContext);
      
      const messages = conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      messages.push({
        role: 'user',
        content: `Perfect! You have chosen the "I Do" workflow. I will create a complete lesson plan for you using evidence-based Teaching and Learning Cycle practices.

Original request: "${originalRequest}"

Since you want me to handle all the planning, I will create a comprehensive lesson plan using the Teaching and Learning Cycle with research-based best practices integrated throughout.

${tlcKnowledge.available ? `
EVIDENCE-BASED TLC PRINCIPLES TO INTEGRATE:
${tlcKnowledge.implementationGuidelines?.map(guideline => `• ${guideline}`).join('\n') || ''}

DIFFERENTIATION STRATEGIES TO INCLUDE:
• EAL/D Support: ${tlcKnowledge.differentiationStrategies?.ealdSupport?.slice(0,2).join(', ') || 'Visual supports, multilingual resources'}
• Learning Support: ${tlcKnowledge.differentiationStrategies?.learningDifficulties?.slice(0,2).join(', ') || 'Visual aids, chunked information'}
• Advanced Learners: ${tlcKnowledge.differentiationStrategies?.advancedLearners?.slice(0,2).join(', ') || 'Tiered assignments, independent study'}

TROUBLESHOOTING PREVENTION:
${contextualKnowledge.relevantTroubleshooting ? Object.entries(contextualKnowledge.relevantTroubleshooting).map(([key, tips]) => `• ${key}: ${tips[0] || ''}`).join('\n') : '• Use interactive strategies to maintain engagement\n• Include talking protocols for structured collaboration'}
` : ''}

IMPORTANT: Please format your response as clean, professional HTML that can be easily copied and pasted. Use proper HTML structure with headings, lists, and clear formatting. Do not include any emojis or decorative characters.

Create a detailed, ready-to-implement lesson plan following this HTML structure:

<h2>LESSON OVERVIEW</h2>
<ul>
<li>Subject/Topic:</li>
<li>Grade Level:</li>
<li>Duration:</li>
<li>Learning Objectives:</li>
<li>Success Criteria:</li>
</ul>

<h2>STAGE 1: BUILDING THE FIELD (15-20% of lesson time)</h2>
<ul>
<li>Activate prior knowledge and build context</li>
<li>Introduce key vocabulary and concepts</li>
<li>Explore the topic through discussion and shared activities</li>
<li>Set the purpose for learning</li>
</ul>

<h2>STAGE 2: MODELING AND DECONSTRUCTION (25-30% of lesson time)</h2>
<ul>
<li>Teacher demonstrates or models the skill/concept</li>
<li>Break down examples step-by-step</li>
<li>Identify key features and patterns</li>
<li>Joint analysis of mentor texts or examples</li>
</ul>

<h2>STAGE 3: JOINT CONSTRUCTION (30-35% of lesson time)</h2>
<ul>
<li>Teacher and students work together</li>
<li>Guided practice with scaffolding</li>
<li>Collaborative problem-solving or writing</li>
<li>Strategic questioning and feedback</li>
</ul>

<h2>STAGE 4: INDEPENDENT CONSTRUCTION (20-25% of lesson time)</h2>
<ul>
<li>Students work independently</li>
<li>Apply learning to new contexts</li>
<li>Individual assessment tasks</li>
<li>Self-reflection and peer feedback</li>
</ul>

<h2>RESOURCES NEEDED</h2>
<ul>
<li>Materials list</li>
<li>Technology requirements</li>
<li>Preparation notes</li>
</ul>

<h2>DIFFERENTIATION STRATEGIES</h2>
<ul>
<li>EAL/D Support strategies</li>
<li>Learning Support accommodations</li>
<li>Advanced Learner extensions</li>
</ul>

Make it practical, detailed, immediately usable, and ensure all output is in clean HTML format without any emojis.`
      });

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 600,
        messages: messages
      });

      return {
        success: true,
        response: response.content[0].text
      };
    } catch (error) {
      console.error('I Do response error:', error);
      return {
        success: false,
        error: `Failed to generate I Do response: ${error.message}`
      };
    }
  }

  async generateWeDoResponse(userInput, conversationHistory = []) {
    try {
      const originalRequest = conversationHistory.find(msg => msg.role === 'user')?.content || userInput;
      
      const messages = conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      messages.push({
        role: 'user',
        content: `Perfect! You've chosen "We Do" - let's collaborate to create your lesson plan.

Original request: "${originalRequest}"

I'll guide you through creating a lesson plan by asking targeted questions about your specific context and preferences. This ensures the final plan is perfectly tailored to your classroom.

Let's start with some key questions:

**Class Context:**
1. How many students are in your class?
2. What's their current knowledge level with this topic?
3. Are there any students with special learning needs to consider?

**Lesson Logistics:**
4. How long is your lesson period?
5. Is this a single lesson or part of a series?
6. What resources/technology do you have available?

**Learning Focus:**
7. What specific skills or knowledge should students gain?
8. How will you know if students have learned successfully?
9. Are there any curriculum requirements to address?

Please answer 2-3 of these questions that feel most important to you, and I'll ask follow-up questions to help us build the perfect lesson together!`
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
      console.error('We Do response error:', error);
      return {
        success: false,
        error: `Failed to generate We Do response: ${error.message}`
      };
    }
  }

  async generateYouDoResponse(userInput, conversationHistory = []) {
    try {
      const messages = conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      messages.push({
        role: 'user',
        content: `Excellent choice! You've selected "You Do" - I'm ready to provide feedback on your lesson plan.

Please paste your lesson plan draft below, and I'll provide:

• **Constructive feedback** on structure and pedagogy
• **Alignment check** with the Teaching and Learning Cycle
• **Enhancement suggestions** for student engagement
• **Differentiation recommendations** for diverse learners
• **Assessment improvement** ideas
• **Resource and timing** optimization tips

**What to include in your lesson plan:**
- Learning objectives
- Activities and timing
- Resources needed
- Assessment strategies
- Any specific concerns or areas you'd like me to focus on

Just paste your lesson plan when you're ready, and I'll give you detailed, actionable feedback to make it even better!`
      });

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 600,
        messages: messages
      });

      return {
        success: true,
        response: response.content[0].text
      };
    } catch (error) {
      console.error('You Do response error:', error);
      return {
        success: false,
        error: `Failed to generate You Do response: ${error.message}`
      };
    }
  }

  async generateLessonPlan(userInput, conversationHistory = []) {
    try {
      // Check if this is the very first user message - offer workflow selection
      const userMessages = conversationHistory.filter(msg => msg.role === 'user');
      if (userMessages.length === 0) {
        return this.generateWorkflowSelection(userInput, conversationHistory);
      }

      // Check if user just selected a workflow
      const isWorkflowSelection = userInput && (
        userInput.toLowerCase().includes('i do') ||
        userInput.toLowerCase().includes('we do') ||
        userInput.toLowerCase().includes('you do')
      );

      if (isWorkflowSelection) {
        const selectedWorkflow = userInput.toLowerCase();
        
        if (selectedWorkflow.includes('you do')) {
          return this.generateYouDoResponse(userInput, conversationHistory);
        } else if (selectedWorkflow.includes('we do')) {
          return this.generateWeDoResponse(userInput, conversationHistory);
        } else if (selectedWorkflow.includes('i do')) {
          return this.generateIDoResponse(userInput, conversationHistory);
        }
      }

      // Check if this is the first message and if it lacks detail
      if (userMessages.length === 0 && !this.isLessonRequestComplete(userInput)) {
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

      // Get TLC knowledge base for enhanced lesson planning
      const tlcKnowledge = unifiedKnowledge.getKnowledgeForLessonPlanning();
      const knowledgeContext = this.extractLessonContext(fullContext);
      const contextualKnowledge = unifiedKnowledge.getContextualKnowledge(knowledgeContext);

      const prompt = `You are an expert lesson planner who creates detailed, engaging lesson plans using the Teaching and Learning Cycle (TLC). You have access to comprehensive TLC research and best practices.

Based on all the information provided: "${fullContext}"

${tlcKnowledge.available ? `
**TLC IMPLEMENTATION GUIDELINES** (Research-Based):
${tlcKnowledge.implementationGuidelines?.map(guideline => `- ${guideline}`).join('\n') || ''}

**DIFFERENTIATION STRATEGIES**:
- EAL/D Support: ${tlcKnowledge.differentiationStrategies?.ealdSupport?.slice(0,2).join(', ') || 'Visual supports, multilingual resources'}
- Learning Support: ${tlcKnowledge.differentiationStrategies?.learningDifficulties?.slice(0,2).join(', ') || 'Visual aids, chunked information'}
- Advanced Learners: ${tlcKnowledge.differentiationStrategies?.advancedLearners?.slice(0,2).join(', ') || 'Tiered assignments, independent study'}

**TROUBLESHOOTING TIPS** (Evidence-Based):
${contextualKnowledge.relevantTroubleshooting ? Object.entries(contextualKnowledge.relevantTroubleshooting).map(([key, tips]) => `- ${key}: ${tips.slice(0,2).join(', ')}`).join('\n') : '- Use interactive annotation and think-pair-share for engagement\n- Use talking protocols for joint construction\n- Provide graphic organizers for independent work'}

**QUALITY INDICATORS** (Look for these signs of success):
${tlcKnowledge.qualityIndicators ? Object.entries(tlcKnowledge.qualityIndicators).map(([stage, indicators]) => `- ${stage.replace(/([A-Z])/g, ' $1').trim()}: ${indicators[0] || ''}`).join('\n') : ''}
` : ''}

Create a comprehensive lesson plan with the following structure:

**LESSON OVERVIEW**
- Subject/Topic:
- Grade Level:
- Duration:
- Learning Objectives:
- Success Criteria:

**STAGE 1: BUILDING THE FIELD** (15-20% of lesson time)
- Activate prior knowledge and build context
- Introduce key vocabulary and concepts
- Explore the topic through discussion and shared activities
- Set the purpose for learning
${tlcKnowledge.available ? '\n*Implementation tip: Ensure all students can participate regardless of background knowledge*' : ''}

**STAGE 2: MODELING AND DECONSTRUCTION** (25-30% of lesson time)  
- Teacher demonstrates or models the skill/concept
- Break down examples step-by-step
- Identify key features and patterns
- Joint analysis of mentor texts or examples
${tlcKnowledge.available ? '\n*Implementation tip: Use think-aloud protocols and interactive annotation*' : ''}

**STAGE 3: JOINT CONSTRUCTION** (30-35% of lesson time)
- Teacher and students work together
- Guided practice with scaffolding
- Collaborative problem-solving or writing
- Strategic questioning and feedback
${tlcKnowledge.available ? '\n*Implementation tip: Use talking protocols and ensure multiple students contribute*' : ''}

**STAGE 4: INDEPENDENT CONSTRUCTION** (20-25% of lesson time)
- Students work independently
- Apply learning to new contexts
- Individual assessment tasks
- Self-reflection and peer feedback
${tlcKnowledge.available ? '\n*Implementation tip: Provide scaffolds like graphic organizers and sentence starters*' : ''}

**DIFFERENTIATION STRATEGIES**
${contextualKnowledge.relevantDifferentiation ? Object.entries(contextualKnowledge.relevantDifferentiation).map(([need, strategies]) => `- ${need.toUpperCase()}: ${strategies.slice(0,3).join(', ')}`).join('\n') : '- Visual supports for diverse learners\n- Flexible grouping options\n- Choice in demonstration methods'}

**RESOURCES NEEDED**
- Materials list
- Technology requirements
- Preparation notes

Make it practical, detailed, and immediately usable by teachers. Integrate TLC best practices throughout.`;

      // Build messages array with LIMITED conversation history for speed (last 6 messages)
      const limitedHistory = conversationHistory.slice(-6);
      const messages = limitedHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      messages.push({
        role: 'user',
        content: prompt
      });

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 600, // Optimized for speed
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