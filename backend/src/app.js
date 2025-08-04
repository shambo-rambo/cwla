// Load environment variables in development
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const cors = require('cors');
const anthropicService = require('./services/anthropicService');
const frameworkLearningService = require('./services/frameworkLearningService');
const db = require('./services/database');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174', 
    'http://localhost:3000',
    'https://cwla-52a1d.web.app',
    'https://cwla-52a1d.firebaseapp.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-email']
}));
app.use(express.json());

// Handle preflight requests
app.options('*', cors());

app.get('/', (req, res) => {
  
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Framework Analysis Chatbot
app.post('/api/framework-analysis', async (req, res) => {
  const startTime = Date.now();
  console.log(`[${new Date().toISOString()}] Framework Analysis request received`);
  
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const serviceStart = Date.now();
    const result = await anthropicService.generateFrameworkAnalysis(message);
    const serviceTime = Date.now() - serviceStart;
    console.log(`[${new Date().toISOString()}] Framework Analysis service time: ${serviceTime}ms`);
    
    const totalTime = Date.now() - startTime;
    
    if (result.success) {
      console.log(`[${new Date().toISOString()}] Framework Analysis total response time: ${totalTime}ms`);
      res.json({ response: result.response });
    } else {
      console.log(`[${new Date().toISOString()}] Framework Analysis error response time: ${totalTime}ms`);
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.log(`[${new Date().toISOString()}] Framework Analysis error response time: ${totalTime}ms`);
    console.error('Framework analysis error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Lesson Planner Chatbot
app.post('/api/lesson-planner', async (req, res) => {
  const startTime = Date.now();
  console.log(`[${new Date().toISOString()}] Lesson Planner request received`);
  
  try {
    const { message, conversationHistory = [], conversationId, userId, userEmail, userName } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Check chat limits if user info provided (skip in development for speed)
    if (userId && conversationId && process.env.NODE_ENV === 'production') {
      try {
        const limitStart = Date.now();
        const limitCheck = await db.checkChatLimits(userId, 'lesson', conversationId);
        console.log(`[${new Date().toISOString()}] Chat limit check time: ${Date.now() - limitStart}ms`);
        if (limitCheck.exceedsLimit) {
          return res.json({ 
            response: limitCheck.message,
            limitExceeded: true,
            limitType: limitCheck.limitType
          });
        }
      } catch (limitError) {
        console.error('Error checking limits:', limitError);
        // Continue without limit check if it fails
      }
    }

    const serviceStart = Date.now();
    const result = await anthropicService.generateLessonPlan(message, conversationHistory);
    const serviceTime = Date.now() - serviceStart;
    console.log(`[${new Date().toISOString()}] Lesson Planner service time: ${serviceTime}ms`);
    
    const totalTime = Date.now() - startTime;
    
    if (result.success) {
      console.log(`[${new Date().toISOString()}] Lesson Planner total response time: ${totalTime}ms`);
      // Send response immediately for speed
      res.json({ response: result.response });
      
      // PERFORMANCE MODE: Skip database operations
      console.log(`[${new Date().toISOString()}] Skipping database save for performance testing`);
      /*
      // Save messages to database asynchronously (fire-and-forget)
      if (conversationId && userId) {
        setImmediate(async () => {
          try {
            const dbStart = Date.now();
            await db.saveMessage(conversationId, 'user', message);
            await db.saveMessage(conversationId, 'assistant', result.response);
            console.log(`[${new Date().toISOString()}] Database save time: ${Date.now() - dbStart}ms`);
          } catch (dbError) {
            console.error('Error saving messages to database:', dbError);
          }
        });
      }
      */
    } else {
      console.log(`[${new Date().toISOString()}] Lesson Planner error response time: ${totalTime}ms`);
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.log(`[${new Date().toISOString()}] Lesson Planner error response time: ${totalTime}ms`);
    console.error('Lesson planner error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Framework Learning Chatbot (Enhanced with Knowledge Base)
app.post('/api/framework-learning', async (req, res) => {
  const startTime = Date.now();
  console.log(`[${new Date().toISOString()}] Framework Learning request received`);
  
  try {
    const { message, conversationHistory = [], conversationId, userId, userEmail, userName } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // PERFORMANCE MODE: Skip database operations for speed testing
    console.log(`[${new Date().toISOString()}] Skipping chat limits check for performance testing`);
    /*
    // Check chat limits if user info provided (skip in development for speed)
    if (userId && conversationId && process.env.NODE_ENV === 'production') {
      try {
        const limitStart = Date.now();
        const limitCheck = await db.checkChatLimits(userId, 'framework', conversationId);
        console.log(`[${new Date().toISOString()}] Chat limit check time: ${Date.now() - limitStart}ms`);
        if (limitCheck.exceedsLimit) {
          return res.json({ 
            response: limitCheck.message,
            limitExceeded: true,
            limitType: limitCheck.limitType
          });
        }
      } catch (limitError) {
        console.error('Error checking limits:', limitError);
        // Continue without limit check if it fails
      }
    }
    */

    const serviceStart = Date.now();
    const result = await frameworkLearningService.generateFrameworkResponse(message, conversationHistory);
    const serviceTime = Date.now() - serviceStart;
    console.log(`[${new Date().toISOString()}] Framework Learning service time: ${serviceTime}ms`);
    
    const totalTime = Date.now() - startTime;
    
    if (result.success) {
      console.log(`[${new Date().toISOString()}] Framework Learning total response time: ${totalTime}ms`);
      // Send response immediately for speed
      res.json({ response: result.response });
      
      // PERFORMANCE MODE: Skip database operations
      console.log(`[${new Date().toISOString()}] Skipping database save for performance testing`);
      /*
      // Save messages to database asynchronously (fire-and-forget)
      if (conversationId && userId) {
        setImmediate(async () => {
          try {
            const dbStart = Date.now();
            await db.saveMessage(conversationId, 'user', message);
            await db.saveMessage(conversationId, 'assistant', result.response);
            console.log(`[${new Date().toISOString()}] Database save time: ${Date.now() - dbStart}ms`);
          } catch (dbError) {
            console.error('Error saving messages to database:', dbError);
          }
        });
      }
      */
    } else {
      console.log(`[${new Date().toISOString()}] Framework Learning error response time: ${totalTime}ms`);
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.log(`[${new Date().toISOString()}] Framework Learning error response time: ${totalTime}ms`);
    console.error('Framework learning error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Conversation Management Routes
app.post('/api/conversations', async (req, res) => {
  try {
    const { userId, userEmail, userName, chatType, title } = req.body;
    
    if (!userId || !userEmail || !chatType) {
      return res.status(400).json({ error: 'userId, userEmail, and chatType are required' });
    }

    // Check if user has reached conversation limit for this chat type
    try {
      const limitCheck = await db.checkChatLimits(userId, chatType);
      if (limitCheck.exceedsLimit) {
        return res.status(403).json({ 
          error: 'Chat limit exceeded',
          message: limitCheck.message,
          limitType: limitCheck.limitType
        });
      }
    } catch (limitError) {
      console.error('Error checking limits:', limitError);
      // Continue without limit check if it fails
    }

    const conversationId = await db.saveConversation(userId, userEmail, userName, chatType, title);
    res.json({ conversationId });
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/conversations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const conversations = await db.getUserConversations(userId);
    res.json({ conversations });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/conversations/:conversationId/messages', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const messages = await db.getConversationHistory(conversationId);
    res.json({ messages });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/conversations/:conversationId/title', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { title } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    await db.updateConversationTitle(conversationId, title);
    res.json({ success: true });
  } catch (error) {
    console.error('Update title error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/conversations/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    await db.deleteConversation(conversationId, userId);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete conversation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin Routes
app.get('/api/admin/conversations', async (req, res) => {
  try {
    // Check authorization header for admin email
    const authEmail = req.headers['x-admin-email'];
    if (authEmail !== 'simon.hamblin@gmail.com') {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;
    
    const conversations = await db.getAllConversationsForAdmin(limit, offset);
    res.json({ conversations });
  } catch (error) {
    console.error('Admin conversations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});