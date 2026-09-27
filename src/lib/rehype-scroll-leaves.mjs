const isElement = (node, tagName) => node?.type === 'element' && node.tagName === tagName;

const getScrollPageSpan = (node) => {
  if (!isElement(node, 'p')) return null;
  const children = node.children ?? [];
  if (children.length === 1 && isElement(children[0], 'span')) {
    const child = children[0];
    const className = child.properties?.className;
    const classes = Array.isArray(className) ? className : String(className ?? '').split(/\s+/);
    return classes.includes('scroll-page') ? child : null;
  }

  if (!children.every((child) => child.type === 'raw' || child.type === 'text')) return null;
  const markup = children.map((child) => child.value).join('');
  const match = markup.match(/^<span\b([^>]*)>([\s\S]*?)<\/span>$/i);
  if (!match || !/\bclass=["'][^"']*\bscroll-page\b[^"']*["']/i.test(match[1])) return null;
  return {
    type: 'element',
    tagName: 'span',
    properties: { className: ['scroll-page'] },
    children: [{ type: 'text', value: match[2] }],
  };
};

const isEmptyNode = (node) => node?.type === 'text' && !node.value.trim();

export default function rehypeScrollLeaves() {
  return (tree, file) => {
    const paths = [file?.path, ...(file?.history ?? [])].filter(Boolean);
    if (!paths.some((path) => /[\\/]lore-scrolls[\\/]/.test(path))) return;

    const children = tree.children ?? [];
    const nextChildren = [];
    let currentLeaf = null;

    const closeLeaf = () => {
      if (!currentLeaf) return;
      nextChildren.push(currentLeaf);
      currentLeaf = null;
    };

    for (const node of children) {
      const scrollPageSpan = getScrollPageSpan(node);
      if (scrollPageSpan) {
        closeLeaf();
        currentLeaf = {
          type: 'element',
          tagName: 'section',
          properties: { className: ['scroll-leaf'] },
          children: [scrollPageSpan],
        };
        continue;
      }

      if (isElement(node, 'h2')) {
        closeLeaf();
        nextChildren.push(node);
        continue;
      }

      if (currentLeaf) {
        currentLeaf.children.push(node);
      } else if (!isEmptyNode(node)) {
        nextChildren.push(node);
      }
    }

    closeLeaf();
    tree.children = nextChildren;
  };
}
