export function initSourceHintListeners() {
  const sourceWindow = window as Window & { __grimsoulSourceHintListeners?: boolean };
  if (sourceWindow.__grimsoulSourceHintListeners) return;
  sourceWindow.__grimsoulSourceHintListeners = true;

  let popover: HTMLDivElement | null = null;
  let activeButton: HTMLButtonElement | null = null;
  let activeCell: HTMLElement | null = null;
  let hideTimer = 0;
  let hideTransitionTimer = 0;
  const cellTimers = new WeakMap<HTMLElement, number>();
  const pointerTypes = new WeakMap<HTMLButtonElement, string>();

  const getPopover = () => {
    if (!popover || !document.body.contains(popover)) {
      popover = document.createElement('div');
      popover.className = 'source-popover';
      popover.setAttribute('role', 'tooltip');
      popover.hidden = true;
      document.body.append(popover);
    }
    return popover;
  };

  const clearHideTimer = () => {
    window.clearTimeout(hideTimer);
    hideTimer = 0;
  };

  const hide = () => {
    clearHideTimer();
    activeButton?.setAttribute('aria-expanded', 'false');
    activeCell?.classList.remove('is-source-active');
    activeButton = null;
    activeCell = null;
    if (popover) {
      window.clearTimeout(hideTransitionTimer);
      popover.classList.remove('is-visible');
      hideTransitionTimer = window.setTimeout(() => {
        if (popover && !popover.classList.contains('is-visible')) popover.hidden = true;
      }, 120);
    }
  };

  const clearCellTimer = (cell: HTMLElement) => {
    const timer = cellTimers.get(cell);
    if (timer !== undefined) {
      window.clearTimeout(timer);
      cellTimers.delete(cell);
    }
  };

  const scheduleCellShow = (cell: HTMLElement) => {
    clearCellTimer(cell);
    cellTimers.set(cell, window.setTimeout(() => {
      cellTimers.delete(cell);
      show(cell);
    }, 200));
  };

  const scheduleHide = () => {
    clearHideTimer();
    hideTimer = window.setTimeout(hide, 150);
  };
  let viewportHideFrame: number | undefined;
  const scheduleViewportHide = () => {
    if (viewportHideFrame !== undefined) return;
    viewportHideFrame = window.requestAnimationFrame(() => {
      viewportHideFrame = undefined;
      hide();
    });
  };

  const readSources = (value: string | undefined) => {
    try {
      const parsed = JSON.parse(value || '[]');
      return Array.isArray(parsed) ? parsed.filter((entry): entry is string => typeof entry === 'string' && entry.length > 0) : [];
    } catch {
      return [];
    }
  };

  const show = (source: HTMLButtonElement | HTMLElement) => {
    clearHideTimer();
    const currentPopover = getPopover();
    const sourceCell = source.matches('[data-source-cell]') ? source : source.closest('[data-source-cell]');
    if (!sourceCell) return;
    currentPopover.replaceChildren();
    const groups = [
      ['实体获取途径', readSources(sourceCell.dataset.obtain)],
      ['图纸获取途径', readSources(sourceCell.dataset.blueprint)],
    ] as const;
    groups.forEach(([label, values]) => {
      if (values.length === 0) return;
      const group = document.createElement('div');
      const title = document.createElement('p');
      title.className = 'source-popover-title';
      title.textContent = label;
      const tags = document.createElement('div');
      tags.className = 'tag-list';
      values.forEach((value) => {
        const tag = document.createElement('span');
        tag.className = 'tag';
        tag.textContent = value;
        tags.append(tag);
      });
      group.append(title, tags);
      currentPopover.append(group);
    });
    activeButton?.setAttribute('aria-expanded', 'false');
    activeButton = source.matches('.source-hint') ? source as HTMLButtonElement : null;
    activeButton?.setAttribute('aria-expanded', 'true');
    const nameAnchor = source.matches('.source-hint')
      ? source.closest('.item-name-with-source')?.querySelector<HTMLElement>('.item-cell')
      : source.matches('.item-cell')
        ? source
        : source.querySelector<HTMLElement>('.item-name-with-source .item-cell');
    if (!nameAnchor) return;
    activeCell?.classList.remove('is-source-active');
    activeCell = sourceCell;
    activeCell.classList.add('is-source-active');
    currentPopover.hidden = false;
    window.clearTimeout(hideTransitionTimer);
    const sourceRect = nameAnchor.getBoundingClientRect();
    const popoverWidth = currentPopover.offsetWidth;
    const popoverHeight = currentPopover.offsetHeight;
    const margin = 8;
    const left = Math.min(Math.max(margin, sourceRect.left), Math.max(margin, window.innerWidth - popoverWidth - margin));
    const headerHeight = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 0;
    const tableHeaderHeight = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--table-header-height')) || 0;
    const safeTop = headerHeight + tableHeaderHeight + margin;
    const above = sourceRect.top - popoverHeight - margin;
    const below = sourceRect.bottom + margin;
    const top = above >= safeTop ? above : below;
    currentPopover.style.left = `${left}px`;
    currentPopover.style.top = `${Math.max(margin, top)}px`;
    requestAnimationFrame(() => currentPopover?.classList.add('is-visible'));
  };

  document.addEventListener('pointerdown', (event) => {
    const button = (event.target as Element | null)?.closest?.('.source-hint') as HTMLButtonElement | null;
    if (button) pointerTypes.set(button, event.pointerType);
  });
  document.addEventListener('pointerover', (event) => {
    if (event.pointerType !== 'mouse') return;
    const nameAnchor = (event.target as Element | null)?.closest?.('[data-source-cell] .item-name-with-source .item-cell') as HTMLElement | null;
    if (nameAnchor) scheduleCellShow(nameAnchor);
    if (popover && (event.target === popover || popover.contains(event.target as Node))) clearHideTimer();
  });
  document.addEventListener('pointerout', (event) => {
    if (event.pointerType !== 'mouse') return;
    const target = event.target as Node | null;
    const related = event.relatedTarget as Node | null;
    const nameAnchor = target && (target as Element).closest?.('[data-source-cell] .item-name-with-source .item-cell') as HTMLElement | null;
    if (nameAnchor) {
      if (!related || nameAnchor.contains(related) || (popover && popover.contains(related))) return;
      clearCellTimer(nameAnchor);
      scheduleHide();
    } else if (popover && popover.contains(target)) {
      if (related && (activeCell?.contains(related) || popover.contains(related))) return;
      scheduleHide();
    }
  });
  document.addEventListener('focusin', (event) => {
    const button = (event.target as Element | null)?.closest?.('.source-hint') as HTMLButtonElement | null;
    if (button) show(button);
  });
  document.addEventListener('focusout', (event) => {
    if ((event.target as Element | null)?.closest?.('.source-hint')) hide();
  });
  document.addEventListener('click', (event) => {
    const target = event.target as Element | null;
    const button = target?.closest?.('.source-hint') as HTMLButtonElement | null;
    if (button) {
      event.preventDefault();
      event.stopPropagation();
      const pointerType = pointerTypes.get(button);
      pointerTypes.delete(button);
      if (pointerType === 'touch' || pointerType === 'pen') {
        if (activeButton === button && popover && !popover.hidden) hide();
        else show(button);
      }
      return;
    }
    if (activeButton && (!popover || !popover.contains(target as Node))) hide();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') hide();
  });
  window.addEventListener('scroll', scheduleViewportHide, { passive: true });
  window.addEventListener('resize', scheduleViewportHide, { passive: true });
  document.addEventListener('astro:before-swap', hide);
}
