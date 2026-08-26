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
      videoUrl: z.string().url().optional(),
    })
    .refine((data) => data.type !== 'video' || Boolean(data.videoUrl), {
      message: '视频类型必须填写 videoUrl',
      path: ['videoUrl'],
    }),
});

export const collections = {
  guides: defineCollection({ schema: guideSchema }),
  lore: defineCollection({ schema: guideSchema }),
  tips,
};
