import { defineCollection, z } from 'astro:content';

const guideSchema = z.object({
  title: z.string(),
  order: z.number(),
  summary: z.string(),
});

const tips = defineCollection({
  schema: z
    .object({
      title: z.string(),
      type: z.enum(['article', 'video']),
      author: z.string(),
      authorBilibili: z.string().url().optional(),
      date: z.coerce.date(),
      summary: z.string(),
      tags: z.array(z.string()).optional(),
      cover: z.string().optional(),
      videos: z.array(z.object({
        label: z.string(),
        url: z.string(),
        cover: z.string().optional(),
      })).optional(),
    })
    .refine((data) => data.type !== 'video' || Boolean(data.videos?.length), {
      message: '视频类型至少填写一个视频',
      path: ['videos'],
    }),
});

export const collections = {
  guides: defineCollection({ schema: guideSchema }),
  lore: defineCollection({ schema: guideSchema }),
  'lore-scrolls': defineCollection({
    schema: z.object({
      title: z.string(),
      group: z.enum(['历史与传说', '日记与笔记', '档案与杂记']),
      order: z.number(),
      pages: z.number(),
    }),
  }),
  'side-stories': defineCollection({
    schema: z.object({
      title: z.string(),
      order: z.number(),
      summary: z.string(),
      source: z.string(),
    }),
  }),
  tips,
};
