// State Management
let currentPalette = null;
let lockedColors = [false, false, false, false, false, false]; // true if locked
let filteredPalettes = [];
let favorites = [];
let history = [];
let activeTab = 'explorer';
let currentExportFormat = 'css';

// Virtual Scroll State
let viewportElement = null;
let runwayElement = null;
let contentElement = null;
let cardHeight = 240;
let cardGap = 24;
let rowHeight = cardHeight + cardGap;
let columnsCount = 4;
let visibleIndices = { start: 0, end: 0 };
let searchDebounceTimeout = null;

// Sandbox Color Mapping States (maps active palette color index to theme role)
let themeMapping = {
  bg: 0,
  surface: 1,
  primary: 2,
  secondary: 3,
  accent: 4,
  text: 5
};

// Initialize Application
window.addEventListener('DOMContentLoaded', () => {
  // Load State from LocalStorage
  loadFromStorage();
  
  // Set initial active palette from first item
  if (window.premiumPalettes && window.premiumPalettes.length > 0) {
    setActivePalette(window.premiumPalettes[0]);
  }

  // Set up elements
  viewportElement = document.getElementById('virtual-viewport');
  runwayElement = document.getElementById('virtual-runway');
  contentElement = document.getElementById('virtual-content');

  // Populate Filter Selectors
  populateFilters();

  // Initial Filter Apply
  applyFilters();

  // Scroll and Resize Event Listeners for Virtual Scroll
  if (viewportElement) {
    viewportElement.addEventListener('scroll', handleViewportScroll);
  }
  window.addEventListener('resize', handleWindowResize);

  // Setup other UI Event Listeners
  setupEventListeners();

  // Trigger default sandbox mapping
  resetDefaultMapping();
});

// Load and Save Storage
function loadFromStorage() {
  try {
    favorites = JSON.parse(localStorage.getItem('aura_favorites')) || [];
    history = JSON.parse(localStorage.getItem('aura_history')) || [];
  } catch (e) {
    favorites = [];
    history = [];
  }
}

function saveToStorage() {
  localStorage.setItem('aura_favorites', JSON.stringify(favorites));
  localStorage.setItem('aura_history', JSON.stringify(history));
}

// Populators for filter sidebar
function populateFilters() {
  const moodSelect = document.getElementById('mood-select');
  if (moodSelect && window.paletteMoods) {
    window.paletteMoods.forEach(mood => {
      const opt = document.createElement('option');
      opt.value = mood;
      opt.textContent = mood;
      moodSelect.appendChild(opt);
    });
  }

  const categoryList = document.getElementById('category-filter-list');
  if (categoryList && window.paletteCategories) {
    // Count items per category
    const counts = {};
    window.premiumPalettes.forEach(p => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });

    // Add 'All' badge
    const allBtn = document.createElement('button');
    allBtn.className = 'category-item active';
    allBtn.dataset.category = 'All';
    allBtn.innerHTML = `All Categories <span class="category-count">${window.premiumPalettes.length}</span>`;
    allBtn.onclick = () => selectCategoryFilter(allBtn);
    categoryList.appendChild(allBtn);

    window.paletteCategories.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = 'category-item';
      btn.dataset.category = cat;
      btn.innerHTML = `${cat} <span class="category-count">${counts[cat] || 0}</span>`;
      btn.onclick = () => selectCategoryFilter(btn);
      categoryList.appendChild(btn);
    });
  }
}

let activeCategoryFilter = 'All';
function selectCategoryFilter(element) {
  document.querySelectorAll('.category-item').forEach(el => el.classList.remove('active'));
  element.classList.add('active');
  activeCategoryFilter = element.dataset.category;
  applyFilters();
}

// Event Listeners setup
function setupEventListeners() {
  // Search Input
  const searchInput = document.getElementById('search-input');
  const clearSearchBtn = document.getElementById('clear-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      if (clearSearchBtn) {
        clearSearchBtn.style.display = e.target.value ? 'block' : 'none';
      }
      clearTimeout(searchDebounceTimeout);
      searchDebounceTimeout = setTimeout(() => {
        applyFilters();
      }, 150);
    });
  }

  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      searchInput.value = '';
      clearSearchBtn.style.display = 'none';
      applyFilters();
    });
  }

  // Filter tags (Luminance, temp)
  document.querySelectorAll('.filter-tag').forEach(tag => {
    tag.addEventListener('click', () => {
      tag.classList.toggle('active');
      applyFilters();
    });
  });

  // Mood select
  const moodSelect = document.getElementById('mood-select');
  if (moodSelect) {
    moodSelect.addEventListener('change', () => {
      applyFilters();
    });
  }

  // Sort select
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      applyFilters();
    });
  }

  // Action triggers
  document.getElementById('btn-generate-random').addEventListener('click', generateRandomPalette);
  document.getElementById('btn-shuffle-current').addEventListener('click', shuffleCurrentPalette);
  
  const stripFavBtn = document.getElementById('strip-btn-fav');
  if (stripFavBtn) {
    stripFavBtn.addEventListener('click', () => {
      toggleFavorite(currentPalette);
      updateActiveStripUI();
    });
  }

  const stripCopyAllBtn = document.getElementById('strip-btn-copy-all');
  if (stripCopyAllBtn) {
    stripCopyAllBtn.addEventListener('click', () => {
      copyToClipboard(currentPalette.colors.join(', '), 'Entire Palette Copied!');
    });
  }

  const stripApplyBtn = document.getElementById('strip-btn-apply');
  if (stripApplyBtn) {
    stripApplyBtn.addEventListener('click', () => {
      applyPaletteToSandbox();
      showToast('Palette applied to Live Sandbox canvas!');
    });
  }

  // Sandbox randomizer
  const sandboxRandBtn = document.getElementById('sandbox-btn-rand');
  if (sandboxRandBtn) {
    sandboxRandBtn.addEventListener('click', () => {
      const randPalette = window.premiumPalettes[Math.floor(Math.random() * window.premiumPalettes.length)];
      setActivePalette(randPalette);
      applyPaletteToSandbox();
    });
  }

  // Setup Sandbox Mapping dropdown options
  const selectors = document.querySelectorAll('.map-selector');
  selectors.forEach(sel => {
    sel.addEventListener('change', (e) => {
      const role = e.target.id.replace('map-', '');
      themeMapping[role] = parseInt(e.target.value);
      applyPaletteToSandbox();
    });
  });

  // Copy Export Action button
  const copyExportBtn = document.getElementById('btn-copy-export');
  if (copyExportBtn) {
    copyExportBtn.addEventListener('click', () => {
      const code = document.getElementById('export-code-box').textContent;
      copyToClipboard(code, 'Export code copied to clipboard!');
    });
  }

  const downloadExportBtn = document.getElementById('btn-download-export');
  if (downloadExportBtn) {
    downloadExportBtn.addEventListener('click', triggerAssetDownload);
  }
}

