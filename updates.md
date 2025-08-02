# Teaching Cycle AI - Improvement Roadmap

## 🎯 High Priority Issues

### ❌ Conversation Memory Issue
**Problem**: AI cannot reference previous messages in the conversation
- Example: User says "but before you said it was 3" → AI responds "I don't have the context"
- **Root Cause**: Conversation history not being passed correctly to the AI service
- **Impact**: Breaks conversation flow and user experience

### ❌ Smart Lesson Planning Questions
**Problem**: Lesson planner should ask intelligent follow-up questions
- Should ask: How many students? Prior knowledge level? Number of lessons desired?
- **Example**: "Plan history lessons for Year 7 about ancient Indian geography and rivers"
- **Expected**: AI asks clarifying questions before creating detailed lesson series
- **Current**: AI creates generic lesson without context

## 🔧 User Experience Improvements

### ❌ Copy Message Functionality
- **Feature**: Users should be able to copy individual AI messages
- **Use Case**: Teachers want to paste responses into their own documents
- **Implementation**: Add copy button to each message

### ❌ Conversation History & Persistence
- **Navbar Integration**: Show conversation history in navigation bar
- **Functionality**: 
  - Click to reload past conversations
  - Delete conversations option
  - Persistent storage across sessions

### ❌ Interactive Element State Management
- **Issue**: In Framework Analysis chat, "add additional details" input should disappear after user continues conversation
- **Current**: Input field persists even after conversation moves on
- **Expected**: Clean UI that adapts to conversation flow

## 📊 Admin & Analytics

### ❌ Database Storage
- **Requirement**: Store all conversations in database for admin analysis
- **Purpose**: Learning insights, usage patterns, improvement opportunities
- **Access**: Admin dashboard for conversation review

## ✅ Technical Decisions Made

1. **Database Choice**: PostgreSQL (Railway offers managed PostgreSQL)
2. **Authentication**: User account-based conversation history
3. **Admin Dashboard**: Separate admin interface for conversation analysis
4. **Conversation History UI**: Sidebar within chatbot popup
5. **Copy Functionality**: Formatted text with copy button
6. **Smart Questioning**: Only when initial request lacks detail

## 🏗️ Technical Implementation Priority

1. **Fix conversation memory** (Critical - breaks core functionality)
2. **Add copy message feature** (High - frequently needed)
3. **Implement conversation persistence** (High - user retention)
4. **Smart lesson planning questions** (Medium - improves quality)
5. **Admin analytics** (Low - nice to have)
6. **UI state management** (Low - polish) 

- I added a logo.png in the frontend/public directory - can you make it my logo on the navigation bar and the brwoser tab?
- remove Teaching Cycle AI the navbar title and replace it with bigger logo

- The Teaching & Learning Cycle AI Assistant - put AI Assistant on a new line below the main title in the navbar

- I want only my email - simon.hamblin@gmail.com - to be able to access the admin dashboard