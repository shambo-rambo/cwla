const fs = require('fs');
const path = require('path');
const IntelligentKnowledgeIndex = require('./intelligentKnowledgeIndex');
const KnowledgeRelationshipMapper = require('./knowledgeRelationshipMapper');

/**
 * Unified Knowledge Service with Advanced Intelligence
 * 
 * Provides centralized access to TLC knowledge base for all chatbot services.
 * Enhanced with intelligent indexing and relationship mapping for deep conceptual understanding.
 */
class UnifiedKnowledgeService {
  constructor() {
    this.knowledgeBase = null;
    this.intelligentIndex = new IntelligentKnowledgeIndex();
    this.relationshipMapper = new KnowledgeRelationshipMapper();
    this.initialized = false;
    this.loadKnowledgeBase();
  }

  /**
   * Load TLC knowledge base from JSON file and build intelligent indexes
   */
  loadKnowledgeBase() {
    try {
      const knowledgePath = path.join(__dirname, '../data/framework-knowledge.json');
      const knowledgeData = fs.readFileSync(knowledgePath, 'utf8');
      this.knowledgeBase = JSON.parse(knowledgeData);
      
      // Build intelligent indexes for fast retrieval
      const indexSuccess = this.intelligentIndex.buildIndexes(this.knowledgeBase);
      
      if (indexSuccess) {
        this.initialized = true;
        console.log('✅ Unified TLC knowledge base loaded with intelligent indexing');
        
        // Log performance statistics
        const stats = this.intelligentIndex.getPerformanceStats();
        console.log(`📊 Index build time: ${stats.indexBuildTime.toFixed(2)}ms`);
        console.log(`📊 Indexed ${stats.indexSize.topics} topics, ${stats.indexSize.keywords} keywords`);
      } else {
        console.warn('⚠️ Knowledge base loaded but indexing failed - falling back to basic retrieval');
        this.initialized = true; // Still functional, just slower
      }
    } catch (error) {
      console.error('❌ Error loading unified knowledge base:', error);
      this.knowledgeBase = null;
      this.initialized = false;
    }
  }

  /**
   * Check if knowledge base is available
   */
  isAvailable() {
    return this.initialized && this.knowledgeBase !== null;
  }

  /**
   * Get knowledge base for lesson planning context
   * Returns knowledge formatted for lesson planning prompts
   */
  getKnowledgeForLessonPlanning() {
    if (!this.isAvailable()) {
      return {
        available: false,
        message: "Knowledge base not available"
      };
    }

    const kb = this.knowledgeBase.knowledge_base;
    
    return {
      available: true,
      tlcStages: kb.quick_reference?.tlc_stages || [],
      genreFamilies: kb.quick_reference?.genre_families || [],
      implementationGuidelines: this.extractImplementationGuidelines(),
      differentiationStrategies: this.extractDifferentiationStrategies(),
      subjectApplications: this.extractSubjectApplications(),
      troubleshootingTips: this.extractTroubleshootingTips(),
      qualityIndicators: this.extractQualityIndicators()
    };
  }

  /**
   * Extract implementation guidelines for lesson planning
   */
  extractImplementationGuidelines() {
    if (!this.isAvailable()) return [];

    const implementationTopic = this.knowledgeBase.knowledge_base.topics
      .find(topic => topic.id === 'implementation_challenges');
    
    if (!implementationTopic) return [];

    return [
      "Strategic curriculum mapping with optimal time allocation",
      "Field building: 15-20%, Modeling: 25-30%, Guided practice: 30-35%, Independent: 20-25%",
      "Create 'must do/could do' prioritization systems",
      "Slow down modeling stage with thorough text deconstruction",
      "Use think-aloud protocols during joint construction"
    ];
  }

  /**
   * Extract differentiation strategies for lesson planning
   */
  extractDifferentiationStrategies() {
    if (!this.isAvailable()) return {};

    const differentiationTopic = this.knowledgeBase.knowledge_base.topics
      .find(topic => topic.id === 'differentiation_strategies');
    
    if (!differentiationTopic) return {};

    const content = differentiationTopic.content;
    
    return {
      ealdSupport: [
        "Use visual materials to support vocabulary development",
        "Pre-teach metalanguage required for analysis",
        "Allow annotation in home languages",
        "Use EAL/D Learning Progressions for assessment"
      ],
      learningDifficulties: [
        "Use visual aids and diagrams",
        "Provide audio with text-to-speech",
        "Use graphic organizers and chunked information",
        "Offer choice in demonstration methods"
      ],
      advancedLearners: [
        "Pre-assessment and compacting",
        "Tiered assignments with professional standards",
        "Independent study opportunities",
        "Problem-based scenarios"
      ]
    };
  }

