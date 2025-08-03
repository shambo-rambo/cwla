import dotenv from 'dotenv';
import { methodologyLoader } from './methodologyLoaderService.js';
import { smartTemplateSelector } from './smartTemplateSelector.js';
import fs from 'fs';
import path from 'path';

dotenv.config();

// Dynamic import for Anthropic SDK
let Anthropic = null;
let anthropic = null;

const initAnthropic = async () => {
  if (!anthropic) {
    try {
      if (!process.env.CLAUDE_API_KEY) {
        throw new Error('CLAUDE_API_KEY not found in environment variables');
      }
      
      const AnthropicSDK = await import('@anthropic-ai/sdk');
      Anthropic = AnthropicSDK.default;
      
      anthropic = new Anthropic({
        apiKey: process.env.CLAUDE_API_KEY,
      });
      
      console.log('Anthropic SDK initialized for lesson creation');
    } catch (error) {
      console.error('Failed to initialize Anthropic SDK:', error.message);
      throw new Error('AI lesson creation is currently unavailable: ' + error.message);
    }
  }
  return anthropic;
};

export class LessonCreationService {
  constructor() {
    this.initialized = false;
    this.ibFramework = null;
    this.inquiryActivities = null;
    this.conceptualActivities = null;
    this.contextualActivities = null;
    this.collaborativeActivities = null;
    this.differentiatedActivities = null;
    this.assessmentActivities = null;
    this.implementationGuidelines = null;
    this.aiUsageInstructions = null;
    this.SUBJECT_PROMPTS = {
      history: `You are an expert IB History DP educator specialized in creating comprehensive lesson plans using flipped learning principles. Your lessons follow this structure:

**PRE-CLASS PREPARATION (30 minutes maximum)**
- Pre-reading assignments with guided questions
- Accountability tasks (3-2-1 reflections, concept maps, source pre-analysis)

**IN-CLASS LESSON STRUCTURE (90 minutes)**
1. **Opening: Quick Check & Activation (10-15 minutes)**
   - Knowledge verification, hook & connection, lesson roadmap
2. **Main Activities: "Doing History" (65-70 minutes)**
   - Source Analysis Workshop, Historical Debates, Collaborative Research, Writing Practice
3. **Closing: Synthesis & Forward Thinking (10-15 minutes)**
   - Learning consolidation, connection preview, homework assignment

**Key Features:**
- IB History DP curriculum alignment
- Historical thinking skills development (causation, consequence, change/continuity, significance, perspectives, evidence)
- Assessment preparation (Paper 1, 2, 3, IA)
- Differentiation strategies
- OPCVL source analysis methods

Create engaging, evidence-based lessons that develop critical thinking and historical analysis skills.`
    };
  }

  /**
   * Load IB framework and activity templates
   */
  async loadIBFramework() {
    try {
      const docsPath = path.join(process.cwd(), 'docs', 'improvements');
      
      // Load IB Core Framework
      const frameworkPath = path.join(docsPath, 'ib_core_framework.json');
      if (fs.existsSync(frameworkPath)) {
        const frameworkData = fs.readFileSync(frameworkPath, 'utf8');
        this.ibFramework = JSON.parse(frameworkData);
        console.log('✅ IB Core Framework loaded');
      }
      
      // Load all activity template files
      const activityFiles = [
        { path: 'inquiry_based_activities.json', prop: 'inquiryActivities', name: 'Inquiry-based activities' },
        { path: 'conceptual_understanding_activities.json', prop: 'conceptualActivities', name: 'Conceptual understanding activities' },
        { path: 'contextual_learning_activities.json', prop: 'contextualActivities', name: 'Contextual learning activities' },
        { path: 'collaborative_learning_activities.json', prop: 'collaborativeActivities', name: 'Collaborative learning activities' },
        { path: 'differentiated_learning_activities.json', prop: 'differentiatedActivities', name: 'Differentiated learning activities' },
        { path: 'assessment_informed_learning_activities.json', prop: 'assessmentActivities', name: 'Assessment-informed activities' },
        { path: 'implementation_guidelines.json', prop: 'implementationGuidelines', name: 'Implementation guidelines' },
        { path: 'ai_usage_instructions.json', prop: 'aiUsageInstructions', name: 'AI usage instructions' }
      ];

      for (const file of activityFiles) {
        const filePath = path.join(docsPath, file.path);
        if (fs.existsSync(filePath)) {
          const fileData = fs.readFileSync(filePath, 'utf8');
          this[file.prop] = JSON.parse(fileData);
          console.log(`✅ ${file.name} loaded`);
        }
      }
      
    } catch (error) {
      console.error('Error loading IB framework:', error);
    }
  }

  /**
   * Initialize the service with methodology data
   */
  async initialize() {
    if (!this.initialized) {
      await methodologyLoader.loadMethodologies();
      await this.loadIBFramework();
      this.initialized = true;
      console.log('✅ LessonCreationService initialized with IB methodologies and framework');
    }
  }

