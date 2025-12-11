import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Helper to estimate tokens (rough calc: 4 chars ~= 1 token)
const estimateTokens = (text: string) => Math.ceil(text.length / 4);

interface Chapter {
  title: string;
  content: string;
  level: number;
}

async function parseAndUpload(filePath: string) {
  console.log(`📖 Reading file: ${filePath}...`);
  const rawText = fs.readFileSync(filePath, 'utf-8');

  // Regex to find headers (# Header or ## Header)
  // Captures: 1=Newlines, 2=Hashes, 3=Title
  const headerRegex = /(^|\n)(#{1,2})\s+(.*)/g;
  
  let match;
  let lastIndex = 0;
  const chapters: Chapter[] = [];
  let currentHeader = "Intro / Executive Summary"; // Default for text before first header
  let currentLevel = 1;

  // 1. Loop through regex matches to slice up the text
  while ((match = headerRegex.exec(rawText)) !== null) {
    // Capture text belonging to the PREVIOUS header
    const content = rawText.slice(lastIndex, match.index).trim();
    
    if (content.length > 0) {
      chapters.push({
        title: currentHeader,
        content: content,
        level: currentLevel
      });
    }

    // Set up for the NEXT section
    currentLevel = match[2].length; // length of '#' or '##'
    currentHeader = match[3].trim();
    lastIndex = match.index + match[0].length;
  }

  // 2. Capture the final section after the last header
  const finalContent = rawText.slice(lastIndex).trim();
  if (finalContent.length > 0) {
    chapters.push({
      title: currentHeader,
      content: finalContent,
      level: currentLevel
    });
  }

  console.log(`🧩 Parsed ${chapters.length} chapters.`);

  // 3. Upload to Supabase
  console.log("🚀 Uploading to Supabase...");
  
  for (const chapter of chapters) {
    // Skip empty or tiny sections (often just table of contents artifacts)
    if (chapter.content.length < 50) continue;

    const { error } = await supabase
      .from('memo_chapters')
      .insert({
        project_name: 'Kajima',
        chapter_title: chapter.title,
        content: chapter.content,
        header_level: chapter.level,
        token_est: estimateTokens(chapter.content)
      });

    if (error) {
      console.error(`❌ Error uploading "${chapter.title}":`, error.message);
    } else {
      console.log(`✅ Uploaded: ${chapter.title} (~${estimateTokens(chapter.content)} tokens)`);
    }
  }

  console.log("🎉 Ingestion complete!");
}

// Run it - look for Kajima.md in parent directory
const kajimaPath = path.join(__dirname, '..', 'Kajima.md');
parseAndUpload(kajimaPath);