  /**
   * Extract subject-specific applications
   */
  extractSubjectApplications() {
    if (!this.isAvailable()) return {};

    const subjectTopic = this.knowledgeBase.knowledge_base.topics
      .find(topic => topic.id === 'subject_applications');
    
    if (!subjectTopic) return {};

    return {
      english: {
        focus: "Genre-based teaching with mentor texts",
        strategies: ["Text deconstruction", "Academic language development", "Integrated skills approach"]
      },
      science: {
        model: "5E Model (Engage, Explore, Explain, Elaborate, Evaluate)",
        alignment: "engage_explore → Build the Field, explain → Modeling, elaborate → Joint/Independent Construction"
      },
      mathematics: {
        approach: "Problem-based learning with explicit instruction",
        tools: ["Manipulatives", "Visual models", "Technology integration"]
      }
    };
  }

  /**
   * Extract troubleshooting tips for common issues
   */
  extractTroubleshootingTips() {
    if (!this.isAvailable()) return {};

    const troubleshootingTopic = this.knowledgeBase.knowledge_base.topics
      .find(topic => topic.id === 'troubleshooting_scenarios');
    
    if (!troubleshootingTopic) return {};

    return {
      engagementIssues: [
        "Switch to interactive annotation - give students colored pens",
        "Use think-pair-share: 'Find one example of [language feature] with your partner'",
        "Break into smaller chunks: analyze one paragraph at a time"
      ],
      jointConstructionChaos: [
        "Use 'hands up, thumbs up' - students suggest, others vote before writing",
        "Implement talking stick/token system for contributions",
        "Break into small groups first, then share with whole class"
      ],
      independentWritingStruggles: [
        "Return to field building - brainstorm topic ideas as a class",
        "Provide graphic organizers specific to the genre",
        "Use sentence starters or paragraph frames as scaffolds"
      ]
    };
  }

  /**
   * Extract quality indicators for self-assessment
   */
  extractQualityIndicators() {
    if (!this.isAvailable()) return {};

    const qualityTopic = this.knowledgeBase.knowledge_base.topics
      .find(topic => topic.id === 'quality_indicators');
    
    if (!qualityTopic) return {};

    return {
      successfulFieldBuilding: [
        "Students actively contribute relevant prior knowledge",
        "Rich discussions emerge about the topic",
        "Students use new vocabulary in conversation"
      ],
      effectiveModeling: [
        "Students can identify key genre features independently",
        "They ask questions about language choices",
        "Students make connections between structure and purpose"
      ],
      successfulJointConstruction: [
        "Multiple students contribute ideas and language",
        "Students build on each other's suggestions",
        "They debate language choices and make improvements"
      ]
    };
  }

  /**
   * Get knowledge base for framework learning context
   * Returns the full knowledge base for expert guidance
   */
  getKnowledgeForFrameworkLearning() {
    if (!this.isAvailable()) {
      return null;
    }

    return this.knowledgeBase;
  }

  /**
   * Search knowledge base for relevant topics using intelligent indexing
   */
  findRelevantTopics(query, context = {}) {
    if (!this.isAvailable()) return [];
    
    // Use intelligent indexing if available
    if (this.intelligentIndex.isInitialized()) {
      const result = this.intelligentIndex.findOptimalTopics(query, context, 5);
      return result.topics || [];
    }
    
    // Fallback to linear search if indexing failed
    console.warn('⚠️ Using fallback linear search - indexing not available');
    const queryLower = query.toLowerCase();
    const kb = this.knowledgeBase.knowledge_base;
    
    return kb.topics.filter(topic => {
      return topic.title.toLowerCase().includes(queryLower) ||
             topic.summary.toLowerCase().includes(queryLower) ||
             topic.keywords.some(keyword => keyword.toLowerCase().includes(queryLower)) ||
             topic.teacher_queries.some(tq => tq.toLowerCase().includes(queryLower));
    });
  }

  /**
   * Get intelligent topic recommendations with context and confidence scoring
   */
  getIntelligentRecommendations(query, context = {}, maxResults = 3) {
    if (!this.isAvailable()) {
      return {
        topics: [],
        confidence: 0,
        reasoning: 'Knowledge base not available'
      };
    }
    
    if (this.intelligentIndex.isInitialized()) {
      return this.intelligentIndex.findOptimalTopics(query, context, maxResults);
    }
    
    // Fallback for non-intelligent retrieval
    const topics = this.findRelevantTopics(query, context).slice(0, maxResults);
    return {
      topics,
      confidence: topics.length > 0 ? 0.6 : 0,
      reasoning: 'Using basic search - intelligent indexing not available'
    };
  }

