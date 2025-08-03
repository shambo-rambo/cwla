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
    // For now, always return false to ensure clarifying questions are asked
    // This can be made smarter later if needed
    const keywords = ['subject', 'topic', 'grade', 'duration', 'objectives', 'assessment', 'students'];
    const lowerInput = userInput.toLowerCase();
    return keywords.every(keyword => lowerInput.includes(keyword));
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

<h3>Key Areas to Explore for Effective TLC Implementation:</h3>
<ol>
<li><strong>Subject & Context:</strong> What subject area? What grade level? What specific topic or concept?</li>
<li><strong>TLC Experience:</strong> Have you used the Teaching & Learning Cycle before? Which TLC stage do you find most challenging?</li>
<li><strong>Student Demographics:</strong> How many students? Any EAL/D students or students with learning support needs? Mixed ability levels?</li>
<li><strong>Learning Goals:</strong> What should students know/do by the end? Any specific curriculum outcomes or assessment requirements?</li>
<li><strong>Practical Details:</strong> Lesson duration? Available resources? Any constraints or challenges I should know about?</li>
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

  async generateLessonPlan(userInput, conversationHistory = []) {
    try {
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