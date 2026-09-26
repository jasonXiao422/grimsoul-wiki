import { getCollection } from 'astro:content';
import { createSearchIndex } from '../lib/search-index';

export async function GET() {
  const loreEntries = await getCollection('lore');
  const loreScrollEntries = await getCollection('lore-scrolls');
  return new Response(JSON.stringify(createSearchIndex(loreEntries, loreScrollEntries)), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
