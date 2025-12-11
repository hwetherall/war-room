// debate-engine/server.ts
import express from 'express';
import cors from 'cors';
import { debateGraph } from './src/graph/workflow';
import * as dotenv from 'dotenv';

dotenv.config();

// Validate required environment variables
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY === 'your_openrouter_api_key_here') {
  console.error(`
╔══════════════════════════════════════════════════╗
║     ❌ MISSING API KEY                            ║
╠══════════════════════════════════════════════════╣
║  The OPENROUTER_API_KEY is missing or invalid.   ║
║                                                   ║
║  To fix this:                                     ║
║  1. Get an API key from https://openrouter.ai    ║
║  2. Add it to debate-engine/.env:                 ║
║     OPENROUTER_API_KEY=sk-or-v1-...               ║
║                                                   ║
║  Make sure the .env file is in the               ║
║  debate-engine/ directory.                       ║
╚══════════════════════════════════════════════════╝
  `);
  process.exit(1);
}

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'War Room API is running' });
});

// Main debate endpoint - streams Server-Sent Events
app.post('/api/debate', async (req, res) => {
  const { topic } = req.body;

  if (!topic) {
    return res.status(400).json({ error: 'Topic is required' });
  }

  console.log(`\n🎯 Starting debate on topic: "${topic}"`);

  // Set headers for Server-Sent Events (SSE) / Streaming
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  try {
    const stream = await debateGraph.stream({
      topic: topic,
      messages: [],
    });

    for await (const event of stream) {
      const nodeName = Object.keys(event)[0];
      const data = event[nodeName];
      
      let payload: { type: string; content: any };

      if (nodeName === 'judge') {
        // Judge returns a structured verdict object
        payload = {
          type: 'judge',
          content: data.verdict
        };
        console.log(`⚖️  Judge delivered verdict: ${data.verdict.winner}`);
      } else if (nodeName === 'moderator') {
        // Moderator returns a structured truth-seeking analysis
        payload = {
          type: 'moderator',
          content: data.moderator_analysis
        };
        console.log(`📊 Moderator analysis: Bull ${data.moderator_analysis.bull_wins} - Bear ${data.moderator_analysis.bear_wins} (${data.moderator_analysis.ties} ties)`);
      } else {
        // Bull and Bear return messages array with LangChain message objects
        const messageContent = data.messages?.[0]?.content || '';
        payload = {
          type: nodeName,
          content: messageContent
        };
        console.log(`${nodeName === 'bull' ? '🐂' : '🐻'} ${nodeName.toUpperCase()} spoke`);
      }

      res.write(`data: ${JSON.stringify(payload)}\n\n`);
    }

    res.write('data: [DONE]\n\n');
    console.log('✅ Debate completed successfully\n');
    res.end();

  } catch (error: any) {
    console.error('❌ Debate Error:', error);
    
    // Provide helpful error messages for common issues
    let errorMessage = 'Debate failed. Check server logs.';
    if (error?.code === 401 || error?.error?.code === 401) {
      errorMessage = 'Authentication failed. Please check your OPENROUTER_API_KEY in debate-engine/.env. The API key may be invalid or expired.';
    } else if (error?.message?.includes('OPENROUTER_API_KEY')) {
      errorMessage = error.message;
    }
    
    res.write(`data: ${JSON.stringify({ type: 'error', content: errorMessage })}\n\n`);
    res.end();
  }
});

// Available topics endpoint (for frontend dropdown)
app.get('/api/topics', (req, res) => {
  res.json({
    topics: [
      'Opportunity Validation',
      'Finance and Operations',
      'Product and Technology',
      'Team and Execution'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════╗
║     🚀 WAR ROOM API                              ║
║     Running on http://localhost:${PORT}             ║
╠══════════════════════════════════════════════════╣
║     POST /api/debate  - Start a debate           ║
║     GET  /api/topics  - List available topics    ║
║     GET  /api/health  - Health check             ║
╚══════════════════════════════════════════════════╝
  `);
});