// Set Active Palette
function setActivePalette(palette) {
  currentPalette = palette;
  
  // Reset locks if color count changes
  if (currentPalette.colors.length !== lockedColors.length) {
    lockedColors = new Array(currentPalette.colors.length).fill(false);
  }

  // Update strip details
  document.getElementById('active-palette-name').textContent = palette.name;
  document.getElementById('active-palette-cat').textContent = palette.category;
  document.getElementById('active-palette-mood').textContent = palette.mood;

  // Add to history list (avoiding immediate repeats)
  if (history.length === 0 || history[0].id !== palette.id) {
    history.unshift({
      ...palette,
      timestamp: Date.now()
    });
    // Cap at 100
    if (history.length > 100) history.pop();
    saveToStorage();
    renderHistory();
  }

  updateActiveStripUI();
  applyPaletteToSandbox();
}

function updateActiveStripUI() {
  const container = document.getElementById('active-color-blocks');
  if (!container) return;
  container.innerHTML = '';

  const stripFavBtn = document.getElementById('strip-btn-fav');
  if (stripFavBtn) {
    const isFav = favorites.some(p => p.id === currentPalette.id);
    if (isFav) {
      stripFavBtn.classList.add('active');
    } else {
      stripFavBtn.classList.remove('active');
    }
  }

  currentPalette.colors.forEach((color, idx) => {
    const isLocked = lockedColors[idx];
    const block = document.createElement('div');
    block.className = `color-strip-block ${isLocked ? 'locked' : ''}`;
    block.style.backgroundColor = color;
    block.style.color = getContrastText(color);

    block.innerHTML = `
      <div class="strip-lock-indicator" onclick="toggleColorLock(event, ${idx})">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          ${isLocked ? '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>' : '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/>'}
        </svg>
      </div>
      <span>${color}</span>
    `;

    // Click to copy color code
    block.onclick = (e) => {
      if (e.target.closest('.strip-lock-indicator')) return;
      copyToClipboard(color, `Color ${color} copied!`);
    };

    container.appendChild(block);
  });

  // Re-populate mapping choices in sandbox
  populateMappingSelectors();
}

function toggleColorLock(event, index) {
  event.stopPropagation();
  lockedColors[index] = !lockedColors[index];
  updateActiveStripUI();
}

// Generate Random Palette from 100k DB
function generateRandomPalette() {
  // Select a completely random index in window.premiumPalettes
  const idx = Math.floor(Math.random() * window.premiumPalettes.length);
  const basePalette = window.premiumPalettes[idx];
  
  // Blend with locked colors if any are locked
  const mergedColors = [...basePalette.colors];
  
  // Make sure size is correct
  const finalSize = currentPalette ? currentPalette.colors.length : mergedColors.length;
  
  let hasLocked = false;
  for (let i = 0; i < finalSize; i++) {
    if (lockedColors[i] && currentPalette && currentPalette.colors[i]) {
      mergedColors[i] = currentPalette.colors[i];
      hasLocked = true;
    }
  }

  // Create a customized palette object if locked items exist
  const finalPalette = hasLocked ? {
    id: 999999 + Math.floor(Math.random() * 10000), // temp ID
    name: `Custom ${basePalette.name}`,
    category: basePalette.category,
    mood: basePalette.mood,
    colors: mergedColors.slice(0, finalSize)
  } : basePalette;

  setActivePalette(finalPalette);
  showToast('New Palette Generated!');
}

// Shuffle current palette colors (keeping locked ones intact)
function shuffleCurrentPalette() {
  if (!currentPalette) return;

  const shuffledColors = [...currentPalette.colors];
  // Simple shuffle algorithm for unlocked colors
  const unlockedIndices = [];
  for (let i = 0; i < shuffledColors.length; i++) {
    if (!lockedColors[i]) unlockedIndices.push(i);
  }

  // Shuffle the values at those indices
  const values = unlockedIndices.map(idx => shuffledColors[idx]);
  // Fisher-Yates
  for (let i = values.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [values[i], values[j]] = [values[j], values[i]];
  }

  unlockedIndices.forEach((origIdx, sliceIdx) => {
    shuffledColors[origIdx] = values[sliceIdx];
  });

  const finalPalette = {
    ...currentPalette,
    id: currentPalette.id > 100000 ? currentPalette.id : 999999 + Math.floor(Math.random() * 10000),
    name: currentPalette.name.startsWith("Shuffled") ? currentPalette.name : `Shuffled ${currentPalette.name}`,
    colors: shuffledColors
  };

  setActivePalette(finalPalette);
  showToast('Colors Shuffled!');
}

