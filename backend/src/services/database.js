const { Pool } = require('pg');

class DatabaseService {
  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
    
    this.initializeTables();
  }

  async initializeTables() {
    try {
      // Create conversations table
      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS conversations (
          id SERIAL PRIMARY KEY,
          user_id VARCHAR(255) NOT NULL,
          user_email VARCHAR(255) NOT NULL,
          user_name VARCHAR(255),
          chat_type VARCHAR(50) NOT NULL,
          title VARCHAR(500),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Create messages table
      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS messages (
          id SERIAL PRIMARY KEY,
          conversation_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE,
          role VARCHAR(20) NOT NULL,
          content TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Create indexes for better performance
      await this.pool.query(`
        CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
        CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
        CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at);
      `);

      console.log('Database tables initialized successfully');
    } catch (error) {
      console.error('Error initializing database tables:', error);
    }
  }

  async saveConversation(userId, userEmail, userName, chatType, title = null) {
    try {
      const result = await this.pool.query(
        `INSERT INTO conversations (user_id, user_email, user_name, chat_type, title) 
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [userId, userEmail, userName, chatType, title]
      );
      return result.rows[0].id;
    } catch (error) {
      console.error('Error saving conversation:', error);
      throw error;
    }
  }

  async saveMessage(conversationId, role, content) {
    try {
      await this.pool.query(
        `INSERT INTO messages (conversation_id, role, content) VALUES ($1, $2, $3)`,
        [conversationId, role, content]
      );
    } catch (error) {
      console.error('Error saving message:', error);
      throw error;
    }
  }

  async getConversationHistory(conversationId) {
    try {
      const result = await this.pool.query(
        `SELECT role, content, created_at FROM messages 
         WHERE conversation_id = $1 ORDER BY created_at ASC`,
        [conversationId]
      );
      return result.rows;
    } catch (error) {
      console.error('Error getting conversation history:', error);
      throw error;
    }
  }

  async getUserConversations(userId, limit = 50) {
    try {
      const result = await this.pool.query(
        `SELECT id, chat_type, title, created_at, updated_at 
         FROM conversations 
         WHERE user_id = $1 
         ORDER BY updated_at DESC 
         LIMIT $2`,
        [userId, limit]
      );
      return result.rows;
    } catch (error) {
      console.error('Error getting user conversations:', error);
      throw error;
    }
  }

  async updateConversationTitle(conversationId, title) {
    try {
      await this.pool.query(
        `UPDATE conversations SET title = $1, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $2`,
        [title, conversationId]
      );
    } catch (error) {
      console.error('Error updating conversation title:', error);
      throw error;
    }
  }

  async deleteConversation(conversationId, userId) {
    try {
      await this.pool.query(
        `DELETE FROM conversations WHERE id = $1 AND user_id = $2`,
        [conversationId, userId]
      );
    } catch (error) {
      console.error('Error deleting conversation:', error);
      throw error;
    }
  }

  async getAllConversationsForAdmin(limit = 100, offset = 0) {
    try {
      const result = await this.pool.query(
        `SELECT c.id, c.user_id, c.user_email, c.user_name, c.chat_type, 
                c.title, c.created_at, c.updated_at,
                COUNT(m.id) as message_count
         FROM conversations c
         LEFT JOIN messages m ON c.id = m.conversation_id
         GROUP BY c.id
         ORDER BY c.updated_at DESC
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      );
      return result.rows;
    } catch (error) {
      console.error('Error getting admin conversations:', error);
      throw error;
    }
  }

  async close() {
    await this.pool.end();
  }
}

module.exports = new DatabaseService();