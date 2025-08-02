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

  async generateFrameworkResponse(userInput) {
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
        const response = await anthropic.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000, // Reduced for faster response
          messages: [
            {
              role: 'user',
              content: `You are a Teaching and Learning Cycle (TLC) framework expert. The user asked: "${userInput}"

This appears to be a request for lesson plans or activities. Respond warmly and redirect them to the lesson planner while providing brief TLC guidance.

Keep your response concise (under 150 words) and include:
- Brief acknowledgment of their request
- Clear direction: "For detailed lesson plans implementing these strategies, use our **lesson planner chatbot**. You can access it from the homepage by clicking 'Start New Lesson Planning'."
- 2-3 key TLC principles relevant to their request
- Encouraging tone

Use markdown formatting with **bold** for key points.`
            }
          ]
        });

        return {
          success: true,
          response: response.content[0].text
        };
      }

      // Enhanced prompt for framework-specific queries (optimized for speed)
      const prompt = `You are a Teaching and Learning Cycle (TLC) framework expert and mentor for secondary school teachers.

User Query: "${userInput}"

**YOUR EXPERTISE:**
- TLC Framework Overview & Implementation  
- Scaffolding & Explicit Teaching (Vygotskian principles)
- Genre-based Teaching & Assessment
- Differentiation for EAL/D & Diverse Learners
- Subject-specific TLC Applications
- Troubleshooting Common Challenges

**CONVERSATION STYLE:**
- Professional but approachable - supportive colleague, not lecturing
- Use practical examples and real classroom scenarios  
- Reference 95% student improvement rate evidence base when relevant
- Use British spelling (realise, colour, organised, centre, analyse)
- Keep responses concise but comprehensive
- Always connect theory to practical classroom application

**RESPONSE FORMAT:**
- Use markdown formatting with **bold** for key concepts
- Use bullet points for practical tips
- Include relevant examples
- When appropriate, reference related topics for follow-up

**KEY TLC PRINCIPLES:**
- Activities carefully ordered to build knowledge and abilities
- Not a strict sequence - teachers move between stages as needed
- Deep learning of content with language of content area
- Constant assessment and response to identified needs

**AVAILABLE EXPERTISE AREAS:**
${kb.topics.map(topic => `- **${topic.title}**: ${topic.summary}`).join('\n')}

Respond helpfully to the teacher's query using this knowledge base and following the guidelines above. Keep focused on TLC framework understanding and implementation.`

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500, // Reduced from 2000 for faster response
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