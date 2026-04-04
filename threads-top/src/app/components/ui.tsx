"use client";

import { MessageCircle, Heart, TrendingUp, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ThreadPost, formatCount, daysAgo, cleanCaption, EMOJI_REGEX } from '../lib/utils';

type AccentColor = 'cyan' | 'purple' | 'amber';

const colors: Record<AccentColor, {
  badge: string;
  rankHover: string;
  avatar: string;
  avatarText: string;
  shadow: string;
  navLink: string;
  spinner: string;
}> = {
  cyan: {
    badge:        'text-cyan-400',
    rankHover:    'group-hover:text-cyan-900',
    avatar:       'group-hover:border-cyan-800/50',
    avatarText:   'group-hover:text-cyan-200',
    shadow:       'group-hover:shadow-cyan-500/5',
    navLink:      'hover:border-cyan-500/50 hover:text-cyan-400',
    spinner:      'border-t-cyan-500',
  },
  purple: {
    badge:        'text-purple-400',
    rankHover:    'group-hover:text-purple-900',
    avatar:       'group-hover:border-purple-800/50',
    avatarText:   'group-hover:text-purple-200',
    shadow:       'group-hover:shadow-purple-500/5',
    navLink:      'hover:border-purple-500/50 hover:text-purple-400',
    spinner:      'border-t-purple-500',
  },
  amber: {
    badge:        'text-amber-500',
    rankHover:    'group-hover:text-amber-900',
    avatar:       'group-hover:border-amber-800/50',
    avatarText:   'group-hover:text-amber-200',
    shadow:       'group-hover:shadow-amber-500/5',
    navLink:      'hover:border-amber-500/50 hover:text-amber-400',
    spinner:      'border-t-amber-500',
  },
};

const glows: Record<AccentColor, string> = {
  cyan:   'bg-cyan-950/20',
  purple: 'bg-purple-950/20',
  amber:  'bg-amber-950/10',
};

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

export function renderCaption(text: string) {
  if (!text) return null;
  const parts = cleanCaption(text).split(EMOJI_REGEX);
  return parts.map((part, i) =>
    part.match(EMOJI_REGEX)
      ? <AppleEmoji key={i} symbol={part} alt="emoji" />
      : part
  );
}

interface PostCardProps {
  post: ThreadPost;
  index: number;
  accent: AccentColor;
  showDate?: boolean;
  variant?: 'default' | 'hall';
}

