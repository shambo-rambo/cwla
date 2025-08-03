/**
 * Conversation Flow Intelligence System
 * 
 * Guides users efficiently through TLC learning and implementation using
 * intelligent flow management, goal tracking, and cross-service navigation.
 * 
 * Target: 70% improvement in goal achievement through intelligent flow management
 */

class ConversationFlowIntelligence {
  constructor() {
    // Goal-oriented conversation flows
    this.conversationFlows = {
      learning_tlc_basics: {
        name: 'Learning TLC Basics',
        stages: [
          { id: 'understand_overview', name: 'Understand TLC Overview', estimatedTime: 5 },
          { id: 'explore_stages', name: 'Explore Four Stages', estimatedTime: 10 },
          { id: 'see_connections', name: 'See Stage Connections', estimatedTime: 8 },
          { id: 'identify_applications', name: 'Identify Applications', estimatedTime: 7 }
        ],
        successCriteria: [
          'Can explain TLC purpose',
          'Can name and describe four stages',
          'Understands stage relationships',
          'Sees relevance to their teaching'
        ]
      },
      
      implementing_tlc: {
        name: 'Implementing TLC',
        stages: [
          { id: 'assess_readiness', name: 'Assess Implementation Readiness', estimatedTime: 3 },
          { id: 'plan_first_attempt', name: 'Plan First Implementation', estimatedTime: 12 },
          { id: 'anticipate_challenges', name: 'Anticipate Challenges', estimatedTime: 8 },
          { id: 'prepare_adaptations', name: 'Prepare Adaptations', estimatedTime: 7 }
        ],
        successCriteria: [
          'Has concrete implementation plan',
          'Understands potential challenges',
          'Has adaptation strategies',
          'Feels confident to try'
        ],
        suggestedTransition: 'lesson_planner'
      },
      
      troubleshooting_problems: {
        name: 'Troubleshooting TLC Problems',
        stages: [
          { id: 'identify_specific_issue', name: 'Identify Specific Issue', estimatedTime: 5 },
          { id: 'understand_root_causes', name: 'Understand Root Causes', estimatedTime: 8 },
          { id: 'explore_solutions', name: 'Explore Solutions', estimatedTime: 10 },
          { id: 'plan_implementation', name: 'Plan Solution Implementation', estimatedTime: 7 }
        ],
        successCriteria: [
          'Issue clearly identified',
          'Root cause understood',
          'Has actionable solutions',
          'Has implementation plan'
        ]
      },
      
      supporting_diverse_learners: {
        name: 'Supporting Diverse Learners',
        stages: [
          { id: 'identify_learner_needs', name: 'Identify Learner Needs', estimatedTime: 6 },
          { id: 'explore_strategies', name: 'Explore Differentiation Strategies', estimatedTime: 12 },
          { id: 'adapt_tlc_stages', name: 'Adapt TLC Stages', estimatedTime: 10 },
          { id: 'plan_assessment', name: 'Plan Inclusive Assessment', estimatedTime: 7 }
        ],
        successCriteria: [
          'Learner needs identified',
          'Appropriate strategies selected',
          'TLC adaptations planned',
          'Assessment approach ready'
        ]
      },
      
      subject_specific_application: {
        name: 'Subject-Specific Application',
        stages: [
          { id: 'understand_subject_context', name: 'Understand Subject Context', estimatedTime: 4 },
          { id: 'explore_genre_applications', name: 'Explore Genre Applications', estimatedTime: 10 },
          { id: 'adapt_for_subject', name: 'Adapt TLC for Subject', estimatedTime: 12 },
          { id: 'plan_integration', name: 'Plan Curriculum Integration', estimatedTime: 8 }
        ],
        successCriteria: [
          'Subject context clear',
          'Genre applications understood',
          'TLC adapted for subject',
          'Integration plan ready'
        ],
        suggestedTransition: 'lesson_planner'
      }
    };
    
    // Flow detection patterns
    this.flowDetectionPatterns = {
      learning_tlc_basics: [
        'what is tlc', 'explain teaching learning cycle', 'new to tlc', 'understand framework',
        'how does tlc work', 'tlc stages', 'beginning with tlc'
      ],
      implementing_tlc: [
        'how to implement', 'start using tlc', 'put tlc into practice', 'use in classroom',
        'begin implementation', 'try tlc', 'getting started'
      ],
      troubleshooting_problems: [
        'problem with', 'not working', 'struggling with', 'difficulty', 'challenge',
        'students not responding', 'issue with', 'help with problem'
      ],
      supporting_diverse_learners: [
        'diverse learners', 'different needs', 'eal students', 'support struggling',
        'mixed abilities', 'differentiation', 'inclusive practice'
      ],
      subject_specific_application: [
        'in english', 'for science', 'math application', 'history class',
        'subject specific', 'my subject', 'curriculum area'
      ]
    };
    
    // Conversation health indicators
    this.healthIndicators = {
      productive_flow: [
        'yes that helps', 'makes sense', 'i understand', 'clear explanation',
        'useful information', 'good point', 'ready for next'
      ],
      stuck_indicators: [
        'still confused', 'not clear', 'dont understand', 'can you explain again',
        'not making sense', 'struggling to follow', 'lost'
      ],
      ready_to_progress: [
        'what next', 'ready to move on', 'next step', 'how do i proceed',
        'what should i do now', 'ready to try', 'lets continue'
      ],
      need_different_approach: [
        'different way', 'another approach', 'simpler explanation', 'more examples',
        'practical steps', 'hands on', 'concrete'
      ]
    };
    
    // Cross-service navigation patterns
    this.navigationPatterns = {
      to_lesson_planner: [
        'create lesson', 'lesson plan', 'specific activities', 'detailed plan',
        'classroom activities', 'ready to plan', 'implement this'
      ],
      to_framework_learning: [
        'understand theory', 'explain concept', 'more about tlc', 'framework details',
        'theoretical background', 'research basis', 'deeper understanding'
      ]
    };
    
    // Performance tracking
    this.flowCompletionRates = [];
    this.goalAchievementMetrics = [];
    this.navigationSuccessRates = [];
    this.userSatisfactionScores = [];
  }

