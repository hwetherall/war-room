import type { VercelRequest, VercelResponse } from '@vercel/node';
import { debateGraph } from './src/graph/workflow';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
}

