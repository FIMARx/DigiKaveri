/**
 * DigiKaveri - Ultra-Premium Custom Select Component
 * 
 * Replaces default OS select popups with a glassmorphic, accessible,
 * and animated dropdown with custom Lucide icons for each topic option.
 * Preserves 100% two-way sync with native form handling, validity checks,
 * and the Price Estimator.
 */

import { createIcons } from 'lucide';
import { ICON_SET } from './icons.js';

// Map topic patterns to Lucide icons and badge accent colors
const TOPIC_ICON_MAP = [
  {
    pattern: /it-ongelma|apua|help|ongelma|problem/i,
    icon: 'Laptop',
    badgeClass: 'badge-blue'
  },
  {
    pattern: /seniori|omais|läheiselle|senior|relative|family/i,
    icon: 'HeartHandshake',
    badgeClass: 'badge-rose'
  },
  {
    pattern: /palaute|kokemus|feedback|review/i,
    icon: 'MessageCircle',
    badgeClass: 'badge-emerald'
  },
  {
    pattern: /yhteistyö|tarjous|collab|partner|business/i,
    icon: 'Briefcase',
    badgeClass: 'badge-amber'
  },
  {
    pattern: /muu|other|general/i,
    icon: 'Sparkles',
    badgeClass: 'badge-purple'
  }
];

function getOptionMeta(optionText) {
  for (const item of TOPIC_ICON_MAP) {
    if (item.pattern.test(optionText)) {
      return item;
    }
  }
  return { icon: 'HelpCircle', badgeClass: 'badge-blue' };
}

let selectCounter = 0;

/**
 * Enhances a native <select> element into a luxury custom dropdown
 * @param {HTMLSelectElement} nativeSelect - The native select element to upgrade
 * @returns {Object|null} Controller object or null
 */