  /**
   * MAIN FLOW MANAGEMENT METHOD: Guide conversation toward user goals efficiently
   */
  guideConversationFlow(currentState, userGoals, conversationHistory, userInput) {
    try {
      // Detect or confirm conversation flow
      const detectedFlow = this.detectConversationFlow(userInput, conversationHistory, userGoals);
      
      // Assess current progress in flow
      const progressAssessment = this.assessFlowProgress(detectedFlow, conversationHistory, currentState);
      
      // Check conversation health
      const conversationHealth = this.assessConversationHealth(conversationHistory, userInput);
      
      // Determine optimal next step
      const nextStepGuidance = this.determineNextStep(
        detectedFlow,
        progressAssessment,
        conversationHealth,
        userGoals
      );
      
      // Generate navigation recommendations
      const navigationGuidance = this.generateNavigationGuidance(
        detectedFlow,
        progressAssessment,
        currentState
      );
      
      // Calculate flow confidence
      const flowConfidence = this.calculateFlowConfidence(
        detectedFlow,
        progressAssessment,
        conversationHealth
      );
      
      return {
        detectedFlow,
        progressAssessment,
        conversationHealth,
        nextStepGuidance,
        navigationGuidance,
        flowConfidence,
        recommendations: this.generateFlowRecommendations(detectedFlow, progressAssessment)
      };
      
    } catch (error) {
      console.error('Error in conversation flow guidance:', error);
      return {
        detectedFlow: null,
        progressAssessment: { stage: 'unknown', progress: 0 },
        conversationHealth: { status: 'unknown' },
        nextStepGuidance: { action: 'continue_conversation' },
        navigationGuidance: {},
        flowConfidence: 0
      };
    }
  }

  /**
   * Detect the conversation flow based on user input and context
   */
  detectConversationFlow(userInput, conversationHistory, userGoals) {
    const inputLower = userInput.toLowerCase();
    const historyText = conversationHistory
      .filter(msg => msg.role === 'user')
      .map(msg => msg.content)
      .join(' ')
      .toLowerCase();
    
    const allText = `${inputLower} ${historyText}`;
    
    // Score each flow based on pattern matching
    const flowScores = {};
    
    Object.entries(this.flowDetectionPatterns).forEach(([flowName, patterns]) => {
      const matchCount = patterns.filter(pattern => allText.includes(pattern)).length;
      flowScores[flowName] = matchCount / patterns.length;
    });
    
    // Find best matching flow
    const bestMatch = Object.entries(flowScores)
      .sort((a, b) => b[1] - a[1])[0];
    
    if (bestMatch && bestMatch[1] > 0.1) { // Minimum threshold
      return {
        flowName: bestMatch[0],
        flowData: this.conversationFlows[bestMatch[0]],
        confidence: bestMatch[1],
        detectionMethod: 'pattern_matching'
      };
    }
    
    // Fallback: infer from user goals
    if (userGoals && userGoals.primary) {
      const goalBasedFlow = this.inferFlowFromGoals(userGoals);
      if (goalBasedFlow) {
        return {
          flowName: goalBasedFlow,
          flowData: this.conversationFlows[goalBasedFlow],
          confidence: 0.6,
          detectionMethod: 'goal_inference'
        };
      }
    }
    
    return null;
  }

