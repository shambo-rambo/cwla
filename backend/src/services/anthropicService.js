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
      const prompt = `CRITICAL INSTRUCTION: Respond ONLY in HTML format. Do not use markdown (no ##, **, *, etc.). Use HTML tags like <h3>, <strong>, <p>, <ol>, <li>.

You are an expert educational consultant specializing in teaching frameworks and pedagogical approaches. 

<p><strong>User Query:</strong> "${userInput}"</p>

<p>Please provide a comprehensive analysis that includes:</p>

<ol>
<li><strong>Framework Identification:</strong> What teaching/learning frameworks are most relevant to this query?</li>
<li><strong>Pedagogical Approach:</strong> Recommend specific teaching strategies and methodologies</li>
<li><strong>Learning Cycle Integration:</strong> How does this align with the 5-stage learning cycle (Engage, Explore, Explain, Elaborate, Evaluate)?</li>
<li><strong>Practical Implementation:</strong> Concrete steps teachers can take</li>
<li><strong>Assessment Strategies:</strong> How to measure effectiveness</li>
</ol>

<p>Keep your response structured, practical, and focused on actionable advice for educators.</p>`;

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
        content: `CRITICAL INSTRUCTION: Respond ONLY in HTML format. Do not use markdown (no ##, **, *, etc.). Use HTML tags like <h3>, <strong>, <p>, <ol>, <li>.

I want to create a comprehensive lesson plan, but I need more details to make it perfect for your specific context.

<p><strong>User's request:</strong> "${userInput}"</p>

<p>Please ask 3-4 targeted questions to gather the missing information I need to create the best possible lesson plan. Focus on:</p>

<h3>Key Areas to Explore:</h3>
<ol>
<li><strong>Class Context:</strong> How many students? What's their prior knowledge/experience with this topic?</li>
<li><strong>Lesson Scope:</strong> How many lessons in the series? Single lesson or multi-day unit?</li>
<li><strong>Practical Details:</strong> Lesson duration? Any specific learning objectives or assessment requirements?</li>
<li><strong>Student Needs:</strong> Any students with special learning needs? Mixed ability levels?</li>
</ol>

<p>Format your response as friendly, specific questions that show you understand their request but need these key details to create something truly tailored to their classroom.</p>

<p>Keep it conversational and encouraging - like a helpful colleague asking follow-up questions.</p>`
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

CRITICAL INSTRUCTION: Format your response as clean HTML. Use the EXACT structure below. Do not use markdown formatting (no ** or * characters).

<h2>Welcome to the Lesson Planner!</h2>

<p>I can help you in three different ways based on how much support you'd like:</p>

<h3>WORKFLOW OPTIONS:</h3>

