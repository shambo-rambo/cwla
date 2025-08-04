# Teaching Cycle AI - Improvement Roadmap

## 🎯 High Priority Issues

- Example "You've got this - your students are lucky to have a teacher who cares enough to seek better approaches! 💪" - I don't like the use of emoji's in AI responses and I don't like these cringe messages. Be friendly but professional and direct to shorten responses. 

- I think I need to create a system prompt that sets the tone for the AI responses to be more professional and direct. and then use the Anthropic Service - unless you think it is better to just add in the Anthropic Service to the existing AI service.

- The AI responses are too long and not concise enough. I want the AI to be more direct and to the point, avoiding unnecessary fluff and going beyond the scope of the conversation / question asked.

- I want to Measure Timing in Your Server - in the cosole if possible - Add simple timestamps in your routes to isolate where the latency starts. For example, in your /api/lesson-planner route:

js
Copy
Edit
app.post('/api/lesson-planner', async (req, res) => {
  const start = Date.now();
  try {
    ...
    const result = await anthropicService.generateLessonPlan(message, conversationHistory);
    console.log('Anthropic response time:', Date.now() - start, 'ms');
    ...
  }
  
  - Use streaming responses. You’re waiting for the entire answer before the client sees anything. Instead, use streaming:

Example (Node, basic):
js
Copy
Edit
const { Readable } = require('stream');

const stream = await anthropic.messages.stream({ ... });
res.setHeader('Content-Type', 'text/event-stream');

for await (const chunk of stream) {
  res.write(`data: ${chunk}\n\n`);
}
res.end();
On the frontend, adapt your fetch to read SSE or use ReadableStream.

- Make an assessment on this - do not implement until discussed - 1. Enforce Knowledge Anchoring in Chatbot Prompting
To ensure the chatbot doesn't "hallucinate" or veer away from your TLC framework:

Use retrieval-augmented generation (RAG): Ensure every chatbot query for lesson planning triggers a call to getKnowledgeForLessonPlanning() or getContextualKnowledge(), then pass the output directly into the prompt for your language model.

Prompt Template Example:

Use the following verified knowledge when responding. Do not include outside information.

[KNOWLEDGE CONTEXT]
{insert output from getContextualKnowledge(context)}

User query: {lesson planning question}
Answer only using the information above.
This avoids drift from your TLC-aligned knowledge base and lets you override the model's broader training when necessary.

✅ 2. Add Strict Fallbacks for Missing or Low-Confidence Matches
Currently, if no match is found, the chatbot might still generate answers. Add a threshold check:

if (recommendations.confidence < 0.6) {
  return {
    message: "Sorry, I couldn’t find reliable TLC-aligned guidance for that. Can you rephrase or choose a different area?"
  };
}
✅ 3. Integrate Metadata Tags for Lesson Planning Concepts
Add metadata fields in your framework-knowledge.json, e.g.:

{
  "id": "modeling_stage",
  "title": "Modeling Stage",
  "tags": ["tlc_stage", "lesson_phase", "explicit_instruction"],
  ...
}
Then, in your IntelligentKnowledgeIndex, weight matches more heavily when context.tags overlap. This makes lesson-planning queries sharper and scoped.

✅ 4. Use Relationship Mapping to Build Lesson Sequences
If a user is planning a sequence, use:

getLearningPaths(concept)
getPrerequisiteChain(concept)
Then, generate full learning sequences like:

1. Field Building → 2. Modeling → 3. Joint Construction → 4. Independent Construction