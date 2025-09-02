const { Pool } = require('pg');

class DatabaseService {
  constructor() {
    if (!process.env.DATABASE_URL) {
      console.log('No DATABASE_URL found - running without database functionality');
      this.pool = null;
      return;
    }
    
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
    
    this.initializeTables();
  }

  async initializeTables() {
    if (!this.pool) return;
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
    if (!this.pool) return null;
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
    if (!this.pool) return;
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
    if (!this.pool) return [];
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
    if (!this.pool) return [];
    try {
      const result = await this.pool.query(
        `SELECT c.id, c.chat_type, c.title, c.created_at, c.updated_at,
                COUNT(m.id) as message_count
         FROM conversations c
         LEFT JOIN messages m ON c.id = m.conversation_id
         WHERE c.user_id = $1 
         GROUP BY c.id
         ORDER BY c.updated_at DESC 
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
    if (!this.pool) return;
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
    if (!this.pool) return;
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
    if (!this.pool) return [];
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

  async getConversationMessageCount(conversationId) {
    if (!this.pool) return 0;
    try {
      const result = await this.pool.query(
        `SELECT COUNT(*) as count FROM messages WHERE conversation_id = $1`,
        [conversationId]
      );
      return parseInt(result.rows[0].count);
    } catch (error) {
      console.error('Error getting conversation message count:', error);
      throw error;
    }
  }

  async getUserChatCount(userId, chatType) {
    if (!this.pool) return 0;
    try {
      const result = await this.pool.query(
        `SELECT COUNT(*) as count FROM conversations 
         WHERE user_id = $1 AND chat_type = $2`,
        [userId, chatType]
      );
      return parseInt(result.rows[0].count);
    } catch (error) {
      console.error('Error getting user chat count:', error);
      throw error;
    }
  }

  async checkChatLimits(userId, chatType, conversationId = null) {
    if (!this.pool) return { exceedsLimit: false };
    try {
      // Get user email to check for admin exemption
      const userResult = await this.pool.query(
        `SELECT user_email FROM conversations WHERE user_id = $1 LIMIT 1`,
        [userId]
      );
      
      const userEmail = userResult.rows[0]?.user_email;
      
      // Admin exemption for simon.hamblin@gmail.com - no limits
      if (userEmail === 'simon.hamblin@gmail.com') {
        return { exceedsLimit: false };
      }

      // Check conversation count limit (max 3 per chat type)
      const chatCount = await this.getUserChatCount(userId, chatType);
      if (chatCount >= 3) {
        return {
          exceedsLimit: true,
          limitType: 'chat_count',
          message: 'This is just a demonstration of the Teaching Cycle AI Assistant. If you would like to use this in your own school with your own framework, please contact simon.hamblin@gmail.com'
        };
      }

      // Check message count limit for specific conversation (max 10 messages)
      if (conversationId) {
        const messageCount = await this.getConversationMessageCount(conversationId);
        if (messageCount >= 10) {
          return {
            exceedsLimit: true,
            limitType: 'message_count',
            message: 'This is just a demonstration of the Teaching Cycle AI Assistant. If you would like to use this in your own school with your own framework, please contact simon.hamblin@gmail.com'
          };
        }
      }

      return { exceedsLimit: false };
    } catch (error) {
      console.error('Error checking chat limits:', error);
      throw error;
    }
  }

  async close() {
    if (this.pool) {
      await this.pool.end();
    }
  }
}

module.exports = new DatabaseService();