  /**
   * Get contextual knowledge for specific lesson planning scenarios
   */
  getContextualKnowledge(context) {
    if (!this.isAvailable()) return {};

    const knowledge = this.getKnowledgeForLessonPlanning();
    
    // Customize knowledge based on context
    const contextualKnowledge = { ...knowledge };
    
    // Add specific guidance based on lesson context
    if (context.subject) {
      contextualKnowledge.subjectSpecific = knowledge.subjectApplications[context.subject.toLowerCase()] || {};
    }
    
    if (context.challenges) {
      contextualKnowledge.relevantTroubleshooting = this.getRelevantTroubleshooting(context.challenges);
    }
    
    if (context.studentNeeds) {
      contextualKnowledge.relevantDifferentiation = this.getRelevantDifferentiation(context.studentNeeds);
    }
    
    return contextualKnowledge;
  }

  /**
   * Get relevant troubleshooting based on specific challenges
   */
  getRelevantTroubleshooting(challenges) {
    const troubleshooting = this.extractTroubleshootingTips();
    const relevant = {};
    
    challenges.forEach(challenge => {
      const challengeLower = challenge.toLowerCase();
      if (challengeLower.includes('engagement') || challengeLower.includes('participation')) {
        relevant.engagement = troubleshooting.engagementIssues;
      }
      if (challengeLower.includes('discussion') || challengeLower.includes('joint')) {
        relevant.discussion = troubleshooting.jointConstructionChaos;
      }
      if (challengeLower.includes('writing') || challengeLower.includes('independent')) {
        relevant.writing = troubleshooting.independentWritingStruggles;
      }
    });
    
    return relevant;
  }

  /**
   * Get relevant differentiation based on student needs
   */
  getRelevantDifferentiation(studentNeeds) {
    const differentiation = this.extractDifferentiationStrategies();
    const relevant = {};
    
    studentNeeds.forEach(need => {
      const needLower = need.toLowerCase();
      if (needLower.includes('eal') || needLower.includes('esl') || needLower.includes('language')) {
        relevant.eald = differentiation.ealdSupport;
      }
      if (needLower.includes('learning difficul') || needLower.includes('support')) {
        relevant.support = differentiation.learningDifficulties;
      }
      if (needLower.includes('advanced') || needLower.includes('gifted') || needLower.includes('extension')) {
        relevant.advanced = differentiation.advancedLearners;
      }
    });
    
    return relevant;
  }

  /**
   * Get quick reference information
   */
  getQuickReference() {
    if (!this.isAvailable()) return null;
    return this.knowledgeBase.knowledge_base.quick_reference;
  }

  /**
   * Get FAQ information
   */
  getFAQ() {
    if (!this.isAvailable()) return [];
    return this.knowledgeBase.knowledge_base.teacher_faq;
  }

  /**
   * Get lesson planner integration guidance
   */
  getLessonPlannerIntegration() {
    if (!this.isAvailable()) return {};
    return this.knowledgeBase.knowledge_base.lesson_planner_integration || {};
  }

  /**
   * Get performance statistics from intelligent indexing
   */
  getIntelligenceStats() {
    if (!this.intelligentIndex.isInitialized()) {
      return {
        indexingEnabled: false,
        message: 'Intelligent indexing not available'
      };
    }
    
    return {
      indexingEnabled: true,
      ...this.intelligentIndex.getPerformanceStats()
    };
  }

  /**
   * Get intelligent relationship analysis for a concept
   */
  getConceptRelationships(concept, userContext = {}, learningGoals = []) {
    if (!this.isAvailable()) {
      return {
        concept,
        relationships: [],
        error: 'Knowledge base not available'
      };
    }
    
    return this.relationshipMapper.findIntelligentRelationships(concept, userContext, learningGoals);
  }

  /**
   * Find related concepts based on relationship strength
   */
  findRelatedConcepts(concept, relationshipType = null, maxResults = 5) {
    if (!this.isAvailable()) return [];
    
    const relationships = this.relationshipMapper.findIntelligentRelationships(concept);
    
    let relatedConcepts = relationships.directRelationships || [];
    
    // Filter by relationship type if specified
    if (relationshipType) {
      relatedConcepts = relatedConcepts.filter(rel => rel.type === relationshipType);
    }
    
    // Sort by strength and limit results
    return relatedConcepts
      .sort((a, b) => b.strength - a.strength)
      .slice(0, maxResults)
      .map(rel => ({
        concept: rel.target,
        relationshipType: rel.type,
        strength: rel.strength,
        description: rel.description
      }));
  }

