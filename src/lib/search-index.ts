import { pinyin } from 'pinyin-pro';
import type { CollectionEntry } from 'astro:content';
import { ALL_CATEGORIES, DATA_BY_CATEGORY, EXTRA_DATA, getItemHref, type CategorySlug } from './data';
import boxes from '../data/boxes.json';

export interface SearchEntry {
  name: string;
  category: string;
  href: string;
  terms: string[];
  pinyin: string;
  initials: string;
  categoryTerms?: string[];
  categoryPinyin?: string;
  categoryInitials?: string;
}

const makePinyin = (name: string) => pinyin(name, { toneType: 'none', type: 'array' }) as string[];
const toSearchFields = (terms: string[]) => {
  const normalizedTerms = [...new Set(terms.filter(Boolean))];
  const syllables = normalizedTerms.map((term) => makePinyin(term));
  return {
    terms: normalizedTerms,
    pinyin: syllables.map((parts) => parts.join('')).join(' ').toLowerCase(),
    initials: syllables.map((parts) => parts.map((part) => part[0] ?? '').join('')).join(' ').toLowerCase(),
  };
};

const stripMarkdown = (text: string) => text.replace(/[`*_~]/g, '').replace(/\s+/g, ' ').trim();
const getLoreHeadings = (body: string) => [...body.matchAll(/^#{2,6}\s+(.+)$/gm)].map((match) => stripMarkdown(match[1]));

export function createSearchIndex(loreEntries: CollectionEntry<'lore'>[]): SearchEntry[] {
  const categoryEntries = ALL_CATEGORIES.flatMap((category) => {
    const slug = category.slug as CategorySlug;
    return [...DATA_BY_CATEGORY[slug]].map((item) => ({
      name: item.name,
      category: category.label,
      href: getItemHref(slug, item),
      categoryTerms: toSearchFields([category.label]).terms,
      categoryPinyin: toSearchFields([category.label]).pinyin,
      categoryInitials: toSearchFields([category.label]).initials,
      ...toSearchFields([item.name]),
    }));
  });
  const knownNames = new Set([
    ...Object.values(DATA_BY_CATEGORY).flatMap((items) => items.map((item) => item.name)),
    ...EXTRA_DATA['armor-pieces'].map((item) => item.name),
  ]);
  const loreSearchEntries = loreEntries.map((entry) => ({
    name: entry.data.title,
    category: '背景故事',
    href: `/lore/${entry.id.replace(/\.md$/, '')}`,
    ...toSearchFields([
      entry.data.title,
      ...getLoreHeadings(entry.body ?? ''),
      ...[...knownNames].filter((name) => (entry.body ?? '').includes(name)),
    ]),
  }));
  const orderSearchEntries = DATA_BY_CATEGORY.orders.map((item) => ({
    name: item.name,
    category: '骑士团',
    href: `/orders/${item.id}`,
    ...toSearchFields([item.name, item.eraLabel, item.summary, item.leader]),
  }));
  const boxSearchEntries = boxes.map((item) => ({
    name: item.name,
    category: '武器盒子',
    href: '/boxes',
    ...toSearchFields([item.name]),
  }));
  return [...categoryEntries, ...loreSearchEntries, ...orderSearchEntries, ...boxSearchEntries];
}