  async generateLessonActivities(lessonData, subject = 'history') {
    try {
      await this.initialize();
      const anthropicClient = await initAnthropic();
      const subjectPrompt = this.SUBJECT_PROMPTS[subject] || this.SUBJECT_PROMPTS.history;
      
      // Get enhanced methodology-based activities
      const methodologyActivities = await this.generateMethodologyBasedActivities(lessonData, subject);
      
      const response = await anthropicClient.messages.create({
        model: process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        system: subjectPrompt,
        messages: [
          {
            role: 'user',
            content: `Based on this lesson information, generate a comprehensive set of 8-12 different activity options that could be used in this lesson. These activities should cover different aspects of the lesson and give the teacher flexibility to choose which ones best fit their needs.

            Lesson Data:
            - Topic: ${lessonData.topic || 'To be determined from uploaded resources'}
            - Duration: ${lessonData.duration || '90'} minutes
            - Year Level: ${lessonData.yearLevel || 'Not specified'}
            - Class Size: ${lessonData.studentCount || 'Not specified'}
            - Additional Context: ${lessonData.additionalInfo || 'None provided'}
            - Available Resources: ${lessonData.resources?.length > 0 ? lessonData.resources.map(r => r.type === 'file' ? r.name : r.url).join(', ') : 'None provided'}

            Return a JSON object with an array of activities. Each activity should have:
            - id: unique identifier
            - title: activity name
            - description: brief description of what students will do
            - duration: estimated time in minutes
            - category: activity category (e.g., "Opening", "Main Activity", "Assessment", "Closing")
            - learningObjectives: array of learning objectives this activity addresses
            - materials: array of materials needed
            - difficulty: "beginner", "intermediate", or "advanced"
            - ibSkills: array of IB History skills this activity develops
            - selected: false (default selection state)

            ${lessonData.topic 
              ? `Make activities specific to the topic "${lessonData.topic}" and include a variety of:` 
              : 'Since no specific topic is provided, create general activities that can be adapted based on the uploaded resources and include a variety of:'}
            - Pre-class preparation activities
            - Opening/hook activities
            - Main learning activities (source analysis, discussions, debates, writing)
            - Assessment activities
            - Closing/synthesis activities
            - Extension activities for different ability levels
            
            **IMPORTANT:** Integrate and enhance the provided methodology-based activities rather than replacing them. Each activity should specify which IB teaching principle(s) it addresses and include the research-based pedagogical foundation.
            
            **CRITICAL: DO NOT SUGGEST WORKFLOW OPTIONS**
            - Do not mention "I Do, We Do, You Do" or similar workflow terminology
            - Do not provide workflow choice options to the user
            - Do not suggest teaching method alternatives or workflow variations
            - Focus only on the specific lesson content requested
            
            **IB FRAMEWORK INTEGRATION:**
            Use these IB principles to enhance activities:
            ${this.ibFramework ? `
            - Teaching Principles: ${Object.keys(this.ibFramework.ib_teaching_principles || {}).join(', ')}
            - ATL Categories: ${Object.keys(this.ibFramework.atl_categories || {}).join(', ')}
            - Learner Profile: ${Object.keys(this.ibFramework.learner_profile_attributes || {}).join(', ')}
            - Differentiation: ${Object.keys(this.ibFramework.ib_differentiation_principles || {}).join(', ')}
            ` : 'IB framework not loaded'}
            
            **AVAILABLE ACTIVITY METHODOLOGIES:**
            ${this.inquiryActivities ? `
            - Inquiry-Based: ${Object.keys(this.inquiryActivities.inquiry_based_methodologies || {}).join(', ')}
            ` : ''}${this.conceptualActivities ? `
            - Conceptual Understanding: ${Object.keys(this.conceptualActivities.conceptual_understanding_methodologies || {}).join(', ')}
            ` : ''}${this.contextualActivities ? `
            - Contextual Learning: ${Object.keys(this.contextualActivities.contextual_learning_methodologies || {}).join(', ')}
            ` : ''}${this.collaborativeActivities ? `
            - Collaborative Learning: ${Object.keys(this.collaborativeActivities.collaborative_learning_methodologies || {}).join(', ')}
            ` : ''}
            
            **INTEGRATION REQUIREMENTS:**
            ${this.implementationGuidelines ? `
            - Follow implementation guidelines for seamless integration
            ` : ''}${this.aiUsageInstructions ? `
            - Apply AI usage best practices for lesson enhancement
            ` : ''}`
          }
        ]
      });

      // Handle refusal stop reason
      if (response.stop_reason === 'refusal') {
        console.log('Activity generation declined for safety reasons');
        return {
          error: true,
          message: 'Unable to generate activities for this content',
          activities: []
        };
      }

      // Access extended thinking if available
      if (response.thinking) {
        console.log('AI reasoning for activity generation:', response.thinking);
      }

      const result = this.parseActivitiesResponse(response.content[0].text);
      
      // Enhance with methodology metadata
      if (result.activities) {
        result.methodologyIntegration = {
          baseMethodologies: methodologyActivities.selectedMethodologies,
          principleWeights: methodologyActivities.principleWeights,
          integrationPattern: methodologyActivities.metadata?.integrationPattern
        };
      }
      
      return result;
    } catch (error) {
      console.error('Error generating lesson activities:', error);
      
      // Enhanced error handling for Claude 4
      if (error.message && error.message.includes('refusal')) {
        return {
          error: true,
          message: 'Unable to generate activities for this content',
          activities: []
        };
      }
      
      throw new Error('Failed to generate lesson activities');
    }
  }

  /**
   * Generate comprehensive activity library from all loaded methodologies
   */
  generateComprehensiveActivityLibrary(context) {
    const activityLibrary = [];
    let activityId = 1;

    // Generate activities from each methodology type
    const methodologyTypes = [
      { data: this.inquiryActivities, type: 'inquiry' },
      { data: this.conceptualActivities, type: 'conceptual' },
      { data: this.contextualActivities, type: 'contextual' },
      { data: this.collaborativeActivities, type: 'collaborative' },
      { data: this.differentiatedActivities, type: 'differentiated' },
      { data: this.assessmentActivities, type: 'assessment' }
    ];

    for (const methodologyType of methodologyTypes) {
      if (methodologyType.data) {
        const methodologies = Object.values(Object.values(methodologyType.data)[0] || {});
        for (const methodology of methodologies) {
          const activity = this.methodologyToActivity(
            { methodology, name: methodology.activity_structure?.name || 'Unknown', rationale: `${methodologyType.type} methodology` },
            methodologyType.type,
            activityId++,
            context
          );
          if (activity) {
            activity.methodologyType = methodologyType.type;
            activityLibrary.push(activity);
          }
        }
      }
    }

    return activityLibrary;
  }