  /**
   * Assess progress through the detected flow
   */
  assessFlowProgress(detectedFlow, conversationHistory, currentState) {
    if (!detectedFlow || !detectedFlow.flowData) {
      return { stage: 'unknown', progress: 0, completedStages: [] };
    }
    
    const flow = detectedFlow.flowData;
    const userMessages = conversationHistory.filter(msg => msg.role === 'user');
    const assistantMessages = conversationHistory.filter(msg => msg.role === 'assistant');
    
    // Analyze which stages have been addressed
    const completedStages = [];
    const partialStages = [];
    
    flow.stages.forEach((stage, index) => {
      const stageCompletion = this.assessStageCompletion(
        stage,
        userMessages,
        assistantMessages,
        currentState
      );
      
      if (stageCompletion.completed) {
        completedStages.push(stage.id);
      } else if (stageCompletion.partial) {
        partialStages.push({
          stageId: stage.id,
          completion: stageCompletion.completionPercentage
        });
      }
    });
    
    // Calculate overall progress
    const totalStages = flow.stages.length;
    const progress = completedStages.length / totalStages;
    
    // Determine current stage
    const currentStageIndex = completedStages.length;
    const currentStage = currentStageIndex < totalStages 
      ? flow.stages[currentStageIndex].id 
      : 'completed';
    
    return {
      stage: currentStage,
      progress,
      completedStages,
      partialStages,
      totalStages,
      estimatedTimeRemaining: this.calculateRemainingTime(flow, completedStages)
    };
  }

  /**
   * Assess conversation health and flow quality
   */
  assessConversationHealth(conversationHistory, userInput) {
    const recentMessages = conversationHistory.slice(-4);
    const recentText = recentMessages.map(msg => msg.content).join(' ').toLowerCase();
    const currentInputLower = userInput.toLowerCase();
    
    const allRecentText = `${recentText} ${currentInputLower}`;
    
    // Check health indicators
    const productiveCount = this.healthIndicators.productive_flow
      .filter(indicator => allRecentText.includes(indicator)).length;
    
    const stuckCount = this.healthIndicators.stuck_indicators
      .filter(indicator => allRecentText.includes(indicator)).length;
    
    const readyCount = this.healthIndicators.ready_to_progress
      .filter(indicator => allRecentText.includes(indicator)).length;
    
    const needChangeCount = this.healthIndicators.need_different_approach
      .filter(indicator => allRecentText.includes(indicator)).length;
    
    // Determine health status
    let status = 'good';
    let confidence = 0.8;
    let recommendations = [];
    
    if (stuckCount > productiveCount) {
      status = 'stuck';
      confidence = 0.9;
      recommendations.push('Provide simpler explanation or different approach');
    } else if (needChangeCount > 0) {
      status = 'needs_adaptation';
      confidence = 0.7;
      recommendations.push('Adapt teaching approach or provide more examples');
    } else if (readyCount > 0) {
      status = 'ready_to_progress';
      confidence = 0.8;
      recommendations.push('Move to next stage or deeper level');
    } else if (productiveCount > 0) {
      status = 'productive';
      confidence = 0.9;
      recommendations.push('Continue current approach');
    }
    
    return {
      status,
      confidence,
      recommendations,
      indicators: {
        productive: productiveCount,
        stuck: stuckCount,
        ready: readyCount,
        needChange: needChangeCount
      }
    };
  }