// Advanced Filters application
function applyFilters() {
  const t0 = performance.now();
  const searchInput = document.getElementById('search-input');
  const searchVal = searchInput ? searchInput.value.toLowerCase().trim() : '';

  // Active filter tags (Light, Dark, Warm, Cool, Vibrant, Muted, Pastel, Monochrome)
  const activeTags = [];
  document.querySelectorAll('.filter-tag.active').forEach(tag => {
    activeTags.push(tag.dataset.filter);
  });

  // Mood selector
  const moodSelect = document.getElementById('mood-select');
  const moodFilter = moodSelect ? moodSelect.value : 'All';

  // Filter algorithm
  filteredPalettes = window.premiumPalettes.filter(p => {
    // 1. Category Filter
    if (activeCategoryFilter !== 'All' && p.category !== activeCategoryFilter) {
      return false;
    }

    // 2. Mood Filter
    if (moodFilter !== 'All' && p.mood !== moodFilter) {
      return false;
    }

    // 3. Search text
    if (searchVal) {
      const matchName = p.name.toLowerCase().includes(searchVal);
      const matchCat = p.category.toLowerCase().includes(searchVal);
      const matchMood = p.mood.toLowerCase().includes(searchVal);
      const matchHex = p.colors.some(c => c.toLowerCase().includes(searchVal));
      if (!matchName && !matchCat && !matchMood && !matchHex) {
        return false;
      }
    }

    // 4. Color attribute tags
    if (activeTags.length > 0) {
      return activeTags.every(tag => {
        switch (tag) {
          case 'Light':
            // Average lightness > 70%
            return getAverageLightness(p.colors) > 65;
          case 'Dark':
            // Average lightness < 35%
            return getAverageLightness(p.colors) < 35;
          case 'Warm':
            // Mostly warm hues (0-60, 300-360)
            return getWarmPercent(p.colors) > 60;
          case 'Cool':
            // Mostly cool hues (90-270)
            return getCoolPercent(p.colors) > 60;
          case 'Vibrant':
            // Average saturation > 60%
            return getAverageSaturation(p.colors) > 60;
          case 'Muted':
            // Average saturation < 30%
            return getAverageSaturation(p.colors) < 35;
          case 'Pastel':
            // High lightness, moderate saturation
            return getAverageLightness(p.colors) > 75 && getAverageSaturation(p.colors) < 50;
          case 'Monochrome':
            // Standard deviation of hues is very small
            return getHueVariance(p.colors) < 15;
          default:
            return true;
        }
      });
    }

    return true;
  });

  // Sorting
  const sortSelect = document.getElementById('sort-select');
  const sortBy = sortSelect ? sortSelect.value : 'id-asc';
  
  if (sortBy === 'id-desc') {
    filteredPalettes.sort((a, b) => b.id - a.id);
  } else if (sortBy === 'name-asc') {
    filteredPalettes.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    // default id-asc
    filteredPalettes.sort((a, b) => a.id - a.id);
  }

  // Update total count indicator
  const resultsCount = document.getElementById('results-count');
  if (resultsCount) {
    resultsCount.textContent = `Showing ${filteredPalettes.length.toLocaleString()} palettes`;
  }

  const t1 = performance.now();
  console.log(`Filtered down to ${filteredPalettes.length} in ${(t1 - t0).toFixed(2)}ms`);

  // Reset viewport scroll top and redraw virtual list
  if (viewportElement) {
    viewportElement.scrollTop = 0;
  }
  recalculateVirtualScrollLayout();
}

// Color Utility Metrics for filter calculations
function getAverageLightness(colors) {
  let sum = 0;
  colors.forEach(hex => {
    const [h, s, l] = hexToHslValues(hex);
    sum += l;
  });
  return sum / colors.length;
}

function getAverageSaturation(colors) {
  let sum = 0;
  colors.forEach(hex => {
    const [h, s, l] = hexToHslValues(hex);
    sum += s;
  });
  return sum / colors.length;
}

function getWarmPercent(colors) {
  let warmCount = 0;
  colors.forEach(hex => {
    const [h, s, l] = hexToHslValues(hex);
    // Warm hues: Red to Yellow (0-75) and Magenta (300-360)
    if (h <= 75 || h >= 300) warmCount++;
  });
  return (warmCount / colors.length) * 100;
}

function getCoolPercent(colors) {
  let coolCount = 0;
  colors.forEach(hex => {
    const [h, s, l] = hexToHslValues(hex);
    // Cool hues: Green to Blue/Indigo (90-270)
    if (h >= 90 && h <= 270) coolCount++;
  });
  return (coolCount / colors.length) * 100;
}

function getHueVariance(colors) {
  const hues = colors.map(hex => hexToHslValues(hex)[0]);
  const avg = hues.reduce((a, b) => a + b, 0) / hues.length;
  // Variance
  const sqDiff = hues.map(h => Math.pow(h - avg, 2));
  const avgSqDiff = sqDiff.reduce((a, b) => a + b, 0) / sqDiff.length;
  return Math.sqrt(avgSqDiff); // Std Dev
}

// Dynamic Virtual Scroll layout computation
function handleViewportScroll() {
  renderVisibleCards();
}

function handleWindowResize() {
  recalculateVirtualScrollLayout();
}

function recalculateVirtualScrollLayout() {
  if (!viewportElement || !runwayElement || !contentElement) return;

  const width = viewportElement.clientWidth;
  
  // Responsive Columns count
  if (width >= 1200) {
    columnsCount = 4;
  } else if (width >= 900) {
    columnsCount = 3;
  } else if (width >= 600) {
    columnsCount = 2;
  } else {
    columnsCount = 1;
  }

  // Calculate row details
  const totalRows = Math.ceil(filteredPalettes.length / columnsCount);
  const runwayHeight = totalRows * rowHeight;
  
  runwayElement.style.height = `${runwayHeight}px`;

  renderVisibleCards();
}

// Render only the visible viewport elements
function renderVisibleCards() {
  if (!viewportElement || !contentElement) return;

  const scrollTop = viewportElement.scrollTop;
  const viewportHeight = viewportElement.clientHeight;

  // Row Indices visible
  const startRow = Math.max(0, Math.floor(scrollTop / rowHeight) - 1);
  const endRow = Math.min(Math.ceil(runwayElement.clientHeight / rowHeight), Math.ceil((scrollTop + viewportHeight) / rowHeight) + 1);

  const startIndex = startRow * columnsCount;
  const endIndex = Math.min(filteredPalettes.length, endRow * columnsCount);

  // Clear existing items if out of range, or build diff
  contentElement.innerHTML = '';

  const viewportWidth = contentElement.clientWidth;
  const gap = cardGap;
  const colWidth = (viewportWidth - (columnsCount - 1) * gap) / columnsCount;

  for (let i = startIndex; i < endIndex; i++) {
    const palette = filteredPalettes[i];
    if (!palette) continue;

    const card = createPaletteCardNode(palette);
    
    // Position card absolutely inside container
    const colIdx = i % columnsCount;
    const rowIdx = Math.floor(i / columnsCount);

    card.style.position = 'absolute';
    card.style.width = `${colWidth}px`;
    card.style.left = `${colIdx * (colWidth + gap)}px`;
    card.style.top = `${rowIdx * rowHeight}px`;

    contentElement.appendChild(card);
  }
}

