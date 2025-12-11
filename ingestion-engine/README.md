# Smart Splitter Ingestion Engine

This TypeScript script intelligently parses your `Kajima.md` file by headers (`#` and `##`) and uploads the parsed chapters to Supabase.

## Setup

1. **Install dependencies** (already done):
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   - Copy `.env.example` to `.env`
   - Fill in your Supabase credentials:
     ```
     SUPABASE_URL=your_supabase_url
     SUPABASE_KEY=your_service_role_key
     ```

3. **Ensure Kajima.md exists**:
   - The script looks for `Kajima.md` in the parent directory (`../Kajima.md`)

## Usage

Run the ingestion script:

```bash
npm run ingest
```

Or directly with tsx:

```bash
npx tsx ingest.ts
```

## How It Works

1. **Parsing**: The script uses regex to find markdown headers (`#` and `##`)
2. **Splitting**: Content is split by headers, with each section becoming a chapter
3. **Upload**: Chapters are uploaded to the `memo_chapters` table in Supabase with:
   - `project_name`: "Kajima"
   - `chapter_title`: The header text
   - `content`: The section content
   - `header_level`: 1 for `#`, 2 for `##`
   - `token_est`: Estimated token count (4 chars ≈ 1 token)

## Database Schema

The script expects a `memo_chapters` table with the following columns:
- `project_name` (text)
- `chapter_title` (text)
- `content` (text)
- `header_level` (integer)
- `token_est` (integer)

## Notes

- Sections with content less than 50 characters are skipped (to filter out table of contents artifacts)
- The first section (before any header) is labeled "Intro / Executive Summary"