export function initCustomSelect(nativeSelect) {
  if (!nativeSelect || nativeSelect.dataset.customSelectInitialized) {
    return null;
  }

  // Prevent multiple initializations
  nativeSelect.dataset.customSelectInitialized = "true";

  const selectId = nativeSelect.id || `custom-select-${++selectCounter}`;
  const menuId = `custom-select-menu-${selectId}`;
  const triggerId = `custom-select-trigger-${selectId}`;
  const isRequired = nativeSelect.required;
  const rawOptions = Array.from(nativeSelect.options);

  // Identify placeholder (first option if disabled or empty value)
  const hasPlaceholder = rawOptions.length > 0 && (rawOptions[0].disabled || rawOptions[0].value === "");
  const placeholderText = hasPlaceholder ? rawOptions[0].text : (nativeSelect.getAttribute('placeholder') || 'Valitse aihe...');

  // Create wrapper
  const wrapper = document.createElement('div');
  wrapper.className = 'custom-select-wrapper';

  // Insert wrapper right before native select and move native select inside it
  nativeSelect.parentNode.insertBefore(wrapper, nativeSelect);
  wrapper.appendChild(nativeSelect);

  // Keep native select in DOM for form submit & validation
  nativeSelect.classList.add('custom-select-native');
  nativeSelect.setAttribute('aria-hidden', 'true');

  nativeSelect.addEventListener('invalid', () => {
    wrapper.classList.add('is-invalid');
    trigger.classList.add('is-invalid');
  });

  nativeSelect.addEventListener('focus', () => {
    trigger.focus();
  });

  // Build trigger button
  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'custom-select-trigger';
  trigger.id = triggerId;
  trigger.setAttribute('role', 'combobox');
  trigger.setAttribute('aria-haspopup', 'listbox');
  trigger.setAttribute('aria-expanded', 'false');
  trigger.setAttribute('aria-controls', menuId);
  trigger.setAttribute('aria-label', nativeSelect.getAttribute('aria-label') || nativeSelect.title || placeholderText);

  // Build trigger content
  trigger.innerHTML = `
    <div class="custom-select-trigger-content">
      <span class="custom-select-trigger-icon hidden"></span>
      <span class="custom-select-trigger-text">${placeholderText}</span>
    </div>
    <div class="custom-select-trigger-actions">
      <span class="custom-select-trigger-success-icon" aria-hidden="true">
        <i data-lucide="check"></i>
      </span>
      <span class="custom-select-arrow" aria-hidden="true">
        <i data-lucide="chevron-down"></i>
      </span>
    </div>
  `;

  // Build floating dropdown menu
  const menu = document.createElement('div');
  menu.className = 'custom-select-menu';
  menu.id = menuId;
  menu.setAttribute('role', 'listbox');
  menu.setAttribute('aria-labelledby', triggerId);
  menu.tabIndex = -1;

  const menuList = document.createElement('div');
  menuList.className = 'custom-select-menu-list';

  // Generate option elements
  const optionElements = [];
  rawOptions.forEach((opt, index) => {
    // Skip empty placeholder option from list
    if (index === 0 && hasPlaceholder) return;

    const optValue = opt.value || opt.text;
    const meta = getOptionMeta(opt.text);

    const optionItem = document.createElement('div');
    optionItem.className = 'custom-select-option';
    optionItem.setAttribute('role', 'option');
    optionItem.setAttribute('data-value', optValue);
    optionItem.setAttribute('data-index', index.toString());
    optionItem.setAttribute('aria-selected', opt.selected ? 'true' : 'false');
    optionItem.tabIndex = -1;

    optionItem.innerHTML = `
      <div class="custom-select-option-content">
        <span class="custom-select-option-badge ${meta.badgeClass}">
          <i data-lucide="${meta.icon}" aria-hidden="true"></i>
        </span>
        <span class="custom-select-option-text">${opt.text}</span>
      </div>
      <span class="custom-select-option-check" aria-hidden="true">
        <i data-lucide="check"></i>
      </span>
    `;

    menuList.appendChild(optionItem);
    optionElements.push({ element: optionItem, index, value: optValue, text: opt.text, meta });
  });

  menu.appendChild(menuList);
  wrapper.appendChild(trigger);
  wrapper.appendChild(menu);

  // Render Lucide icons
  try {
    createIcons({ icons: ICON_SET, root: wrapper });
  } catch (e) {
    console.warn('Lucide icon render warning:', e);
  }

  let isOpen = false;
  let highlightedIndex = -1;

  // Open / Close functions
  const openMenu = () => {
    if (isOpen) return;
    isOpen = true;
    wrapper.classList.add('is-open');
    trigger.setAttribute('aria-expanded', 'true');
    menu.classList.add('is-open');

    // Highlight currently selected option or first option
    const activeItem = optionElements.find(item => item.index === nativeSelect.selectedIndex);
    if (activeItem) {
      setHighlighted(optionElements.indexOf(activeItem));
    } else if (optionElements.length > 0) {
      setHighlighted(0);
    }
  };

  const closeMenu = (focusTrigger = true) => {
    if (!isOpen) return;
    isOpen = false;
    wrapper.classList.remove('is-open');
    trigger.setAttribute('aria-expanded', 'false');
    menu.classList.remove('is-open');
    highlightedIndex = -1;
    optionElements.forEach(item => item.element.classList.remove('is-highlighted'));
    if (focusTrigger) {
      trigger.focus({ preventScroll: true });
    }
  };

  const toggleMenu = () => {
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  };

  const setHighlighted = (listIdx) => {
    if (listIdx < 0 || listIdx >= optionElements.length) return;
    highlightedIndex = listIdx;
    optionElements.forEach((item, idx) => {
      const isHl = idx === listIdx;
      item.element.classList.toggle('is-highlighted', isHl);
      if (isHl) {
        item.element.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    });
  };

  // Sync state to UI
  const syncFromNative = (notifyChange = false) => {
    const selIdx = nativeSelect.selectedIndex;
    const selectedOpt = rawOptions[selIdx];
    const triggerTextEl = trigger.querySelector('.custom-select-trigger-text');
    const triggerIconEl = trigger.querySelector('.custom-select-trigger-icon');

    if (selIdx > 0 && selectedOpt && selectedOpt.value !== "") {
      const meta = getOptionMeta(selectedOpt.text);
      triggerTextEl.textContent = selectedOpt.text;
      wrapper.classList.add('has-selection');

      // Update trigger icon
      triggerIconEl.innerHTML = `<i data-lucide="${meta.icon}"></i>`;
      triggerIconEl.className = `custom-select-trigger-icon ${meta.badgeClass}`;
      triggerIconEl.classList.remove('hidden');

      // Update options aria-selected & class
      optionElements.forEach(item => {
        const isSel = item.index === selIdx;
        item.element.setAttribute('aria-selected', isSel ? 'true' : 'false');
        item.element.classList.toggle('is-selected', isSel);
      });

      wrapper.classList.remove('is-invalid');
      trigger.classList.remove('is-invalid');
      nativeSelect.setCustomValidity("");

      // Update parent form-group validation state
      const formGroup = wrapper.closest('.form-group') || wrapper.closest('.input-group');
      if (formGroup) {
        formGroup.classList.add('has-success');
      }
    } else {
      // Revert to placeholder
      triggerTextEl.textContent = placeholderText;
      triggerIconEl.innerHTML = '';
      triggerIconEl.classList.add('hidden');
      wrapper.classList.remove('has-selection');

      optionElements.forEach(item => {
        item.element.setAttribute('aria-selected', 'false');
        item.element.classList.remove('is-selected');
      });

      const formGroup = wrapper.closest('.form-group') || wrapper.closest('.input-group');
      if (formGroup && isRequired) {
        formGroup.classList.remove('has-success');
      }
    }

    try {
      createIcons({ icons: ICON_SET, root: trigger });
    } catch (_) {}

    if (notifyChange) {
      nativeSelect.dispatchEvent(new Event('input', { bubbles: true }));
      nativeSelect.dispatchEvent(new Event('change', { bubbles: true }));
    }
  };

  // Select an option by its native index
  const selectByIndex = (index) => {
    if (index < 0 || index >= rawOptions.length) return;
    nativeSelect.selectedIndex = index;
    syncFromNative(true);
    closeMenu(true);
  };

  // Trigger click
  trigger.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleMenu();
  });

  // Options click & hover
  optionElements.forEach((item, idx) => {
    item.element.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      selectByIndex(item.index);
    });

    item.element.addEventListener('mouseenter', () => {
      setHighlighted(idx);
    });
  });

  // Keyboard navigation on trigger and menu
  trigger.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (!isOpen) {
          openMenu();
        } else if (highlightedIndex >= 0 && highlightedIndex < optionElements.length) {
          selectByIndex(optionElements[highlightedIndex].index);
        } else {
          closeMenu();
        }
        break;

      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          openMenu();
        } else {
          const next = highlightedIndex < optionElements.length - 1 ? highlightedIndex + 1 : 0;
          setHighlighted(next);
        }
        break;

      case 'ArrowUp':
        e.preventDefault();
        if (!isOpen) {
          openMenu();
        } else {
          const prev = highlightedIndex > 0 ? highlightedIndex - 1 : optionElements.length - 1;
          setHighlighted(prev);
        }
        break;

      case 'Home':
        if (isOpen) {
          e.preventDefault();
          setHighlighted(0);
        }
        break;

      case 'End':
        if (isOpen) {
          e.preventDefault();
          setHighlighted(optionElements.length - 1);
        }
        break;

      case 'Escape':
        if (isOpen) {
          e.preventDefault();
          closeMenu(true);
        }
        break;

      case 'Tab':
        if (isOpen) {
          closeMenu(false);
        }
        break;

      default:
        // Type-to-jump (quick letter jump)
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          const searchChar = e.key.toLowerCase();
          const matchIdx = optionElements.findIndex(
            (item, idx) => idx > highlightedIndex && item.text.trim().toLowerCase().startsWith(searchChar)
          );
          const fallbackIdx = optionElements.findIndex(
            (item) => item.text.trim().toLowerCase().startsWith(searchChar)
          );
          const targetIdx = matchIdx !== -1 ? matchIdx : fallbackIdx;
          if (targetIdx !== -1) {
            if (!isOpen) openMenu();
            setHighlighted(targetIdx);
          }
        }
        break;
    }
  });

  // Close on outside click
  const handleOutsideClick = (e) => {
    if (!wrapper.contains(e.target)) {
      closeMenu(false);
    }
  };
  document.addEventListener('click', handleOutsideClick);

  // Sync when native select is modified programmatically (e.g. by estimator.js)
  nativeSelect.addEventListener('change', () => {
    syncFromNative(false);
  });

  // Sync on form reset
  const parentForm = nativeSelect.closest('form');
  if (parentForm) {
    parentForm.addEventListener('reset', () => {
      setTimeout(() => {
        syncFromNative(false);
      }, 10);
    });
  }

  // Initial sync
  syncFromNative(false);

  return {
    wrapper,
    trigger,
    menu,
    open: openMenu,
    close: closeMenu,
    sync: syncFromNative,
    destroy: () => {
      document.removeEventListener('click', handleOutsideClick);
      wrapper.replaceWith(nativeSelect);
      nativeSelect.classList.remove('custom-select-native');
      nativeSelect.removeAttribute('aria-hidden');
      delete nativeSelect.dataset.customSelectInitialized;
    }
  };
}
