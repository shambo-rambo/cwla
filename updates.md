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

- I want the lesson planner to initially offer how it will work with the user - "I do" "We do" "You do" - and then ask the user to select which they want to use - "I do" = the ai does all the work , "We do" = the ai does some of the work through questioning, "You do" = the ai allows you to dpaste in a lesson and it just provides feedback.

- Put a limit on my chats - i want them to be limited to 10 messages per chat, and then the user has to start a new chat. And i want a user to have a maximum of 5 chats for each chatbot. Then a message saying "This is just a demonstration of the Teaching Cycle AI Assistant. If you would like to use this in your own school with your own framework, please contact simon.hamblin@gmail.com"

- I want to have a bio in the footer of the app that says "Hi, I'm Simon, a History teacher and a full stack web developer with over 15 years

 experience in education. If you would like to get in touch, please email simon.hamblin@gmail.com"

 - make the home screen fit all on one page, with no scrolling. 

 - update mui - hook.js:608 MUI Grid: The `item` prop has been removed and is no longer necessary. You can safely remove it.
 Error Component Stack
    at Grid3 (createGrid.js:77:19)
    at div (<anonymous>)
    at emotion-element-489459f2.browser.development.esm.js:33:17
    at Grid3 (createGrid.js:77:19)
    at div (<anonymous>)
    at emotion-element-489459f2.browser.development.esm.js:33:17
    at Box3 (createBox.js:20:19)
    at div (<anonymous>)
    at emotion-element-489459f2.browser.development.esm.js:33:17
    at Box3 (createBox.js:20:19)
    at AdminDashboard (AdminDashboard.jsx:27:27)
    at DefaultPropsProvider (DefaultPropsProvider.js:9:3)
    at RtlProvider (index.js:8:3)
    at ThemeProvider2 (ThemeProvider.js:33:5)
    at ThemeProvider3 (ThemeProvider.js:49:5)
    at ThemeProviderNoVars (ThemeProviderNoVars.js:8:10)
    at ThemeProvider (ThemeProvider.js:9:3)
    at App (App.jsx:10:27)
overrideMethod @ hook.js:608
hook.js:608 MUI Grid: The `xs` prop has been removed. See https://mui.com/material-ui/migration/upgrade-to-grid-v2/ for migration instructions.
 Error Component Stack
    at Grid3 (createGrid.js:77:19)
    at div (<anonymous>)
    at emotion-element-489459f2.browser.development.esm.js:33:17
    at Grid3 (createGrid.js:77:19)
    at div (<anonymous>)
    at emotion-element-489459f2.browser.development.esm.js:33:17
    at Box3 (createBox.js:20:19)
    at div (<anonymous>)
    at emotion-element-489459f2.browser.development.esm.js:33:17
    at Box3 (createBox.js:20:19)
    at AdminDashboard (AdminDashboard.jsx:27:27)
    at DefaultPropsProvider (DefaultPropsProvider.js:9:3)
    at RtlProvider (index.js:8:3)
    at ThemeProvider2 (ThemeProvider.js:33:5)
    at ThemeProvider3 (ThemeProvider.js:49:5)
    at ThemeProviderNoVars (ThemeProviderNoVars.js:8:10)
    at ThemeProvider (ThemeProvider.js:9:3)
    at App (App.jsx:10:27)
overrideMethod @ hook.js:608
hook.js:608 MUI Grid: The `md` prop has been removed. See https://mui.com/material-ui/migration/upgrade-to-grid-v2/ for migration instructions.
 Error Component Stack
    at Grid3 (createGrid.js:77:19)
    at div (<anonymous>)
    at emotion-element-489459f2.browser.development.esm.js:33:17
    at Grid3 (createGrid.js:77:19)
    at div (<anonymous>)
    at emotion-element-489459f2.browser.development.esm.js:33:17
    at Box3 (createBox.js:20:19)
    at div (<anonymous>)
    at emotion-element-489459f2.browser.development.esm.js:33:17
    at Box3 (createBox.js:20:19)
    at AdminDashboard (AdminDashboard.jsx:27:27)
    at DefaultPropsProvider (DefaultPropsProvider.js:9:3)
    at RtlProvider (index.js:8:3)
    at ThemeProvider2 (ThemeProvider.js:33:5)
    at ThemeProvider3 (ThemeProvider.js:49:5)
    at ThemeProviderNoVars (ThemeProviderNoVars.js:8:10)
    at ThemeProvider (ThemeProvider.js:9:3)
    at App (App.jsx:10:27)
overrideMethod @ hook.js:608

- Make smart questioning with the lesson planner mandatory.

- the i do we do you do is not appearing 

- remove DIFFERENTIATION from the lesson planner

- add Success criteria at the start of the lesson planner under the learning objectives. 

- I dont think the AI is using the knowledge base properly - its trying to fix the whole framework into one lessoon, this is not right. 

- The AI is slow - why would it be slow? It was fast on my old iteration of the app. 

- remove  (2 minutes) minutes from lesson planner