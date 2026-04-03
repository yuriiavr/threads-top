import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const maxDuration = 60;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const WORDS_TO_SEARCH = ["це", "та", "що", "як", "її", "і"];

async function fetchByWord(word: string) {
  const url = `https://threads-api4.p.rapidapi.com/api/search/top?query=${encodeURIComponent(word)}&limit=100`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY!,
        'x-rapidapi-host': 'threads-api4.p.rapidapi.com'
      },
      cache: 'no-store'
    });
    
    if (!response.ok) return [];
    
    const result = await response.json();
    return result.data?.searchResults?.edges || [];
  } catch (e) {
    return [];
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Запускаємо всі запити одночасно
    const results = await Promise.all(WORDS_TO_SEARCH.map(word => fetchByWord(word)));
    
    // Об'єднуємо всі результати в один плаский масив
    const allEdges = results.flat();

    const processed = allEdges.map((edge: any) => {
      const post = edge.node?.thread?.thread_items?.[0]?.post || edge.node?.post;
      if (!post || !post.caption?.text) return null;

      const text = post.caption.text;
      if (!/[іїєґІЇЄҐ]/.test(text)) return null;

      return {
        threads_id: String(post.pk || post.id),
        caption: text,
        author_name: post.user?.username || "unknown",
        like_count: Number(post.like_count || 0),
        reply_count: Number(post.text_post_app_info?.direct_reply_count || 0),
        post_url: `https://www.threads.net/post/${post.code}`
      };
    }).filter(Boolean);

    // Видаляємо дублікати (якщо один пост потрапив у різні запити)
    const uniquePosts = Array.from(new Map(processed.map(p => [p.threads_id, p])).values());

    if (uniquePosts.length > 0) {
      await supabase.from("posts").delete().neq("author_name", "system_reserved");
      const { error: dbError } = await supabase
        .from("posts")
        .upsert(uniquePosts, { onConflict: 'threads_id' });
      
      if (dbError) throw dbError;
    }

    return NextResponse.json({ 
      success: true, 
      count: uniquePosts.length,
      words_searched: WORDS_TO_SEARCH
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}