// 启用 ClientRouter 后 astro:page-load 在首次加载时也会触发，届时需移除 DOMContentLoaded 分支，避免首次加载执行两次。
type PageReadyCallback = () => void;

declare global {
  interface Window {
    __onPageReady?: (callback: PageReadyCallback, key?: string) => void;
    __grimsoulBreadcrumbInitialized?: boolean;
    __grimsoulImageZoomInitialized?: boolean;
    __grimsoulNavLoaderInitialized?: boolean;
    __grimsoulScrollRestorationInitialized?: boolean;
    __grimsoulSearchGlobalListeners?: boolean;
    __grimsoulHeaderResizeListener?: boolean;
    __grimsoulLayoutClickListener?: boolean;
    __grimsoulLayoutKeydownListener?: boolean;
    __grimsoulBackToTopListeners?: boolean;
    __grimsoulCardPagerFilterListener?: boolean;
    __GRIMSOUL_LOADING_LINES__?: readonly string[];
  }
}

const callbacks = new Set<PageReadyCallback>();
const keyedCallbacks = new Map<string, PageReadyCallback>();
let initialized = false;
let domReady = false;

const runCallbacks = () => {
  domReady = true;
  callbacks.forEach((callback) => callback());
};

if (typeof document !== 'undefined') {
  document.addEventListener('astro:page-load', runCallbacks);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      if (!initialized) {
        initialized = true;
        runCallbacks();
      }
    }, { once: true });
  } else {
    initialized = true;
    queueMicrotask(runCallbacks);
  }
}

export const onPageReady = (callback: PageReadyCallback, key?: string) => {
  if (key) {
    const previousCallback = keyedCallbacks.get(key);
    if (previousCallback) callbacks.delete(previousCallback);
    keyedCallbacks.set(key, callback);
  } else if (callbacks.has(callback)) {
    return;
  }
  callbacks.add(callback);
  if (domReady) queueMicrotask(callback);
};
