/**
 * Intelligent Knowledge Index System
 * 
 * Provides multi-dimensional knowledge indexing and retrieval with relevance scoring.
 * Replaces linear search with intelligent, context-aware topic discovery.
 * 
 * Performance Target: 95% faster knowledge retrieval vs linear search
 */

class IntelligentKnowledgeIndex {
  constructor() {
    // Core indexes for instant lookup
    this.topicIndex = new Map();           // topic_id -> full_topic_data
    this.keywordIndex = new Map();         // keyword -> [topic_ids_with_scores]
    this.scenarioIndex = new Map();        // scenario_type -> [solution_topic_ids]
    this.conceptIndex = new Map();         // tlc_concept -> [explanation_topic_ids]
    this.difficultyIndex = new Map();      // difficulty_level -> [topic_ids]
    this.subjectIndex = new Map();         // subject -> [relevant_topic_ids]
    
    // Performance tracking
    this.performanceMetrics = {
      indexBuildTime: 0,
      avgRetrievalTime: [],
      relevanceScores: [],
      cacheHitRate: 0
    };
    
    // Cache for frequent queries
    this.queryCache = new Map();
    this.maxCacheSize = 100;
    
    this.initialized = false;
  }

  /**
   * Build all indexes from knowledge base data
   * Called once at startup for optimal performance
   */
  buildIndexes(knowledgeBase) {
    const startTime = performance.now();
    console.log('🔧 Building intelligent knowledge indexes...');
    
    if (!knowledgeBase || !knowledgeBase.knowledge_base) {
      console.error('❌ Invalid knowledge base structure for indexing');
      return false;
    }

    const kb = knowledgeBase.knowledge_base;
    const topics = kb.topics || [];
    
    try {
      // Clear existing indexes
      this.clearIndexes();
      
      // Build core indexes
      topics.forEach(topic => {
        this.indexTopic(topic);
      });
      
      // Build specialized indexes
      this.buildScenarioIndex(topics);
      this.buildConceptIndex(topics);
      this.buildDifficultyIndex(topics);
      this.buildSubjectIndex(topics);
      
      // Build quick reference indexes
      if (kb.quick_reference) {
        this.indexQuickReference(kb.quick_reference);
      }
      
      const buildTime = performance.now() - startTime;
      this.performanceMetrics.indexBuildTime = buildTime;
      this.initialized = true;
      
      console.log(`✅ Knowledge indexes built successfully in ${buildTime.toFixed(2)}ms`);
      console.log(`📊 Indexed ${topics.length} topics with ${this.keywordIndex.size} unique keywords`);
      
      return true;
    } catch (error) {
      console.error('❌ Error building knowledge indexes:', error);
      return false;
    }
  }

  /**
   * Index a single topic across all dimensions
   */
  indexTopic(topic) {
    const topicId = topic.id;
    
    // Core topic storage
    this.topicIndex.set(topicId, topic);
    
    // Keyword indexing with relevance weighting
    this.indexKeywords(topicId, topic);
    
    // Teacher query indexing (common questions)
    this.indexTeacherQueries(topicId, topic);
  }

  /**
   * Index keywords with relevance scoring
   */
  indexKeywords(topicId, topic) {
    const keywords = [
      ...(topic.keywords || []),
      ...this.extractKeywordsFromContent(topic),
      ...this.extractKeywordsFromTitle(topic.title),
      ...this.extractKeywordsFromSummary(topic.summary)
    ];
    
    keywords.forEach(keyword => {
      const normalizedKeyword = keyword.toLowerCase().trim();
      if (normalizedKeyword.length < 2) return; // Skip very short keywords
      
      if (!this.keywordIndex.has(normalizedKeyword)) {
        this.keywordIndex.set(normalizedKeyword, []);
      }
      
      // Calculate relevance score based on keyword source
      let relevanceScore = 1.0;
      if (topic.keywords?.includes(keyword)) relevanceScore = 3.0;      // Explicit keywords highest
      if (topic.title?.toLowerCase().includes(normalizedKeyword)) relevanceScore = 2.5;
      if (topic.summary?.toLowerCase().includes(normalizedKeyword)) relevanceScore = 2.0;
      
      this.keywordIndex.get(normalizedKeyword).push({
        topicId,
        relevanceScore,
        source: this.determineKeywordSource(keyword, topic)
      });
    });
  }

