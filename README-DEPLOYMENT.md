# Vercel Deployment Guide

This project is configured to deploy to Vercel with both frontend and backend components.

## Project Structure

- `debate-ui/` - Frontend React application (Vite)
- `api/` - Backend serverless functions (Vercel API routes)
- `debate-engine/` - Original Express server (not used in Vercel deployment)

## Environment Variables

You need to set the following environment variables in your Vercel project settings:

### Required Environment Variables

1. **SUPABASE_URL** - Your Supabase project URL
2. **SUPABASE_KEY** - Your Supabase anon/service key
3. **OPENROUTER_API_KEY** - Your OpenRouter API key for LLM access

### Optional Environment Variables

- **VITE_API_URL** - Custom API URL (defaults to `/api` in production)

## Deployment Steps

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy to Vercel**:
   ```bash
   vercel
   ```

   For production deployment:
   ```bash
   vercel --prod
   ```

4. **Set Environment Variables**:
   - Go to your Vercel project dashboard
   - Navigate to Settings → Environment Variables
   - Add all required environment variables listed above

5. **Redeploy** after setting environment variables:
   ```bash
   vercel --prod
   ```

## API Endpoints

Once deployed, your API endpoints will be available at:
- `https://your-project.vercel.app/api/debate` - POST endpoint for starting debates
- `https://your-project.vercel.app/api/health` - GET endpoint for health checks
- `https://your-project.vercel.app/api/topics` - GET endpoint for available topics

## Local Development

For local development, the frontend will use `http://localhost:3001` in development mode. In production, it will use `/api` which routes to the Vercel serverless functions.

## Troubleshooting

- **Build failures**: Make sure all dependencies are installed. The build command installs dependencies automatically.
- **API errors**: Verify all environment variables are set correctly in Vercel dashboard.
- **CORS issues**: CORS headers are already configured in the API functions.
- **Timeout errors**: The API functions have a max duration of 300 seconds (5 minutes) configured.

