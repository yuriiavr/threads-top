"use client";

import { useEffect, useState } from 'react';
import { Sparkles, Calendar, Trophy } from 'lucide-react';
import { supabase } from './lib/supabase';
import { ThreadPost } from './lib/utils';
import { PageLayout, PostCard, NavLink } from './components/ui';

export default function Home() {
  const [posts, setPosts] = useState<ThreadPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .gte('first_seen_at', yesterday)
        .order('like_count', { ascending: false })
        .limit(100);

      if (!error && data) setPosts(data as ThreadPost[]);
      setLoading(false);
    }
    fetchPosts();
  }, []);

  return (
    <PageLayout
      badge="Ukraine Trending"
      title={<>TOP<span className="text-zinc-800">.</span><span className="text-cyan-500 font-black">24h</span></>}
      periodLabel="Last 24 Hours"
      periodIcon={<><Sparkles size={11} className="text-cyan-600/60" /> Live Feed</>}
      accentColor="cyan"
      glowColor="cyan-950/20"
      loadingColor="border-t-cyan-500"
      loading={loading}
      nav={
        <>
          <NavLink href="/week" icon={<Calendar size={16} />} label="Топ тижня" accentColor="cyan" />
          <NavLink href="/hall-of-fame" icon={<Trophy size={16} />} label="Зал слави" accentColor="cyan" />
        </>
      }
    >
      {posts.map((post, index) => (
        <PostCard key={post.threads_id} post={post} index={index} accentColor="cyan" />
      ))}
    </PageLayout>
  );
}