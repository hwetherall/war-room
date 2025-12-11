# Debate Engine

The Brain (Phase 2) of the War Room system. Uses LangGraph.js to orchestrate debates between Bull, Bear, and Judge agents.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Add your `OPENROUTER_API_KEY` (get one at https://openrouter.ai)
   - `SUPABASE_URL` and `SUPABASE_KEY` are already configured from ingestion-engine

## Usage

Run a debate on a specific chapter:

```bash
npm start
```

Or directly:
```bash
npx tsx run.ts
```

## How It Works

1. **Bull Node**: Optimistic VC partner defending the investment case
2. **Bear Node**: Skeptical risk officer attacking the investment case  
3. **Judge Node**: Managing partner making the final verdict

The workflow alternates between Bull and Bear for 4 turns, then the Judge renders a structured verdict with:
- Winner (Bull/Bear/Tie)
- Confidence score (0-10)
- Reasoning
- Key takeaway

## Architecture

- `src/utils/supabase.ts` - Data connector to fetch chapter content
- `src/graph/state.ts` - State definition for the debate graph
- `src/graph/nodes.ts` - Agent implementations (Bull, Bear, Judge)
- `src/graph/workflow.ts` - LangGraph workflow orchestration
- `run.ts` - Test driver script

## Next Steps

Once this works in the terminal, connect it to your React UI via:
- Supabase Edge Functions
- Next.js API routes
- Express server