  /**
   * Extract meaningful keywords from topic content
   */
  extractKeywordsFromContent(topic) {
    const keywords = [];
    
    if (topic.content) {
      // Extract from different content sections
      Object.values(topic.content).forEach(section => {
        if (typeof section === 'string') {
          keywords.push(...this.extractSignificantWords(section));
        } else if (typeof section === 'object') {
          Object.values(section).forEach(subsection => {
            if (typeof subsection === 'string') {
              keywords.push(...this.extractSignificantWords(subsection));
            } else if (Array.isArray(subsection)) {
              subsection.forEach(item => {
                if (typeof item === 'string') {
                  keywords.push(...this.extractSignificantWords(item));
                }
              });
            }
          });
        }
      });
    }
    
    return keywords;
  }

  /**
   * Extract significant words from text (avoiding common words)
   */
  extractSignificantWords(text) {
    if (!text || typeof text !== 'string') return [];
    
    const commonWords = new Set([
      'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'from', 'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below',
      'up', 'down', 'out', 'off', 'over', 'under', 'again', 'further', 'then', 'once',
      'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do',
      'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can',
      'a', 'an', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they'
    ]);
    
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')  // Remove punctuation
      .split(/\s+/)
      .filter(word => 
        word.length > 2 && 
        !commonWords.has(word) && 
        !/^\d+$/.test(word)  // No pure numbers
      )
      .slice(0, 10); // Limit to most relevant words
  }

  /**
   * Extract keywords from title with higher relevance
   */
  extractKeywordsFromTitle(title) {
    if (!title) return [];
    return this.extractSignificantWords(title);
  }

  /**
   * Extract keywords from summary
   */
  extractKeywordsFromSummary(summary) {
    if (!summary) return [];
    return this.extractSignificantWords(summary);
  }

  /**
   * Build scenario-based index for troubleshooting
   */
  buildScenarioIndex(topics) {
    const scenarioKeywords = {
      'engagement_issues': ['engagement', 'participation', 'motivation', 'bored', 'disengaged'],
      'joint_construction_problems': ['joint construction', 'collaboration', 'discussion', 'chaos', 'dominated'],
      'independent_writing_struggles': ['independent', 'writing', 'blank pages', 'cant write', 'stuck'],
      'time_management': ['time', 'running out', 'schedule', 'pacing', 'rushed'],
      'differentiation_needs': ['differentiation', 'diverse', 'eal', 'esl', 'support', 'advanced'],
      'assessment_challenges': ['assessment', 'feedback', 'evaluation', 'grades', 'marking']
    };
    
    Object.entries(scenarioKeywords).forEach(([scenario, keywords]) => {
      const relevantTopics = [];
      
      topics.forEach(topic => {
        const hasRelevantKeywords = keywords.some(keyword =>
          topic.title?.toLowerCase().includes(keyword) ||
          topic.summary?.toLowerCase().includes(keyword) ||
          topic.keywords?.some(tk => tk.toLowerCase().includes(keyword))
        );
        
        if (hasRelevantKeywords) {
          relevantTopics.push(topic.id);
        }
      });
      
      if (relevantTopics.length > 0) {
        this.scenarioIndex.set(scenario, relevantTopics);
      }
    });
  }

  /**
   * Build TLC concept index
   */
  buildConceptIndex(topics) {
    const tlcConcepts = {
      'field_building': ['field building', 'prior knowledge', 'context', 'vocabulary'],
      'modeling': ['modeling', 'deconstruction', 'demonstration', 'example'],
      'joint_construction': ['joint construction', 'guided practice', 'collaboration', 'scaffolding'],
      'independent_construction': ['independent', 'individual', 'assessment', 'application'],
      'scaffolding': ['scaffold', 'support', 'guidance', 'gradual release'],
      'genre_based_teaching': ['genre', 'text type', 'structure', 'language features']
    };
    
    Object.entries(tlcConcepts).forEach(([concept, keywords]) => {
      const relevantTopics = [];
      
      topics.forEach(topic => {
        const relevanceScore = keywords.reduce((score, keyword) => {
          if (topic.title?.toLowerCase().includes(keyword)) score += 3;
          if (topic.summary?.toLowerCase().includes(keyword)) score += 2;
          if (topic.keywords?.some(tk => tk.toLowerCase().includes(keyword))) score += 2;
          return score;
        }, 0);
        
        if (relevanceScore > 0) {
          relevantTopics.push({ topicId: topic.id, relevanceScore });
        }
      });
      
      // Sort by relevance and store
      relevantTopics.sort((a, b) => b.relevanceScore - a.relevanceScore);
      this.conceptIndex.set(concept, relevantTopics.map(t => t.topicId));
    });
  }