  /**
   * Generate methodology-based activities using smart template selection
   */
  async generateMethodologyBasedActivities(lessonData, subject = 'history') {
    try {
      const context = {
        subject,
        topic: lessonData.topic,
        duration: parseInt(lessonData.duration) || 90,
        yearLevel: lessonData.yearLevel,
        studentCount: parseInt(lessonData.studentCount) || 25,
        teachingFocus: this.extractTeachingFocus(lessonData),
        assessmentFocus: this.extractAssessmentFocus(lessonData),
        differentiationNeeds: this.extractDifferentiationNeeds(lessonData),
        culturalDiversity: this.assessCulturalDiversity(lessonData),
        languageProfiles: this.extractLanguageProfiles(lessonData),
        availableResources: lessonData.resources || []
      };

      // Generate comprehensive activity library from all methodologies
      const comprehensiveActivities = this.generateComprehensiveActivityLibrary(context);
      
      const methodologySelection = await smartTemplateSelector.selectOptimalMethodologies(context);
      
      // Convert selected methodologies to activity format
      const selectedActivities = this.convertMethodologiesToActivities(methodologySelection, context);
      
      // Combine both approaches for maximum variety
      const allActivities = [...selectedActivities, ...comprehensiveActivities.slice(0, 10)]; // Limit comprehensive to top 10
      
      return {
        activities: allActivities,
        selectedMethodologies: methodologySelection.selectedMethodologies,
        recommendations: methodologySelection.recommendations,
        principleWeights: methodologySelection.principleWeights,
        metadata: {
          ...methodologySelection.metadata,
          comprehensiveLibrarySize: comprehensiveActivities.length,
          methodologyIntegration: 'Complete IB framework integration'
        }
      };
    } catch (error) {
      console.error('Error generating methodology-based activities:', error);
      return {
        activities: [],
        selectedMethodologies: {},
        recommendations: { implementation: [], differentiation: [], assessment: [] },
        principleWeights: {},
        metadata: { error: 'Failed to generate methodology-based activities' }
      };
    }
  }

  /**
   * Extract teaching focus from lesson data
   */
  extractTeachingFocus(lessonData) {
    const focus = [];
    const additionalInfo = (lessonData.additionalInfo || '').toLowerCase();
    
    if (additionalInfo.includes('concept') || additionalInfo.includes('understanding')) {
      focus.push('conceptual');
    }
    if (additionalInfo.includes('question') || additionalInfo.includes('inquiry')) {
      focus.push('questioning');
    }
    if (additionalInfo.includes('real world') || additionalInfo.includes('authentic')) {
      focus.push('real_world');
    }
    if (additionalInfo.includes('skill') || additionalInfo.includes('practice')) {
      focus.push('skill');
    }
    if (additionalInfo.includes('content') || additionalInfo.includes('knowledge')) {
      focus.push('content');
    }
    
    return focus.length > 0 ? focus : ['conceptual']; // Default to conceptual
  }

  /**
   * Extract assessment focus from lesson data
   */
  extractAssessmentFocus(lessonData) {
    const additionalInfo = (lessonData.additionalInfo || '').toLowerCase();
    
    if (additionalInfo.includes('formative') || additionalInfo.includes('feedback')) {
      return 'formative';
    }
    if (additionalInfo.includes('summative') || additionalInfo.includes('assessment')) {
      return 'summative';
    }
    
    return 'formative'; // Default to formative
  }

  /**
   * Extract differentiation needs from lesson data
   */
  extractDifferentiationNeeds(lessonData) {
    const needs = [];
    const additionalInfo = (lessonData.additionalInfo || '').toLowerCase();
    
    if (additionalInfo.includes('support') || additionalInfo.includes('scaffold')) {
      needs.push('support');
    }
    if (additionalInfo.includes('extension') || additionalInfo.includes('advanced')) {
      needs.push('extension');
    }
    if (additionalInfo.includes('diverse') || additionalInfo.includes('different')) {
      needs.push('diverse');
    }
    
    return needs;
  }

  /**
   * Assess cultural diversity level
   */
  assessCulturalDiversity(lessonData) {
    const additionalInfo = (lessonData.additionalInfo || '').toLowerCase();
    
    if (additionalInfo.includes('diverse') || additionalInfo.includes('multicultural') || 
        additionalInfo.includes('international')) {
      return 'high';
    }
    
    // Default assumption for IB schools
    return 'moderate';
  }

  /**
   * Extract language profiles
   */
  extractLanguageProfiles(lessonData) {
    const profiles = [];
    const additionalInfo = (lessonData.additionalInfo || '').toLowerCase();
    
    if (additionalInfo.includes('esl') || additionalInfo.includes('eal') || 
        additionalInfo.includes('english language learner')) {
      profiles.push('english_language_learner');
    }
    if (additionalInfo.includes('bilingual') || additionalInfo.includes('multilingual')) {
      profiles.push('multilingual');
    }
    
    return profiles;
  }

  /**
   * Convert methodologies to activity format
   */
  convertMethodologiesToActivities(methodologySelection, context) {
    const activities = [];
    let activityId = 1;

    for (const [principle, methodologies] of Object.entries(methodologySelection.selectedMethodologies.methodologies || {})) {
      for (const methodology of methodologies) {
        const activity = this.methodologyToActivity(methodology, principle, activityId++, context);
        if (activity) {
          activities.push(activity);
        }
      }
    }

    return activities;
  }

