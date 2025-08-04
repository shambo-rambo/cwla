const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');
const unifiedKnowledge = require('./unifiedKnowledgeService');
const ContextualResponseEngine = require('./contextualResponseEngine');
const PredictiveLearningEngine = require('./predictiveLearningEngine');
const AdaptiveResponseEngine = require('./adaptiveResponseEngine');
const ConversationFlowIntelligence = require('./conversationFlowIntelligence');
const LearningAnalyticsEngine = require('./learningAnalyticsEngine');
const UserModelingEngine = require('./userModelingEngine');

// Debug: Check if API key exists
console.log('Framework Learning - API Key exists:', !!process.env.ANTHROPIC_API_KEY);

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

class FrameworkLearningService {
  constructor() {
    // Use unified knowledge service instead of loading separately
    this.knowledgeBase = null;
    
    // Initialize Phase 2 intelligence engines
    this.contextualEngine = new ContextualResponseEngine();
    this.predictiveEngine = new PredictiveLearningEngine();
    this.adaptiveEngine = new AdaptiveResponseEngine();
    this.flowIntelligence = new ConversationFlowIntelligence();
    
    // Initialize Phase 3 advanced engines
    this.analyticsEngine = new LearningAnalyticsEngine();
    this.userModelingEngine = new UserModelingEngine();
    
    this.loadKnowledgeBase();
    console.log('✅ Framework Learning Service initialized with Phase 2 intelligence + Phase 3 advanced features');
  }

  loadKnowledgeBase() {
    try {
      // Use unified knowledge service for consistency
      this.knowledgeBase = unifiedKnowledge.getKnowledgeForFrameworkLearning();
      if (this.knowledgeBase) {
        console.log('✅ Framework service connected to unified knowledge base');
      } else {
        console.log('⚠️ Framework service falling back to direct file loading');
        // Fallback to direct loading if unified service fails
        const knowledgePath = path.join(__dirname, '../data/framework-knowledge.json');
        const knowledgeData = fs.readFileSync(knowledgePath, 'utf8');
        this.knowledgeBase = JSON.parse(knowledgeData);
        console.log('Framework knowledge base loaded successfully (fallback)');
      }
    } catch (error) {
      console.error('Error loading knowledge base:', error);
      this.knowledgeBase = null;
    }
  }

