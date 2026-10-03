import { defineConfig } from 'astro/config';
import rehypeScrollLeaves from './src/lib/rehype-scroll-leaves.mjs';

export default defineConfig({
  site: 'https://grimsoul-wiki.pages.dev',
  output: 'static',
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },
  markdown: {
    rehypePlugins: [rehypeScrollLeaves],
  },
});
