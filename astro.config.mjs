import { defineConfig } from 'astro/config';
import rehypeItemRefs from './src/lib/rehype-item-refs';

export default defineConfig({
  site: 'https://grimsoul-wiki.pages.dev',
  output: 'static',
  markdown: {
    rehypePlugins: [rehypeItemRefs],
  },
});
