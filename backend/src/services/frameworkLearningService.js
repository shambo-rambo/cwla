const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

// Debug: Check if API key exists
console.log('Framework Learning - API Key exists:', !!process.env.ANTHROPIC_API_KEY);

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

class FrameworkLearningService {
  constructor() {
    this.knowledgeBase = null;
    this.loadKnowledgeBase();
  }

  loadKnowledgeBase() {
    try {
      const knowledgePath = path.join(__dirname, '../data/framework-knowledge.json');
      const knowledgeData = fs.readFileSync(knowledgePath, 'utf8');
      this.knowledgeBase = JSON.parse(knowledgeData);
      console.log('Framework knowledge base loaded successfully');
    } catch (error) {
      console.error('Error loading knowledge base:', error);
      this.knowledgeBase = null;
    }
  }

  async generateFrameworkResponse(userInput, conversationHistory = []) {
    try {
      if (!this.knowledgeBase) {
        return {
          success: false,
          error: "I'm sorry, but I'm having trouble accessing my knowledge base right now. Please try again later."
        };
      }

      const kb = this.knowledgeBase.knowledge_base;
      
      // Check if user is asking for lesson plans - redirect them
      const lessonPlanKeywords = ['lesson plan', 'activities', 'create', 'generate', 'design', 'unit', 'assessment', 'worksheet', 'detailed implementation'];
      const isLessonRequest = lessonPlanKeywords.some(keyword => 
        userInput.toLowerCase().includes(keyword)
      );

      if (isLessonRequest) {
        // Build messages array with conversation history + system prompt
        const messages = conversationHistory.map(msg => ({
          role: msg.role,
          content: msg.content
        }));
        
        messages.push({
          role: 'user',
          content: `You're a helpful TLC framework expert. The teacher asked: "${userInput}"

They want lesson plans or activities, but you're the framework expert, not the lesson planner. Respond directly but helpfully.

Keep it concise and helpful (under 100 words):
- Briefly acknowledge what they're looking for
- Always include this exact redirect with link: "For detailed lesson plans implementing these strategies, **[click here to open the lesson planner](https://cwla-52a1d.web.app/?open=lesson-planner)**."
- Share 1-2 quick TLC tips relevant to their request
- Be friendly but direct

IMPORTANT: You must include the clickable markdown link exactly as shown above. Use markdown **bold** for key points. No rambling or overly personal tone.`
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
      }

      // Enhanced prompt for direct but friendly framework guidance with interactive options
      const prompt = `You are a helpful TLC framework expert. Be friendly and conversational, but keep responses direct and practical.

Teacher's question: "${userInput}"

**YOUR PERSONALITY:**
- Friendly but concise - no rambling
- Direct and practical advice
- Helpful without being overly chatty
- Focus on actionable information
- Skip personal anecdotes and lengthy introductions

**CONVERSATION STYLE:**
- Keep responses focused and useful
- Use British spelling (realise, colour, organised, centre, analyse)  
- Be encouraging but brief
- Get straight to helpful information
- Avoid "I remember when..." or overly personal stories

**INTERACTIVE OPTIONS (USE FREQUENTLY):**
For most responses, especially greetings, general questions, or when offering guidance, ALWAYS include interactive options using this EXACT format:

\`\`\`interactive-options
- Option 1 text
- Option 2 text  
- Option 3 text
- Option 4 text
\`\`\`

ALWAYS use interactive options for:
- Any greeting like "hello", "hi", "hey"
- "What can you help with" type queries
- General or broad questions about TLC
- When offering multiple paths forward
- After providing advice and asking "what else"
- When you sense the teacher needs guidance on next steps

**SUGGESTED INTERACTIVE OPTIONS:**
- Just getting started with TLC and wondering where to begin?
- Working through a particular challenge with one of the stages?
- Looking for practical tips for your specific subject area?
- Trying to figure out how to differentiate for your diverse learners?
- Having trouble with student engagement during TLC lessons?
- Need help with assessment and feedback strategies?
- Struggling with time management and pacing?
- Want to understand how TLC works in different subjects?

**WHAT YOU KNOW ABOUT:**
- TLC stages and how they flow together naturally
- Scaffolding techniques that actually work with real students
- Genre-based teaching that doesn't feel overwhelming
- Supporting EAL/D learners and diverse classrooms
- Subject-specific TLC applications
- Troubleshooting when things go wrong

**KEY POINTS TO REMEMBER:**
- TLC isn't rigid - you move between stages as students need
- It's about building knowledge step by step
- Both content and language learning happen together
- Keep assessing and adjusting as you go

**AVAILABLE TOPICS:** ${kb.topics.map(topic => topic.title).join(', ')}

Respond in a friendly but direct way. Use markdown formatting with **bold** for key points and bullet points for tips. Keep responses concise and focused on practical help. Include interactive options when it would help guide the conversation.`

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
        max_tokens: 800, // Optimized for speed
        messages: messages
      });

      return {
        success: true,
        response: response.content[0].text
      };
    } catch (error) {
      console.error('Framework Learning API Error:', error);
      return {
        success: false,
        error: `Failed to generate framework response: ${error.message}`
      };
    }
  }

  // Method to search knowledge base for relevant topics
  findRelevantTopics(query) {
    if (!this.knowledgeBase) return [];
    
    const queryLower = query.toLowerCase();
    const kb = this.knowledgeBase.knowledge_base;
    
    return kb.topics.filter(topic => {
      return topic.title.toLowerCase().includes(queryLower) ||
             topic.summary.toLowerCase().includes(queryLower) ||
             topic.keywords.some(keyword => keyword.toLowerCase().includes(queryLower)) ||
             topic.teacher_queries.some(tq => tq.toLowerCase().includes(queryLower));
    });
  }

  // Method to get quick reference information
  getQuickReference() {
    if (!this.knowledgeBase) return null;
    return this.knowledgeBase.knowledge_base.quick_reference;
  }

  // Method to get FAQ
  getFAQ() {
    if (!this.knowledgeBase) return [];
    return this.knowledgeBase.knowledge_base.teacher_faq;
  }
}

module.exports = new FrameworkLearningService();