export function PostCard({ post, index, accent, showDate = false, variant = 'default' }: PostCardProps) {
  const c = colors[accent];
  const isHall = variant === 'hall';

  return (
    <a
      href={post.post_url}
      target="_blank"
      rel="noopener noreferrer"
      data-post-card
      className={`group relative block transition-all duration-300 ease-out md:hover:translate-y-[-2px] post-accent-${accent}`}
    >
      <div className="absolute -inset-px bg-gradient-to-r from-zinc-800/50 to-zinc-900/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none card-glow" />
      <div className={`relative p-6 md:p-7 bg-[#080808] border border-zinc-900 rounded-2xl flex gap-6 items-start transition-all duration-300 group-hover:bg-[#0a0a0a] group-hover:border-zinc-800/80 group-hover:shadow-2xl ${c.shadow} card-body`}>
        <div className="flex flex-col items-center pt-1 w-[40px] flex-shrink-0">
          <span className={`text-xl font-bold font-mono text-zinc-800 ${c.rankHover} transition-colors rank-number`}>
            {(index + 1).toString().padStart(2, '0')}
          </span>
          <div className="w-px h-full min-h-[50px] mt-2 bg-gradient-to-b from-zinc-900 to-transparent" />
        </div>
        <div className="flex-1 min-w-0 overflow-hidden">
          <div className="flex items-center justify-between mb-4 min-w-0">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className={`w-9 h-9 flex-shrink-0 rounded-full bg-zinc-900 border border-zinc-800 ${c.avatar} flex items-center justify-center transition-colors text-xs font-bold text-zinc-400 ${c.avatarText} uppercase avatar-box`}>
                {post.author_name.slice(0, 2)}
              </div>
              <span className="font-semibold text-zinc-300 group-hover:text-white transition-colors tracking-tight text-[15px] truncate author-name">
                @{post.author_name}
              </span>
            </div>
            {showDate && post.first_seen_at && (
              <span className="text-[11px] text-zinc-600 font-mono hidden sm:block ml-2 flex-shrink-0">
                {daysAgo(post.first_seen_at)}
              </span>
            )}
          </div>
          <p className={`${isHall ? 'text-lg md:text-xl font-medium italic' : 'text-[16px] md:text-[17px] font-normal'} leading-[1.65] text-zinc-400 group-hover:text-zinc-100 transition-colors mb-6 break-words post-caption`}>
            {isHall && '"'}{renderCaption(post.caption)}{isHall && '"'}
          </p>
          <div className="flex items-center gap-6 border-t border-zinc-900/80 pt-5">
            <div className="flex items-center gap-2.5">
              <Heart size={18} className="text-zinc-700 transition-colors" />
              <span className="text-sm font-semibold font-mono text-zinc-600 transition-colors">
                {formatCount(post.like_count)}
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <MessageCircle size={18} className="text-zinc-700 transition-colors" />
              <span className="text-sm font-semibold font-mono text-zinc-600 transition-colors">
                {formatCount(post.reply_count)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </a>
  );
}

export function MobileSnapList({ children }: { children: React.ReactNode }) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleActive = () => {
      const container = listRef.current;
      if (!container) return;
      const cards = container.querySelectorAll('[data-snap-item]');
      if (cards.length === 0) return;

      const viewportHeight = window.innerHeight;
      const triggerPoint = viewportHeight * 0.45; 
      
      let closestCard: Element | null = null;
      let minDistance = Infinity;

      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const cardCenter = rect.top + rect.height / 2;
        const distance = Math.abs(triggerPoint - cardCenter);

        if (distance < minDistance) {
          minDistance = distance;
          closestCard = card;
        }
      });

      cards.forEach(card => card.classList.remove('snap-active'));
      if (closestCard) (closestCard as Element).classList.add('snap-active');
    };

    window.addEventListener('scroll', handleActive, { passive: true });
    window.addEventListener('resize', handleActive);
    
    const timeout = setTimeout(handleActive, 50);
    
    return () => {
      window.removeEventListener('scroll', handleActive);
      window.removeEventListener('resize', handleActive);
      clearTimeout(timeout);
    };
  }, [children]);

  return <div ref={listRef} className="mobile-snap-list md:hidden">{children}</div>;
}

export function MobileSnapItem({ children }: { children: React.ReactNode }) {
  return <div data-snap-item className="snap-item">{children}</div>;
}

interface NavLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  accent: AccentColor;
}

