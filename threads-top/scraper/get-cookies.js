/**
 * get-cookies.js
 * 
 * Запусти цей скрипт ОДИН РАЗ щоб залогінитись в Threads
 * і зберегти cookies в файл.
 * 
 * Запуск: node get-cookies.js
 */

import puppeteer from 'puppeteer';
import fs from 'fs';

const browser = await puppeteer.launch({
  headless: false, // Відкриває реальний браузер
  defaultViewport: null,
});

const page = await browser.newPage();
await page.goto('https://www.threads.net/login', { waitUntil: 'networkidle2' });

console.log('');
console.log('🌐 Браузер відкрито!');
console.log('👉 Залогінься в Threads вручну (через Instagram)');
console.log('⏳ Після логіну натисни Enter тут...');
console.log('');

// Чекаємо поки юзер залогіниться
await new Promise(resolve => {
  process.stdin.once('data', resolve);
});

await new Promise(r => setTimeout(r, 3000));

// Зберігаємо cookies
const cookies = await page.cookies();
const threadsCookes = cookies;

fs.writeFileSync('cookies.json', JSON.stringify(threadsCookes, null, 2));
console.log(`✅ Збережено ${threadsCookes.length} cookies у cookies.json`);
console.log('');
console.log('Тепер скопіюй вміст cookies.json в .env як THREADS_COOKIES=...');
console.log('(зроби з нього одну строку без переносів)');

await browser.close();
process.exit(0);