// Helper to construct a Palette Display Card DOM Node
function createPaletteCardNode(palette) {
  const card = document.createElement('div');
  card.className = 'palette-card';
  card.dataset.id = palette.id;

  // Active indicator glow border
  const isActive = currentPalette && currentPalette.id === palette.id;
  if (isActive) {
    card.style.borderColor = 'var(--primary)';
    card.style.boxShadow = '0 8px 30px rgba(99, 102, 241, 0.2)';
  }

  // 1. Color blocks row
  const colorsRow = document.createElement('div');
  colorsRow.className = 'palette-card-colors';
  
  palette.colors.forEach((color, idx) => {
    const block = document.createElement('div');
    block.className = 'card-color-block';
    block.style.backgroundColor = color;
    
    // Mini buttons inside colors
    const actions = document.createElement('div');
    actions.className = 'card-color-actions';
    
    const copyBtn = document.createElement('button');
    copyBtn.className = 'card-color-btn';
    copyBtn.title = 'Copy HEX';
    copyBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
    copyBtn.onclick = (e) => {
      e.stopPropagation();
      copyToClipboard(color, `HEX ${color} Copied!`);
    };

    const expBtn = document.createElement('button');
    expBtn.className = 'card-color-btn';
    expBtn.title = 'Analyze Color';
    expBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>';
    expBtn.onclick = (e) => {
      e.stopPropagation();
      openAnalyzerModal(color);
    };

    actions.appendChild(copyBtn);
    actions.appendChild(expBtn);
    block.appendChild(actions);

    // Clicking color block selects palette
    block.onclick = (e) => {
      if (e.target.closest('.card-color-btn')) return;
      setActivePalette(palette);
      recalculateVirtualScrollLayout();
    };

    colorsRow.appendChild(block);
  });

  // 2. Info area
  const body = document.createElement('div');
  body.className = 'palette-card-body';
  
  const meta = document.createElement('div');
  meta.className = 'palette-card-meta';
  
  const title = document.createElement('h4');
  title.className = 'palette-card-title';
  title.textContent = palette.name;
  title.onclick = () => {
    setActivePalette(palette);
    recalculateVirtualScrollLayout();
  };

  const badges = document.createElement('div');
  badges.className = 'palette-card-badges';
  badges.innerHTML = `
    <span class="card-badge">${palette.category}</span>
    <span class="card-badge" style="background: rgba(139,92,246,0.08); color: #c084fc;">${palette.mood}</span>
  `;

  meta.appendChild(title);
  meta.appendChild(badges);
  body.appendChild(meta);

  // 3. Card footer
  const footer = document.createElement('div');
  footer.className = 'palette-card-footer';
  
  const isFav = favorites.some(p => p.id === palette.id);
  const likeBtn = document.createElement('button');
  likeBtn.className = `like-btn ${isFav ? 'liked' : ''}`;
  likeBtn.innerHTML = `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
    <span>${isFav ? 'Liked' : 'Like'}</span>
  `;
  likeBtn.onclick = (e) => {
    e.stopPropagation();
    toggleFavorite(palette);
    likeBtn.classList.toggle('liked');
    likeBtn.querySelector('span').textContent = likeBtn.classList.contains('liked') ? 'Liked' : 'Like';
    if (activeTab === 'studio') renderFavorites();
  };

  const actions = document.createElement('div');
  actions.className = 'action-menu';

  const previewBtn = document.createElement('button');
  previewBtn.className = 'card-action-btn';
  previewBtn.title = 'Apply Theme Preview';
  previewBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>';
  previewBtn.onclick = (e) => {
    e.stopPropagation();
    setActivePalette(palette);
    applyPaletteToSandbox();
    showToast('Applied to sandbox frame!');
  };

  const exportBtn = document.createElement('button');
  exportBtn.className = 'card-action-btn';
  exportBtn.title = 'Export Options';
  exportBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>';
  exportBtn.onclick = (e) => {
    e.stopPropagation();
    setActivePalette(palette);
    openExportModalCurrent();
  };

  actions.appendChild(previewBtn);
  actions.appendChild(exportBtn);
  
  footer.appendChild(likeBtn);
  footer.appendChild(actions);
  body.appendChild(footer);

  card.appendChild(colorsRow);
  card.appendChild(body);

  return card;
}

// Favorite list handlers
function toggleFavorite(palette) {
  const idx = favorites.findIndex(p => p.id === palette.id);
  if (idx > -1) {
    favorites.splice(idx, 1);
    showToast('Removed from Favorites');
  } else {
    favorites.push(palette);
    showToast('Added to Favorites!');
  }
  saveToStorage();
  if (activeTab === 'studio') renderFavorites();
}

function clearFavorites() {
  if (confirm('Are you sure you want to remove all saved favorites?')) {
    favorites = [];
    saveToStorage();
    renderFavorites();
    showToast('Favorites cleared');
  }
}

// History list handlers
function clearHistory() {
  history = [];
  saveToStorage();
  renderHistory();
  showToast('History cleared');
}

// Render Studio Favorites
function renderFavorites() {
  const container = document.getElementById('favorites-grid');
  if (!container) return;
  container.innerHTML = '';

  if (favorites.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        <p>No favorites saved yet. Click the heart icon on any palette to keep it here!</p>
      </div>
    `;
    return;
  }

  favorites.forEach(p => {
    const card = createPaletteCardNode(p);
    // Override absolute sizing in static grid
    card.style.position = 'relative';
    card.style.width = '100%';
    card.style.left = '0';
    card.style.top = '0';
    container.appendChild(card);
  });
}

// Render Studio History list
function renderHistory() {
  const container = document.getElementById('history-list');
  if (!container) return;
  container.innerHTML = '';

  if (history.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        <p>No history available. Start browsing or generating palettes to track details.</p>
      </div>
    `;
    return;
  }

  history.forEach((p, idx) => {
    const item = document.createElement('div');
    item.className = 'history-item';
    
    // format timestamp
    const dateStr = p.timestamp ? new Date(p.timestamp).toLocaleTimeString() : 'Recent';

    const colorBlocks = p.colors.map(color => `
      <span class="history-color-dot" style="background-color: ${color};" title="${color}"></span>
    `).join('');

    item.innerHTML = `
      <div class="history-info">
        <span class="history-time">${dateStr}</span>
        <span class="history-name">${p.name}</span>
        <div class="history-colors">${colorBlocks}</div>
      </div>
      <div class="history-actions">
        <button class="btn btn-secondary btn-sm" onclick="restoreHistoryItem(${idx})">Restore</button>
        <button class="btn btn-secondary btn-sm" style="color: #ef4444;" onclick="deleteHistoryItem(${idx})">Delete</button>
      </div>
    `;

    container.appendChild(item);
  });
}

function restoreHistoryItem(index) {
  const palette = history[index];
  if (palette) {
    setActivePalette(palette);
    showToast(`Restored: ${palette.name}`);
  }
}

function deleteHistoryItem(index) {
  history.splice(index, 1);
  saveToStorage();
  renderHistory();
  showToast('History item removed');
}