  /**
   * Build difficulty-based index
   */
  buildDifficultyIndex(topics) {
    const difficultyLevels = ['beginner', 'intermediate', 'advanced'];
    
    difficultyLevels.forEach(level => {
      const relevantTopics = topics
        .filter(topic => topic.difficulty === level)
        .map(topic => topic.id);
      
      if (relevantTopics.length > 0) {
        this.difficultyIndex.set(level, relevantTopics);
      }
    });
  }

  /**
   * Build subject-specific index
   */
  buildSubjectIndex(topics) {
    const subjectKeywords = {
      'english': ['english', 'literacy', 'writing', 'reading', 'language', 'genre'],
      'science': ['science', 'scientific', 'investigation', 'hypothesis', 'experiment'],
      'mathematics': ['mathematics', 'math', 'problem solving', 'numerical', 'calculation'],
      'history': ['history', 'historical', 'past', 'chronology', 'evidence'],
      'geography': ['geography', 'spatial', 'location', 'environment', 'mapping']
    };
    
    Object.entries(subjectKeywords).forEach(([subject, keywords]) => {
      const relevantTopics = [];
      
      topics.forEach(topic => {
        const hasSubjectContent = keywords.some(keyword =>
          topic.title?.toLowerCase().includes(keyword) ||
          topic.summary?.toLowerCase().includes(keyword) ||
          topic.keywords?.some(tk => tk.toLowerCase().includes(keyword)) ||
          JSON.stringify(topic.content || {}).toLowerCase().includes(keyword)
        );
        
        if (hasSubjectContent) {
          relevantTopics.push(topic.id);
        }
      });
      
      if (relevantTopics.length > 0) {
        this.subjectIndex.set(subject, relevantTopics);
      }
    });
  }

  /**
   * Index teacher queries for quick FAQ lookup
   */
  indexTeacherQueries(topicId, topic) {
    if (topic.teacher_queries && Array.isArray(topic.teacher_queries)) {
      topic.teacher_queries.forEach(query => {
        const queryKeywords = this.extractSignificantWords(query);
        queryKeywords.forEach(keyword => {
          const normalizedKeyword = keyword.toLowerCase();
          if (!this.keywordIndex.has(normalizedKeyword)) {
            this.keywordIndex.set(normalizedKeyword, []);
          }
          
          this.keywordIndex.get(normalizedKeyword).push({
            topicId,
            relevanceScore: 2.5, // High relevance for teacher queries
            source: 'teacher_query'
          });
        });
      });
    }
  }

  /**
   * Index quick reference data
   */
  indexQuickReference(quickRef) {
    if (quickRef.tlc_stages) {
      quickRef.tlc_stages.forEach((stage, index) => {
        const stageKeywords = [
          stage.stage?.toLowerCase(),
          stage.purpose?.toLowerCase(),
          ...(stage.key_activities || []).map(a => a.toLowerCase())
        ].filter(Boolean);
        
        stageKeywords.forEach(keyword => {
          const normalizedKeyword = keyword.toLowerCase();
          if (!this.keywordIndex.has(normalizedKeyword)) {
            this.keywordIndex.set(normalizedKeyword, []);
          }
          
          this.keywordIndex.get(normalizedKeyword).push({
            topicId: `quick_ref_stage_${index}`,
            relevanceScore: 2.0,
            source: 'quick_reference',
            data: stage
          });
        });
      });
    }
  }

