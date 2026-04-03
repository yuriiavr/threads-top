export const EMOJI_REGEX = /(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)/gu;

export function formatCount(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace('.0', '') + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1).replace('.0', '') + 'K';
  return n.toString();
}

export function daysAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function cleanCaption(text: string): string {
  return text
    .replace(/\s*Translate\s*$/gi, '')
    .replace(/\s*\d+\s*\/\s*\d+\s*$/g, '')
    .trim();
}

export interface ThreadPost {
  threads_id: string;
  author_name: string;
  caption: string;
  like_count: number;
  reply_count: number;
  post_url: string;
  first_seen_at?: string;
}