"use client";

import { useEffect, useState } from "react";
import { Calendar, Clock, Trophy, TrendingUp } from "lucide-react";
import { supabase } from "../lib/supabase";
import { ThreadPost } from "../lib/utils";
import { PageLayout, PostCard, NavLink, MobileSnapItem, SortControl } from "../components/ui";

export default function WeekPage() {
  const [posts, setPosts] = useState<ThreadPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'likes' | 'recent'>('likes');

  useEffect(() => {
    async function fetchPosts() {
      const weekAgo = new Date(
        Date.now() - 7 * 24 * 60 * 60 * 1000,
      ).toISOString();
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .gte("first_seen_at", weekAgo)
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
          <span className="text-purple-500 font-black">WEEK</span>
        </>
      }
      periodLabel={sortBy === 'likes' ? "Top of the Week" : "Recently Added"}
      periodIcon={
        sortBy === 'likes' 
          ? <TrendingUp size={11} className="text-purple-600/60" /> 
          : <Calendar size={11} className="text-purple-600/60" />
      }
      accent="purple"
      loading={loading}
      nav={
        <>
          <SortControl 
            current={sortBy} 
            onChange={setSortBy} 
            accent="purple" 
          />
          
          <NavLink
            href="/"
            icon={<Clock size={16} />}
            label="Головна"
            accent="purple"
          />
          <NavLink
            href="/hall-of-fame"
            icon={<Trophy size={16} />}
            label="Зал слави"
            accent="purple"
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
            accent="purple"
            showDate={true}
          />
        </MobileSnapItem>
      ))}
    </PageLayout>
  );
}