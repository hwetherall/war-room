import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function fetchChapterContent(chapterTitleFragment: string) {
  // Search for the chapter by title (simple ILIKE for now)
  const { data, error } = await supabase
    .from('memo_chapters')
    .select('chapter_title, content')
    .ilike('chapter_title', `%${chapterTitleFragment}%`)
    .limit(1) // Just grab the most relevant one for the MVP
    .single();

  if (error || !data) {
    return `System: Could not find content for chapter: "${chapterTitleFragment}".`;
  }

  return `
  ## Source Document Context: ${data.chapter_title}
  ${data.content}
  `;
}

