"use client";

import { useEffect, useState } from "react";
import { Calendar, Clock, Trophy } from "lucide-react";
import { supabase } from "../lib/supabase";
import { ThreadPost } from "../lib/utils";
import { PageLayout, PostCard, NavLink, MobileSnapItem } from "../components/ui";

export default function WeekPage() {
  const [posts, setPosts] = useState<ThreadPost[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <PageLayout
      badge="Ukraine Trending"
      title={
        <>
          TOP<span className="text-zinc-800">.</span>
          <span className="text-purple-500 font-black">WEEK</span>
        </>
      }
      periodLabel="Last 7 Days"
      periodIcon={
        <>
          <Calendar size={11} className="text-purple-600/60" /> Period
        </>
      }
      accent="purple"
      loading={loading}
      nav={
        <>
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
      {posts.map((post, index) => (
        <MobileSnapItem key={post.threads_id}>
          <PostCard
            key={post.threads_id}
            post={post}
            index={index}
            accent="purple"
            showDate
          />
        </MobileSnapItem>
      ))}
    </PageLayout>
  );
}
