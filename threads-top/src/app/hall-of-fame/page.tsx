"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { MessageCircle, Heart, ExternalLink, Trophy, Clock, Calendar } from 'lucide-react';
import Link from 'next/link';

interface ThreadPost {
  threads_id: string;
  author_name: string;
  caption: string;
  like_count: number;
  reply_count: number;
  post_url: string;
}

const EMOJI_REGEX = /(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)/gu;

function AppleEmoji({ symbol, alt }: { symbol: string; alt: string }) {
  const codePoint = symbol.codePointAt(0)?.toString(16).toLowerCase();
  if (!codePoint) return null;
  const src = `https://cdn.jsdelivr.net/gh/iamcal/emoji-data@master/img-apple-64/${codePoint}.png`;
  return (
    <img
      src={src}
      alt={alt}
      className="inline-block w-[1.25em] h-[1.25em] align-text-bottom mx-[0.05em] translate-y-[-0.1em]"
      loading="lazy"
      onError={(e) => { e.currentTarget.style.display = 'none'; }}
    />
  );
}

function renderCaption(text: string) {
  if (!text) return null;
  const cleanedText = text
    .replace(/\s*Translate\s*$/gi, '')
    .replace(/\s*\d+\s*\/\s*\d+\s*$/g, '')
    .trim();
  
  const parts = cleanedText.split(EMOJI_REGEX);
  return parts.map((part, i) => {
    if (part.match(EMOJI_REGEX)) return <AppleEmoji key={i} symbol={part} alt="emoji" />;
    return part;
  });
}

function formatCount(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace('.0', '') + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1).replace('.0', '') + 'K';
  return n.toString();
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function HallOfFame() {
  const [posts, setPosts] = useState<ThreadPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      const { data, error } = await supabase
        .from('hall_of_fame')
        .select('*')
        .order('like_count', { ascending: false });
      
      if (error) {
        console.error('Supabase error:', error);
        return;
      }

      if (data) setPosts(data as ThreadPost[]);
      setLoading(false);
    }
    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-[#030303] text-zinc-100 selection:bg-amber-500/20 selection:text-white font-sans antialiased">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-amber-950/10 blur-[130px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-zinc-900/30 blur-[130px] rounded-full" />
      </div>

      <header className="relative max-w-4xl mx-auto pt-20 pb-12 px-6">
        <div className="flex flex-col gap-8 border-b border-zinc-900/50 pb-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/20 border border-amber-900/30 backdrop-blur-sm">
                <Trophy size={12} className="text-amber-500" />
                <span className="text-[10px] uppercase tracking-[0.25em] text-amber-500/80 font-bold">
                  Legendary Content
                </span>
              </div>
              <h1 className="text-5xl md:text-6xl font-extrabold tracking-tighter text-white">
                HALL OF <span className="text-amber-500 font-black italic text-shadow-glow">FAME</span>
              </h1>
            </div>
          </div>

          <nav className="flex flex-wrap gap-3">
            <Link href="/" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 hover:bg-zinc-800/50 transition-all text-sm font-medium text-zinc-400 hover:text-amber-400">
              <Clock size={16} />
              Головна
            </Link>
            <Link href="/week" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 hover:bg-zinc-800/50 transition-all text-sm font-medium text-zinc-400 hover:text-amber-400">
              <Calendar size={16} />
              Топ тижня
            </Link>
          </nav>
        </div>
      </header>

      <main className="relative max-w-4xl mx-auto px-6 pb-32">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 space-y-6">
            <div className="w-10 h-10 border-2 border-zinc-800 border-t-amber-500 rounded-full animate-spin" />
            <p className="text-xs text-zinc-600 tracking-[0.4em] uppercase font-medium">Fetching legends</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post, index) => (
              <a 
                key={post.threads_id} 
                href={post.post_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="group relative block transition-all duration-300 ease-out hover:translate-y-[-4px]"
              >
                <div className="absolute -inset-px bg-gradient-to-r from-amber-500/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative p-6 md:p-8 bg-[#0a0a0a] border border-zinc-900 rounded-2xl flex gap-6 items-start transition-all duration-300 group-hover:bg-[#0d0d0d] group-hover:border-amber-900/50 group-hover:shadow-[0_0_30px_-10px_rgba(245,158,11,0.15)]">
                  <div className="flex flex-col items-center pt-1 width-[40px] flex-shrink-0">
                    <Trophy size={20} className={index < 3 ? "text-amber-500" : "text-zinc-800"} />
                    <div className="w-px h-full min-h-[60px] mt-3 bg-gradient-to-b from-amber-900/50 to-transparent" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:border-amber-500/30 transition-colors">
                          <span className="text-xs font-bold text-zinc-500 group-hover:text-amber-200">
                            {post.author_name.slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <span className="font-bold text-zinc-300 group-hover:text-white transition-colors tracking-tight text-base">
                          @{post.author_name}
                        </span>
                      </div>
                      <ExternalLink size={14} className="text-zinc-700 group-hover:text-amber-500 transition-colors" />
                    </div>

                    <p className="text-lg md:text-xl leading-relaxed text-zinc-200 group-hover:text-white transition-colors mb-8 font-medium italic">
                      "{renderCaption(post.caption)}"
                    </p>

                    <div className="flex items-center gap-8 border-t border-zinc-900/50 pt-6">
                      <div className="flex items-center gap-3 group/stat">
                        <Heart size={20} className="text-zinc-700 group-hover/stat:text-red-500 transition-colors fill-transparent group-hover/stat:fill-red-500/10" />
                        <span className="text-sm font-bold font-mono text-zinc-500 group-hover/stat:text-red-400">{formatCount(post.like_count)}</span>
                      </div>
                      <div className="flex items-center gap-3 group/stat">
                        <MessageCircle size={20} className="text-zinc-700 group-hover/stat:text-amber-400 transition-colors" />
                        <span className="text-sm font-bold font-mono text-zinc-500 group-hover/stat:text-amber-200">{formatCount(post.reply_count)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </main>

      <footer className="fixed bottom-6 right-6 pointer-events-none z-50">
        <div className="px-4 py-2 bg-amber-500/5 backdrop-blur-xl border border-amber-500/10 rounded-full shadow-2xl">
          <p className="text-[9px] text-amber-500/60 uppercase tracking-[0.4em] font-black">
            The Golden Standard
          </p>
        </div>
      </footer>
    </div>
  );
}