  async generateFrameworkResponse(userInput, conversationHistory = [], userId = 'anonymous') {
    const serviceStartTime = Date.now();
    console.log(`[${new Date().toISOString()}] FrameworkLearningService - generateFrameworkResponse started`);
    
    try {
      if (!this.knowledgeBase) {
        return {
          success: false,
          error: "I'm sorry, but I'm having trouble accessing my knowledge base right now. Please try again later."
        };
      }

      const kb = this.knowledgeBase.knowledge_base;
      
      // Check if user is asking for lesson plans - redirect them with enhanced knowledge integration
      const lessonPlanKeywords = ['lesson plan', 'activities', 'create', 'generate', 'design', 'unit', 'assessment', 'worksheet', 'detailed implementation'];
      const isLessonRequest = lessonPlanKeywords.some(keyword => 
        userInput.toLowerCase().includes(keyword)
      );

      if (isLessonRequest) {
        // Get relevant TLC knowledge for better redirect guidance
        const lessonPlannerIntegration = unifiedKnowledge.getLessonPlannerIntegration();
        const relevantKnowledge = this.getRelevantKnowledgeForLessonRequest(userInput);
        
        // Build messages array with conversation history + system prompt
        const messages = conversationHistory.map(msg => ({
          role: msg.role,
          content: msg.content
        }));
        
        messages.push({
          role: 'user',
          content: `You are a TLC framework expert. The teacher asked: "${userInput}"

They want lesson plans or activities, but you provide framework guidance, not lesson planning. Respond directly and professionally.

${relevantKnowledge ? `
**RELEVANT TLC KNOWLEDGE TO MENTION:**
${relevantKnowledge}
` : ''}

Provide a concise response (under 150 words):
- Briefly acknowledge what they're looking for
- Share 1-2 quick TLC tips relevant to their request based on the knowledge above
- Always include this exact redirect with link: "For detailed lesson plans implementing these strategies, **[click here to open the lesson planner](https://cwla-52a1d.web.app/?open=lesson-planner)**."
- Mention that the lesson planner now uses the same TLC knowledge base for consistent, research-based lessons
- Be direct and professional

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

      // ========== FAST MODE - SKIP HEAVY PROCESSING FOR SPEED ==========
      console.log(`[${new Date().toISOString()}] FrameworkLearningService - Using fast mode, skipping heavy AI processing`);
      
      // Skip complex user modeling and contextual engines for speed
      // TODO: Re-enable after performance optimization
      /*
      // ========== PHASE 3 USER MODELING INTEGRATION ==========
      
      // Get personalized context from user modeling
      const personalizedContext = this.userModelingEngine.generatePersonalizedContext(userId);
      const crossConversationContext = this.userModelingEngine.getCrossConversationContext(userId, userInput, 3);
      const personalizedRecommendations = this.userModelingEngine.getPersonalizedRecommendations(userId, null, {
        currentInput: userInput,
        conversationHistory
      });
      
      // ========== PHASE 2 INTELLIGENCE INTEGRATION ==========
      
      // 1. Contextual Response Strategy (enhanced with user context)
      const enhancedContext = {
        ...personalizedContext,
        crossConversationInsights: crossConversationContext.context,
        userRecommendations: personalizedRecommendations.recommendations
      };
      
      const responseStrategy = this.contextualEngine.determineResponseStrategy(userInput, conversationHistory, enhancedContext);
      */
      
      // FAST MODE: Skip heavy AI processing engines
      // Get basic knowledge recommendations directly
      const basicRecommendations = unifiedKnowledge.getKnowledgeForFrameworkLearning();
      console.log(`[${new Date().toISOString()}] FrameworkLearningService - Retrieved basic knowledge recommendations`);

      // ========== SIMPLIFIED FAST PROMPT ==========
      console.log(`[${new Date().toISOString()}] FrameworkLearningService - Building simplified prompt`);
      
      const prompt = `You are a professional TLC (Teaching and Learning Cycle) framework expert. Provide direct, concise help to primary teachers.

Teacher's question: "${userInput}"


**RESPONSE GUIDELINES:**
- Be professional, direct, and concise
- NO emojis or overly casual language
- Focus on practical TLC implementation
- Use British spelling
- Ask 1-2 strategic questions if helpful
- Use markdown **bold** for key points

Available topics: ${kb.topics.map(topic => topic.title).join(', ')}`

      // Build messages array with conversation history + system prompt
      const messages = conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      messages.push({
        role: 'user',
        content: prompt
      });

      const anthropicStartTime = Date.now();
      console.log(`[${new Date().toISOString()}] FrameworkLearningService - Calling Anthropic API (streaming)`);
      
      const stream = await anthropic.messages.stream({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 800,
        messages: messages
      });

      const anthropicTime = Date.now() - anthropicStartTime;
      console.log(`[${new Date().toISOString()}] FrameworkLearningService - Anthropic stream initialized: ${anthropicTime}ms`);
      
      return {
        success: true,
        stream: stream // Return the stream instead of waiting for full response
      };
      
      // Stream is returned above, no additional processing needed
    } catch (error) {
      console.error('Framework Learning API Error:', error);
      return {
        success: false,
        error: `Failed to generate framework response: ${error.message}`
      };
    }
  }

  // Extract subject from conversation context
  extractSubjectFromContext(conversationHistory) {
    const allText = conversationHistory
      .filter(msg => msg.role === 'user')
      .map(msg => msg.content)
      .join(' ')
      .toLowerCase();
    
    if (allText.includes('english') || allText.includes('literacy')) return 'english';
    if (allText.includes('science') || allText.includes('scientific')) return 'science';
    if (allText.includes('math') || allText.includes('mathematics')) return 'mathematics';
    if (allText.includes('history') || allText.includes('historical')) return 'history';
    
    return null;
  }

  // Get personality guidelines based on response strategy
  getPersonalityGuidelines(strategy, adaptationGuidelines) {
    const personalityMap = {
      foundational_guidance: `
- Be professional and supportive - this teacher is learning TLC concepts
- Provide detailed explanations with clear examples
- Use simple, accessible language
- Offer guidance and scaffolded learning paths`,
      
      targeted_troubleshooting: `
- Be direct and solution-focused
- Acknowledge the specific challenge clearly
- Provide practical, actionable solutions
- Show confidence that the problem can be solved`,
      
      practical_implementation: `
- Be instructional and supportive
- Focus on step-by-step guidance
- Use "how to" language and clear sequences
- Emphasize practical classroom application`,
      
      expert_consultation: `
- Be collaborative and analytical
- Engage in deeper theoretical discussion
- Use appropriate technical terminology
- Respect the teacher's expertise while adding value`,
      
      differentiation_support: `
- Be inclusive and adaptive in your language
- Focus on student-centered approaches
- Acknowledge the complexity of diverse classrooms
- Provide multiple options and strategies`
    };
    
    return personalityMap[strategy] || personalityMap.foundational_guidance;
  }

  // Generate contextual interactive options
  generateContextualOptions(contextAnalysis, intelligentRecommendations) {
    const { expertiseLevel, detectedChallenges, userIntent } = contextAnalysis;
    
    let options = [];
    
    // Expertise-based options
    if (expertiseLevel === 'novice') {
      options.push('Just getting started with TLC and wondering where to begin?');
      options.push('Want to understand the basics of the 4 TLC stages?');
    } else if (expertiseLevel === 'expert') {
      options.push('Looking to refine advanced TLC implementation strategies?');
      options.push('Want to explore theoretical connections and research?');
    }
    
    // Challenge-based options
    if (detectedChallenges.length > 0) {
      const primaryChallenge = detectedChallenges[0].challenge;
      
      if (primaryChallenge === 'engagement') {
        options.push('Need specific strategies for student engagement during TLC?');
        options.push('Want troubleshooting tips for passive students?');
      } else if (primaryChallenge === 'collaboration') {
        options.push('Looking for joint construction management strategies?');
        options.push('Need help with classroom discussion techniques?');
      } else if (primaryChallenge === 'differentiation') {
        options.push('Want support strategies for diverse learners?');
        options.push('Need EAL/D or learning support approaches?');
      }
    }
    
    // Intent-based options
    if (userIntent === 'implementation') {
      options.push('Ready for step-by-step implementation guidance?');
    } else if (userIntent === 'planning') {
      options.push('Looking to create specific TLC lesson plans?');
    }
    
    // Intelligent recommendation-based options
    if (intelligentRecommendations.topics.length > 0) {
      const topTopic = intelligentRecommendations.topics[0];
      if (topTopic.title.includes('Troubleshooting')) {
        options.push('Want specific troubleshooting solutions for your challenge?');
      } else if (topTopic.title.includes('Differentiation')) {
        options.push('Need differentiation strategies for your classroom?');
      }
    }
    
    // Fill remaining slots with general options
    while (options.length < 4) {
      const generalOptions = [
        'Want practical tips for your specific subject area?',
        'Looking for assessment and feedback strategies?',
        'Need help with time management and pacing?',
        'Want to understand how TLC works in different subjects?'
      ];
      
      const newOption = generalOptions.find(opt => !options.includes(opt));
      if (newOption) options.push(newOption);
      else break;
    }
    
    return options.slice(0, 4).map(opt => `- ${opt}`).join('\n');
  }

  // Get relevant knowledge for lesson planning requests
  getRelevantKnowledgeForLessonRequest(userInput) {
    try {
      const inputLower = userInput.toLowerCase();
      const lessonKnowledge = unifiedKnowledge.getKnowledgeForLessonPlanning();
      
      if (!lessonKnowledge.available) return null;
      
      let relevantTips = [];
      
      // Add stage-specific tips based on request
      if (inputLower.includes('field building') || inputLower.includes('introduction') || inputLower.includes('activate')) {
        relevantTips.push("Field Building (15-20%): Ensure all students can participate regardless of background knowledge");
      }
      if (inputLower.includes('modeling') || inputLower.includes('demonstrate') || inputLower.includes('example')) {
        relevantTips.push("Modeling (25-30%): Use think-aloud protocols and interactive annotation to keep students engaged");
      }
      if (inputLower.includes('joint') || inputLower.includes('guided') || inputLower.includes('together')) {
        relevantTips.push("Joint Construction (30-35%): Use talking protocols to ensure multiple students contribute");
      }
      if (inputLower.includes('independent') || inputLower.includes('individual') || inputLower.includes('assessment')) {
        relevantTips.push("Independent Construction (20-25%): Provide scaffolds like graphic organizers and sentence starters");
      }
      
      // Add differentiation tips if mentioned
      if (inputLower.includes('eal') || inputLower.includes('esl') || inputLower.includes('diverse')) {
        relevantTips.push("Differentiation: Use visual materials and pre-teach metalanguage for EAL/D students");
      }
      if (inputLower.includes('support') || inputLower.includes('struggling')) {
        relevantTips.push("Support: Use graphic organizers and chunked information for learning difficulties");
      }
      if (inputLower.includes('advanced') || inputLower.includes('extension')) {
        relevantTips.push("Extension: Provide tiered assignments and independent study opportunities");
      }
      
      // Add subject-specific tips
      if (inputLower.includes('english') || inputLower.includes('writing')) {
        relevantTips.push("English: Focus on genre-based teaching with mentor texts and text deconstruction");
      }
      if (inputLower.includes('science')) {
        relevantTips.push("Science: Align with 5E Model - engage/explore → Field Building, explain → Modeling");
      }
      if (inputLower.includes('math')) {
        relevantTips.push("Mathematics: Use problem-based learning with manipulatives and visual models");
      }
      
      return relevantTips.length > 0 ? relevantTips.join('\n- ') : null;
    } catch (error) {
      console.error('Error getting relevant knowledge:', error);
      return null;
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

  // Method to get learning analytics dashboard
  getAnalyticsDashboard() {
    return this.analyticsEngine.getDashboardData();
  }

  // Method to get detailed analytics
  getDetailedAnalytics(timeRange = '24h', filters = {}) {
    return this.analyticsEngine.getAnalytics(timeRange, filters);
  }

  // Method to get relationship mapping metrics
  getRelationshipMetrics() {
    return unifiedKnowledge.getRelationshipMetrics();
  }

  // Method to get comprehensive intelligence overview
  getIntelligenceOverview() {
    const dashboardData = this.getAnalyticsDashboard();
    const relationshipMetrics = this.getRelationshipMetrics();
    const intelligenceStats = unifiedKnowledge.getIntelligenceStats();
    
    return {
      systemHealth: {
        status: 'operational',
        uptime: dashboardData.systemMetrics?.uptime || 0.99,
        responseTime: dashboardData.systemMetrics?.averageResponseTime || 0,
        lastUpdate: dashboardData.lastUpdated
      },
      learningAnalytics: {
        totalConversations: dashboardData.overview?.totalConversations || 0,
        averageEngagement: dashboardData.overview?.averageEngagement || 0,
        userSatisfaction: dashboardData.userMetrics?.averageSatisfaction || 0,
        conceptMasteryRates: dashboardData.learningMetrics?.conceptMasteryRates || {}
      },
      intelligenceCapabilities: {
        knowledgeIndexing: intelligenceStats.indexingEnabled,
        relationshipMapping: relationshipMetrics.totalConcepts > 0,
        predictiveLearning: true,
        adaptiveResponses: true,
        conversationFlow: true,
        realTimeAnalytics: dashboardData.realTimeStatus?.monitoringActive || false,
        userModeling: true,
        crossConversationMemory: true,
        personalization: true
      },
      performanceMetrics: {
        indexBuildTime: intelligenceStats.indexBuildTime || 0,
        relationshipAccuracy: relationshipMetrics.helpfulnessRate || 0,
        averageResponseTime: dashboardData.systemMetrics?.averageResponseTime || 0,
        systemEfficiency: dashboardData.overview?.systemHealth || 0
      }
    };
  }

  // Method to get user profile
  getUserProfile(userId) {
    return this.userModelingEngine.getUserProfileSummary(userId);
  }

  // Method to get personalized recommendations for a user
  getPersonalizedRecommendations(userId, currentTopic = null, context = {}) {
    return this.userModelingEngine.getPersonalizedRecommendations(userId, currentTopic, context);
  }

  // Method to get cross-conversation context
  getCrossConversationContext(userId, userInput, maxContext = 5) {
    return this.userModelingEngine.getCrossConversationContext(userId, userInput, maxContext);
  }

  // Method to get all user profiles (for analytics/admin)
  getAllUserProfiles() {
    const profiles = [];
    
    // This would normally iterate through stored user profiles
    // For demo purposes, return placeholder data
    return {
      totalUsers: 0,
      profiles: profiles,
      averageEngagement: 0,
      totalConversations: 0
    };
  }
}

module.exports = new FrameworkLearningService();