  /**
   * MAIN INTELLIGENCE METHOD: Find optimal topics with multi-dimensional scoring
   */
  findOptimalTopics(query, context = {}, maxResults = 3) {
    const startTime = performance.now();
    
    // Check cache first
    const cacheKey = this.generateCacheKey(query, context, maxResults);
    if (this.queryCache.has(cacheKey)) {
      const cachedResult = this.queryCache.get(cacheKey);
      this.trackPerformance(performance.now() - startTime, cachedResult.relevanceScore || 0.8);
      return cachedResult;
    }
    
    if (!this.initialized) {
      console.warn('⚠️ Knowledge index not initialized, falling back to empty results');
      return { topics: [], confidence: 0, reasoning: 'Index not initialized' };
    }
    
    try {
      // Step 1: Tokenize and analyze query
      const queryTokens = this.tokenizeQuery(query);
      const relevanceScores = new Map();
      
      // Step 2: Score by keyword relevance
      this.scoreByKeywords(queryTokens, relevanceScores);
      
      // Step 3: Score by context (subject, challenges, needs)
      this.scoreByContext(context, relevanceScores);
      
      // Step 4: Score by scenario patterns
      this.scoreByScenario(query, relevanceScores);
      
      // Step 5: Apply difficulty and expertise adjustments
      this.applyExpertiseAdjustments(context, relevanceScores);
      
      // Step 6: Get top scored topics
      const topTopics = this.getTopScoredTopics(relevanceScores, maxResults);
      
      // Step 7: Calculate confidence and generate reasoning
      const confidence = this.calculateConfidence(topTopics, query);
      const reasoning = this.generateReasoning(topTopics, query, context);
      
      const result = {
        topics: topTopics,
        confidence,
        reasoning,
        retrievalTime: performance.now() - startTime,
        queryAnalysis: {
          tokens: queryTokens,
          detectedScenarios: this.detectScenarios(query),
          contextFactors: Object.keys(context)
        }
      };
      
      // Cache result
      this.cacheResult(cacheKey, result);
      
      // Track performance
      this.trackPerformance(result.retrievalTime, confidence);
      
      return result;
      
    } catch (error) {
      console.error('❌ Error in intelligent topic retrieval:', error);
      return {
        topics: [],
        confidence: 0,
        reasoning: `Error during retrieval: ${error.message}`,
        retrievalTime: performance.now() - startTime
      };
    }
  }

  /**
   * Tokenize query with smart preprocessing
   */
  tokenizeQuery(query) {
    if (!query || typeof query !== 'string') return [];
    
    return query
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(token => token.length > 1)
      .slice(0, 20); // Reasonable limit
  }

  /**
   * Score topics by keyword relevance
   */
  scoreByKeywords(queryTokens, relevanceScores) {
    queryTokens.forEach(token => {
      if (this.keywordIndex.has(token)) {
        this.keywordIndex.get(token).forEach(entry => {
          const currentScore = relevanceScores.get(entry.topicId) || 0;
          relevanceScores.set(entry.topicId, currentScore + entry.relevanceScore);
        });
      }
      
      // Also check for partial matches
      this.keywordIndex.forEach((entries, keyword) => {
        if (keyword.includes(token) || token.includes(keyword)) {
          entries.forEach(entry => {
            const currentScore = relevanceScores.get(entry.topicId) || 0;
            relevanceScores.set(entry.topicId, currentScore + (entry.relevanceScore * 0.5)); // Partial match bonus
          });
        }
      });
    });
  }

  /**
   * Score by context factors
   */
  scoreByContext(context, relevanceScores) {
    // Subject-specific boosting
    if (context.subject && this.subjectIndex.has(context.subject)) {
      this.subjectIndex.get(context.subject).forEach(topicId => {
        const currentScore = relevanceScores.get(topicId) || 0;
        relevanceScores.set(topicId, currentScore + 1.5);
      });
    }
    
    // Challenge-specific boosting
    if (context.challenges && Array.isArray(context.challenges)) {
      context.challenges.forEach(challenge => {
        if (this.scenarioIndex.has(challenge)) {
          this.scenarioIndex.get(challenge).forEach(topicId => {
            const currentScore = relevanceScores.get(topicId) || 0;
            relevanceScores.set(topicId, currentScore + 2.0);
          });
        }
      });
    }
    
    // Student needs boosting
    if (context.studentNeeds && Array.isArray(context.studentNeeds)) {
      context.studentNeeds.forEach(need => {
        const needKeyword = need.toLowerCase().replace(/\s+/g, '_');
        if (this.scenarioIndex.has(needKeyword)) {
          this.scenarioIndex.get(needKeyword).forEach(topicId => {
            const currentScore = relevanceScores.get(topicId) || 0;
            relevanceScores.set(topicId, currentScore + 1.8);
          });
        }
      });
    }
  }