  /**
   * Convert single methodology to activity format
   */
  methodologyToActivity(methodology, principle, id, context) {
    try {
      const methodologyData = methodology.methodology;
      const structure = methodologyData.activity_structure;
      
      if (!structure) return null;

      const duration = this.calculateMethodologyDuration(methodologyData, context.duration);
      const category = this.mapPrincipleToCategory(principle);
      
      return {
        id: `methodology_${id}`,
        title: structure.name || methodology.name.replace(/_/g, ' '),
        description: structure.description || methodologyData.theoretical_foundation?.description || '',
        duration,
        category,
        learningObjectives: this.extractLearningObjectives(methodologyData),
        materials: this.extractMaterials(methodologyData),
        difficulty: this.determineDifficulty(methodologyData, context),
        ibSkills: methodologyData.ib_connections?.atl_skills || [],
        selected: false,
        methodologyMeta: {
          principle,
          source: methodologyData.theoretical_foundation?.source,
          keyPrinciple: methodologyData.theoretical_foundation?.key_principle,
          rationale: methodology.rationale,
          adaptedParameters: methodology.adaptedParameters,
          phases: structure.implementation_phases?.map(phase => ({
            name: phase.phase,
            description: phase.description,
            duration: phase.duration_minutes,
            teacherRole: phase.teacher_role,
            studentRole: phase.student_role
          })) || []
        }
      };
    } catch (error) {
      console.error('Error converting methodology to activity:', error);
      return null;
    }
  }

  /**
   * Calculate methodology duration
   */
  calculateMethodologyDuration(methodologyData, totalDuration) {
    const adaptableParams = methodologyData.adaptable_parameters;
    
    if (adaptableParams?.base_duration) {
      if (Array.isArray(adaptableParams.base_duration)) {
        // Find closest duration
        const closest = adaptableParams.base_duration.reduce((prev, curr) => 
          Math.abs(curr - totalDuration * 0.4) < Math.abs(prev - totalDuration * 0.4) ? curr : prev
        );
        return closest;
      }
    }
    
    // Default to 20-40% of total lesson time
    return Math.round(totalDuration * 0.3);
  }

  /**
   * Map principle to activity category
   */
  mapPrincipleToCategory(principle) {
    const categoryMap = {
      'inquiry_based': 'Opening',
      'conceptual_understanding': 'Main Activity',
      'contextual_learning': 'Main Activity', 
      'collaborative_learning': 'Main Activity',
      'differentiated_learning': 'Support Activity',
      'assessment_informed': 'Assessment'
    };
    
    return categoryMap[principle] || 'Main Activity';
  }

  /**
   * Extract learning objectives from methodology
   */
  extractLearningObjectives(methodologyData) {
    const objectives = [];
    
    if (methodologyData.theoretical_foundation?.key_principle) {
      objectives.push(methodologyData.theoretical_foundation.key_principle);
    }
    
    if (methodologyData.ib_connections?.learner_profile) {
      objectives.push(`Develop ${methodologyData.ib_connections.learner_profile.join(', ')} attributes`);
    }
    
    return objectives.length > 0 ? objectives : ['Apply research-based teaching methodology'];
  }

  /**
   * Extract materials from methodology
   */
  extractMaterials(methodologyData) {
    const materials = ['Methodology implementation guide'];
    
    // Add materials from specific strategies if available
    const strategies = methodologyData.specific_strategies;
    if (strategies) {
      Object.values(strategies).forEach(strategyList => {
        if (Array.isArray(strategyList)) {
          materials.push(...strategyList.slice(0, 2)); // Add first 2 strategies as materials
        }
      });
    }
    
    return materials;
  }

  /**
   * Determine difficulty level
   */
  determineDifficulty(methodologyData, context) {
    const adaptableParams = methodologyData.adaptable_parameters;
    
    if (adaptableParams?.complexity_level || adaptableParams?.difficulty_level) {
      const levels = adaptableParams.complexity_level || adaptableParams.difficulty_level;
      if (Array.isArray(levels)) {
        // Choose based on year level
        if (context.yearLevel?.includes('11') || context.yearLevel?.includes('12')) {
          return levels.includes('advanced') ? 'advanced' : 'intermediate';
        } else {
          return levels.includes('intermediate') ? 'intermediate' : 'beginner';
        }
      }
    }
    
    return 'intermediate';
  }