// Tab switcher logic
function switchTab(tabId) {
  activeTab = tabId;
  document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.tab-pane').forEach(el => el.classList.remove('active'));

  document.getElementById(`nav-btn-${tabId}`).classList.add('active');
  document.getElementById(`tab-${tabId}`).classList.add('active');

  if (tabId === 'studio') {
    renderFavorites();
    renderHistory();
  } else if (tabId === 'explorer') {
    // Redraw virtual grid
    setTimeout(recalculateVirtualScrollLayout, 50);
  }
}

// Sandbox Color Mapping logic
function resetDefaultMapping() {
  themeMapping = {
    bg: 0,
    surface: 1,
    primary: 2,
    secondary: 3,
    accent: 4,
    text: 5
  };
  populateMappingSelectors();
  applyPaletteToSandbox();
}

function populateMappingSelectors() {
  const selectors = document.querySelectorAll('.map-selector');
  if (!selectors.length || !currentPalette) return;

  selectors.forEach(sel => {
    const role = sel.id.replace('map-', '');
    const currentVal = themeMapping[role];
    sel.innerHTML = '';

    currentPalette.colors.forEach((color, idx) => {
      const opt = document.createElement('option');
      opt.value = idx;
      opt.textContent = `Color ${idx + 1} (${color})`;
      if (idx === currentVal) {
        opt.selected = true;
      }
      sel.appendChild(opt);
    });
  });
}

function applyPaletteToSandbox() {
  if (!currentPalette) return;

  const wrapper = document.getElementById('sandbox-current-blocks');
  if (wrapper) {
    wrapper.innerHTML = '';
    currentPalette.colors.forEach(color => {
      const pill = document.createElement('span');
      pill.className = 'sandbox-color-pill';
      pill.style.backgroundColor = color;
      pill.title = color;
      pill.onclick = () => openAnalyzerModal(color);
      wrapper.appendChild(pill);
    });
  }

  // Resolve mapping
  const c = currentPalette.colors;
  const bg = c[themeMapping.bg] || c[0];
  const surface = c[themeMapping.surface] || c[1] || c[0];
  const primary = c[themeMapping.primary] || c[2] || c[0];
  const secondary = c[themeMapping.secondary] || c[3] || c[0];
  const accent = c[themeMapping.accent] || c[4] || c[0];
  const text = c[themeMapping.text] || c[5] || c[0];

  // Set mockup variables
  const mockup = document.getElementById('mockup-viewport');
  if (mockup) {
    mockup.style.setProperty('--preview-bg', bg);
    mockup.style.setProperty('--preview-surface', surface);
    mockup.style.setProperty('--preview-primary', primary);
    mockup.style.setProperty('--preview-secondary', secondary);
    mockup.style.setProperty('--preview-accent', accent);
    mockup.style.setProperty('--preview-text', text);
  }
}

function applyPaletteToSandboxSpecific(colors) {
  const mockup = document.getElementById('mockup-viewport');
  if (mockup) {
    mockup.style.setProperty('--preview-bg', colors[0]);
    mockup.style.setProperty('--preview-surface', colors[1]);
    mockup.style.setProperty('--preview-primary', colors[2]);
    mockup.style.setProperty('--preview-secondary', colors[3]);
    mockup.style.setProperty('--preview-accent', colors[4]);
    mockup.style.setProperty('--preview-text', colors[5] || colors[0]);
  }
}

// Copy Code Clipboard helper
function copyToClipboard(text, successMsg) {
  navigator.clipboard.writeText(text).then(() => {
    showToast(successMsg);
  }).catch(() => {
    // Fallback
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      showToast(successMsg);
    } catch (err) {
      showToast('Copy failed!');
    }
    document.body.removeChild(textarea);
  });
}

// Custom Toast notification system
function showToast(message) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <span class="toast-success-icon">✓</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  // Slide-out and remove
  setTimeout(() => {
    toast.style.animation = 'toast-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) reverse forwards';
    setTimeout(() => {
      if (toast.parentNode) {
        container.removeChild(toast);
      }
    }, 300);
  }, 2200);
}

