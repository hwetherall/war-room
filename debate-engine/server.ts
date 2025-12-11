// debate-engine/server.ts
import express from 'express';
import cors from 'cors';
import { debateGraph } from './src/graph/workflow';
import * as dotenv from 'dotenv';

dotenv.config();

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

  } catch (error) {
    console.error('❌ Debate Error:', error);
    res.write(`data: ${JSON.stringify({ type: 'error', content: 'Debate failed. Check server logs.' })}\n\n`);
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

