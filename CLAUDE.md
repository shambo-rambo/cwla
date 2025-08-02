# CLAUDE.md - AI & Frontend Development Procedures

## Deployment Checklist for AI & Frontend Changes

### 🤖 When Making AI Service Changes

**Before Starting:**
- [ ] Check current git status: `git status`
- [ ] Verify which branch we're on: `git branch`

**After Making AI Changes:**
1. [ ] Test the service locally first:
   ```bash
   cd backend
   node -e "const service = require('./src/services/frameworkLearningService'); console.log('Service loaded:', !!service.knowledgeBase);"
   ```

2. [ ] Stage and commit backend changes:
   ```bash
   git add backend/
   git commit -m "Update AI service: [describe changes]"
   ```

3. [ ] Push to trigger Railway deployment:
   ```bash
   git push origin main
   ```

4. [ ] Test the deployed API endpoint:
   ```bash
   curl -X POST "https://cwla-production.up.railway.app/api/framework-learning" \
     -H "Content-Type: application/json" \
     -d '{"message": "hello"}' \
     -s | head -100
   ```

### 🎨 When Making Frontend Changes

**After Making Frontend Changes:**
1. [ ] Stage and commit frontend changes:
   ```bash
   git add frontend/
   git commit -m "Update frontend: [describe changes]"
   ```

2. [ ] Push changes to repository:
   ```bash
   git push origin main
   ```

3. [ ] Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```

4. [ ] Deploy to Firebase:
   ```bash
   firebase deploy --only hosting
   ```

5. [ ] Verify deployment URL: https://cwla-52a1d.web.app

### 🔄 When Making Both AI & Frontend Changes

**Complete Deployment Flow:**
1. [ ] Make AI changes in `backend/src/services/`
2. [ ] Make frontend changes in `frontend/src/`
3. [ ] Test AI service locally
4. [ ] Stage all changes:
   ```bash
   git add .
   ```
5. [ ] Commit with descriptive message:
   ```bash
   git commit -m "Update AI and frontend: [describe changes]
   
   - AI: [specific AI changes]
   - Frontend: [specific frontend changes]
   
   🤖 Generated with [Claude Code](https://claude.ai/code)
   
   Co-Authored-By: Claude <noreply@anthropic.com>"
   ```
6. [ ] Push to trigger Railway backend deployment:
   ```bash
   git push origin main
   ```
7. [ ] Wait 1-2 minutes for Railway deployment
8. [ ] Test backend API endpoint
9. [ ] Build and deploy frontend:
   ```bash
   cd frontend
   npm run build
   firebase deploy --only hosting
   ```
10. [ ] Test complete application at https://cwla-52a1d.web.app

### 🧪 Testing Procedures

**Backend API Testing:**
```bash
# Test framework learning endpoint
curl -X POST "https://cwla-production.up.railway.app/api/framework-learning" \
  -H "Content-Type: application/json" \
  -d '{"message": "test message"}' \
  -w "\nStatus: %{http_code}\n"

# Test lesson planner endpoint  
curl -X POST "https://cwla-production.up.railway.app/api/lesson-planner" \
  -H "Content-Type: application/json" \
  -d '{"message": "test message"}' \
  -w "\nStatus: %{http_code}\n"

# Check health endpoint
curl -s https://cwla-production.up.railway.app/health
```

**Frontend Testing:**
- [ ] Open https://cwla-52a1d.web.app
- [ ] Test Framework Learning chatbot
- [ ] Test Lesson Planner chatbot
- [ ] Check browser dev tools (F12) for errors
- [ ] Verify API calls in Network tab

### 🔧 Troubleshooting

**If AI responses are wrong:**
1. Check if Railway deployment completed
2. Test API endpoint directly with curl
3. Check Railway logs for errors
4. Verify environment variables on Railway

**If frontend not updating:**
1. Check if Firebase deployment completed
2. Clear browser cache (Ctrl+F5)
3. Verify Firebase hosting URL
4. Check browser dev tools for errors

**If both not working:**
1. Check git commits were pushed: `git log --oneline -3`
2. Check Railway deployment status
3. Rebuild and redeploy frontend
4. Test each service independently

### 📁 Key Files & Locations

**AI Services:**
- Framework Learning: `backend/src/services/frameworkLearningService.js`
- Lesson Planning: `backend/src/services/lessonCreationService.js`
- Basic Analysis: `backend/src/services/anthropicService.js`
- API Routes: `backend/src/app.js`

**Frontend:**
- Main Chatbot: `frontend/src/components/Chatbot.jsx`
- App Component: `frontend/src/App.jsx`
- Build Output: `frontend/dist/`

**Deployment:**
- Backend: Railway (auto-deploy from main branch)
- Frontend: Firebase Hosting (manual deploy)

### 🌐 URLs

- **Backend API**: https://cwla-production.up.railway.app
- **Frontend App**: https://cwla-52a1d.web.app
- **Health Check**: https://cwla-production.up.railway.app/health

### ⚠️ Important Notes

- **Always test locally before deploying**
- **Railway auto-deploys backend from git push**
- **Firebase requires manual deployment for frontend**
- **Wait for Railway deployment before testing API**
- **Clear browser cache if frontend changes not visible**
- **Check both Railway and Firebase deployment status**

### 🔑 Environment Variables

**Required on Railway:**
- `ANTHROPIC_API_KEY` or `CLAUDE_API_KEY`
- `CLAUDE_MODEL` (optional, defaults to claude-sonnet-4-20250514)

**Required for Frontend:**
- `VITE_API_BASE_URL=https://cwla-production.up.railway.app`