// --- COLOR SPACE CONVERTER & ANALYSIS Drawer ---
function openAnalyzerModal(hexColor) {
  const modal = document.getElementById('analyzer-modal');
  if (!modal) return;

  modal.classList.add('active');

  // Convert Color Space Values
  const rgb = hexToRgbValues(hexColor);
  const hsl = hexToHslValues(hexColor);
  const hsv = hexToHsvValues(hexColor);
  const cmyk = hexToCmykValues(hexColor);
  const xyz = rgbToXyz(rgb[0], rgb[1], rgb[2]);
  const lab = xyzToLab(xyz[0], xyz[1], xyz[2]);
  const lch = labToLch(lab[0], lab[1], lab[2]);
  const oklab = rgbToOklab(rgb[0], rgb[1], rgb[2]);
  const oklch = oklabToOklch(oklab[0], oklab[1], oklab[2]);

  // Accessibility Scoring (WCAG check against dark layout background)
  const contrastWithBg = calculateContrastRatio(hexColor, '#0B0F19');
  const contrastWithWhite = calculateContrastRatio(hexColor, '#FFFFFF');
  const contrastWithDark = calculateContrastRatio(hexColor, '#111827');
  
  // Choose best background contrast for preview block label
  const darkLuminance = calculateRelativeLuminance('#0B0F19');
  const colorLuminance = calculateRelativeLuminance(hexColor);
  const passAA = contrastWithBg >= 4.5;
  const passAAA = contrastWithBg >= 7.0;

  // Header Details
  document.getElementById('analyzer-title-hex').textContent = hexColor.toUpperCase();
  const previewBg = document.getElementById('analyzer-preview-bg');
  previewBg.style.backgroundColor = hexColor;
  previewBg.style.color = colorLuminance > 0.5 ? '#111827' : '#FFFFFF';

  document.getElementById('analyzer-contrast-label').textContent = `Contrast (vs Bg): ${contrastWithBg.toFixed(2)}:1`;
  const wcagBadge = document.getElementById('analyzer-wcag-badge');
  if (passAAA) {
    wcagBadge.textContent = 'WCAG AAA PASS';
    wcagBadge.className = 'accessibility-pill';
  } else if (passAA) {
    wcagBadge.textContent = 'WCAG AA PASS';
    wcagBadge.className = 'accessibility-pill';
  } else {
    wcagBadge.textContent = 'WCAG FAIL (Normal Text)';
    wcagBadge.className = 'accessibility-pill fail';
  }

  // Previews panel
  const borderDemo = document.getElementById('preview-border-demo');
  borderDemo.style.borderColor = hexColor;

  const textDemo = document.getElementById('preview-text-demo');
  textDemo.querySelector('.demo-text-primary').style.color = hexColor;
  textDemo.querySelector('.demo-text-secondary').style.color = hexColor;

  const btnSolid = document.getElementById('demo-btn-solid');
  btnSolid.style.backgroundColor = hexColor;
  btnSolid.style.color = colorLuminance > 0.5 ? '#000000' : '#FFFFFF';

  const btnOutline = document.getElementById('demo-btn-outline');
  btnOutline.style.borderColor = hexColor;
  btnOutline.style.color = hexColor;

  // Readability grids
  const smallTextScore = document.getElementById('wcag-small-text');
  if (contrastWithBg >= 4.5) {
    smallTextScore.textContent = 'PASS (AA)';
    smallTextScore.className = '';
    if (contrastWithBg >= 7.0) smallTextScore.textContent = 'PASS (AAA)';
  } else {
    smallTextScore.textContent = 'FAIL';
    smallTextScore.className = 'fail';
  }

  const largeTextScore = document.getElementById('wcag-large-text');
  if (contrastWithBg >= 3.0) {
    largeTextScore.textContent = 'PASS (AA)';
    largeTextScore.className = '';
    if (contrastWithBg >= 4.5) largeTextScore.textContent = 'PASS (AAA)';
  } else {
    largeTextScore.textContent = 'FAIL';
    largeTextScore.className = 'fail';
  }

  const uiElementsScore = document.getElementById('wcag-ui-elements');
  if (contrastWithBg >= 3.0) {
    uiElementsScore.textContent = 'PASS';
    uiElementsScore.className = '';
  } else {
    uiElementsScore.textContent = 'FAIL';
    uiElementsScore.className = 'fail';
  }

  // Populate conversions list
  const formatsGrid = document.getElementById('conversion-formats-grid');
  formatsGrid.innerHTML = '';

  const formatList = [
    { label: 'HEX', val: hexColor.toUpperCase() },
    { label: 'RGB', val: `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})` },
    { label: 'RGBA', val: `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 1.0)` },
    { label: 'HSL', val: `hsl(${Math.round(hsl[0])}, ${Math.round(hsl[1])}%, ${Math.round(hsl[2])}%)` },
    { label: 'HSLA', val: `hsla(${Math.round(hsl[0])}, ${Math.round(hsl[1])}%, ${Math.round(hsl[2])}%, 1.0)` },
    { label: 'HSV', val: `hsv(${Math.round(hsv[0])}, ${Math.round(hsv[1])}%, ${Math.round(hsv[2])}%)` },
    { label: 'CMYK', val: `cmyk(${cmyk[0]}%, ${cmyk[1]}%, ${cmyk[2]}%, ${cmyk[3]}%)` },
    { label: 'LAB', val: `lab(${Math.round(lab[0])} ${Math.round(lab[1])} ${Math.round(lab[2])})` },
    { label: 'LCH', val: `lch(${Math.round(lch[0])} ${Math.round(lch[1])} ${Math.round(lch[2])})` },
    { label: 'OKLAB', val: `oklab(${oklab[0].toFixed(3)} ${oklab[1].toFixed(3)} ${oklab[2].toFixed(3)})` },
    { label: 'OKLCH', val: `oklch(${oklch[0].toFixed(3)} ${oklch[1].toFixed(3)} ${oklch[2].toFixed(1)})` },
    { label: 'CSS Variable', val: `--color-primary: ${hexColor.toUpperCase()};` },
    { label: 'Tailwind Class', val: `bg-[${hexColor.toUpperCase()}]` }
  ];

  formatList.forEach(item => {
    const row = document.createElement('div');
    row.className = 'conversion-row';
    row.innerHTML = `
      <span class="conversion-label">${item.label}</span>
      <span class="conversion-value" title="${item.val}">${item.val}</span>
      <button class="copy-mini-btn" title="Copy to clipboard">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
      </button>
    `;
    
    row.querySelector('.copy-mini-btn').onclick = () => {
      copyToClipboard(item.val, `${item.label} code copied!`);
    };

    formatsGrid.appendChild(row);
  });
}

function closeAnalyzerModal() {
  const modal = document.getElementById('analyzer-modal');
  if (modal) modal.classList.remove('active');
}

// Color Converter Mathematical Equations
function hexToRgbValues(hex) {
  const cleaned = hex.replace('#', '');
  const r = parseInt(cleaned.substring(0, 2), 16);
  const g = parseInt(cleaned.substring(2, 4), 16);
  const b = parseInt(cleaned.substring(4, 6), 16);
  return [r, g, b];
}

function hexToHslValues(hex) {
  let [r, g, b] = hexToRgbValues(hex);
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [h * 360, s * 100, l * 100];
}