  /**
   * Determine the optimal next step in the conversation
   */
  determineNextStep(detectedFlow, progressAssessment, conversationHealth, userGoals) {
    // If conversation is stuck, address that first
    if (conversationHealth.status === 'stuck') {
      return {
        action: 'address_confusion',
        priority: 'high',
        guidance: 'Clarify confusion before proceeding',
        suggestedApproach: 'simpler_explanation'
      };
    }
    
    // If user needs different approach
    if (conversationHealth.status === 'needs_adaptation') {
      return {
        action: 'adapt_approach',
        priority: 'high',
        guidance: 'Change teaching method or provide different examples',
        suggestedApproach: 'alternative_explanation'
      };
    }
    
    // If no flow detected, help establish one
    if (!detectedFlow) {
      return {
        action: 'establish_flow',
        priority: 'medium',
        guidance: 'Help user identify their learning goals',
        suggestedApproach: 'goal_clarification'
      };
    }
    
    // If ready to progress in current flow
    if (conversationHealth.status === 'ready_to_progress' || 
        conversationHealth.status === 'productive') {
      
      const nextStage = this.getNextStageInFlow(detectedFlow, progressAssessment);
      
      if (nextStage) {
        return {
          action: 'progress_to_next_stage',
          priority: 'high',
          guidance: `Move to: ${nextStage.name}`,
          suggestedApproach: 'stage_transition',
          nextStage
        };
      } else {
        // Flow completed
        return {
          action: 'complete_flow',
          priority: 'high',
          guidance: 'Flow completed - offer next steps or transitions',
          suggestedApproach: 'flow_completion'
        };
      }
    }
    
    // Default: continue current stage
    return {
      action: 'continue_current_stage',
      priority: 'medium',
      guidance: 'Continue developing current topic',
      suggestedApproach: 'topic_development'
    };
  }

  /**
   * Generate navigation guidance for cross-service transitions
   */
  generateNavigationGuidance(detectedFlow, progressAssessment, currentState) {
    const guidance = {
      shouldRedirect: false,
      redirectTarget: null,
      redirectReason: null,
      redirectConfidence: 0
    };
    
    // Check if user input suggests lesson planning need
    const needsLessonPlanning = this.navigationPatterns.to_lesson_planner
      .some(pattern => currentState.lastUserInput?.toLowerCase().includes(pattern));
    
    if (needsLessonPlanning) {
      guidance.shouldRedirect = true;
      guidance.redirectTarget = 'lesson_planner';
      guidance.redirectReason = 'User expressed need for specific lesson planning';
      guidance.redirectConfidence = 0.8;
    }
    
    // Check if flow suggests natural transition
    if (detectedFlow && detectedFlow.flowData.suggestedTransition && 
        progressAssessment.progress > 0.7) {
      guidance.shouldRedirect = true;
      guidance.redirectTarget = detectedFlow.flowData.suggestedTransition;
      guidance.redirectReason = 'Flow completion suggests transition';
      guidance.redirectConfidence = 0.7;
    }
    
    // Check for deep framework learning needs
    const needsFrameworkLearning = this.navigationPatterns.to_framework_learning
      .some(pattern => currentState.lastUserInput?.toLowerCase().includes(pattern));
    
    if (needsFrameworkLearning && currentState.currentService !== 'framework_learning') {
      guidance.shouldRedirect = true;
      guidance.redirectTarget = 'framework_learning';
      guidance.redirectReason = 'User needs deeper theoretical understanding';
      guidance.redirectConfidence = 0.6;
    }
    
    return guidance;
  }

  /**
   * Calculate confidence in flow management
   */
  calculateFlowConfidence(detectedFlow, progressAssessment, conversationHealth) {
    let confidence = 0.5; // Base confidence
    
    // Flow detection confidence
    if (detectedFlow && detectedFlow.confidence > 0.5) {
      confidence += 0.3 * detectedFlow.confidence;
    }
    
    // Progress clarity
    if (progressAssessment.progress > 0) {
      confidence += 0.2;
    }
    
    // Conversation health
    if (conversationHealth.confidence > 0.7) {
      confidence += 0.2;
    }
    
    return Math.min(confidence, 1.0);
  }

  /**
   * Helper Methods
   */
  
  inferFlowFromGoals(userGoals) {
    const goalMappings = {
      'learn_basics': 'learning_tlc_basics',
      'implement': 'implementing_tlc',
      'solve_problem': 'troubleshooting_problems',
      'support_students': 'supporting_diverse_learners',
      'subject_application': 'subject_specific_application'
    };
    
    return goalMappings[userGoals.primary] || null;
  }