export function NavLink({ href, icon, label, accent }: NavLinkProps) {
  const c = colors[accent];
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-6 py-4 md:px-4 md:py-2 rounded-xl md:rounded-lg bg-zinc-900 border border-zinc-800 ${c.navLink} hover:bg-zinc-800/50 transition-all text-base md:text-sm font-bold md:font-medium text-zinc-400`}
    >
      {icon}
      {label}
    </Link>
  );
}

interface PageLayoutProps {
  badge: string;
  title: React.ReactNode;
  periodLabel: string;
  periodIcon: React.ReactNode;
  accent: AccentColor;
  nav: React.ReactNode;
  children: React.ReactNode;
  loading: boolean;
  loadingText?: string;
}

export function PageLayout({
  badge, title, periodLabel, periodIcon,
  accent, nav, children, loading,
  loadingText = 'Loading charts',
}: PageLayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const c = colors[accent];
  const glow = glows[accent];

  return (
    <div className="min-h-screen bg-[#030303] text-zinc-100 font-sans antialiased overflow-x-hidden">
      <style>{`
        @media (max-width: 767px) {
          .mobile-snap-list {
            padding: 22dvh 16px 120px 16px; 
            display: flex;
            flex-direction: column;
            gap: 16px;
          }
          .snap-item {
            opacity: 0.35;
            transform: scale(0.96);
            transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
            will-change: transform, opacity;
          }
          .snap-item.snap-active {
            opacity: 1;
            transform: scale(1);
          }
          .snap-item.snap-active .card-glow { opacity: 1 !important; }
          .snap-item.snap-active .card-body {
            background: #0a0a0a !important;
            border-color: rgba(63, 63, 70, 0.8) !important;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.4);
            translate: 0 -2px;
          }
          .snap-item.snap-active .author-name { color: white !important; }
          .snap-item.snap-active .post-caption { color: #f4f4f5 !important; }
          
          .snap-item.snap-active .post-accent-cyan .rank-number { color: #22d3ee !important; text-shadow: 0 0 15px rgba(34, 211, 238, 0.3); }
          .snap-item.snap-active .post-accent-purple .rank-number { color: #c084fc !important; text-shadow: 0 0 15px rgba(192, 132, 252, 0.3); }
          .snap-item.snap-active .post-accent-amber .rank-number { color: #fbbf24 !important; text-shadow: 0 0 15px rgba(251, 191, 36, 0.3); }

          .snap-item.snap-active .post-accent-cyan .avatar-box { border-color: rgba(21, 94, 117, 0.5) !important; color: #a5f3fc !important; }
          .snap-item.snap-active .post-accent-purple .avatar-box { border-color: rgba(107, 33, 168, 0.5) !important; color: #e9d5ff !important; }
          .snap-item.snap-active .post-accent-amber .avatar-box { border-color: rgba(146, 64, 14, 0.5) !important; color: #fde68a !important; }
        }
      `}</style>

      {/* Header, Menu & Glowing background remains the same... */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 z-[60] px-6 flex items-center justify-between border-b border-zinc-900/50 bg-black/60 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <TrendingUp size={16} className={c.badge} />
          <h2 className="font-black tracking-tighter text-lg uppercase">{title}</h2>
        </div>
        <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400">
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-[55] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center p-8 space-y-4">
          <div className="w-full space-y-3" onClick={() => setMenuOpen(false)}>
            {nav}
          </div>
        </div>
      )}

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-[10%] -left-[10%] w-[50%] h-[50%] ${glow} blur-[130px] rounded-full`} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-zinc-900/30 blur-[130px] rounded-full" />
      </div>

      {/* Desktop Header */}
      <header className="relative max-w-4xl mx-auto pt-20 pb-12 px-6 hidden md:block">
        <div className="flex flex-col gap-8 border-b border-zinc-900/50 pb-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/30 border border-zinc-800/50 backdrop-blur-sm">
                <TrendingUp size={12} className={c.badge} />
                <span className="text-[10px] uppercase tracking-[0.25em] text-zinc-500 font-bold">{badge}</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-extrabold tracking-tighter text-white">{title}</h1>
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

      {/* Desktop Main */}
      <main className="relative max-w-4xl mx-auto px-6 pb-32 hidden md:block">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 space-y-6">
            <div className={`w-10 h-10 border-2 border-zinc-800 ${c.spinner} rounded-full animate-spin`} />
            <p className="text-xs text-zinc-600 tracking-[0.4em] uppercase font-medium">{loadingText}</p>
          </div>
        ) : (
          <div className="space-y-3">{children}</div>
        )}
      </main>

      {/* Mobile Snap List */}
      {!loading && <MobileSnapList>{children}</MobileSnapList>}

      {loading && (
        <div className="md:hidden flex flex-col items-center justify-center h-dvh space-y-6">
          <div className={`w-10 h-10 border-2 border-zinc-800 ${c.spinner} rounded-full animate-spin`} />
          <p className="text-xs text-zinc-600 tracking-[0.4em] uppercase font-medium">{loadingText}</p>
        </div>
      )}

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