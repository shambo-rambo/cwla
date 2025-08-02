const express = require('express');
const cors = require('cors');
const anthropicService = require('./services/anthropicService');
const frameworkLearningService = require('./services/frameworkLearningService');
const db = require('./services/database');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Hello from backend', version: '2.0' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Framework Analysis Chatbot
app.post('/api/framework-analysis', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const result = await anthropicService.generateFrameworkAnalysis(message);
    
    if (result.success) {
      res.json({ response: result.response });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('Framework analysis error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Lesson Planner Chatbot
app.post('/api/lesson-planner', async (req, res) => {
  try {
    const { message, conversationHistory = [], conversationId, userId, userEmail, userName } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const result = await anthropicService.generateLessonPlan(message, conversationHistory);
    
    if (result.success) {
      // Save messages to database if conversation info provided
      if (conversationId && userId) {
        try {
          await db.saveMessage(conversationId, 'user', message);
          await db.saveMessage(conversationId, 'assistant', result.response);
        } catch (dbError) {
          console.error('Error saving messages to database:', dbError);
          // Continue with response even if DB save fails
        }
      }
      
      res.json({ response: result.response });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('Lesson planner error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Framework Learning Chatbot (Enhanced with Knowledge Base)
app.post('/api/framework-learning', async (req, res) => {
  try {
    const { message, conversationHistory = [], conversationId, userId, userEmail, userName } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const result = await frameworkLearningService.generateFrameworkResponse(message, conversationHistory);
    
    if (result.success) {
      // Save messages to database if conversation info provided
      if (conversationId && userId) {
        try {
          await db.saveMessage(conversationId, 'user', message);
          await db.saveMessage(conversationId, 'assistant', result.response);
        } catch (dbError) {
          console.error('Error saving messages to database:', dbError);
          // Continue with response even if DB save fails
        }
      }
      
      res.json({ response: result.response });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
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