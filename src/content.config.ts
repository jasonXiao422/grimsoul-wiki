import { defineCollection, z } from 'astro:content';

const lore = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    order: z.number(),
    summary: z.string(),
  }),
});

const guides = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    order: z.number(),
    summary: z.string(),
  }),
});

export const collections = { lore, guides };
