const express = require('express');
const cors = require('cors');
const anthropicService = require('./services/anthropicService');
const frameworkLearningService = require('./services/frameworkLearningService');

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
    const { message, conversationHistory = [] } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const result = await anthropicService.generateLessonPlan(message, conversationHistory);
    
    if (result.success) {
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
    const { message, conversationHistory = [] } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const result = await frameworkLearningService.generateFrameworkResponse(message, conversationHistory);
    
    if (result.success) {
      res.json({ response: result.response });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('Framework learning error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});