  assessStageCompletion(stage, userMessages, assistantMessages, currentState) {
    // This would involve more sophisticated analysis of conversation content
    // For now, provide a simplified assessment based on message patterns
    
    const stageKeywords = this.getStageKeywords(stage.id);
    const conversationText = [...userMessages, ...assistantMessages]
      .map(msg => msg.content)
      .join(' ')
      .toLowerCase();
    
    const keywordMatches = stageKeywords.filter(keyword => 
      conversationText.includes(keyword)
    ).length;
    
    const completionPercentage = Math.min(keywordMatches / stageKeywords.length, 1.0);
    
    return {
      completed: completionPercentage > 0.7,
      partial: completionPercentage > 0.3 && completionPercentage <= 0.7,
      completionPercentage
    };
  }

  getStageKeywords(stageId) {
    const stageKeywords = {
      understand_overview: ['tlc', 'framework', 'overview', 'purpose', 'principles'],
      explore_stages: ['field building', 'modeling', 'joint construction', 'independent'],
      see_connections: ['stages connect', 'flow', 'sequence', 'progression'],
      identify_applications: ['classroom', 'subject', 'apply', 'use'],
      assess_readiness: ['ready', 'prepared', 'confident', 'resources'],
      plan_first_attempt: ['plan', 'first try', 'implementation', 'start'],
      anticipate_challenges: ['problems', 'challenges', 'difficulties', 'issues'],
      prepare_adaptations: ['adapt', 'modify', 'adjust', 'flexible']
    };
    
    return stageKeywords[stageId] || [];
  }

  calculateRemainingTime(flow, completedStages) {
    const remainingStages = flow.stages.filter(stage => 
      !completedStages.includes(stage.id)
    );
    
    return remainingStages.reduce((total, stage) => 
      total + (stage.estimatedTime || 10), 0
    );
  }

  getNextStageInFlow(detectedFlow, progressAssessment) {
    if (!detectedFlow || !detectedFlow.flowData) return null;
    
    const flow = detectedFlow.flowData;
    const currentStageIndex = progressAssessment.completedStages.length;
    
    if (currentStageIndex < flow.stages.length) {
      return flow.stages[currentStageIndex];
    }
    
    return null; // Flow completed
  }

  generateFlowRecommendations(detectedFlow, progressAssessment) {
    const recommendations = [];
    
    if (!detectedFlow) {
      recommendations.push('Help establish clear learning goals');
      recommendations.push('Identify specific TLC topic of interest');
      return recommendations;
    }
    
    if (progressAssessment.progress < 0.3) {
      recommendations.push('Focus on building foundational understanding');
      recommendations.push('Provide concrete examples and explanations');
    } else if (progressAssessment.progress < 0.7) {
      recommendations.push('Deepen understanding of current concepts');
      recommendations.push('Prepare for practical application');
    } else {
      recommendations.push('Ready for implementation planning');
      recommendations.push('Consider transition to lesson planning tools');
    }
    
    return recommendations;
  }

  /**
   * Track flow performance for continuous improvement
   */
  trackFlowOutcome(flowData, completionSuccess, userSatisfaction, goalAchievement) {
    this.flowCompletionRates.push({
      flowName: flowData.flowName,
      completed: completionSuccess,
      satisfaction: userSatisfaction,
      goalAchieved: goalAchievement,
      timestamp: Date.now()
    });
    
    // Keep only last 100 flows
    if (this.flowCompletionRates.length > 100) {
      this.flowCompletionRates.shift();
    }
  }

  /**
   * Get flow performance metrics
   */
  getFlowMetrics() {
    if (this.flowCompletionRates.length === 0) {
      return {
        completionRate: 0,
        satisfactionRate: 0,
        goalAchievementRate: 0,
        totalFlows: 0
      };
    }
    
    const completed = this.flowCompletionRates.filter(f => f.completed).length;
    const satisfied = this.flowCompletionRates.filter(f => f.satisfaction > 0.7).length;
    const goalAchieved = this.flowCompletionRates.filter(f => f.goalAchieved).length;
    
    return {
      completionRate: completed / this.flowCompletionRates.length,
      satisfactionRate: satisfied / this.flowCompletionRates.length,
      goalAchievementRate: goalAchieved / this.flowCompletionRates.length,
      totalFlows: this.flowCompletionRates.length
    };
  }
}

module.exports = ConversationFlowIntelligence;