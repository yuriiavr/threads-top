import { ApifyClient } from 'apify-client';
import { createClient } from '@supabase/supabase-js';

const apify = new ApifyClient({ token: process.env.APIFY_TOKEN });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export default async function handler(req, res) {
  const { secret } = req.query;
  if (secret !== process.env.CRON_SECRET) return res.status(401).send('Unauthorized');

  try {
    // Виклик саме цього актора, який ти обрав
    const run = await apify.actor('igview-owner/threads-search-scraper').call({
      "searchQuery": "ї", // Можна додати кілька через кому або запустити цикл
      "sort": "top",      // Вибираємо найрелевантніші
      "maxItems": 50      // Почни з невеликої кількості для тесту
    });

    const { items } = await apify.dataset(run.defaultDatasetId).listItems();

    // Мапінг даних (цей актор може віддавати поля трохи інакше, тому перевіряємо)
    const processedPosts = items.map(p => ({
      threads_id: p.id,
      caption: p.text || p.caption || '',
      author_name: p.user?.username || 'unknown',
      like_count: p.like_count || 0,
      reply_count: p.reply_count || 0,
      post_url: p.url || `https://www.threads.net/post/${p.code}`,
    }));

    // Чистимо і записуємо в Supabase
    await supabase.from('posts').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('posts').insert(processedPosts);

    return res.status(200).json({ success: true, count: processedPosts.length });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}