import express from "express";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

puppeteer.use(StealthPlugin());
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
);

const LETTERS_TO_SEARCH = [
  "ї", "є", "ґ", "і",
  "що", "як", "чому", "коли", "де", "хто", "який", "скільки",
  "але", "або", "якщо", "тому", "через", "після",
  "треба", "потрібно", "завжди", "ніколи", "робота"
];

const MIN_LIKES = 500;
const MIN_REPLIES = 200;

function authMiddleware(req, res, next) {
  const secret = req.headers["x-cron-secret"] || req.query.secret;
  if (secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

async function scrapeByLetter(letter, page) {
  const url = `https://www.threads.net/search?q=${encodeURIComponent(letter)}&serp_type=default`;
  console.log(`\n🔍 Searching: "${letter}"`);

  await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

  try {
    await page.waitForSelector('[data-pressable-container="true"]', {
      timeout: 12000,
    });
  } catch {
    console.log(`  ✗ No posts found for "${letter}"`);
    return [];
  }

  const scrollTimes = letter.length === 1 ? 150 : 50;

  console.log(`  ↕ Scrolling ${scrollTimes} times...`);
  for (let i = 0; i < scrollTimes; i++) {
    await page.evaluate(() => window.scrollBy(0, window.innerHeight * 2));
    await new Promise((r) => setTimeout(r, 800));
  }

  const posts = await page.evaluate((MIN_LIKES, MIN_REPLIES) => {
    function parseCount(text) {
      if (!text) return 0;
      const t = text.trim().replace(",", ".");
      if (t.includes("K")) return Math.round(parseFloat(t) * 1000);
      if (t.includes("M")) return Math.round(parseFloat(t) * 1000000);
      return parseInt(t) || 0;
    }

    const containers = document.querySelectorAll(
      '[data-pressable-container="true"]',
    );
    const results = [];

    containers.forEach((container) => {
      try {
        const timeEl = container.querySelector(
          '[aria-label*="ago"], [aria-label*="minutes"], [aria-label*="hour"]',
        );
        if (!timeEl) return;

        const timeLabel = timeEl.getAttribute("aria-label");
        if (
          timeLabel.includes("day") ||
          timeLabel.includes("week") ||
          timeLabel.includes("month")
        )
          return;

        const authorEl = container.querySelector('a[href^="/@"]');
        const author_name = authorEl
          ? authorEl.getAttribute("href").replace("/@", "").split("/")[0]
          : null;

        const caption = Array.from(container.querySelectorAll("span.xi7mnp6"))
          .map((el) => el.innerText.trim())
          .filter((t) => t.length > 0)
          .join("\n")
          .trim();

        const statSpans = Array.from(
          container.querySelectorAll("span.x1o0tod.x10l6tqk.x13vifvy"),
        ).map((el) => parseCount(el.innerText.trim()));
        
        const like_count = statSpans[0] || 0;
        const reply_count = statSpans[1] || 0;

        if (like_count < MIN_LIKES && reply_count < MIN_REPLIES) return;

        const linkEl = container.querySelector('a[href*="/post/"]');
        const post_url = linkEl
          ? "https://www.threads.net" +
            linkEl.getAttribute("href").split("?")[0]
          : null;
        const threads_id = post_url ? post_url.split("/post/")[1] : null;

        if (author_name && caption && threads_id) {
          results.push({
            threads_id,
            author_name,
            caption,
            like_count,
            reply_count,
            post_url,
          });
        }
      } catch (e) {}
    });

    return results;
  }, MIN_LIKES, MIN_REPLIES);

  console.log(`  ✓ Found ${posts.length} posts`);
  return posts;
}

async function runScraper() {
  console.log("\n🚀 Starting Threads scraper...");
  const startTime = Date.now();

  const browser = await puppeteer.launch({
    headless: false,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-blink-features=AutomationControlled",
    ],
    defaultViewport: { width: 1280, height: 900 },
  });

  try {
    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    );

    if (process.env.THREADS_COOKIES) {
      try {
        const cookies = JSON.parse(process.env.THREADS_COOKIES);
        await page.setCookie(...cookies);
        console.log("🍪 Cookies loaded");
      } catch (e) {
        console.warn("⚠️  Could not parse THREADS_COOKIES");
      }
    }

    const allPosts = [];
    for (const letter of LETTERS_TO_SEARCH) {
      const posts = await scrapeByLetter(letter, page);
      allPosts.push(...posts);
      await new Promise((r) => setTimeout(r, 1500));
    }

    const uniquePosts = Array.from(
      new Map(allPosts.map((p) => [p.threads_id, p])).values(),
    );

    const now = new Date().toISOString();

    if (uniquePosts.length > 0) {
      const newPosts = uniquePosts.map((p) => ({
        ...p,
        scraped_at: now,
        first_seen_at: now,
      }));

      const { error: insertError } = await supabase
        .from("posts")
        .upsert(newPosts, {
          onConflict: "threads_id",
          ignoreDuplicates: true,
        });

      if (insertError) throw insertError;

      for (const p of uniquePosts) {
        await supabase
          .from("posts")
          .update({ like_count: p.like_count, reply_count: p.reply_count, scraped_at: now })
          .eq("threads_id", p.threads_id);
      }

      console.log(`✅ Supabase updated — ${uniquePosts.length} posts`);
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n📊 Total unique posts: ${uniquePosts.length}`);
    console.log(`⏱ Done in ${elapsed}s`);

    return { success: true, count: uniquePosts.length };
  } finally {
    await browser.close();
  }
}

app.get("/update", authMiddleware, async (req, res) => {
  try {
    const result = await runScraper();
    res.json(result);
  } catch (error) {
    console.error("❌ Scraper error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🟢 Server running on http://localhost:${PORT}`);
  console.log(`  Trigger: GET /update?secret=YOUR_SECRET`);
});