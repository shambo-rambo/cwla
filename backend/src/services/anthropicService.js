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

  async generateSmartQuestioning(userInput, conversationHistory = [], workflowType = 'I Do') {
    try {
      console.log('🚀 generateSmartQuestioning called for:', workflowType);
      console.log('📝 Conversation history length:', conversationHistory.length);
      
      const originalRequest = conversationHistory.find(msg => msg.role === 'user')?.content || userInput;
      
      const messages = conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      messages.push({
        role: 'user',
        content: `CRITICAL INSTRUCTION: Respond ONLY in HTML format. Do not use markdown (no ##, **, *, etc.). Use HTML tags like <h3>, <strong>, <p>, <ol>, <li>.

Perfect! You've chosen "${workflowType}" workflow.

<p><strong>Original request:</strong> "${originalRequest}"</p>

<p>Before I can help you effectively, I need to gather some key information to ensure the lesson plan is perfectly tailored to your specific classroom context.</p>

<h3>Smart Questions to Get Started:</h3>

<h4>Essential Context:</h4>
<ol>
<li><strong>Subject & Topic:</strong> What specific subject and topic are you teaching?</li>
<li><strong>Grade Level:</strong> What grade/year level are your students?</li>
<li><strong>Lesson Duration:</strong> How long is your lesson period?</li>
<li><strong>Class Size:</strong> How many students are in your class?</li>
</ol>

<h4>Learning Focus:</h4>
<ol start="5">
<li><strong>Learning Objectives:</strong> What should students be able to do by the end of this lesson?</li>
<li><strong>Prior Knowledge:</strong> What do students already know about this topic?</li>
<li><strong>Assessment:</strong> How will you check if students have learned successfully?</li>
</ol>

<h4>Resources & Context:</h4>
<ol start="8">
<li><strong>Available Resources:</strong> What materials, technology, or space do you have access to?</li>
<li><strong>Student Needs:</strong> Do you have students with diverse learning needs (EAL/D, learning support, advanced learners)?</li>
</ol>

<p><strong>Please answer 4-5 of these questions that are most relevant to your situation.</strong> Once I have this information, I'll proceed with the ${workflowType} approach you selected!</p>`
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
      console.error('Smart questioning error:', error);
      return {
        success: false,
        error: `Failed to generate smart questioning: ${error.message}`
      };
    }
  }

  async generateIDoResponse(userInput, conversationHistory = []) {
    try {
      console.log('🚀 generateIDoResponse called with:', userInput);
      console.log('📝 Conversation history length:', conversationHistory.length);
      
      // Get all user inputs to build complete context
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

Perfect! Based on all the information you've provided, I'll now create your complete lesson plan.

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
        max_tokens: 800, // Increased for complete lesson plan
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
      
      // Get context from all user responses
      const allUserRequests = conversationHistory
        .filter(msg => msg.role === 'user')
        .map(msg => msg.content)
        .join('\n\nAdditional details: ');

      const fullContext = allUserRequests ? `${userInput}\n\nAdditional details: ${allUserRequests}` : userInput;
      
      const messages = conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      messages.push({
        role: 'user',
        content: `CRITICAL INSTRUCTION: Respond ONLY in HTML format. Do not use markdown (no ##, **, *, etc.). Use HTML tags like <h3>, <strong>, <p>, <ol>, <li>.

Excellent! Now let's collaborate to build your lesson plan step by step.

<p><strong>Based on what you've shared:</strong> "${fullContext}"</p>

<p>I'll guide you through each stage of the Teaching and Learning Cycle with specific questions to help you design the most effective lesson. Let's work together on the details:</p>

<h3>Building the Field - Getting Started:</h3>
<ol>
<li><strong>Hook Activity:</strong> What engaging activity could you start with to grab students' attention and connect to their prior knowledge?</li>
<li><strong>Vocabulary:</strong> What key terms or concepts do students need to understand before diving into the main content?</li>
<li><strong>Context Setting:</strong> How will you help students understand why this learning matters to them?</li>
</ol>

<h3>Modeling & Deconstruction - Showing How:</h3>
<ol start="4">
<li><strong>Demonstration:</strong> What specific examples or models will you show students to illustrate the concept?</li>
<li><strong>Think-Aloud:</strong> What thinking processes should you make visible as you work through examples?</li>
<li><strong>Key Features:</strong> What patterns or elements do you want students to notice and identify?</li>
</ol>

<h3>Joint Construction - Working Together:</h3>
<ol start="7">
<li><strong>Collaborative Activity:</strong> How will you and your students work together to practice or apply the learning?</li>
<li><strong>Scaffolding:</strong> What supports will you provide as students try the skill/concept with your guidance?</li>
</ol>

<p><strong>Let's start with 2-3 questions from the first section (Building the Field).</strong> What ideas do you have for hooking your students and building their understanding of why this topic matters?</p>`
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
      
      // Get context from all user responses  
      const allUserRequests = conversationHistory
        .filter(msg => msg.role === 'user')
        .map(msg => msg.content)
        .join('\n\nAdditional details: ');

      const fullContext = allUserRequests ? `${userInput}\n\nAdditional details: ${allUserRequests}` : userInput;
      
      const messages = conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      messages.push({
        role: 'user',
        content: `CRITICAL INSTRUCTION: Respond ONLY in HTML format. Do not use markdown (no ##, **, *, etc.). Use HTML tags like <h3>, <strong>, <p>, <ol>, <li>.

Perfect! Now I'm ready to provide expert feedback on your lesson plan.

<p><strong>Based on the context you've provided:</strong> "${fullContext}"</p>

<p>I'll analyze your lesson plan and provide specific feedback on:</p>

<h3>Teaching and Learning Cycle Analysis:</h3>
<ul>
<li><strong>Building the Field:</strong> How well does your lesson activate prior knowledge and set context?</li>
<li><strong>Modeling & Deconstruction:</strong> Are your demonstrations and examples clear and effective?</li>
<li><strong>Joint Construction:</strong> Do you have collaborative activities with appropriate scaffolding?</li>
<li><strong>Independent Construction:</strong> Are students given appropriate opportunities to apply learning independently?</li>
</ul>

<h3>Specific Focus Areas:</h3>
<ul>
<li><strong>Student Engagement:</strong> Activities that will capture and maintain student interest</li>
<li><strong>Differentiation:</strong> Support for diverse learners based on your class context</li>
<li><strong>Assessment:</strong> How you'll check student understanding throughout the lesson</li>
<li><strong>Timing & Flow:</strong> Lesson pacing and transitions between activities</li>
<li><strong>Resources & Preparation:</strong> What you'll need and how to prepare effectively</li>
</ul>

<h3>Ready for Your Lesson Plan!</h3>
<p><strong>Please paste your lesson plan draft below.</strong> Include as much detail as you have - even rough notes or bullet points are fine. I'll provide specific, actionable feedback to help you strengthen the lesson and align it with Teaching and Learning Cycle best practices.</p>

<p><em>The more detail you share, the more targeted and helpful my feedback will be!</em></p>`
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
        
        // ALL workflows start with smart questioning to gather enough information
        if (inputLower.includes('you do') || inputLower.includes('provide your lesson draft') || inputLower.includes('lesson draft, i\'ll give feedback')) {
          console.log('🎯 Routing to You Do workflow - Starting with smart questioning');
          return this.generateSmartQuestioning(userInput, conversationHistory, 'You Do');
        } else if (inputLower.includes('we do') || inputLower.includes('collaborate through guided')) {
          console.log('🎯 Routing to We Do workflow - Starting with smart questioning');
          return this.generateSmartQuestioning(userInput, conversationHistory, 'We Do');
        } else if (inputLower.includes('i do') || inputLower.includes('complete lesson plan')) {
          console.log('🎯 Routing to I Do workflow - Starting with smart questioning');
          return this.generateSmartQuestioning(userInput, conversationHistory, 'I Do');
        }
      }

      // Check if user has completed smart questioning and determine next workflow step
      const hasSmartQuestioning = conversationHistory.some(msg => 
        msg.role === 'assistant' && 
        msg.content.includes('Smart Questions to Get Started')
      );

      if (hasSmartQuestioning && !isWorkflowSelection) {
        console.log('📋 Smart questioning completed, determining workflow step...');
        
        // Determine which workflow was chosen based on conversation history
        const workflowMessage = conversationHistory.find(msg => 
          msg.role === 'assistant' && 
          (msg.content.includes('You\'ve chosen "I Do"') || 
           msg.content.includes('You\'ve chosen "We Do"') || 
           msg.content.includes('You\'ve chosen "You Do"'))
        );
        
        if (workflowMessage) {
          if (workflowMessage.content.includes('You\'ve chosen "I Do"')) {
            console.log('🎯 Smart questioning complete - proceeding with I Do: Create lesson plan');
            return this.generateIDoResponse(userInput, conversationHistory);
          } else if (workflowMessage.content.includes('You\'ve chosen "We Do"')) {
            console.log('🎯 Smart questioning complete - proceeding with We Do: Collaborative questioning');
            return this.generateWeDoResponse(userInput, conversationHistory);
          } else if (workflowMessage.content.includes('You\'ve chosen "You Do"')) {
            console.log('🎯 Smart questioning complete - proceeding with You Do: Request lesson paste');
            return this.generateYouDoResponse(userInput, conversationHistory);
          }
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