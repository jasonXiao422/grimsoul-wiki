import { getCollection } from 'astro:content';
import { createSearchIndex } from '../lib/search-index';

export async function GET() {
  const loreEntries = await getCollection('lore');
  const loreScrollEntries = await getCollection('lore-scrolls');
  const sideStoryEntries = await getCollection('side-stories');
  return new Response(JSON.stringify(createSearchIndex(loreEntries, loreScrollEntries, sideStoryEntries)), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
