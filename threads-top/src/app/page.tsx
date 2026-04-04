"use client";

import { useEffect, useState } from "react";
import { Sparkles, Calendar, Trophy, Clock, TrendingUp } from "lucide-react";
import { supabase } from "./lib/supabase";
import { ThreadPost } from "./lib/utils";
import { PageLayout, PostCard, NavLink, MobileSnapItem, SortControl } from "./components/ui";

export default function Home() {
  const [posts, setPosts] = useState<ThreadPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'likes' | 'recent'>('likes');

  useEffect(() => {
    async function fetchPosts() {
      const yesterday = new Date(
        Date.now() - 24 * 60 * 60 * 1000,
      ).toISOString();
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .gte("first_seen_at", yesterday)
        .order("like_count", { ascending: false })
        .limit(100);

      if (!error && data) setPosts(data as ThreadPost[]);
      setLoading(false);
    }
    fetchPosts();
  }, []);

  const displayedPosts = [...posts].sort((a, b) => {
    if (sortBy === 'recent') {
      return new Date(b.first_seen_at || 0).getTime() - new Date(a.first_seen_at || 0).getTime();
    }
    return b.like_count - a.like_count;
  });

  return (
    <PageLayout
      badge="Ukraine Trending"
      title={
        <>
          TOP<span className="text-zinc-800">.</span>
          <span className="text-cyan-500 font-black">24h</span>
        </>
      }
      periodLabel={sortBy === 'likes' ? "Most Liked Today" : "Newly Added"}
      periodIcon={
        sortBy === 'likes' 
          ? <TrendingUp size={12} className="text-cyan-600/60" /> 
          : <Clock size={12} className="text-cyan-600/60" />
      }
      accent="cyan"
      loading={loading}
      nav={
        <>
          <SortControl 
            current={sortBy} 
            onChange={setSortBy} 
            accent="cyan" 
          />
          
          <NavLink
            href="/week"
            icon={<Calendar size={16} />}
            label="Топ тижня"
            accent="cyan"
          />
          <NavLink
            href="/hall-of-fame"
            icon={<Trophy size={16} />}
            label="Зал слави"
            accent="cyan"
          />
        </>
      }
    >
      {displayedPosts.map((post, index) => (
        <MobileSnapItem key={post.threads_id}>
          <PostCard
            key={post.threads_id}
            post={post}
            index={index}
            accent="cyan"
            showDate={sortBy === 'recent'}
          />
        </MobileSnapItem>
      ))}
    </PageLayout>
  );
}