  /**
   * Score by detected scenarios
   */
  scoreByScenario(query, relevanceScores) {
    const detectedScenarios = this.detectScenarios(query);
    
    detectedScenarios.forEach(scenario => {
      if (this.scenarioIndex.has(scenario)) {
        this.scenarioIndex.get(scenario).forEach(topicId => {
          const currentScore = relevanceScores.get(topicId) || 0;
          relevanceScores.set(topicId, currentScore + 2.5);
        });
      }
    });
  }

  /**
   * Detect scenarios from query patterns
   */
  detectScenarios(query) {
    const queryLower = query.toLowerCase();
    const scenarios = [];
    
    // Engagement detection
    if (queryLower.includes('engagement') || queryLower.includes('participation') || 
        queryLower.includes('motivation') || queryLower.includes('bored')) {
      scenarios.push('engagement_issues');
    }
    
    // Joint construction detection
    if (queryLower.includes('joint construction') || queryLower.includes('discussion') || 
        queryLower.includes('collaboration') || queryLower.includes('chaos')) {
      scenarios.push('joint_construction_problems');
    }
    
    // Writing struggles detection
    if (queryLower.includes('writing') && (queryLower.includes('struggle') || 
        queryLower.includes('difficult') || queryLower.includes('help'))) {
      scenarios.push('independent_writing_struggles');
    }
    
    // Time management detection
    if (queryLower.includes('time') && (queryLower.includes('management') || 
        queryLower.includes('running out') || queryLower.includes('schedule'))) {
      scenarios.push('time_management');
    }
    
    return scenarios;
  }

  /**
   * Apply expertise-based adjustments
   */
  applyExpertiseAdjustments(context, relevanceScores) {
    if (!context.expertiseLevel) return;
    
    const expertiseLevel = context.expertiseLevel.toLowerCase();
    
    // Boost topics appropriate for expertise level
    if (this.difficultyIndex.has(expertiseLevel)) {
      this.difficultyIndex.get(expertiseLevel).forEach(topicId => {
        const currentScore = relevanceScores.get(topicId) || 0;
        relevanceScores.set(topicId, currentScore + 1.0);
      });
    }
    
    // Penalize inappropriate difficulty levels
    if (expertiseLevel === 'beginner') {
      if (this.difficultyIndex.has('advanced')) {
        this.difficultyIndex.get('advanced').forEach(topicId => {
          const currentScore = relevanceScores.get(topicId) || 0;
          relevanceScores.set(topicId, currentScore - 0.5);
        });
      }
    }
  }

