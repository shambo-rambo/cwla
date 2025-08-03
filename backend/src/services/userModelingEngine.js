/**
 * Cross-Conversation Memory and User Modeling Engine
 * 
 * Builds persistent user profiles, tracks learning progression across sessions,
 * and provides personalized experiences based on conversation history.
 * 
 * Target: Personalized learning experiences with 80% improved relevance
 */

class UserModelingEngine {
  constructor() {
    // User profile storage (in production would use persistent database)
    this.userProfiles = new Map();
    this.conversationMemory = new Map();
    this.learningProgressions = new Map();
    this.conceptMasteryProfiles = new Map();
    this.preferenceProfiles = new Map();
    
    // User modeling dimensions
    this.modelingDimensions = {
      expertise_level: {
        novice: 0,
        developing: 1,
        proficient: 2,
        expert: 3
      },
      learning_style: {
        visual: 'prefers examples and diagrams',
        auditory: 'learns through discussion and explanation',
        kinesthetic: 'needs hands-on practice and implementation',
        reading: 'prefers detailed written explanations'
      },
      subject_expertise: {
        english: 'english_language_arts',
        science: 'science_education',
        mathematics: 'mathematics_education',
        history: 'social_studies',
        general: 'cross_curricular'
      },
      teaching_context: {
        early_years: 'foundation_to_year_2',
        primary: 'years_3_to_6',
        secondary: 'years_7_to_12',
        adult: 'adult_education'
      }
    };
    
    // Learning pattern recognition
    this.learningPatterns = {
      mastery_indicators: [
        'understand', 'clear', 'makes sense', 'got it', 'brilliant',
        'helpful', 'exactly', 'perfect', 'ready to try'
      ],
      struggle_indicators: [
        'confused', 'difficult', 'not sure', 'struggling', 'help',
        'dont understand', 'unclear', 'lost', 'complicated'
      ],
      engagement_indicators: [
        'interesting', 'more about', 'tell me', 'what about', 'how',
        'example', 'show me', 'curious', 'want to know'
      ],
      preference_indicators: {
        detailed_explanations: ['explain more', 'details', 'thorough', 'comprehensive'],
        practical_examples: ['example', 'practical', 'real classroom', 'in practice'],
        step_by_step: ['step by step', 'stages', 'process', 'how to'],
        research_based: ['research', 'evidence', 'studies', 'theoretical']
      }
    };
    
    // Conversation memory structure
    this.memoryStructure = {
      short_term: {
        duration: 24 * 60 * 60 * 1000, // 24 hours
        capacity: 10 // Last 10 conversations
      },
      medium_term: {
        duration: 7 * 24 * 60 * 60 * 1000, // 7 days
        capacity: 50 // Last 50 conversations
      },
      long_term: {
        duration: 30 * 24 * 60 * 60 * 1000, // 30 days
        capacity: 200 // Last 200 conversations
      }
    };
    
    // Personalization factors
    this.personalizationFactors = {
      expertise_weight: 0.3,
      learning_style_weight: 0.25,
      subject_context_weight: 0.2,
      preference_weight: 0.15,
      progression_weight: 0.1
    };
    
    console.log('🧠 User modeling engine initialized with cross-conversation memory');
  }