function hexToHsvValues(hex) {
  let [r, g, b] = hexToRgbValues(hex);
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const d = max - min;
  const v = max;
  const s = max === 0 ? 0 : d / max;
  let h = 0;

  if (max !== min) {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [h * 360, s * 100, v * 100];
}

function hexToCmykValues(hex) {
  const [r, g, b] = hexToRgbValues(hex);
  const rL = r / 255, gL = g / 255, bL = b / 255;
  const k = 1 - Math.max(rL, gL, bL);
  const c = (1 - rL - k) / (1 - k) || 0;
  const m = (1 - gL - k) / (1 - k) || 0;
  const y = (1 - bL - k) / (1 - k) || 0;
  return [
    Math.round(c * 100),
    Math.round(m * 100),
    Math.round(y * 100),
    Math.round(k * 100)
  ];
}

// CIEXYZ
function rgbToXyz(r, g, b) {
  let rL = r / 255, gL = g / 255, bL = b / 255;
  rL = rL > 0.04045 ? Math.pow((rL + 0.055) / 1.055, 2.4) : rL / 12.92;
  gL = gL > 0.04045 ? Math.pow((gL + 0.055) / 1.055, 2.4) : gL / 12.92;
  bL = bL > 0.04045 ? Math.pow((bL + 0.055) / 1.055, 2.4) : bL / 12.92;
  rL *= 100; gL *= 100; bL *= 100;
  const x = rL * 0.4124 + gL * 0.3576 + bL * 0.1805;
  const y = rL * 0.2126 + gL * 0.7152 + bL * 0.0722;
  const z = rL * 0.0193 + gL * 0.1192 + bL * 0.9505;
  return [x, y, z];
}

// CIELAB
function xyzToLab(x, y, z) {
  const refX = 95.047, refY = 100.000, refZ = 108.883; // D65
  let xL = x / refX, yL = y / refY, zL = z / refZ;

  xL = xL > 0.008856 ? Math.pow(xL, 1/3) : (7.787 * xL) + (16 / 116);
  yL = yL > 0.008856 ? Math.pow(yL, 1/3) : (7.787 * yL) + (16 / 116);
  zL = zL > 0.008856 ? Math.pow(zL, 1/3) : (7.787 * zL) + (16 / 116);

  const L = (116 * yL) - 16;
  const a = 500 * (xL - yL);
  const bVal = 200 * (yL - zL);
  return [L, a, bVal];
}

// CIELCH
function labToLch(L, a, b) {
  const c = Math.sqrt(a * a + b * b);
  let h = Math.atan2(b, a) * 180 / Math.PI;
  if (h < 0) h += 360;
  return [L, c, h];
}

// OKLAB
function rgbToOklab(r, g, b) {
  let rL = r / 255, gL = g / 255, bL = b / 255;
  // linearize sRGB
  rL = rL > 0.04045 ? Math.pow((rL + 0.055) / 1.055, 2.4) : rL / 12.92;
  gL = gL > 0.04045 ? Math.pow((gL + 0.055) / 1.055, 2.4) : gL / 12.92;
  bL = bL > 0.04045 ? Math.pow((bL + 0.055) / 1.055, 2.4) : bL / 12.92;

  const l = 0.4122214708 * rL + 0.5363325363 * gL + 0.0514459929 * bL;
  const m = 0.2119034982 * rL + 0.6806995451 * gL + 0.1073969566 * bL;
  const s = 0.0883024619 * rL + 0.2817188376 * gL + 0.6299787005 * bL;

  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);

  const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
  const bVal = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;
  return [L, a, bVal];
}

// OKLCH
function oklabToOklch(L, a, b) {
  const c = Math.sqrt(a * a + b * b);
  let h = Math.atan2(b, a) * 180 / Math.PI;
  if (h < 0) h += 360;
  return [L, c, h];
}

// Contrast & WCAG Readability check mathematics
function calculateRelativeLuminance(hex) {
  const [r, g, b] = hexToRgbValues(hex);
  let rL = r / 255, gL = g / 255, bL = b / 255;
  rL = rL <= 0.03928 ? rL / 12.92 : Math.pow((rL + 0.055) / 1.055, 2.4);
  gL = gL <= 0.03928 ? gL / 12.92 : Math.pow((gL + 0.055) / 1.055, 2.4);
  bL = bL <= 0.03928 ? bL / 12.92 : Math.pow((bL + 0.055) / 1.055, 2.4);
  return 0.2126 * rL + 0.7152 * gL + 0.0722 * bL;
}

function calculateContrastRatio(hex1, hex2) {
  const l1 = calculateRelativeLuminance(hex1);
  const l2 = calculateRelativeLuminance(hex2);
  const brightest = Math.max(l1, l2);
  const darkest = Math.min(l1, l2);
  return (brightest + 0.05) / (darkest + 0.05);
}

function getContrastText(hexColor) {
  const luminance = calculateRelativeLuminance(hexColor);
  return luminance > 0.45 ? '#000000' : '#FFFFFF';
}

// --- EXPORT MODAL & EXPORTERS ---
function openExportModalCurrent() {
  const modal = document.getElementById('export-modal');
  if (!modal || !currentPalette) return;

  modal.classList.add('active');

  // Trigger default pane rendering
  const activeTabBtn = document.querySelector('.export-tab.active');
  const format = activeTabBtn ? activeTabBtn.dataset.export : 'css';
  switchExportTab(activeTabBtn, format);
}

function closeExportModal(e) {
  const modal = document.getElementById('export-modal');
  if (modal) modal.classList.remove('active');
}

function switchExportTab(btn, format) {
  currentExportFormat = format;
  
  // Set tab active
  document.querySelectorAll('.export-tab').forEach(el => el.classList.remove('active'));
  if (btn) btn.classList.add('active');

  // Show/Hide Pane modes
  const codePane = document.getElementById('pane-code');
  const visualPane = document.getElementById('pane-visual');
  const codeBox = document.getElementById('export-code-box');

  const nameCamel = currentPalette.name.replace(/\s+/g, '');
  const c = currentPalette.colors;

  if (format === 'png' || format === 'svg' || format === 'pdf') {
    codePane.classList.remove('active');
    visualPane.classList.add('active');
    renderVisualExportPreview(format);
  } else {
    codePane.classList.add('active');
    visualPane.classList.remove('active');

    // Build text strings
    let code = '';
    switch (format) {
      case 'css':
        code = `/* Palette: ${currentPalette.name} (${currentPalette.category}/${currentPalette.mood}) */\n`;
        code += `:root {\n`;
        c.forEach((color, idx) => {
          code += `  --color-${idx + 1}: ${color};\n`;
        });
        code += `}`;
        break;

      case 'scss':
        code = `// Palette: ${currentPalette.name}\n`;
        c.forEach((color, idx) => {
          code += `$color-${idx + 1}: ${color};\n`;
        });
        code += `\n$palette-map: (\n`;
        c.forEach((color, idx) => {
          code += `  "color-${idx + 1}": ${color},\n`;
        });
        code += `);`;
        break;

      case 'tailwind':
        code = `// Tailwind v3 config snippet\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: {\n        '${nameCamel.toLowerCase()}': {\n`;
        c.forEach((color, idx) => {
          code += `          ${idx + 1}: '${color}',\n`;
        });
        code += `        }\n      }\n    }\n  }\n}`;
        break;

      case 'json':
        code = JSON.stringify(currentPalette, null, 2);
        break;

      case 'txt':
        code = `Palette: ${currentPalette.name}\nCategory: ${currentPalette.category}\nMood: ${currentPalette.mood}\n\n`;
        c.forEach((color, idx) => {
          const rgb = hexToRgbValues(color);
          const hsl = hexToHslValues(color);
          code += `Color ${idx + 1}: ${color} | rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]}) | hsl(${Math.round(hsl[0])}, ${Math.round(hsl[1])}%, ${Math.round(hsl[2])}%)\n`;
        });
        break;
    }
    codeBox.textContent = code;
  }
}