  /**
   * Get top scored topics with metadata
   */
  getTopScoredTopics(relevanceScores, maxResults) {
    return Array.from(relevanceScores.entries())
      .filter(([topicId, score]) => score > 0 && this.topicIndex.has(topicId))
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxResults)
      .map(([topicId, score]) => ({
        ...this.topicIndex.get(topicId),
        relevanceScore: score,
        matchConfidence: Math.min(score / 5.0, 1.0) // Normalize to 0-1
      }));
  }

  /**
   * Calculate overall confidence in results
   */
  calculateConfidence(topTopics, query) {
    if (topTopics.length === 0) return 0;
    
    const avgRelevance = topTopics.reduce((sum, topic) => sum + topic.relevanceScore, 0) / topTopics.length;
    const queryComplexity = this.assessQueryComplexity(query);
    const resultDiversity = this.assessResultDiversity(topTopics);
    
    // Combine factors for overall confidence
    let confidence = (avgRelevance / 5.0) * 0.6 + queryComplexity * 0.2 + resultDiversity * 0.2;
    return Math.min(Math.max(confidence, 0), 1); // Clamp to 0-1
  }

  /**
   * Assess query complexity
   */
  assessQueryComplexity(query) {
    const wordCount = query.split(/\s+/).length;
    const hasSpecificTerms = /\b(tlc|teaching|learning|cycle|framework)\b/i.test(query);
    const hasQuestionWords = /\b(how|what|why|when|where|which)\b/i.test(query);
    
    let complexity = 0.5; // Base complexity
    if (wordCount > 5) complexity += 0.2;
    if (hasSpecificTerms) complexity += 0.2;
    if (hasQuestionWords) complexity += 0.1;
    
    return Math.min(complexity, 1.0);
  }

  /**
   * Assess diversity of results
   */
  assessResultDiversity(topics) {
    if (topics.length <= 1) return 0.5;
    
    const categories = new Set(topics.map(t => t.category));
    const difficulties = new Set(topics.map(t => t.difficulty));
    
    return Math.min((categories.size + difficulties.size) / (topics.length * 2), 1.0);
  }

  /**
   * Generate human-readable reasoning
   */
  generateReasoning(topTopics, query, context) {
    if (topTopics.length === 0) {
      return 'No highly relevant topics found for this query. Consider rephrasing or asking about specific TLC concepts.';
    }
    
    let reasoning = `Found ${topTopics.length} relevant topics. `;
    
    const topTopic = topTopics[0];
    reasoning += `Top match: "${topTopic.title}" (confidence: ${(topTopic.matchConfidence * 100).toFixed(0)}%). `;
    
    if (context.subject) {
      reasoning += `Prioritized ${context.subject} content. `;
    }
    
    const detectedScenarios = this.detectScenarios(query);
    if (detectedScenarios.length > 0) {
      reasoning += `Detected scenario patterns: ${detectedScenarios.join(', ')}. `;
    }
    
    return reasoning;
  }

  /**
   * Cache management
   */
  generateCacheKey(query, context, maxResults) {
    return `${query.toLowerCase()}|${JSON.stringify(context)}|${maxResults}`;
  }

  cacheResult(cacheKey, result) {
    if (this.queryCache.size >= this.maxCacheSize) {
      // Remove oldest entries
      const firstKey = this.queryCache.keys().next().value;
      this.queryCache.delete(firstKey);
    }
    
    this.queryCache.set(cacheKey, result);
  }

  /**
   * Performance tracking
   */
  trackPerformance(retrievalTime, relevanceScore) {
    this.performanceMetrics.avgRetrievalTime.push(retrievalTime);
    this.performanceMetrics.relevanceScores.push(relevanceScore);
    
    // Keep only last 100 measurements
    if (this.performanceMetrics.avgRetrievalTime.length > 100) {
      this.performanceMetrics.avgRetrievalTime.shift();
      this.performanceMetrics.relevanceScores.shift();
    }
    
    // Update cache hit rate
    this.performanceMetrics.cacheHitRate = this.queryCache.size / (this.queryCache.size + 1);
  }

  /**
   * Get performance statistics
   */
  getPerformanceStats() {
    const avgTime = this.performanceMetrics.avgRetrievalTime.length > 0
      ? this.performanceMetrics.avgRetrievalTime.reduce((a, b) => a + b) / this.performanceMetrics.avgRetrievalTime.length
      : 0;
      
    const avgRelevance = this.performanceMetrics.relevanceScores.length > 0
      ? this.performanceMetrics.relevanceScores.reduce((a, b) => a + b) / this.performanceMetrics.relevanceScores.length
      : 0;
    
    return {
      indexBuildTime: this.performanceMetrics.indexBuildTime,
      avgRetrievalTime: avgTime,
      avgRelevanceScore: avgRelevance,
      cacheHitRate: this.performanceMetrics.cacheHitRate,
      totalQueries: this.performanceMetrics.avgRetrievalTime.length,
      indexSize: {
        topics: this.topicIndex.size,
        keywords: this.keywordIndex.size,
        scenarios: this.scenarioIndex.size,
        concepts: this.conceptIndex.size
      }
    };
  }

  /**
   * Utility methods
   */
  clearIndexes() {
    this.topicIndex.clear();
    this.keywordIndex.clear();
    this.scenarioIndex.clear();
    this.conceptIndex.clear();
    this.difficultyIndex.clear();
    this.subjectIndex.clear();
    this.queryCache.clear();
  }

  determineKeywordSource(keyword, topic) {
    if (topic.keywords?.includes(keyword)) return 'explicit_keyword';
    if (topic.title?.toLowerCase().includes(keyword.toLowerCase())) return 'title';
    if (topic.summary?.toLowerCase().includes(keyword.toLowerCase())) return 'summary';
    return 'content';
  }

  isInitialized() {
    return this.initialized;
  }

  getIndexSizes() {
    return {
      topics: this.topicIndex.size,
      keywords: this.keywordIndex.size,
      scenarios: this.scenarioIndex.size,
      concepts: this.conceptIndex.size,
      difficulties: this.difficultyIndex.size,
      subjects: this.subjectIndex.size
    };
  }
}

module.exports = IntelligentKnowledgeIndex;