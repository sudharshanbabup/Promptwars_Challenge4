import { useCallback } from 'react';
import { nextIndex, prevIndex, firstIndex, lastIndex } from '../lib/tablist.js';

/**
 * Custom hook managing roving tabIndex keyboard events for accessible tab lists.
 * Supports Left/Right/Home/End arrow controls.
 * 
 * @param {number} activeIndex - Currently selected tab index.
 * @param {(idx: number) => void} setActiveIndex - Set state method.
 * @param {number} tabsCount - Total number of visible tabs.
 * @returns {{ handleKeyDown: (e: React.KeyboardEvent) => void }} Key listener callback.
 */
export function useTablist(activeIndex, setActiveIndex, tabsCount) {
  const handleKeyDown = useCallback((e) => {
    let targetIndex = activeIndex;

    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        targetIndex = nextIndex(activeIndex, tabsCount);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        targetIndex = prevIndex(activeIndex, tabsCount);
        break;
      case 'Home':
        e.preventDefault();
        targetIndex = firstIndex();
        break;
      case 'End':
        e.preventDefault();
        targetIndex = lastIndex(tabsCount);
        break;
      default:
        return; // Ignore other keys
    }

    setActiveIndex(targetIndex);

    // Focus the newly active tab element
    setTimeout(() => {
      const tabElements = document.querySelectorAll('[role="tab"]');
      if (tabElements[targetIndex]) {
        tabElements[targetIndex].focus();
      }
    }, 0);
  }, [activeIndex, setActiveIndex, tabsCount]);

  return { handleKeyDown };
}