  async generateIBCycleActivities(tags, selections, subject = 'history') {
    try {
      const anthropicClient = await initAnthropic();
      const subjectPrompt = this.SUBJECT_PROMPTS[subject] || this.SUBJECT_PROMPTS.history;
      
      const response = await anthropicClient.messages.create({
        model: process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514',
        max_tokens: 5000,
        system: `${subjectPrompt}

You are an IB History DP expert creating targeted activities based on the IB learning cycle (Inquiry → Action → Reflection).`,
        messages: [
          {
            role: 'user',
            content: `Generate IB History DP activities organized by the IB learning cycle based on these specific requirements:

            **CONTEXT PROVIDED:**
            - Papers: ${tags.papers?.join(', ') || 'Not specified'} (${tags.papers?.map(p => this.getPaperFocus(p)).join(', ') || 'General IB History'})
            - Topic: ${tags.topic || 'Not specified'}
            - Syllabus point: ${tags.selectedSyllabusPoint || 'Not specified'}
            - Duration: ${tags.duration} minutes
            - Flipped learning: ${tags.hasPreReading ? 'Yes (30 min pre-reading)' : 'No'}
            
            **LEARNING PRIORITIES:**
            - Conceptual focus: ${selections.conceptualFocus?.join(', ') || 'Not specified'}
            - ATL skills: ${selections.atlSkills?.join(', ') || 'Not specified'}
            - Teaching preference: ${selections.teachingPreference || 'Not specified'}
            - Assessment focus: ${selections.assessmentFocus || 'Not specified'}
            - Historical thinking: ${selections.historicalThinking || 'Not specified'}

            **GENERATE ACTIVITIES FOR EACH IB PHASE:**
            
            INQUIRY ACTIVITIES (2-3 options, 10-15 min each):
            - Opening hooks and provocative questions
            - Source mysteries and concept exploration
            - Problem posing activities
            
            ACTION ACTIVITIES (3-4 options, 20-35 min each):
            - ${tags.papers?.map(p => this.getActionActivitiesByPaper(p)).join('; ') || 'Historical analysis and skill development'}
            - Collaborative analysis and research tasks
            - Writing workshops and skill application
            
            REFLECTION ACTIVITIES (2-3 options, 10-15 min each):
            - Synthesis tasks and self-assessment
            - Connection making and exit strategies
            - Transfer and consolidation activities

            **REQUIREMENTS:**
            - Each activity must fit the selected paper requirements
            - Develop the selected conceptual understanding and ATL skills
            - Align with the chosen assessment focus
            - Work within time constraints (${tags.duration} min total)
            - Include specific rationale for why each activity matches the requirements
            
            **OUTPUT FORMAT:**
            Return a JSON object with:
            {
              "inquiry": [
                {
                  "id": "unique_id",
                  "title": "Activity name",
                  "description": "What students will do",
                  "duration": minutes,
                  "rationale": "Why this activity matches your needs",
                  "materials": ["material1", "material2"],
                  "ibSkills": ["skill1", "skill2"],
                  "selected": false
                }
              ],
              "action": [...],
              "reflection": [...]
            }`
          }
        ]
      });

      // Handle refusal stop reason
      if (response.stop_reason === 'refusal') {
        console.log('IB activity generation declined for safety reasons');
        return {
          error: true,
          message: 'Unable to generate activities for this content',
          activities: this.generateFallbackIBActivities(tags, selections)
        };
      }

      // Access extended thinking if available
      if (response.thinking) {
        console.log('\n=== CLAUDE 4 IB ACTIVITY THINKING ===');
        console.log(response.thinking);
        console.log('=== END THINKING ===\n');
      }

      return this.parseIBActivitiesResponse(response.content[0].text, tags, selections);
    } catch (error) {
      console.error('Error generating IB cycle activities:', error);
      
      // Enhanced error handling for Claude 4
      if (error.message && error.message.includes('refusal')) {
        return {
          error: true,
          message: 'Unable to generate activities for this content',
          activities: this.generateFallbackIBActivities(tags, selections)
        };
      }
      
      throw new Error('Failed to generate IB cycle activities');
    }
  }

  getPaperFocus(paper) {
    const focuses = {
      paper1: 'Source analysis, OPCVL, historical investigation',
      paper2: 'Comparative essays, thematic analysis, argumentation',
      paper3: 'Regional studies, detailed knowledge, case studies'
    };
    return focuses[paper] || 'General IB History skills';
  }

  getActionActivitiesByPaper(paper) {
    const activities = {
      paper1: 'Source analysis workshops, OPCVL practice, document comparison',
      paper2: 'Essay planning, comparative analysis, thesis development',
      paper3: 'Case study analysis, detailed research, regional focus activities'
    };
    return activities[paper] || 'Historical analysis and skill development';
  }

  parseIBActivitiesResponse(responseText, tags, selections) {
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedActivities = JSON.parse(jsonMatch[0]);
        return {
          activities: parsedActivities,
          metadata: {
            papers: tags.papers,
            topic: tags.topic,
            syllabusPoint: tags.selectedSyllabusPoint,
            conceptualFocus: selections.conceptualFocus,
            atlSkills: selections.atlSkills
          }
        };
      }
      