\`\`\`interactive-options
- <strong>I Do</strong> - I'll create the complete lesson plan for you
- <strong>We Do</strong> - We'll collaborate through guided questions  
- <strong>You Do</strong> - You provide your lesson draft, I'll give feedback
\`\`\`

<h3>Choose your preferred workflow:</h3>

<ul>
<li><strong>I Do:</strong> Perfect when you're short on time or want a complete lesson plan created from scratch</li>
<li><strong>We Do:</strong> Great for collaborative planning where you want input on specific decisions</li>
<li><strong>You Do:</strong> Ideal when you have a lesson draft and want expert feedback and improvements</li>
</ul>

<p>Which workflow would work best for your needs today?</p>`
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
      console.log('🚀 generateIDoResponse called with:', userInput);
      console.log('📝 Conversation history length:', conversationHistory.length);
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
        content: `CRITICAL INSTRUCTION: Respond ONLY in HTML format. Do not use markdown (no ##, **, *, etc.). Use HTML tags like <h3>, <strong>, <p>, <ol>, <li>.

Perfect! You've chosen "I Do" - I'll create a complete lesson plan for you.

<p><strong>Original request:</strong> "${originalRequest}"</p>

<p>I'll handle all the planning, but first I need to gather a few key details to make sure the lesson plan is perfectly tailored to your specific classroom and needs.</p>

<h3>Quick Questions to Perfect Your Lesson:</h3>

<h4>Class Context:</h4>
<ol>
<li>How many students are in your class?</li>
<li>What grade/year level are you teaching?</li>
<li>How long is your lesson period?</li>
</ol>

<h4>Learning Focus:</h4>
<ol start="4">
<li>What's the main learning objective you want to achieve?</li>
<li>Are there any specific curriculum requirements to address?</li>
<li>Do you have any students with special learning needs (EAL/D, learning support, advanced learners)?</li>
</ol>

<h4>Resources & Timing:</h4>
<ol start="7">
<li>What resources/technology do you have available?</li>
<li>Is this a standalone lesson or part of a unit?</li>
<li>Any specific assessment requirements?</li>
</ol>

<p>Please answer 3-4 of these questions that are most relevant to your situation. Once I have these details, I'll create a comprehensive, ready-to-use lesson plan with all the Teaching and Learning Cycle stages perfectly structured for your classroom!</p>`
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
      console.log('🚀 generateWeDoResponse called with:', userInput);
      console.log('📝 Conversation history length:', conversationHistory.length);
      const originalRequest = conversationHistory.find(msg => msg.role === 'user')?.content || userInput;
      
      const messages = conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      messages.push({
        role: 'user',
        content: `CRITICAL INSTRUCTION: Respond ONLY in HTML format. Do not use markdown (no ##, **, *, etc.). Use HTML tags like <h3>, <strong>, <p>, <ol>, <li>.

Perfect! You've chosen "We Do" - let's collaborate to create your lesson plan.

<p><strong>Original request:</strong> "${originalRequest}"</p>

<p>I'll guide you through creating a lesson plan by asking targeted questions about your specific context and preferences. This ensures the final plan is perfectly tailored to your classroom.</p>

<p>Let's start with some key questions:</p>

<h4>Class Context:</h4>
<ol>
<li>How many students are in your class?</li>
<li>What's their current knowledge level with this topic?</li>
<li>Are there any students with special learning needs to consider?</li>
</ol>

<h4>Lesson Logistics:</h4>
<ol start="4">
<li>How long is your lesson period?</li>
<li>Is this a single lesson or part of a series?</li>
<li>What resources/technology do you have available?</li>
</ol>

<h4>Learning Focus:</h4>
<ol start="7">
<li>What specific skills or knowledge should students gain?</li>
<li>How will you know if students have learned successfully?</li>
<li>Are there any curriculum requirements to address?</li>
</ol>

<p>Please answer 2-3 of these questions that feel most important to you, and I'll ask follow-up questions to help us build the perfect lesson together!</p>`
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
      console.log('🚀 generateYouDoResponse called with:', userInput);
      console.log('📝 Conversation history length:', conversationHistory.length);
      const originalRequest = conversationHistory.find(msg => msg.role === 'user')?.content || userInput;
      
      const messages = conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      messages.push({
        role: 'user',
        content: `CRITICAL INSTRUCTION: Respond ONLY in HTML format. Do not use markdown (no ##, **, *, etc.). Use HTML tags like <h3>, <strong>, <p>, <ol>, <li>.

Excellent choice! You've selected "You Do" - I'll provide expert feedback on your lesson plan.

<p><strong>Original request:</strong> "${originalRequest}"</p>

<p>Before you share your lesson draft, let me ask a few quick questions to give you the most targeted and helpful feedback:</p>

<h4>About Your Lesson Context:</h4>
<ol>
<li>What grade/year level are you teaching?</li>
<li>How long is your lesson period?</li>
<li>How many students are in your class?</li>
</ol>

<h4>Feedback Focus:</h4>
<ol start="4">
<li>Are there specific areas you'd like me to focus on? (e.g., engagement, differentiation, timing, assessment)</li>
<li>Do you have students with special learning needs I should consider?</li>
<li>Are there particular Teaching and Learning Cycle stages you want to strengthen?</li>
</ol>

<h4>Your Lesson Status:</h4>
<ol start="7">
<li>Is this a complete draft or still in development?</li>
<li>Are there any challenges you're facing with this lesson?</li>
</ol>

<p>Please answer 2-3 of these questions, then paste your lesson plan draft. This will help me provide much more specific and useful feedback tailored to your exact needs!</p>`
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

      // Check if user just selected a workflow (handle both direct selections and formatted selections)
      const inputLower = userInput ? userInput.toLowerCase() : '';
      console.log('Checking workflow selection for input:', userInput);
      console.log('Input lowercase:', inputLower);
      
      const isWorkflowSelection = inputLower && (
        inputLower.includes('"i do"') ||
        inputLower.includes('"we do"') ||
        inputLower.includes('"you do"') ||
        inputLower.includes('selected:') ||
        inputLower.includes('i do') ||
        inputLower.includes('we do') ||
        inputLower.includes('you do') ||
        // Check for the specific workflow phrases from the HTML options
        inputLower.includes('complete lesson plan') ||
        inputLower.includes('collaborate through guided') ||
        inputLower.includes('provide your lesson draft') ||
        inputLower.includes('lesson draft, i\'ll give feedback')
      );

      console.log('Is workflow selection:', isWorkflowSelection);

      if (isWorkflowSelection) {
        console.log('✅ Workflow selection detected:', userInput);
        
        // Prioritize workflow detection based on specific phrases first
        if (inputLower.includes('you do') || inputLower.includes('provide your lesson draft') || inputLower.includes('lesson draft, i\'ll give feedback')) {
          console.log('🎯 Routing to You Do workflow');
          return this.generateYouDoResponse(userInput, conversationHistory);
        } else if (inputLower.includes('we do') || inputLower.includes('collaborate through guided')) {
          console.log('🎯 Routing to We Do workflow');
          return this.generateWeDoResponse(userInput, conversationHistory);
        } else if (inputLower.includes('i do') || inputLower.includes('complete lesson plan')) {
          console.log('🎯 Routing to I Do workflow');
          return this.generateIDoResponse(userInput, conversationHistory);
        }
      }

      // Check if we've already presented workflow options
      const hasWorkflowOptions = conversationHistory.some(msg => 
        msg.role === 'assistant' && 
        (msg.content.includes('interactive-options') || 
         msg.content.includes('WORKFLOW OPTIONS') ||
         msg.content.includes('I Do') && msg.content.includes('We Do') && msg.content.includes('You Do'))
      );

      console.log('Has workflow options already shown:', hasWorkflowOptions);

      // If we've shown workflow options but didn't detect a clear selection, ask them to choose again
      if (hasWorkflowOptions && !isWorkflowSelection) {
        console.log('⚠️ Workflow options shown but no clear selection detected - asking to choose again');
        return {
          success: true,
          response: `I see you've responded, but I'm not sure which workflow you'd like to use. Please click on one of the workflow options above:

\`\`\`interactive-options
- <strong>"I Do"</strong> - I'll create the complete lesson plan for you
- <strong>"We Do"</strong> - We'll collaborate through guided questions  
- <strong>"You Do"</strong> - You provide your lesson draft, I'll give feedback
\`\`\`

Please select one of these options so I can help you in the best way possible!`
        };
      }

      // Don't ask clarifying questions if we've already shown workflow options
      if (!hasWorkflowOptions) {
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
      }

      // Additional safety check - if we've shown workflow options, don't generate a regular lesson
      if (hasWorkflowOptions) {
        console.log('🚫 Blocking regular lesson generation - workflow options already shown');
        return {
          success: true,
          response: `I've already shown you the workflow options. Please select one of the workflows:

\`\`\`interactive-options
- <strong>"I Do"</strong> - I'll create the complete lesson plan for you
- <strong>"We Do"</strong> - We'll collaborate through guided questions  
- <strong>"You Do"</strong> - You provide your lesson draft, I'll give feedback
\`\`\`

Click on one of the options above to proceed with your lesson planning!`
        };
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

      const prompt = `CRITICAL INSTRUCTION: Respond ONLY in HTML format. Do not use markdown (no ##, **, *, etc.). Use HTML tags like <h2>, <h3>, <strong>, <p>, <ul>, <li>.

You are an expert lesson planner who creates detailed, engaging lesson plans using the Teaching and Learning Cycle (TLC). You have access to comprehensive TLC research and best practices.

<p><strong>Based on all the information provided:</strong> "${fullContext}"</p>

${tlcKnowledge.available ? `
<h3>TLC IMPLEMENTATION GUIDELINES (Research-Based):</h3>
<ul>
${tlcKnowledge.implementationGuidelines?.map(guideline => `<li>${guideline}</li>`).join('\n') || ''}
</ul>

<h3>DIFFERENTIATION STRATEGIES:</h3>
<ul>
<li><strong>EAL/D Support:</strong> ${tlcKnowledge.differentiationStrategies?.ealdSupport?.slice(0,2).join(', ') || 'Visual supports, multilingual resources'}</li>
<li><strong>Learning Support:</strong> ${tlcKnowledge.differentiationStrategies?.learningDifficulties?.slice(0,2).join(', ') || 'Visual aids, chunked information'}</li>
<li><strong>Advanced Learners:</strong> ${tlcKnowledge.differentiationStrategies?.advancedLearners?.slice(0,2).join(', ') || 'Tiered assignments, independent study'}</li>
</ul>

<h3>TROUBLESHOOTING TIPS (Evidence-Based):</h3>
<ul>
${contextualKnowledge.relevantTroubleshooting ? Object.entries(contextualKnowledge.relevantTroubleshooting).map(([key, tips]) => `<li><strong>${key}:</strong> ${tips.slice(0,2).join(', ')}</li>`).join('\n') : '<li>Use interactive annotation and think-pair-share for engagement</li>\n<li>Use talking protocols for joint construction</li>\n<li>Provide graphic organizers for independent work</li>'}
</ul>

<h3>QUALITY INDICATORS (Look for these signs of success):</h3>
<ul>
${tlcKnowledge.qualityIndicators ? Object.entries(tlcKnowledge.qualityIndicators).map(([stage, indicators]) => `<li><strong>${stage.replace(/([A-Z])/g, ' $1').trim()}:</strong> ${indicators[0] || ''}</li>`).join('\n') : ''}
</ul>
` : ''}

<p>Create a comprehensive lesson plan with the following structure:</p>

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
${tlcKnowledge.available ? '<p><em>Implementation tip: Ensure all students can participate regardless of background knowledge</em></p>' : ''}

<h2>STAGE 2: MODELING AND DECONSTRUCTION (25-30% of lesson time)</h2>
<ul>
<li>Teacher demonstrates or models the skill/concept</li>
<li>Break down examples step-by-step</li>
<li>Identify key features and patterns</li>
<li>Joint analysis of mentor texts or examples</li>
</ul>
${tlcKnowledge.available ? '<p><em>Implementation tip: Use think-aloud protocols and interactive annotation</em></p>' : ''}

<h2>STAGE 3: JOINT CONSTRUCTION (30-35% of lesson time)</h2>
<ul>
<li>Teacher and students work together</li>
<li>Guided practice with scaffolding</li>
<li>Collaborative problem-solving or writing</li>
<li>Strategic questioning and feedback</li>
</ul>
${tlcKnowledge.available ? '<p><em>Implementation tip: Use talking protocols and ensure multiple students contribute</em></p>' : ''}

<h2>STAGE 4: INDEPENDENT CONSTRUCTION (20-25% of lesson time)</h2>
<ul>
<li>Students work independently</li>
<li>Apply learning to new contexts</li>
<li>Individual assessment tasks</li>
<li>Self-reflection and peer feedback</li>
</ul>
${tlcKnowledge.available ? '<p><em>Implementation tip: Provide scaffolds like graphic organizers and sentence starters</em></p>' : ''}

<h2>DIFFERENTIATION STRATEGIES</h2>
<ul>
${contextualKnowledge.relevantDifferentiation ? Object.entries(contextualKnowledge.relevantDifferentiation).map(([need, strategies]) => `<li><strong>${need.toUpperCase()}:</strong> ${strategies.slice(0,3).join(', ')}</li>`).join('\n') : '<li>Visual supports for diverse learners</li>\n<li>Flexible grouping options</li>\n<li>Choice in demonstration methods</li>'}
</ul>

<h2>RESOURCES NEEDED</h2>
<ul>
<li>Materials list</li>
<li>Technology requirements</li>
<li>Preparation notes</li>
</ul>

<p>Make it practical, detailed, and immediately usable by teachers. Integrate TLC best practices throughout.</p>`;

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