// Renders the visual visual-palette-preview inside Export dialogue box
function renderVisualExportPreview(format) {
  const container = document.getElementById('visual-palette-preview');
  if (!container || !currentPalette) return;
  container.innerHTML = '';

  const c = currentPalette.colors;

  if (format === 'svg') {
    // Generate inline SVG tag for view preview
    const svgEl = createSVGElement(c, currentPalette.name, 400, 120);
    container.appendChild(svgEl);
  } else if (format === 'png') {
    // Canvas preview rendering
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 120;
    const ctx = canvas.getContext('2d');
    drawPaletteOnCanvas(ctx, c, currentPalette.name, 400, 120);
    container.appendChild(canvas);
  } else if (format === 'pdf') {
    // Visual text card showing print format
    container.innerHTML = `
      <div style="text-align: center; color: var(--text);">
        <p style="font-size: 14px; font-weight: 700; margin-bottom: 8px;">Print/PDF Format Ready</p>
        <span style="font-size: 11px; color: var(--subtext);">Will open print options layout layout matching designer grids.</span>
      </div>
    `;
  }
}

// Canvas Drawer
function drawPaletteOnCanvas(ctx, colors, name, width, height) {
  const blockWidth = width / colors.length;
  colors.forEach((color, idx) => {
    ctx.fillStyle = color;
    ctx.fillRect(idx * blockWidth, 0, blockWidth, height - 30);
  });

  // Footer bar for metadata
  ctx.fillStyle = '#0f1524';
  ctx.fillRect(0, height - 30, width, 30);

  ctx.fillStyle = '#FFF';
  ctx.font = '10px "Outfit", sans-serif';
  ctx.textBaseline = 'middle';
  ctx.fillText(name, 12, height - 15);

  // Print color values
  colors.forEach((color, idx) => {
    ctx.fillStyle = getContrastText(color);
    ctx.font = '8px "monospace"';
    ctx.textAlign = 'center';
    ctx.fillText(color, (idx * blockWidth) + (blockWidth / 2), (height - 30) / 2);
  });
}

// SVG Builder
function createSVGElement(colors, name, width, height) {
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("width", "100%");
  svg.setAttribute("height", "100%");
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);

  const blockWidth = width / colors.length;
  colors.forEach((color, idx) => {
    const rect = document.createElementNS(svgNS, "rect");
    rect.setAttribute("x", idx * blockWidth);
    rect.setAttribute("y", 0);
    rect.setAttribute("width", blockWidth);
    rect.setAttribute("height", height - 30);
    rect.setAttribute("fill", color);
    svg.appendChild(rect);

    // Color text
    const text = document.createElementNS(svgNS, "text");
    text.setAttribute("x", (idx * blockWidth) + (blockWidth / 2));
    text.setAttribute("y", (height - 30) / 2);
    text.setAttribute("fill", getContrastText(color));
    text.setAttribute("font-family", "monospace");
    text.setAttribute("font-size", "8");
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("dominant-baseline", "middle");
    text.textContent = color;
    svg.appendChild(text);
  });

  // Footer label rect
  const footerBg = document.createElementNS(svgNS, "rect");
  footerBg.setAttribute("x", 0);
  footerBg.setAttribute("y", height - 30);
  footerBg.setAttribute("width", width);
  footerBg.setAttribute("height", 30);
  footerBg.setAttribute("fill", "#0f1524");
  svg.appendChild(footerBg);

  // Footer label name text
  const label = document.createElementNS(svgNS, "text");
  label.setAttribute("x", 12);
  label.setAttribute("y", height - 15);
  label.setAttribute("fill", "#ffffff");
  label.setAttribute("font-family", "sans-serif");
  label.setAttribute("font-size", "10");
  label.setAttribute("dominant-baseline", "middle");
  label.textContent = name;
  svg.appendChild(label);

  return svg;
}

// Download file trigger for visual assets
function triggerAssetDownload() {
  if (!currentPalette) return;

  const c = currentPalette.colors;
  const nameSnake = currentPalette.name.toLowerCase().replace(/\s+/g, '_');

  if (currentExportFormat === 'svg') {
    const svgEl = createSVGElement(c, currentPalette.name, 600, 180);
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svgEl);
    const blob = new Blob([svgStr], { type: 'image/svg+xml' });
    downloadBlob(blob, `${nameSnake}_palette.svg`);
  } else if (currentExportFormat === 'png') {
    // Render high quality PNG
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 360;
    const ctx = canvas.getContext('2d');
    drawPaletteOnCanvas(ctx, c, currentPalette.name, 1200, 360);
    
    canvas.toBlob(blob => {
      downloadBlob(blob, `${nameSnake}_palette.png`);
    });
  } else if (currentExportFormat === 'pdf') {
    // Generate styled Print template
    const printWindow = window.open('', '_blank');
    const colorSwatches = c.map(color => `
      <div class="swatch-item">
        <div class="swatch-block" style="background-color: ${color};"></div>
        <div class="swatch-labels">
          <strong>${color}</strong>
          <span>rgb(${hexToRgbValues(color).join(', ')})</span>
          <span>hsl(${hexToHslValues(color).map(Math.round).join(', ')})</span>
        </div>
      </div>
    `).join('');

    printWindow.document.write(`
      <html>
      <head>
        <title>Palette Print - ${currentPalette.name}</title>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background: #FFF; color: #111; margin: 40px; }
          .header { border-bottom: 2px solid #EEE; padding-bottom: 20px; margin-bottom: 30px; }
          .title { font-size: 28px; font-weight: 700; margin: 0 0 5px 0; }
          .meta { font-size: 14px; color: #666; }
          .swatches-grid { display: flex; flex-direction: column; gap: 20px; }
          .swatch-item { display: flex; align-items: center; gap: 24px; border: 1px solid #EEE; padding: 12px; border-radius: 8px; }
          .swatch-block { width: 100px; height: 100px; border-radius: 6px; box-shadow: inset 0 0 10px rgba(0,0,0,0.05); }
          .swatch-labels { display: flex; flex-direction: column; gap: 4px; }
          .swatch-labels strong { font-size: 18px; font-family: monospace; }
          .swatch-labels span { font-size: 12px; color: #555; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="title">${currentPalette.name}</h1>
          <div class="meta">Category: ${currentPalette.category} | Mood: ${currentPalette.mood}</div>
        </div>
        <div class="swatches-grid">
          ${colorSwatches}
        </div>
        <script>
          window.onload = function() {
            window.print();
            window.close();
          };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  }
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