  /**
   * MAIN USER MODELING METHOD: Update user profile and get personalized context
   */
  updateUserModel(userId, conversationData, userResponse, systemResponse, metadata = {}) {
    try {
      const timestamp = Date.now();
      
      // Initialize user profile if new
      this.ensureUserProfile(userId);
      
      // Update conversation memory
      this.updateConversationMemory(userId, {
        timestamp,
        userInput: userResponse,
        systemResponse,
        metadata,
        analytics: this.analyzeConversationForModeling(userResponse, conversationData)
      });
      
      // Update user dimensions
      this.updateUserDimensions(userId, userResponse, conversationData, metadata);
      
      // Update learning progression
      this.updateLearningProgression(userId, conversationData, userResponse);
      
      // Update concept mastery tracking
      this.updateConceptMasteryProfile(userId, userResponse, systemResponse);
      
      // Update preference profile
      this.updatePreferenceProfile(userId, userResponse, conversationData);
      
      // Generate personalized context for next interaction
      const personalizedContext = this.generatePersonalizedContext(userId);
      
      // Generate user insights
      const userInsights = this.generateUserInsights(userId);
      
      return {
        success: true,
        userId,
        profileUpdated: true,
        personalizedContext,
        userInsights,
        profileSummary: this.getUserProfileSummary(userId)
      };
      
    } catch (error) {
      console.error('Error updating user model:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get personalized recommendations for a user
   */
  getPersonalizedRecommendations(userId, currentTopic = null, context = {}) {
    if (!this.userProfiles.has(userId)) {
      return this.getDefaultRecommendations(currentTopic, context);
    }
    
    const userProfile = this.userProfiles.get(userId);
    const conversationHistory = this.getConversationMemory(userId);
    
    // Generate recommendations based on user profile
    const recommendations = {
      nextTopics: this.suggestNextTopics(userProfile, currentTopic, conversationHistory),
      learningPath: this.suggestPersonalizedLearningPath(userProfile, context),
      contentType: this.suggestOptimalContentType(userProfile),
      interactionStyle: this.suggestInteractionStyle(userProfile),
      difficultyLevel: this.suggestOptimalDifficulty(userProfile, currentTopic),
      reminders: this.generateContextualReminders(userProfile, conversationHistory)
    };
    
    return {
      userId,
      recommendations,
      confidenceScore: this.calculateRecommendationConfidence(userProfile),
      basedOn: this.getRecommendationReasoning(userProfile, recommendations)
    };
  }

  /**
   * Get cross-conversation context for enhanced understanding
   */
  getCrossConversationContext(userId, currentInput, maxContext = 5) {
    if (!this.conversationMemory.has(userId)) {
      return {
        available: false,
        context: []
      };
    }
    
    const conversationHistory = this.conversationMemory.get(userId);
    const relevantConversations = this.findRelevantPastConversations(
      conversationHistory,
      currentInput,
      maxContext
    );
    
    // Extract key insights from past conversations
    const contextInsights = relevantConversations.map(conv => ({
      timestamp: conv.timestamp,
      topic: this.extractTopicFromConversation(conv),
      userProgress: conv.analytics?.learningProgress || 'unknown',
      keyLearnings: this.extractKeyLearnings(conv),
      unresolved: this.identifyUnresolvedTopics(conv),
      relevanceScore: this.calculateRelevanceScore(conv, currentInput)
    }));
    
    return {
      available: true,
      context: contextInsights,
      continuity: this.analyzeContinuity(contextInsights, currentInput),
      suggestions: this.generateContinuityBasedSuggestions(contextInsights, currentInput)
    };
  }

  /**
   * Analyze conversation for user modeling insights
   */
  analyzeConversationForModeling(userResponse, conversationData) {
    const inputLower = userResponse.toLowerCase();
    
    // Analyze learning indicators
    const masteryCount = this.learningPatterns.mastery_indicators
      .filter(indicator => inputLower.includes(indicator)).length;
    
    const struggleCount = this.learningPatterns.struggle_indicators
      .filter(indicator => inputLower.includes(indicator)).length;
    
    const engagementCount = this.learningPatterns.engagement_indicators
      .filter(indicator => inputLower.includes(indicator)).length;
    
    // Analyze preferences
    const preferenceScores = {};
    Object.entries(this.learningPatterns.preference_indicators).forEach(([pref, indicators]) => {
      preferenceScores[pref] = indicators.filter(indicator => 
        inputLower.includes(indicator)).length;
    });
    
    // Analyze expertise level indicators
    const expertiseIndicators = this.analyzeExpertiseIndicators(userResponse);
    
    // Analyze subject context
    const subjectContext = this.extractSubjectContext(userResponse, conversationData);
    
    return {
      learningState: {
        mastery: masteryCount,
        struggle: struggleCount,
        engagement: engagementCount
      },
      preferences: preferenceScores,
      expertiseIndicators,
      subjectContext,
      conversationLength: userResponse.length,
      questionAsking: (userResponse.match(/\?/g) || []).length
    };
  }

  /**
   * Update user dimensions based on conversation analysis
   */
  updateUserDimensions(userId, userResponse, conversationData, metadata) {
    const profile = this.userProfiles.get(userId);
    const analytics = this.analyzeConversationForModeling(userResponse, conversationData);
    
    // Update expertise level
    this.updateExpertiseLevel(profile, analytics);
    
    // Update learning style
    this.updateLearningStyle(profile, analytics);
    
    // Update subject expertise
    this.updateSubjectExpertise(profile, analytics, metadata);
    
    // Update teaching context
    this.updateTeachingContext(profile, userResponse, metadata);
    
    // Increment conversation count
    profile.conversationCount = (profile.conversationCount || 0) + 1;
    profile.lastUpdated = Date.now();
  }

  /**
   * Update learning progression tracking
   */
  updateLearningProgression(userId, conversationData, userResponse) {
    if (!this.learningProgressions.has(userId)) {
      this.learningProgressions.set(userId, {
        topicsExplored: new Set(),
        masteryLevels: new Map(),
        learningVelocity: 0,
        progressionPath: [],
        goals: new Set()
      });
    }
    
    const progression = this.learningProgressions.get(userId);
    
    // Extract topics from conversation
    const discussedTopics = this.extractDiscussedTopics(userResponse, conversationData);
    discussedTopics.forEach(topic => progression.topicsExplored.add(topic));
    
    // Update progression path
    progression.progressionPath.push({
      timestamp: Date.now(),
      topic: discussedTopics[0] || 'general',
      userInput: userResponse,
      confidence: this.assessTopicConfidence(userResponse)
    });
    
    // Maintain path length
    if (progression.progressionPath.length > 50) {
      progression.progressionPath.shift();
    }
    
    // Calculate learning velocity
    progression.learningVelocity = this.calculateLearningVelocity(progression.progressionPath);
  }

  /**
   * Generate personalized context for interactions
   */
  generatePersonalizedContext(userId) {
    const profile = this.userProfiles.get(userId);
    const progression = this.learningProgressions.get(userId);
    const preferences = this.preferenceProfiles.get(userId);
    
    if (!profile) return this.getDefaultPersonalizedContext();
    
    return {
      expertiseLevel: profile.dimensions?.expertise_level || 'developing',
      preferredLearningStyle: profile.dimensions?.learning_style || 'mixed',
      subjectContext: profile.dimensions?.subject_expertise || 'general',
      teachingLevel: profile.dimensions?.teaching_context || 'primary',
      knownTopics: Array.from(progression?.topicsExplored || []),
      preferredContentTypes: this.getPreferredContentTypes(preferences),
      learningVelocity: progression?.learningVelocity || 0.5,
      conversationHistory: this.getRecentConversationSummary(userId),
      personalizedPrompts: this.generatePersonalizedPrompts(profile, progression),
      adaptationRecommendations: this.generateAdaptationRecommendations(profile)
    };
  }

  /**
   * Helper Methods
   */
  
  ensureUserProfile(userId) {
    if (!this.userProfiles.has(userId)) {
      this.userProfiles.set(userId, {
        id: userId,
        created: Date.now(),
        lastUpdated: Date.now(),
        conversationCount: 0,
        dimensions: {
          expertise_level: 'developing',
          learning_style: 'mixed',
          subject_expertise: 'general',
          teaching_context: 'primary'
        },
        confidence: {
          expertise_level: 0.1,
          learning_style: 0.1,
          subject_expertise: 0.1,
          teaching_context: 0.1
        }
      });
    }
    
    // Initialize related structures
    if (!this.conversationMemory.has(userId)) {
      this.conversationMemory.set(userId, []);
    }
    
    if (!this.conceptMasteryProfiles.has(userId)) {
      this.conceptMasteryProfiles.set(userId, new Map());
    }
    
    if (!this.preferenceProfiles.has(userId)) {
      this.preferenceProfiles.set(userId, {
        contentPreferences: new Map(),
        interactionPreferences: new Map(),
        difficultyPreferences: new Map()
      });
    }
  }

  updateConversationMemory(userId, conversationEntry) {
    const memory = this.conversationMemory.get(userId);
    memory.push(conversationEntry);
    
    // Maintain memory limits based on time and capacity
    const now = Date.now();
    const filteredMemory = memory.filter(entry => {
      const age = now - entry.timestamp;
      return age < this.memoryStructure.long_term.duration;
    });
    
    // Keep only most recent conversations if over capacity
    if (filteredMemory.length > this.memoryStructure.long_term.capacity) {
      filteredMemory.splice(0, filteredMemory.length - this.memoryStructure.long_term.capacity);
    }
    
    this.conversationMemory.set(userId, filteredMemory);
  }

  analyzeExpertiseIndicators(userResponse) {
    const inputLower = userResponse.toLowerCase();
    
    const noviceIndicators = ['new to', 'dont know', 'help me', 'what is', 'how do i'];
    const expertIndicators = ['in my experience', 'i usually', 'effective strategy', 'research shows'];
    
    const noviceCount = noviceIndicators.filter(indicator => inputLower.includes(indicator)).length;
    const expertCount = expertIndicators.filter(indicator => inputLower.includes(indicator)).length;
    
    return {
      novice: noviceCount,
      expert: expertCount,
      complexity: this.analyzeLanguageComplexity(userResponse)
    };
  }

  extractSubjectContext(userResponse, conversationData) {
    const inputLower = userResponse.toLowerCase();
    const subjects = {
      english: ['english', 'literacy', 'writing', 'reading', 'language'],
      science: ['science', 'biology', 'chemistry', 'physics', 'experiment'],
      mathematics: ['math', 'maths', 'mathematics', 'number', 'calculation'],
      history: ['history', 'social studies', 'humanities']
    };
    
    const detectedSubjects = [];
    Object.entries(subjects).forEach(([subject, keywords]) => {
      if (keywords.some(keyword => inputLower.includes(keyword))) {
        detectedSubjects.push(subject);
      }
    });
    
    return detectedSubjects;
  }

  updateExpertiseLevel(profile, analytics) {
    const currentLevel = profile.dimensions.expertise_level;
    const currentLevelIndex = this.modelingDimensions.expertise_level[currentLevel];
    
    let adjustment = 0;
    
    // Evidence for higher expertise
    if (analytics.expertiseIndicators.expert > 0) adjustment += 0.1;
    if (analytics.expertiseIndicators.complexity > 0.7) adjustment += 0.1;
    if (analytics.learningState.mastery > analytics.learningState.struggle) adjustment += 0.05;
    
    // Evidence for lower expertise
    if (analytics.expertiseIndicators.novice > 0) adjustment -= 0.1;
    if (analytics.learningState.struggle > analytics.learningState.mastery) adjustment -= 0.05;
    
    // Update confidence and level
    const newConfidence = Math.min(profile.confidence.expertise_level + Math.abs(adjustment), 1.0);
    profile.confidence.expertise_level = newConfidence;
    
    if (newConfidence > 0.6 && Math.abs(adjustment) > 0.1) {
      const levels = Object.keys(this.modelingDimensions.expertise_level);
      const newIndex = Math.max(0, Math.min(levels.length - 1, 
        Math.round(currentLevelIndex + adjustment * 10)));
      profile.dimensions.expertise_level = levels[newIndex];
    }
  }

  updateLearningStyle(profile, analytics) {
    // Infer learning style from preference indicators
    const styles = {
      visual: analytics.preferences.practical_examples || 0,
      reading: analytics.preferences.detailed_explanations || 0,
      kinesthetic: analytics.preferences.step_by_step || 0,
      auditory: analytics.learningState.engagement || 0
    };
    
    const preferredStyle = Object.entries(styles)
      .sort((a, b) => b[1] - a[1])[0][0];
    
    if (styles[preferredStyle] > 0) {
      profile.dimensions.learning_style = preferredStyle;
      profile.confidence.learning_style = Math.min(
        profile.confidence.learning_style + 0.1, 1.0
      );
    }
  }

  updateSubjectExpertise(profile, analytics, metadata) {
    if (analytics.subjectContext.length > 0) {
      const primarySubject = analytics.subjectContext[0];
      profile.dimensions.subject_expertise = primarySubject;
      profile.confidence.subject_expertise = Math.min(
        profile.confidence.subject_expertise + 0.2, 1.0
      );
    }
  }

  updateTeachingContext(profile, userResponse, metadata) {
    const inputLower = userResponse.toLowerCase();
    const contexts = {
      early_years: ['foundation', 'prep', 'kindergarten', 'early years'],
      primary: ['primary', 'elementary', 'year 3', 'year 4', 'year 5', 'year 6'],
      secondary: ['secondary', 'high school', 'year 7', 'year 8', 'year 9', 'year 10']
    };
    
    Object.entries(contexts).forEach(([context, keywords]) => {
      if (keywords.some(keyword => inputLower.includes(keyword))) {
        profile.dimensions.teaching_context = context;
        profile.confidence.teaching_context = Math.min(
          profile.confidence.teaching_context + 0.2, 1.0
        );
      }
    });
  }

  extractDiscussedTopics(userResponse, conversationData) {
    const inputLower = userResponse.toLowerCase();
    const topics = [];
    
    const topicKeywords = {
      'field_building': ['field building', 'prior knowledge', 'context'],
      'modeling': ['modeling', 'demonstration', 'example'],
      'joint_construction': ['joint construction', 'guided practice', 'together'],
      'independent_construction': ['independent', 'individual', 'assessment'],
      'differentiation': ['differentiation', 'diverse', 'support'],
      'assessment': ['assessment', 'feedback', 'evaluation']
    };
    
    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
      if (keywords.some(keyword => inputLower.includes(keyword))) {
        topics.push(topic);
      }
    });
    
    return topics;
  }

  calculateLearningVelocity(progressionPath) {
    if (progressionPath.length < 2) return 0.5;
    
    const timeSpan = progressionPath[progressionPath.length - 1].timestamp - progressionPath[0].timestamp;
    const topicCount = new Set(progressionPath.map(p => p.topic)).size;
    
    return Math.min(topicCount / (timeSpan / (1000 * 60 * 60)), 2.0); // topics per hour, max 2
  }

  getConversationMemory(userId, memoryType = 'medium_term') {
    const memory = this.conversationMemory.get(userId) || [];
    const now = Date.now();
    const timeLimit = this.memoryStructure[memoryType].duration;
    
    return memory
      .filter(entry => (now - entry.timestamp) < timeLimit)
      .slice(-this.memoryStructure[memoryType].capacity);
  }

  getUserProfileSummary(userId) {
    const profile = this.userProfiles.get(userId);
    const progression = this.learningProgressions.get(userId);
    
    if (!profile) return null;
    
    return {
      userId,
      expertise: profile.dimensions.expertise_level,
      learningStyle: profile.dimensions.learning_style,
      subject: profile.dimensions.subject_expertise,
      teachingLevel: profile.dimensions.teaching_context,
      conversationCount: profile.conversationCount,
      topicsExplored: progression ? Array.from(progression.topicsExplored) : [],
      modelConfidence: this.calculateOverallModelConfidence(profile),
      lastSeen: profile.lastUpdated
    };
  }

  calculateOverallModelConfidence(profile) {
    const confidences = Object.values(profile.confidence);
    return confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length;
  }

  generateUserInsights(userId) {
    const profile = this.userProfiles.get(userId);
    const progression = this.learningProgressions.get(userId);
    
    if (!profile) return [];
    
    const insights = [];
    
    // Expertise insights
    if (profile.confidence.expertise_level > 0.7) {
      insights.push({
        type: 'expertise',
        message: `User demonstrates ${profile.dimensions.expertise_level} level understanding`,
        confidence: profile.confidence.expertise_level
      });
    }
    
    // Learning style insights
    if (profile.confidence.learning_style > 0.6) {
      insights.push({
        type: 'learning_style',
        message: `Prefers ${profile.dimensions.learning_style} learning approaches`,
        confidence: profile.confidence.learning_style
      });
    }
    
    // Progression insights
    if (progression && progression.topicsExplored.size > 3) {
      insights.push({
        type: 'progression',
        message: `Explored ${progression.topicsExplored.size} TLC topics with good engagement`,
        confidence: 0.8
      });
    }
    
    return insights;
  }

  getDefaultRecommendations(currentTopic, context) {
    return {
      nextTopics: ['field_building', 'modeling', 'joint_construction'],
      learningPath: 'tlc_basics',
      contentType: 'mixed',
      interactionStyle: 'supportive',
      difficultyLevel: 'intermediate'
    };
  }

  getDefaultPersonalizedContext() {
    return {
      expertiseLevel: 'developing',
      preferredLearningStyle: 'mixed',
      subjectContext: 'general',
      teachingLevel: 'primary',
      knownTopics: [],
      conversationHistory: 'none'
    };
  }

  // Additional helper methods would be implemented here for production use
  analyzeLanguageComplexity(text) { return 0.5; }
  suggestNextTopics(profile, topic, history) { return []; }
  suggestPersonalizedLearningPath(profile, context) { return 'adaptive'; }
  suggestOptimalContentType(profile) { return 'mixed'; }
  suggestInteractionStyle(profile) { return 'supportive'; }
  suggestOptimalDifficulty(profile, topic) { return 'adaptive'; }
  generateContextualReminders(profile, history) { return []; }
  calculateRecommendationConfidence(profile) { return 0.8; }
  getRecommendationReasoning(profile, recommendations) { return 'Based on user profile'; }
  findRelevantPastConversations(history, input, max) { return []; }
  extractTopicFromConversation(conv) { return 'general'; }
  extractKeyLearnings(conv) { return []; }
  identifyUnresolvedTopics(conv) { return []; }
  calculateRelevanceScore(conv, input) { return 0.5; }
  analyzeContinuity(insights, input) { return 'good'; }
  generateContinuityBasedSuggestions(insights, input) { return []; }
  assessTopicConfidence(response) { return 0.7; }
  getPreferredContentTypes(preferences) { return ['explanatory', 'practical']; }
  getRecentConversationSummary(userId) { return 'Recent TLC discussions'; }
  generatePersonalizedPrompts(profile, progression) { return []; }
  generateAdaptationRecommendations(profile) { return []; }
  updateConceptMasteryProfile(userId, userResponse, systemResponse) {
    // Implementation for concept mastery tracking
  }
  updatePreferenceProfile(userId, userResponse, conversationData) {
    // Implementation for preference tracking
  }
}

module.exports = UserModelingEngine;