import { getCollection } from 'astro:content';
import { createSearchIndex } from '../lib/search-index';

export async function GET() {
  const loreEntries = await getCollection('lore');
  return new Response(JSON.stringify(createSearchIndex(loreEntries)), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