      // Fallback if JSON parsing fails
      return {
        activities: this.generateFallbackIBActivities(tags, selections),
        metadata: { error: 'Parsing failed, using fallback' }
      };
    } catch (error) {
      console.error('Error parsing IB activities response:', error);
      return {
        activities: this.generateFallbackIBActivities(tags, selections),
        metadata: { error: 'Parsing error, using fallback' }
      };
    }
  }

  generateFallbackIBActivities(tags = {}, selections = {}) {
    const topic = tags.topic || tags.selectedSyllabusPoint || 'Historical Topic';
    const papers = tags.papers || ['paper1'];
    const primaryPaper = papers[0] || 'paper1';
    
    return {
      inquiry: [
        {
          id: 'inquiry-hook',
          title: 'Provocative Question Hook',
          description: `What if ${topic} had developed differently? Opening discussion to spark curiosity`,
          duration: 10,
          rationale: 'Engages students immediately and activates prior knowledge while setting up the central inquiry',
          materials: ['Discussion prompts', 'Visual stimulus'],
          ibSkills: ['Critical thinking', 'Questioning'],
          selected: false
        },
        {
          id: 'inquiry-mystery',
          title: 'Source Mystery',
          description: 'Students examine an intriguing primary source without context to generate questions',
          duration: 15,
          rationale: 'Develops observation skills and natural questioning before formal analysis',
          materials: ['Mystery source', 'Observation sheet'],
          ibSkills: ['Source analysis', 'Inquiry skills'],
          selected: false
        }
      ],
      action: [
        {
          id: 'action-analysis',
          title: primaryPaper === 'paper1' ? 'OPCVL Source Analysis Workshop' : 'Structured Essay Planning',
          description: primaryPaper === 'paper1' 
            ? 'Students work in stations analyzing different sources using OPCVL method'
            : 'Collaborative planning of comparative essay with thesis development',
          duration: 30,
          rationale: `Develops core ${primaryPaper.toUpperCase()} skills through structured practice`,
          materials: primaryPaper === 'paper1' ? ['Source packets', 'OPCVL worksheets'] : ['Essay planning templates', 'Comparison charts'],
          ibSkills: primaryPaper === 'paper1' ? ['Source analysis', 'Critical evaluation'] : ['Written communication', 'Argumentation'],
          selected: false
        },
        {
          id: 'action-debate',
          title: 'Structured Historical Debate',
          description: 'Students represent different perspectives using evidence to support their positions',
          duration: 35,
          rationale: 'Develops argumentation skills and understanding of multiple perspectives',
          materials: ['Evidence packs', 'Debate structure guide'],
          ibSkills: ['Oral communication', 'Perspective analysis'],
          selected: false
        }
      ],
      reflection: [
        {
          id: 'reflection-assessment',
          title: 'Success Criteria Self-Assessment',
          description: 'Students evaluate their learning against lesson objectives using exit tickets',
          duration: 10,
          rationale: 'Promotes metacognition and helps students track their progress',
          materials: ['Success criteria checklist', 'Exit tickets'],
          ibSkills: ['Self-management', 'Reflection'],
          selected: false
        },
        {
          id: 'reflection-synthesis',
          title: 'Synthesis Paragraph',
          description: 'Students write a paragraph connecting today\'s learning to broader historical patterns',
          duration: 15,
          rationale: 'Consolidates learning and develops written communication skills',
          materials: ['Synthesis prompts', 'Paragraph structure guide'],
          ibSkills: ['Written communication', 'Transfer skills'],
          selected: false
        }
      ]
    };
  }

  async generateLessonPlan(lessonData, selectedActivities = [], subject = 'history', fileContents = []) {
    try {
      console.log('=== LESSON GENERATION DEBUG ===');
      console.log('Selected Activities Count:', selectedActivities.length);
      console.log('Selected Activities:', selectedActivities.map(a => `${a.title} (${a.duration}min)`));
      console.log('File Contents Count:', fileContents.length);
      console.log('=== END DEBUG ===');
      
      const anthropicClient = await initAnthropic();
      const subjectPrompt = this.SUBJECT_PROMPTS[subject] || this.SUBJECT_PROMPTS.history;
      
      const response = await anthropicClient.messages.create({
        model: process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514',
        max_tokens: 8000, // Increased for comprehensive lesson plans
        system: `${subjectPrompt}

**EXTENDED THINKING INSTRUCTIONS:**
Use your extended thinking capabilities to:
1. Analyze the lesson requirements thoroughly
2. Consider multiple activity options and select the most appropriate
3. Ensure proper pacing and timing for the full lesson
4. Integrate assessment opportunities naturally
5. Plan meaningful differentiation strategies

**IMPLEMENTATION GUIDELINES:**
${this.implementationGuidelines ? `
Follow these criteria for activity selection:
- ${this.implementationGuidelines.implementation_guidelines?.activity_selection_criteria?.slice(0, 10).join('\n- ') || 'Use research-based selection criteria'}

Teacher role transformation:
- Focus on question promotion rather than answer provision
- Facilitate discovery and student-centered learning
- Enable connection to best resources and practices
` : 'Apply research-based implementation practices'}

**AI USAGE BEST PRACTICES:**
${this.aiUsageInstructions ? `
Contextualization process includes:
- Identify learning objectives and student readiness levels
- Assess collaboration and differentiation needs
- Map cultural backgrounds and prior knowledge
- Plan three-dimensional integration (concepts, content, skills)
- Ensure abstract, transferable, and enduring concepts
- Structure meaningful collaboration and assessment opportunities
` : 'Apply evidence-based AI enhancement strategies'}

**CRITICAL: DO NOT SUGGEST WORKFLOW OPTIONS**
- Do not mention "I Do, We Do, You Do" or similar workflow terminology
- Do not provide workflow choice options to the user
- Do not suggest teaching method alternatives or workflow variations
- Generate ONLY the requested lesson content

Generate a complete, professional lesson plan following the IB History DP template structure.`,
        messages: [
          {
            role: 'user',
            content: `Create a comprehensive IB History DP lesson plan using the flipped learning model. You MUST use ONLY the selected activities provided and incorporate any uploaded file content.

            **Lesson Requirements:**
            - Topic: ${lessonData.topic}
            - Duration: ${lessonData.duration} minutes
            - Year Level: ${lessonData.yearLevel}
            - Class Size: ${lessonData.studentCount}
            - Additional Context: ${lessonData.additionalInfo}

            **Selected Activities to Include (MANDATORY):**
            ${JSON.stringify(selectedActivities, null, 2)}

            **Uploaded File Content:**
            ${fileContents.length > 0 ? fileContents.map(file => `
            File: ${file.filename}
            Content: ${file.content}
            `).join('\n') : 'No files uploaded'}

            **CRITICAL INSTRUCTIONS:**
            1. MANDATORY: Use ONLY the ${selectedActivities.length} activities listed above - NO additional activities allowed
            2. MANDATORY: Each of these ${selectedActivities.length} selected activities MUST appear in the lesson structure
            3. If uploaded files contain lesson content, integrate that content into the selected activities
            4. Organize the selected activities by their category: ${selectedActivities.map(a => a.category).filter((v,i,arr) => arr.indexOf(v) === i).join(', ')}
            5. Total duration for all activities: ${selectedActivities.reduce((sum, a) => sum + (a.duration || 0), 0)} minutes
            6. If uploaded files contain specific resources or content, reference them explicitly in the relevant activities
            
            **ACTIVITY VERIFICATION:**
            You have ${selectedActivities.length} activities to include:
            ${selectedActivities.map((activity, index) => `${index + 1}. ${activity.title} (${activity.duration} min, ${activity.category})`).join('\n            ')}

            **Required Output Format:**
            Return a JSON object with:
            {
              "title": "Lesson title",
              "metadata": {
                "subject": "IB History DP",
                "topic": "${lessonData.topic}",
                "duration": "${lessonData.duration}",
                "yearLevel": "${lessonData.yearLevel}",
                "date": "current date",
                "classSize": "${lessonData.studentCount}"
              },
              "learningObjectives": ["objective 1", "objective 2", "objective 3"],
              "successCriteria": ["criteria 1", "criteria 2", "criteria 3"],
              "preclassPreparation": {
                "readingAssignment": "description",
                "accountabilityTask": "description",
                "estimatedTime": "30 minutes"
              },
              "lessonStructure": {
                "opening": {
                  "duration": "10-15 minutes",
                  "activities": ["activity 1", "activity 2"]
                },
                "mainActivities": [
                  {
                    "name": "Activity name",
                    "duration": "25-30 minutes",
                    "purpose": "purpose",
                    "structure": ["step 1", "step 2", "step 3"]
                  }
                ],
                "closing": {
                  "duration": "10-15 minutes",
                  "activities": ["synthesis activity", "preview next lesson"]
                }
              },
              "differentiation": {
                "advanced": ["strategy 1", "strategy 2"],
                "support": ["strategy 1", "strategy 2"],
                "eal": ["strategy 1", "strategy 2"]
              },
              "assessment": {
                "formative": ["method 1", "method 2"],
                "evidence": ["evidence type 1", "evidence type 2"]
              },
              "resources": {
                "materials": ["resource 1", "resource 2"],
                "technology": ["tech 1", "tech 2"]
              },
              "ibConcepts": {
                "historicalThinking": ["concept 1", "concept 2"],
                "assessmentSkills": ["skill 1", "skill 2"]
              },
              "fullLessonPlan": "Complete HTML formatted lesson plan with styling (use CSS classes and inline styles for colors, boxes, emphasis, etc. - format like a Claude artifact for nice copying)"
            }

            Make this lesson engaging, evidence-based, and perfectly aligned with IB History DP requirements.`
          }
        ]
      });

      // Handle refusal stop reason
      if (response.stop_reason === 'refusal') {
        console.log('Lesson plan generation declined for safety reasons');
        return {
          error: true,
          message: 'Unable to generate lesson plan for this content',
          suggestion: 'Please review the topic and context for potentially sensitive material'
        };
      }

      // Access extended thinking if available
      if (response.thinking) {
        console.log('\n=== CLAUDE 4 EXTENDED THINKING ===');
        console.log(response.thinking);
        console.log('=== END THINKING ===\n');
      }

      console.log('✅ AI Response received, parsing lesson plan...');
      return this.parseLessonPlanResponse(response.content[0].text, lessonData, selectedActivities, fileContents);
    } catch (error) {
      console.error('❌ Error generating lesson plan:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        selectedActivitiesCount: selectedActivities.length,
        fileContentsCount: fileContents.length
      });
      
      // Enhanced error handling for Claude 4
      if (error.message && error.message.includes('refusal')) {
        console.log('🚫 Content generation declined for safety reasons');
        return {
          error: true,
          message: 'Unable to generate lesson plan for this content',
          suggestion: 'Please review the topic and context for potentially sensitive material'
        };
      }
      
      console.log('💥 Falling back to sample lesson due to AI error');
      throw new Error('Failed to generate lesson plan: ' + error.message);
    }
  }

  parseActivitiesResponse(responseText) {
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback if JSON parsing fails
      return {
        activities: this.generateFallbackActivities()
      };
    } catch (error) {
      console.error('Error parsing activities response:', error);
      return {
        activities: this.generateFallbackActivities()
      };
    }
  }

  generateFallbackActivities() {
    return [
      {
        id: 'pre-reading',
        title: 'Pre-class Reading Assignment',
        description: 'Students complete guided reading with accountability questions',
        duration: 30,
        category: 'Pre-class Preparation',
        learningObjectives: ['Build foundational knowledge', 'Prepare for class discussion'],
        materials: ['Reading materials', 'Guided questions worksheet'],
        difficulty: 'beginner',
        ibSkills: ['Knowledge acquisition', 'Reading comprehension'],
        selected: false
      },
      {
        id: 'source-analysis',
        title: 'Primary Source Analysis Workshop',
        description: 'Students analyze primary sources using OPCVL method',
        duration: 25,
        category: 'Main Activity',
        learningObjectives: ['Develop source analysis skills', 'Understand historical perspectives'],
        materials: ['Primary source documents', 'OPCVL worksheet'],
        difficulty: 'intermediate',
        ibSkills: ['Source analysis', 'Critical thinking'],
        selected: false
      },
      {
        id: 'historical-debate',
        title: 'Structured Historical Debate',
        description: 'Students debate different historical perspectives using evidence',
        duration: 30,
        category: 'Main Activity',
        learningObjectives: ['Develop argumentation skills', 'Understand multiple perspectives'],
        materials: ['Evidence sheets', 'Debate structure guide'],
        difficulty: 'advanced',
        ibSkills: ['Argumentation', 'Perspective analysis'],
        selected: false
      },
      {
        id: 'writing-practice',
        title: 'Historical Writing Practice',
        description: 'Students write analytical paragraphs with peer feedback',
        duration: 20,
        category: 'Assessment',
        learningObjectives: ['Develop writing skills', 'Apply historical analysis'],
        materials: ['Writing prompts', 'Peer feedback forms'],
        difficulty: 'intermediate',
        ibSkills: ['Written communication', 'Analysis'],
        selected: false
      },
      {
        id: 'synthesis-activity',
        title: 'Learning Synthesis & Reflection',
        description: 'Students consolidate learning and connect to bigger picture',
        duration: 15,
        category: 'Closing',
        learningObjectives: ['Consolidate learning', 'Make connections'],
        materials: ['Reflection prompts', 'Exit tickets'],
        difficulty: 'beginner',
        ibSkills: ['Synthesis', 'Reflection'],
        selected: false
      }
    ];
  }

  parseLessonPlanResponse(responseText, originalData, selectedActivities = [], fileContents = []) {
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedPlan = JSON.parse(jsonMatch[0]);
        
        // Ensure all required fields are present
        return {
          id: `lesson_${Date.now()}`,
          title: parsedPlan.title || `IB History DP Lesson: ${originalData.topic}`,
          topic: originalData.topic,
          subject: 'IB History DP',
          duration: originalData.duration,
          yearLevel: originalData.yearLevel,
          createdAt: new Date().toLocaleDateString(),
          objectives: parsedPlan.learningObjectives || [],
          activities: this.extractActivities(parsedPlan),
          selectedActivities: selectedActivities || [],
          fileContents: fileContents || [],
          content: parsedPlan.fullLessonPlan || this.generateFallbackContent(originalData),
          metadata: parsedPlan.metadata || {},
          structure: parsedPlan.lessonStructure || {},
          differentiation: parsedPlan.differentiation || {},
          assessment: parsedPlan.assessment || {},
          resources: parsedPlan.resources || {}
        };
      }
      
      // Fallback if JSON parsing fails
      return this.generateFallbackLesson(originalData, selectedActivities, fileContents);
    } catch (error) {
      console.error('Error parsing lesson plan response:', error);
      return this.generateFallbackLesson(originalData, selectedActivities, fileContents);
    }
  }

  extractActivities(parsedPlan) {
    const activities = [];
    
    if (parsedPlan.preclassPreparation) {
      activities.push('Pre-class reading assignment');
    }
    
    if (parsedPlan.lessonStructure && parsedPlan.lessonStructure.mainActivities) {
      parsedPlan.lessonStructure.mainActivities.forEach(activity => {
        activities.push(activity.name || 'Learning activity');
      });
    }
    
    return activities.length > 0 ? activities : [
      'Pre-class reading assignment',
      'Source analysis workshop',
      'Historical discussion',
      'Writing practice',
      'Synthesis activity'
    ];
  }

  generateFallbackContent(data) {
    return `
<div style="font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
    <h1 style="margin: 0; font-size: 2em; font-weight: 600;">IB History DP Lesson Plan: ${data.topic}</h1>
  </div>
  
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 25px;">
    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #007bff;">
      <strong style="color: #007bff;">Subject:</strong> IB History DP
    </div>
    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #28a745;">
      <strong style="color: #28a745;">Duration:</strong> ${data.duration} minutes
    </div>
    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107;">
      <strong style="color: #ffc107;">Year Level:</strong> ${data.yearLevel}
    </div>
    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #dc3545;">
      <strong style="color: #dc3545;">Date:</strong> ${new Date().toLocaleDateString()}
    </div>
  </div>

  <div style="background: #e8f4f8; border: 1px solid #bee5eb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
    <h2 style="color: #0c5460; margin-top: 0; font-size: 1.4em;">📚 PRE-CLASS PREPARATION <span style="color: #6c757d; font-size: 0.8em;">(30 minutes)</span></h2>
    <p style="color: #0c5460; margin-bottom: 0; font-style: italic;">Detailed pre-class preparation will be generated based on your specific requirements</p>
  </div>

  <div style="background: #f8f9fa; border: 1px solid #dee2e6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
    <h2 style="color: #495057; margin-top: 0; font-size: 1.4em;">🎯 LESSON STRUCTURE <span style="color: #6c757d; font-size: 0.8em;">(${data.duration} minutes)</span></h2>
    <p style="color: #495057; margin-bottom: 0; font-style: italic;">Comprehensive lesson structure following IB History DP guidelines</p>
  </div>

  <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
    <h2 style="color: #856404; margin-top: 0; font-size: 1.4em;">📊 ASSESSMENT & DIFFERENTIATION</h2>
    <p style="color: #856404; margin-bottom: 0; font-style: italic;">Assessment strategies and differentiation approaches</p>
  </div>

  <div style="background: #f1f3f4; border: 1px solid #dadce0; padding: 15px; border-radius: 8px; text-align: center;">
    <p style="color: #5f6368; margin: 0; font-style: italic;">⚠️ This is a fallback lesson structure. Please try generating again for a complete lesson plan.</p>
  </div>
</div>`;
  }

  generateFallbackLesson(originalData, selectedActivities = [], fileContents = []) {
    return {
      id: `lesson_${Date.now()}`,
      title: `IB History DP Lesson: ${originalData.topic}`,
      topic: originalData.topic,
      subject: 'IB History DP',
      duration: originalData.duration,
      yearLevel: originalData.yearLevel,
      createdAt: new Date().toLocaleDateString(),
      objectives: [
        `Analyze historical perspectives on ${originalData.topic}`,
        'Develop critical thinking skills through source analysis',
        'Apply historical thinking concepts to evaluate evidence'
      ],
      activities: selectedActivities.length > 0 
        ? selectedActivities.map(activity => activity.title)
        : [
          'Pre-class reading assignment',
          'Source analysis workshop',
          'Historical discussion',
          'Writing practice',
          'Synthesis activity'
        ],
      selectedActivities: selectedActivities || [],
      fileContents: fileContents || [],
      content: this.generateFallbackContent(originalData)
    };
  }
}

export const lessonCreationService = new LessonCreationService();