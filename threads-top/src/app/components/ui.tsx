"use client";

import { MessageCircle, Heart, ExternalLink } from 'lucide-react';
import { TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { ThreadPost, formatCount, daysAgo, cleanCaption, EMOJI_REGEX } from '../lib/utils';

// Apple Emoji
function AppleEmoji({ symbol, alt }: { symbol: string; alt: string }) {
  const codePoint = symbol.codePointAt(0)?.toString(16).toLowerCase();
  if (!codePoint) return null;
  return (
    <img
      src={`https://cdn.jsdelivr.net/gh/iamcal/emoji-data@master/img-apple-64/${codePoint}.png`}
      alt={alt}
      className="inline-block w-[1.25em] h-[1.25em] align-text-bottom mx-[0.05em] translate-y-[-0.1em]"
      loading="lazy"
      onError={(e) => { e.currentTarget.style.display = 'none'; }}
    />
  );
}

// Caption renderer
export function renderCaption(text: string) {
  if (!text) return null;
  const parts = cleanCaption(text).split(EMOJI_REGEX);
  return parts.map((part, i) =>
    part.match(EMOJI_REGEX)
      ? <AppleEmoji key={i} symbol={part} alt="emoji" />
      : part
  );
}

// Post Card
interface PostCardProps {
  post: ThreadPost;
  index: number;
  accentColor: string;
  showDate?: boolean;
  variant?: 'default' | 'hall';
}

export function PostCard({ post, index, accentColor, showDate = false, variant = 'default' }: PostCardProps) {
  const isHall = variant === 'hall';

  return (
    <a
      href={post.post_url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block transition-all duration-300 ease-out hover:translate-y-[-2px]"
    >
      <div className="absolute -inset-px bg-gradient-to-r from-zinc-800/50 to-zinc-900/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className={`relative p-6 md:p-7 bg-[#080808] border border-zinc-900 rounded-2xl flex gap-6 items-start transition-colors duration-300 group-hover:bg-[#0a0a0a] group-hover:border-zinc-800/80 group-hover:shadow-2xl group-hover:shadow-${accentColor}-500/5`}>
        <div className="flex flex-col items-center pt-1 w-[40px] flex-shrink-0">
          <span className={`text-xl font-bold font-mono text-zinc-800 group-hover:text-${accentColor}-900 transition-colors`}>
            {(index + 1).toString().padStart(2, '0')}
          </span>
          <div className="w-px h-full min-h-[50px] mt-2 bg-gradient-to-b from-zinc-900 to-transparent" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:border-${accentColor}-800/50 transition-colors text-xs font-bold text-zinc-400 group-hover:text-${accentColor}-200 uppercase`}>
                {post.author_name.slice(0, 2)}
              </div>
              <span className="font-semibold text-zinc-300 group-hover:text-white transition-colors tracking-tight text-[15px]">
                @{post.author_name}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {showDate && post.first_seen_at && (
                <span className="text-[11px] text-zinc-600 font-mono">
                  {daysAgo(post.first_seen_at)}
                </span>
              )}
              <div className={`flex items-center gap-1.5 p-1.5 px-2.5 rounded-full bg-zinc-900/50 border border-zinc-800 opacity-60 group-hover:opacity-100 group-hover:border-${accentColor}-900 group-hover:bg-${accentColor}-950/20 transition-all`}>
                <span className={`text-[10px] font-bold text-zinc-500 group-hover:text-${accentColor}-300`}>OPEN</span>
                <ExternalLink size={13} className={`text-zinc-600 group-hover:text-${accentColor}-400`} />
              </div>
            </div>
          </div>

          <p className={`${isHall ? 'text-lg md:text-xl font-medium italic' : 'text-[16px] md:text-[17px] font-normal'} leading-[1.65] text-zinc-300 group-hover:text-zinc-100 transition-colors mb-6 break-words`}>
            {isHall && '"'}{renderCaption(post.caption)}{isHall && '"'}
          </p>

          <div className="flex items-center gap-6 border-t border-zinc-900/80 pt-5">
            <div className="flex items-center gap-2.5 group/stat">
              <Heart size={18} className="text-zinc-700 group-hover/stat:text-red-500 transition-colors" />
              <span className="text-sm font-semibold font-mono text-zinc-500 group-hover/stat:text-red-300">
                {formatCount(post.like_count)}
              </span>
            </div>
            <div className="flex items-center gap-2.5 group/stat">
              <MessageCircle size={18} className={`text-zinc-700 group-hover/stat:text-${accentColor}-400 transition-colors`} />
              <span className={`text-sm font-semibold font-mono text-zinc-500 group-hover/stat:text-${accentColor}-200`}>
                {formatCount(post.reply_count)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </a>
  );
}

// Nav Link 
interface NavLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  accentColor: string;
}

export function NavLink({ href, icon, label, accentColor }: NavLinkProps) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-${accentColor}-500/50 hover:bg-zinc-800/50 transition-all text-sm font-medium text-zinc-400 hover:text-${accentColor}-400`}
    >
      {icon}
      {label}
    </Link>
  );
}

// Page Layout 
interface PageLayoutProps {
  badge: string;
  title: React.ReactNode;
  periodLabel: string;
  periodIcon: React.ReactNode;
  accentColor: string;
  glowColor: string;        
  nav: React.ReactNode;
  children: React.ReactNode;
  loadingColor: string;
  loading: boolean;
  loadingText?: string;
}

export function PageLayout({
  badge, title, periodLabel, periodIcon,
  accentColor, glowColor, nav, children,
  loadingColor, loading, loadingText = 'Loading charts'
}: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-[#030303] text-zinc-100 font-sans antialiased">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-${glowColor} blur-[130px] rounded-full`} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-zinc-900/30 blur-[130px] rounded-full" />
      </div>

      <header className="relative max-w-4xl mx-auto pt-20 pb-12 px-6">
        <div className="flex flex-col gap-8 border-b border-zinc-900/50 pb-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/30 border border-zinc-800/50 backdrop-blur-sm`}>
                <TrendingUp size={12} className={`text-${accentColor}-400`} />
                <span className="text-[10px] uppercase tracking-[0.25em] text-zinc-500 font-bold">
                  {badge}
                </span>
              </div>
              <h1 className="text-5xl md:text-6xl font-extrabold tracking-tighter text-white">
                {title}
              </h1>
            </div>
            <div className="flex flex-col md:items-end p-4 rounded-xl bg-zinc-900/20 border border-zinc-800/30 backdrop-blur-sm">
              <span className="text-[10px] text-zinc-600 uppercase tracking-[0.3em] font-bold mb-1 flex items-center gap-2">
                {periodIcon}
              </span>
              <p className="text-lg font-mono text-zinc-300 font-medium">{periodLabel}</p>
            </div>
          </div>
          <nav className="flex flex-wrap gap-3">{nav}</nav>
        </div>
      </header>

      <main className="relative max-w-4xl mx-auto px-6 pb-32">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 space-y-6">
            <div className={`w-10 h-10 border-2 border-zinc-800 ${loadingColor} rounded-full animate-spin`} />
            <p className="text-xs text-zinc-600 tracking-[0.4em] uppercase font-medium">{loadingText}</p>
          </div>
        ) : (
          <div className="space-y-3">{children}</div>
        )}
      </main>

      <footer className="fixed bottom-6 left-6 pointer-events-none z-50">
        <div className="px-4 py-2 bg-black/80 backdrop-blur-lg border border-zinc-800/50 rounded-full shadow-xl">
          <p className="text-[9px] text-zinc-600 uppercase tracking-[0.4em] font-bold">
            Created by <span className="text-zinc-400">yurii.av</span>
          </p>
        </div>
      </footer>
    </div>
  );
}