  /**
   * Get learning path recommendations for a concept
   */
  getLearningPaths(concept, userContext = {}) {
    if (!this.isAvailable()) return [];
    
    const relationships = this.relationshipMapper.findIntelligentRelationships(concept, userContext);
    return relationships.learningPaths || [];
  }

  /**
   * Get prerequisite chain for a concept
   */
  getPrerequisiteChain(concept) {
    if (!this.isAvailable()) return [];
    
    const relationships = this.relationshipMapper.findIntelligentRelationships(concept);
    return relationships.prerequisiteChain || [];
  }

  /**
   * Find concepts that complement the given concept
   */
  getComplementaryConcepts(concept, userContext = {}) {
    if (!this.isAvailable()) return [];
    
    const relationships = this.relationshipMapper.findIntelligentRelationships(concept, userContext);
    return relationships.complementaryConcepts || [];
  }

  /**
   * Get application contexts for a concept
   */
  getApplicationContexts(concept, userContext = {}) {
    if (!this.isAvailable()) return [];
    
    const relationships = this.relationshipMapper.findIntelligentRelationships(concept, userContext);
    return relationships.applicationContexts || [];
  }

  /**
   * Enhanced intelligent recommendations with relationship awareness
   */
  getAdvancedIntelligentRecommendations(query, context = {}, maxResults = 3) {
    const basicRecommendations = this.getIntelligentRecommendations(query, context, maxResults);
    
    if (!this.isAvailable() || !basicRecommendations.topics.length) {
      return basicRecommendations;
    }
    
    // Enhance with relationship data
    const enhancedTopics = basicRecommendations.topics.map(topic => {
      const relationships = this.relationshipMapper.findIntelligentRelationships(topic.id || topic.title, context);
      
      return {
        ...topic,
        relationships: {
          prerequisites: relationships.prerequisiteChain.slice(0, 2),
          complements: relationships.complementaryConcepts.slice(0, 2),
          applications: relationships.applicationContexts.slice(0, 2)
        },
        learningPath: relationships.learningPaths.length > 0 ? relationships.learningPaths[0] : null,
        conceptMetadata: relationships.conceptMetadata
      };
    });
    
    return {
      ...basicRecommendations,
      topics: enhancedTopics,
      relationshipAnalysis: {
        available: true,
        conceptConnections: enhancedTopics.length,
        learningPathsFound: enhancedTopics.filter(t => t.learningPath).length
      }
    };
  }

  /**
   * Get comprehensive concept overview with all intelligence features
   */
  getConceptOverview(concept, userContext = {}) {
    if (!this.isAvailable()) {
      return {
        available: false,
        concept,
        error: 'Knowledge base not available'
      };
    }
    
    // Get basic topic information
    const kb = this.knowledgeBase.knowledge_base;
    const topicInfo = kb.topics.find(topic => 
      topic.id === concept || topic.title.toLowerCase().includes(concept.toLowerCase())
    );
    
    // Get intelligent recommendations
    const recommendations = this.getIntelligentRecommendations(concept, userContext, 3);
    
    // Get relationship analysis
    const relationships = this.relationshipMapper.findIntelligentRelationships(concept, userContext);
    
    return {
      available: true,
      concept,
      topicInformation: topicInfo,
      intelligentRecommendations: recommendations,
      relationshipAnalysis: relationships,
      learningGuidance: {
        suggestedPaths: relationships.learningPaths,
        prerequisites: relationships.prerequisiteChain,
        complementaryTopics: relationships.complementaryConcepts,
        practicalApplications: relationships.applicationContexts
      },
      navigationRecommendations: relationships.recommendations
    };
  }

  /**
   * Track relationship usage for performance optimization
   */
  trackRelationshipUsage(relationship, userFeedback) {
    this.relationshipMapper.trackRelationshipUsage(relationship, userFeedback);
  }

  /**
   * Get relationship mapping performance metrics
   */
  getRelationshipMetrics() {
    return this.relationshipMapper.getRelationshipMetrics();
  }

  /**
   * Clear caches and rebuild indexes (for development/testing)
   */
  rebuildIntelligentIndexes() {
    if (!this.isAvailable()) return false;
    
    console.log('🔄 Rebuilding intelligent knowledge indexes...');
    return this.intelligentIndex.buildIndexes(this.knowledgeBase);
  }
}

// Export singleton instance
module.exports = new UnifiedKnowledgeService();