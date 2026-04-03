"use client";

import { useEffect, useState } from 'react';
import { Trophy, Clock, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ThreadPost } from '../lib/utils';
import { PageLayout, PostCard, NavLink } from '../components/ui';

export default function HallOfFame() {
  const [posts, setPosts] = useState<ThreadPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      const { data, error } = await supabase
        .from('hall_of_fame')
        .select('*')
        .order('like_count', { ascending: false });

      if (!error && data) setPosts(data as ThreadPost[]);
      setLoading(false);
    }
    fetchPosts();
  }, []);

  return (
    <PageLayout
      badge="Legendary Content"
      title={<>HALL OF <span className="text-amber-500 font-black italic">FAME</span></>}
      periodLabel="All Time"
      periodIcon={<><Trophy size={11} className="text-amber-600/60" /> Best Ever</>}
      accent="amber"
      loadingText="Fetching legends"
      loading={loading}
      nav={
        <>
          <NavLink href="/" icon={<Clock size={16} />} label="Головна" accent="amber" />
          <NavLink href="/week" icon={<Calendar size={16} />} label="Топ тижня" accent="amber" />
        </>
      }
    >
      {posts.map((post, index) => (
        <PostCard key={post.threads_id} post={post} index={index} accent="amber" variant="hall" />
      ))}
    </PageLayout>
  );
}