/**
 * LUMINA — Editorial Fine Art Image Gallery & Lightbox
 * Pure Vanilla JavaScript (ES6+) Architecture
 */

(function () {
  'use strict';

  /* ==========================================================================
     APPLICATION STATE
     ========================================================================== */
  const AppState = {
    allImages: (typeof galleryData !== 'undefined') ? galleryData : [],
    filteredImages: [],
    favorites: new Set(),
    activeCategory: 'all',
    searchQuery: '',
    sortBy: 'featured',
    layout: 'masonry',
    theme: 'dark',

    // Lightbox State
    lightbox: {
      isOpen: false,
      currentIndex: 0,
      zoomLevel: 1.0,
      isSlideshowActive: false,
      slideshowInterval: null,
      slideshowDuration: 4000,
      isInfoDrawerOpen: true,
      isFilmstripVisible: true,
      triggerElement: null,
      touchStartX: 0,
      touchStartY: 0,
      touchEndX: 0,
      touchEndY: 0
    }
  };

  /* ==========================================================================
     DOM ELEMENTS CACHE
     ========================================================================== */
  const DOM = {
    // Theme & Navigation
    html: document.documentElement,
    themeToggleBtn: document.getElementById('themeToggleBtn'),
    navFavoritesBtn: document.getElementById('navFavoritesBtn'),
    navFavCount: document.getElementById('navFavCount'),
    shortcutsBtn: document.getElementById('shortcutsBtn'),
    surpriseMeBtn: document.getElementById('surpriseMeBtn'),

    // Hero Section
    heroTotalCount: document.getElementById('heroTotalCount'),
    heroFavCount: document.getElementById('heroFavCount'),
    exploreBtn: document.getElementById('exploreBtn'),
    heroRandomBtn: document.getElementById('heroRandomBtn'),

    // Controls & Filtering
    searchInput: document.getElementById('searchInput'),
    clearSearchBtn: document.getElementById('clearSearchBtn'),
    categoryTabs: document.getElementById('categoryTabs'),
    resultsCount: document.getElementById('resultsCount'),
    sortSelect: document.getElementById('sortSelect'),
    layoutMasonryBtn: document.getElementById('layoutMasonryBtn'),
    layoutGridBtn: document.getElementById('layoutGridBtn'),
    layoutCompactBtn: document.getElementById('layoutCompactBtn'),
    layoutButtons: document.querySelectorAll('.layout-btn'),

    // Gallery
    galleryGrid: document.getElementById('galleryGrid'),
    emptyState: document.getElementById('emptyState'),
    emptyStateMessage: document.getElementById('emptyStateMessage'),
    resetFiltersBtn: document.getElementById('resetFiltersBtn'),

    // Lightbox Modal
    lightboxModal: document.getElementById('lightboxModal'),
    lightboxBackdrop: document.getElementById('lightboxBackdrop'),
    slideshowProgress: document.getElementById('slideshowProgress'),
    lbCurrentIndex: document.getElementById('lbCurrentIndex'),
    lbTotalCount: document.getElementById('lbTotalCount'),
    lbCategoryPill: document.getElementById('lbCategoryPill'),
    lbTitle: document.getElementById('lbTitle'),
    lbImage: document.getElementById('lbImage'),
    lbSpinner: document.getElementById('lbSpinner'),
    lbTransformWrapper: document.getElementById('lbTransformWrapper'),
    lbViewport: document.getElementById('lbViewport'),

    // Lightbox Controls
    lbPrevBtn: document.getElementById('lbPrevBtn'),
    lbNextBtn: document.getElementById('lbNextBtn'),
    lbCloseBtn: document.getElementById('lbCloseBtn'),
    lbSlideshowBtn: document.getElementById('lbSlideshowBtn'),
    lbZoomOutBtn: document.getElementById('lbZoomOutBtn'),
    lbZoomResetBtn: document.getElementById('lbZoomResetBtn'),
    lbZoomInBtn: document.getElementById('lbZoomInBtn'),
    lbZoomLevel: document.getElementById('lbZoomLevel'),
    lbFavoriteBtn: document.getElementById('lbFavoriteBtn'),
    lbCopyLinkBtn: document.getElementById('lbCopyLinkBtn'),
    lbDownloadBtn: document.getElementById('lbDownloadBtn'),
    lbFullscreenBtn: document.getElementById('lbFullscreenBtn'),
    lbInfoToggleBtn: document.getElementById('lbInfoToggleBtn'),

    // Lightbox Info Drawer
    lbInfoDrawer: document.getElementById('lbInfoDrawer'),
    lbCloseInfoBtn: document.getElementById('lbCloseInfoBtn'),
    lbDescription: document.getElementById('lbDescription'),
    lbLocationText: document.getElementById('lbLocationText'),
    lbPhotographer: document.getElementById('lbPhotographer'),
    lbDate: document.getElementById('lbDate'),
    lbCameraModel: document.getElementById('lbCameraModel'),
    lbExifAperture: document.getElementById('lbExifAperture'),
    lbExifShutter: document.getElementById('lbExifShutter'),
    lbExifIso: document.getElementById('lbExifIso'),
    lbExifFocal: document.getElementById('lbExifFocal'),

    // Lightbox Footer & Filmstrip
    toggleFilmstripBtn: document.getElementById('toggleFilmstripBtn'),
    lightboxFooter: document.querySelector('.lightbox-footer'),
    filmstripTrack: document.getElementById('filmstripTrack'),

    // Modals & Utilities
    shortcutsModal: document.getElementById('shortcutsModal'),
    shortcutsBackdrop: document.getElementById('shortcutsBackdrop'),
    closeShortcutsBtn: document.getElementById('closeShortcutsBtn'),
    toastContainer: document.getElementById('toastContainer'),
    backToTopBtn: document.getElementById('backToTopBtn'),
    footerFilterLinks: document.querySelectorAll('.footer-filter-link')
  };

  /* ==========================================================================
     INITIALIZATION
     ========================================================================== */
  function init() {
    loadPersistentState();
    updateThemeUI();
    updateHeroStats();
    filterImages();
    bindEventListeners();
    updateCategoryBadges();
  }

  /* ==========================================================================
     LOCAL STORAGE & PERSISTENCE
     ========================================================================== */
  function loadPersistentState() {
    // 1. Favorites
    try {
      const savedFavorites = localStorage.getItem('lumina_favorites');
      if (savedFavorites) {
        const parsed = JSON.parse(savedFavorites);
        AppState.favorites = new Set(parsed);
      }
    } catch (e) {
      console.warn('Failed to load favorites from localStorage', e);
    }

    // 2. Theme
    try {
      const savedTheme = localStorage.getItem('lumina_theme');
      if (savedTheme) {
        AppState.theme = savedTheme;
      } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        AppState.theme = 'light';
      }
    } catch (e) {
      console.warn('Failed to load theme preference', e);
    }

    // 3. Layout
    try {
      const savedLayout = localStorage.getItem('lumina_layout');
      if (savedLayout && ['masonry', 'grid', 'compact'].includes(savedLayout)) {
        AppState.layout = savedLayout;
        updateLayoutUI(savedLayout);
      }
    } catch (e) {
      console.warn('Failed to load layout preference', e);
    }

    updateFavoritesCountUI();
  }

  function saveFavorites() {
    try {
      const arr = Array.from(AppState.favorites);
      localStorage.setItem('lumina_favorites', JSON.stringify(arr));
    } catch (e) {
      console.warn('Failed to save favorites to localStorage', e);
    }
  }

  function saveTheme() {
    try {
      localStorage.setItem('lumina_theme', AppState.theme);
    } catch (e) {
      console.warn('Failed to save theme', e);
    }
  }

  function saveLayout() {
    try {
      localStorage.setItem('lumina_layout', AppState.layout);
    } catch (e) {
      console.warn('Failed to save layout', e);
    }
  }

  /* ==========================================================================
     THEME CONTROLLER
     ========================================================================== */
  function toggleTheme() {
    AppState.theme = AppState.theme === 'dark' ? 'light' : 'dark';
    saveTheme();
    updateThemeUI();
    showToast(`Switched to ${AppState.theme === 'dark' ? 'Dark' : 'Light'} theme`);
  }

  function updateThemeUI() {
    DOM.html.setAttribute('data-theme', AppState.theme);
  }

  /* ==========================================================================
     LAYOUT CONTROLLER
     ========================================================================== */
  function setLayout(layoutName) {
    if (!['masonry', 'grid', 'compact'].includes(layoutName)) return;
    AppState.layout = layoutName;
    saveLayout();
    updateLayoutUI(layoutName);
  }

  function updateLayoutUI(layoutName) {
    DOM.galleryGrid.className = `gallery-grid layout-${layoutName}`;
    DOM.layoutButtons.forEach(btn => {
      if (btn.dataset.layout === layoutName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  /* ==========================================================================
     FILTERING & SORTING LOGIC
     ========================================================================== */
  function filterImages() {
    const query = AppState.searchQuery.trim().toLowerCase();
    const category = AppState.activeCategory;

    AppState.filteredImages = AppState.allImages.filter(photo => {
      // 1. Category / Favorites filter
      if (category === 'favorites') {
        if (!AppState.favorites.has(photo.id)) return false;
      } else if (category !== 'all' && photo.category !== category) {
        return false;
      }

      // 2. Search query filter
      if (query) {
        const titleMatch = photo.title.toLowerCase().includes(query);
        const descMatch = photo.description.toLowerCase().includes(query);
        const categoryMatch = photo.categoryLabel.toLowerCase().includes(query);
        const photographerMatch = photo.photographer.toLowerCase().includes(query);
        const locationMatch = photo.location.toLowerCase().includes(query);
        const cameraMatch = (photo.camera && photo.camera.toLowerCase().includes(query));

        if (!titleMatch && !descMatch && !categoryMatch && !photographerMatch && !locationMatch && !cameraMatch) {
          return false;
        }
      }

      return true;
    });

    sortImages();
    renderGallery();
    updateResultsCounter();
  }

  function sortImages() {
    const criteria = AppState.sortBy;
    if (criteria === 'newest') {
      AppState.filteredImages.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (criteria === 'oldest') {
      AppState.filteredImages.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (criteria === 'title-asc') {
      AppState.filteredImages.sort((a, b) => a.title.localeCompare(b.title));
    } else if (criteria === 'title-desc') {
      AppState.filteredImages.sort((a, b) => b.title.localeCompare(a.title));
    }
    // 'featured' maintains default curated array index
  }

  function updateCategoryBadges() {
    const counts = {
      all: AppState.allImages.length,
      nature: 0,
      architecture: 0,
      portraits: 0,
      travel: 0,
      street: 0,
      abstract: 0,
      favorites: AppState.favorites.size
    };

    AppState.allImages.forEach(img => {
      if (counts[img.category] !== undefined) {
        counts[img.category]++;
      }
    });

    const setBadgeText = (id, count) => {
      const el = document.getElementById(id);
      if (el) el.textContent = count;
    };

    setBadgeText('countAll', counts.all);
    setBadgeText('countNature', counts.nature);
    setBadgeText('countArchitecture', counts.architecture);
    setBadgeText('countPortraits', counts.portraits);
    setBadgeText('countTravel', counts.travel);
    setBadgeText('countStreet', counts.street);
    setBadgeText('countAbstract', counts.abstract);
    setBadgeText('countFavorites', counts.favorites);
  }

  function updateResultsCounter() {
    const count = AppState.filteredImages.length;
    const total = AppState.allImages.length;
    DOM.resultsCount.textContent = `Showing ${count} of ${total} master works`;

    if (count === 0) {
      DOM.galleryGrid.style.display = 'none';
      DOM.emptyState.style.display = 'flex';
      if (AppState.activeCategory === 'favorites') {
        DOM.emptyStateMessage.textContent = 'You have not added any photographs to your favorites yet. Tap the heart icon on any image to save it here!';
      } else if (AppState.searchQuery) {
        DOM.emptyStateMessage.textContent = `No matches found for "${AppState.searchQuery}". Try adjusting your keywords or clearing the search.`;
      } else {
        DOM.emptyStateMessage.textContent = 'No photographs found matching the selected criteria.';
      }
    } else {
      DOM.galleryGrid.style.display = '';
      DOM.emptyState.style.display = 'none';
    }
  }

  function updateHeroStats() {
    DOM.heroTotalCount.textContent = AppState.allImages.length;
    DOM.heroFavCount.textContent = AppState.favorites.size;
  }

  function updateFavoritesCountUI() {
    const count = AppState.favorites.size;
    DOM.navFavCount.textContent = count;
    DOM.heroFavCount.textContent = count;
    const countFavBadge = document.getElementById('countFavorites');
    if (countFavBadge) countFavBadge.textContent = count;

    if (count > 0) {
      DOM.navFavoritesBtn.classList.add('has-favs');
    } else {
      DOM.navFavoritesBtn.classList.remove('has-favs');
    }
  }

  /* ==========================================================================
     GALLERY RENDERING
     ========================================================================== */
  function renderGallery() {
    DOM.galleryGrid.innerHTML = '';

    const fragment = document.createDocumentFragment();

    AppState.filteredImages.forEach((photo, index) => {
      const card = document.createElement('article');
      card.className = 'gallery-card';
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', `View ${photo.title} by ${photo.photographer}`);
      card.dataset.id = photo.id;
      card.dataset.index = index;

      const isFav = AppState.favorites.has(photo.id);

      // Media aspect ratio helper
      let aspectClass = 'aspect-tall';
      if (photo.aspect === 'wide') aspectClass = 'aspect-wide';
      else if (photo.aspect === 'square') aspectClass = 'aspect-square';

      card.innerHTML = `
        <div class="card-media-wrapper ${aspectClass}" style="background-color: ${photo.color || '#161922'}">
          <div class="skeleton-shimmer" aria-hidden="true"></div>
          <img 
            src="${photo.thumbUrl}" 
            alt="${photo.title} — ${photo.description}"
            class="gallery-img"
            loading="lazy"
            decoding="async"
            width="600"
            height="800">
          
          <div class="card-overlay">
            <div class="card-top-row">
              <span class="card-category-tag">${photo.categoryLabel}</span>
              <button 
                class="card-fav-btn ${isFav ? 'is-favorite' : ''}" 
                data-id="${photo.id}" 
                aria-label="${isFav ? 'Remove from favorites' : 'Add to favorites'}"
                title="${isFav ? 'Remove from favorites' : 'Save to favorites'}">
                <svg viewBox="0 0 24 24" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </button>
            </div>

            <div class="card-bottom-row">
              <h3 class="card-title">${escapeHTML(photo.title)}</h3>
              <div class="card-location">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <span>${escapeHTML(photo.location)}</span>
              </div>
              <span class="card-photographer">By ${escapeHTML(photo.photographer)}</span>
            </div>
          </div>
        </div>
      `;

      // Handle image load event to hide shimmer
      const img = card.querySelector('.gallery-img');
      const shimmer = card.querySelector('.skeleton-shimmer');

      img.addEventListener('load', () => {
        if (shimmer) shimmer.style.display = 'none';
      });

      // Handle graceful error fallback
      img.addEventListener('error', () => {
        if (typeof generateFallbackSvg === 'function') {
          img.src = generateFallbackSvg(photo.title, photo.categoryLabel);
        }
        if (shimmer) shimmer.style.display = 'none';
      });

      // Card Click -> Open Lightbox
      card.addEventListener('click', (e) => {
        // If clicking the favorite button, do not open lightbox
        if (e.target.closest('.card-fav-btn')) {
          e.stopPropagation();
          const photoId = e.target.closest('.card-fav-btn').dataset.id;
          toggleFavorite(photoId, e);
          return;
        }
        openLightbox(index);
      });

      // Keyboard Access: Enter or Space opens lightbox
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(index);
        }
      });

      fragment.appendChild(card);
    });

    DOM.galleryGrid.appendChild(fragment);
  }

  /* ==========================================================================
     FAVORITES SYSTEM
     ========================================================================== */
  function toggleFavorite(photoId, event) {
    if (event) event.stopPropagation();

    const photo = AppState.allImages.find(p => p.id === photoId);
    if (!photo) return;

    const isFav = AppState.favorites.has(photoId);

    if (isFav) {
      AppState.favorites.delete(photoId);
      showToast(`Removed "${photo.title}" from favorites`, 'default');
    } else {
      AppState.favorites.add(photoId);
      showToast(`Saved "${photo.title}" to favorites!`, 'fav');
    }

    saveFavorites();
    updateFavoritesCountUI();
    updateCategoryBadges();

    // Update gallery cards heart icons
    const cardBtns = document.querySelectorAll(`.card-fav-btn[data-id="${photoId}"]`);
    cardBtns.forEach(btn => {
      if (AppState.favorites.has(photoId)) {
        btn.classList.add('is-favorite');
        btn.querySelector('svg').setAttribute('fill', 'currentColor');
        btn.setAttribute('aria-label', 'Remove from favorites');
      } else {
        btn.classList.remove('is-favorite');
        btn.querySelector('svg').setAttribute('fill', 'none');
        btn.setAttribute('aria-label', 'Add to favorites');
      }
    });

    // Update lightbox favorite button if active
    if (AppState.lightbox.isOpen) {
      const currentPhoto = AppState.filteredImages[AppState.lightbox.currentIndex];
      if (currentPhoto && currentPhoto.id === photoId) {
        updateLightboxFavoriteButton(AppState.favorites.has(photoId));
      }
    }

    // If currently filtering by favorites, re-filter smoothly
    if (AppState.activeCategory === 'favorites') {
      filterImages();
    }
  }

  function updateLightboxFavoriteButton(isFav) {
    if (isFav) {
      DOM.lbFavoriteBtn.classList.add('is-favorite');
      DOM.lbFavoriteBtn.querySelector('svg').setAttribute('fill', 'currentColor');
      DOM.lbFavoriteBtn.setAttribute('title', 'Remove Favorite (L)');
    } else {
      DOM.lbFavoriteBtn.classList.remove('is-favorite');
      DOM.lbFavoriteBtn.querySelector('svg').setAttribute('fill', 'none');
      DOM.lbFavoriteBtn.setAttribute('title', 'Save Favorite (L)');
    }
  }

  /* ==========================================================================
     ADVANCED LIGHTBOX CONTROLLER
     ========================================================================== */
  function openLightbox(index) {
    if (AppState.filteredImages.length === 0) return;

    AppState.lightbox.triggerElement = document.activeElement;
    AppState.lightbox.isOpen = true;
    AppState.lightbox.currentIndex = (index >= 0 && index < AppState.filteredImages.length) ? index : 0;
    AppState.lightbox.zoomLevel = 1.0;

    // Lock background scroll without shifting layout
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    DOM.lightboxModal.classList.add('active');
    DOM.lightboxModal.setAttribute('aria-hidden', 'false');

    loadLightboxImage(AppState.lightbox.currentIndex);
    renderLightboxFilmstrip();
    resetZoom();

    // Focus close button for accessibility trap
    DOM.lbCloseBtn.focus();
  }

  function closeLightbox() {
    if (!AppState.lightbox.isOpen) return;

    stopSlideshow();
    resetZoom();

    AppState.lightbox.isOpen = false;
    DOM.lightboxModal.classList.remove('active');
    DOM.lightboxModal.setAttribute('aria-hidden', 'true');

    // Restore body scroll
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';

    // Restore focus
    if (AppState.lightbox.triggerElement && typeof AppState.lightbox.triggerElement.focus === 'function') {
      AppState.lightbox.triggerElement.focus();
    }
  }

  function loadLightboxImage(index) {
    if (index < 0 || index >= AppState.filteredImages.length) return;

    const photo = AppState.filteredImages[index];

    // Reset zoom
    resetZoom();

    // Show loading spinner
    DOM.lbSpinner.classList.add('active');
    DOM.lbImage.classList.add('loading');

    // Update counters & title
    DOM.lbCurrentIndex.textContent = String(index + 1).padStart(2, '0');
    DOM.lbTotalCount.textContent = String(AppState.filteredImages.length).padStart(2, '0');
    DOM.lbCategoryPill.textContent = photo.categoryLabel;
    DOM.lbTitle.textContent = photo.title;

    // Preload high-res image
    const tempImg = new Image();
    tempImg.src = photo.url;

    tempImg.onload = () => {
      DOM.lbImage.src = photo.url;
      DOM.lbImage.alt = `${photo.title} by ${photo.photographer}`;
      DOM.lbSpinner.classList.remove('active');
      DOM.lbImage.classList.remove('loading');
    };

    tempImg.onerror = () => {
      // Graceful fallback
      if (typeof generateFallbackSvg === 'function') {
        DOM.lbImage.src = generateFallbackSvg(photo.title, photo.categoryLabel);
      } else {
        DOM.lbImage.src = photo.thumbUrl;
      }
      DOM.lbSpinner.classList.remove('active');
      DOM.lbImage.classList.remove('loading');
    };

    // Update EXIF & metadata drawer
    DOM.lbDescription.textContent = photo.description;
    DOM.lbLocationText.textContent = photo.location;
    DOM.lbPhotographer.textContent = photo.photographer;
    DOM.lbDate.textContent = formatDate(photo.date);
    DOM.lbCameraModel.textContent = photo.camera || 'High Resolution Digital Camera';

    if (photo.exif) {
      DOM.lbExifAperture.textContent = photo.exif.aperture || '—';
      DOM.lbExifShutter.textContent = photo.exif.shutter || '—';
      DOM.lbExifIso.textContent = photo.exif.iso || '—';
      DOM.lbExifFocal.textContent = photo.exif.focalLength || '—';
    }

    // Update favorite button state
    const isFav = AppState.favorites.has(photo.id);
    updateLightboxFavoriteButton(isFav);

    // Update download link
    DOM.lbDownloadBtn.href = photo.url;
    DOM.lbDownloadBtn.setAttribute('download', `${photo.title.toLowerCase().replace(/\s+/g, '-')}-${photo.id}.jpg`);

    // Update active thumbnail in filmstrip
    highlightActiveFilmstripThumb(index);
  }

  function showNextImage() {
    if (AppState.filteredImages.length <= 1) return;
    const nextIndex = (AppState.lightbox.currentIndex + 1) % AppState.filteredImages.length;
    AppState.lightbox.currentIndex = nextIndex;
    loadLightboxImage(nextIndex);

    if (AppState.lightbox.isSlideshowActive) {
      restartSlideshowTimer();
    }
  }

  function showPreviousImage() {
    if (AppState.filteredImages.length <= 1) return;
    const prevIndex = (AppState.lightbox.currentIndex - 1 + AppState.filteredImages.length) % AppState.filteredImages.length;
    AppState.lightbox.currentIndex = prevIndex;
    loadLightboxImage(prevIndex);

    if (AppState.lightbox.isSlideshowActive) {
      restartSlideshowTimer();
    }
  }

  /* ==========================================================================
     FILMSTRIP THUMBNAIL TRACK
     ========================================================================== */
  function renderLightboxFilmstrip() {
    DOM.filmstripTrack.innerHTML = '';
    const fragment = document.createDocumentFragment();

    AppState.filteredImages.forEach((photo, index) => {
      const thumb = document.createElement('div');
      thumb.className = `filmstrip-thumb ${index === AppState.lightbox.currentIndex ? 'active' : ''}`;
      thumb.dataset.index = index;
      thumb.setAttribute('role', 'tab');
      thumb.setAttribute('aria-label', `Thumbnail ${index + 1}: ${photo.title}`);

      thumb.innerHTML = `
        <img src="${photo.thumbUrl}" alt="${photo.title}" loading="lazy">
      `;

      thumb.addEventListener('click', () => {
        AppState.lightbox.currentIndex = index;
        loadLightboxImage(index);
        if (AppState.lightbox.isSlideshowActive) {
          restartSlideshowTimer();
        }
      });

      fragment.appendChild(thumb);
    });

    DOM.filmstripTrack.appendChild(fragment);
    highlightActiveFilmstripThumb(AppState.lightbox.currentIndex);
  }

  function highlightActiveFilmstripThumb(index) {
    const thumbs = DOM.filmstripTrack.querySelectorAll('.filmstrip-thumb');
    thumbs.forEach(t => t.classList.remove('active'));

    const activeThumb = DOM.filmstripTrack.querySelector(`.filmstrip-thumb[data-index="${index}"]`);
    if (activeThumb) {
      activeThumb.classList.add('active');
      activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }

  function toggleFilmstrip() {
    AppState.lightbox.isFilmstripVisible = !AppState.lightbox.isFilmstripVisible;
    if (AppState.lightbox.isFilmstripVisible) {
      DOM.lightboxFooter.classList.remove('collapsed');
      DOM.toggleFilmstripBtn.querySelector('.toggle-text').textContent = 'Hide Strip';
    } else {
      DOM.lightboxFooter.classList.add('collapsed');
      DOM.toggleFilmstripBtn.querySelector('.toggle-text').textContent = 'Show Strip';
    }
  }

  /* ==========================================================================
     ZOOM & PAN LOGIC
     ========================================================================== */
  function zoomIn() {
    if (AppState.lightbox.zoomLevel < 2.5) {
      AppState.lightbox.zoomLevel = +(AppState.lightbox.zoomLevel + 0.35).toFixed(2);
      applyZoom();
    }
  }

  function zoomOut() {
    if (AppState.lightbox.zoomLevel > 0.65) {
      AppState.lightbox.zoomLevel = +(AppState.lightbox.zoomLevel - 0.35).toFixed(2);
      applyZoom();
    }
  }

  function resetZoom() {
    AppState.lightbox.zoomLevel = 1.0;
    applyZoom();
  }

  function toggleZoom() {
    if (AppState.lightbox.zoomLevel === 1.0) {
      AppState.lightbox.zoomLevel = 1.7;
    } else {
      AppState.lightbox.zoomLevel = 1.0;
    }
    applyZoom();
  }

  function applyZoom() {
    DOM.lbTransformWrapper.style.transform = `scale(${AppState.lightbox.zoomLevel})`;
    DOM.lbZoomLevel.textContent = `${Math.round(AppState.lightbox.zoomLevel * 100)}%`;
  }

  /* ==========================================================================
     SLIDESHOW CONTROLLER
     ========================================================================== */
  function toggleSlideshow() {
    if (AppState.lightbox.isSlideshowActive) {
      stopSlideshow();
      showToast('Slideshow paused');
    } else {
      startSlideshow();
      showToast('Slideshow started (4s interval)');
    }
  }

  function startSlideshow() {
    AppState.lightbox.isSlideshowActive = true;
    DOM.lbSlideshowBtn.classList.add('active');
    DOM.lbSlideshowBtn.querySelector('.play-icon').style.display = 'none';
    DOM.lbSlideshowBtn.querySelector('.pause-icon').style.display = 'block';

    triggerProgressBar();
    AppState.lightbox.slideshowInterval = setInterval(() => {
      showNextImage();
    }, AppState.lightbox.slideshowDuration);
  }

  function stopSlideshow() {
    AppState.lightbox.isSlideshowActive = false;
    DOM.lbSlideshowBtn.classList.remove('active');
    DOM.lbSlideshowBtn.querySelector('.play-icon').style.display = 'block';
    DOM.lbSlideshowBtn.querySelector('.pause-icon').style.display = 'none';

    if (AppState.lightbox.slideshowInterval) {
      clearInterval(AppState.lightbox.slideshowInterval);
      AppState.lightbox.slideshowInterval = null;
    }
    resetProgressBar();
  }

  function restartSlideshowTimer() {
    if (!AppState.lightbox.isSlideshowActive) return;
    clearInterval(AppState.lightbox.slideshowInterval);
    resetProgressBar();
    triggerProgressBar();
    AppState.lightbox.slideshowInterval = setInterval(() => {
      showNextImage();
    }, AppState.lightbox.slideshowDuration);
  }

  function triggerProgressBar() {
    DOM.slideshowProgress.style.transition = 'none';
    DOM.slideshowProgress.style.width = '0%';
    // Force layout reflow
    void DOM.slideshowProgress.offsetWidth;
    DOM.slideshowProgress.style.transition = `width ${AppState.lightbox.slideshowDuration}ms linear`;
    DOM.slideshowProgress.style.width = '100%';
  }

  function resetProgressBar() {
    DOM.slideshowProgress.style.transition = 'none';
    DOM.slideshowProgress.style.width = '0%';
  }

  /* ==========================================================================
     FULLSCREEN TOGGLE
     ========================================================================== */
  function toggleFullscreen() {
    const isFullscreen = document.fullscreenElement || document.webkitFullscreenElement;

    if (!isFullscreen) {
      const el = DOM.lightboxModal;
      if (el.requestFullscreen) {
        el.requestFullscreen().catch(err => {
          console.warn('Fullscreen request rejected', err);
        });
      } else if (el.webkitRequestFullscreen) {
        el.webkitRequestFullscreen();
      }
      setFullscreenIcons(true);
      showToast('Entered Fullscreen mode');
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
      setFullscreenIcons(false);
      showToast('Exited Fullscreen mode');
    }
  }

  function setFullscreenIcons(isFullscreen) {
    const enterIcon = DOM.lbFullscreenBtn.querySelector('.fullscreen-enter');
    const exitIcon = DOM.lbFullscreenBtn.querySelector('.fullscreen-exit');
    if (isFullscreen) {
      enterIcon.style.display = 'none';
      exitIcon.style.display = 'block';
      DOM.lbFullscreenBtn.classList.add('active');
    } else {
      enterIcon.style.display = 'block';
      exitIcon.style.display = 'none';
      DOM.lbFullscreenBtn.classList.remove('active');
    }
  }

  /* ==========================================================================
     CLIPBOARD COPY & DOWNLOAD
     ========================================================================== */
  function copyCurrentImageLink() {
    const currentPhoto = AppState.filteredImages[AppState.lightbox.currentIndex];
    if (!currentPhoto) return;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(currentPhoto.url)
        .then(() => {
          showToast('Image URL copied to clipboard!');
        })
        .catch(() => {
          fallbackCopyText(currentPhoto.url);
        });
    } else {
      fallbackCopyText(currentPhoto.url);
    }
  }

  function fallbackCopyText(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.top = '-9999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      showToast('Image URL copied to clipboard!');
    } catch (err) {
      showToast('Could not copy URL automatically');
    }
    document.body.removeChild(textArea);
  }

  /* ==========================================================================
     SURPRISE ME / RANDOM PHOTO
     ========================================================================== */
  function triggerSurprisePhoto() {
    if (AppState.allImages.length === 0) return;
    const randomIndex = Math.floor(Math.random() * AppState.allImages.length);
    const randomPhoto = AppState.allImages[randomIndex];

    // If currently filtered out, reset category to 'all' so user can see context
    if (AppState.activeCategory !== 'all' && AppState.activeCategory !== randomPhoto.category) {
      setCategoryFilter('all');
    }

    const filteredIdx = AppState.filteredImages.findIndex(p => p.id === randomPhoto.id);
    openLightbox(filteredIdx >= 0 ? filteredIdx : 0);
    showToast(`Curated: "${randomPhoto.title}"`);
  }

  /* ==========================================================================
     TOAST NOTIFICATION ENGINE
     ========================================================================== */
  function showToast(message, type = 'default') {
    const toast = document.createElement('div');
    toast.className = `toast ${type === 'fav' ? 'toast-fav' : ''}`;
    toast.setAttribute('role', 'status');

    let iconSvg = `
      <svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
      </svg>
    `;

    if (type === 'fav') {
      iconSvg = `
        <svg class="toast-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
      `;
    }

    toast.innerHTML = `
      ${iconSvg}
      <span>${escapeHTML(message)}</span>
    `;

    DOM.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast-exit');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 350);
    }, 2800);
  }

  /* ==========================================================================
     CATEGORY & NAVIGATION HELPERS
     ========================================================================== */
  function setCategoryFilter(category) {
    AppState.activeCategory = category;

    // Update active tab buttons
    const tabs = DOM.categoryTabs.querySelectorAll('.cat-tab');
    tabs.forEach(tab => {
      if (tab.dataset.category === category) {
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
      } else {
        tab.classList.remove('active');
        tab.setAttribute('aria-selected', 'false');
      }
    });

    filterImages();
  }

  /* ==========================================================================
     EVENT LISTENERS & BINDINGS
     ========================================================================== */
  function bindEventListeners() {
    // 1. Theme toggle
    DOM.themeToggleBtn.addEventListener('click', toggleTheme);

    // 2. Search input (debounced)
    let searchDebounceTimer = null;
    DOM.searchInput.addEventListener('input', (e) => {
      const val = e.target.value;
      if (val.trim()) {
        DOM.clearSearchBtn.classList.add('visible');
      } else {
        DOM.clearSearchBtn.classList.remove('visible');
      }

      clearTimeout(searchDebounceTimer);
      searchDebounceTimer = setTimeout(() => {
        AppState.searchQuery = val;
        filterImages();
      }, 180);
    });

    DOM.clearSearchBtn.addEventListener('click', () => {
      DOM.searchInput.value = '';
      DOM.clearSearchBtn.classList.remove('visible');
      AppState.searchQuery = '';
      filterImages();
      DOM.searchInput.focus();
    });

    // 3. Category tabs click
    DOM.categoryTabs.addEventListener('click', (e) => {
      const tab = e.target.closest('.cat-tab');
      if (!tab) return;
      const category = tab.dataset.category;
      setCategoryFilter(category);
    });

    // 4. Header Favorites pill button
    DOM.navFavoritesBtn.addEventListener('click', () => {
      setCategoryFilter('favorites');
      const gallerySec = document.getElementById('gallery-section');
      if (gallerySec) gallerySec.scrollIntoView({ behavior: 'smooth' });
    });

    // 5. Footer Category links
    DOM.footerFilterLinks.forEach(link => {
      link.addEventListener('click', () => {
        const cat = link.dataset.category;
        setCategoryFilter(cat);
        const gallerySec = document.getElementById('gallery-section');
        if (gallerySec) gallerySec.scrollIntoView({ behavior: 'smooth' });
      });
    });

    // 6. Sort selector
    DOM.sortSelect.addEventListener('change', (e) => {
      AppState.sortBy = e.target.value;
      sortImages();
      renderGallery();
    });

    // 7. Layout switchers
    DOM.layoutMasonryBtn.addEventListener('click', () => setLayout('masonry'));
    DOM.layoutGridBtn.addEventListener('click', () => setLayout('grid'));
    DOM.layoutCompactBtn.addEventListener('click', () => setLayout('compact'));

    // 8. Empty state reset button
    DOM.resetFiltersBtn.addEventListener('click', () => {
      AppState.searchQuery = '';
      DOM.searchInput.value = '';
      DOM.clearSearchBtn.classList.remove('visible');
      setCategoryFilter('all');
    });

    // 9. Surprise Me Buttons
    DOM.surpriseMeBtn.addEventListener('click', triggerSurprisePhoto);
    DOM.heroRandomBtn.addEventListener('click', triggerSurprisePhoto);

    // 10. Lightbox Navigation & Actions
    DOM.lbPrevBtn.addEventListener('click', showPreviousImage);
    DOM.lbNextBtn.addEventListener('click', showNextImage);
    DOM.lbCloseBtn.addEventListener('click', closeLightbox);

    // Clicking backdrop closes modal (clicking stage/image/controls does not)
    DOM.lightboxBackdrop.addEventListener('click', closeLightbox);
    DOM.lightboxModal.addEventListener('click', (e) => {
      if (e.target === DOM.lightboxModal || e.target === DOM.lbViewport) {
        closeLightbox();
      }
    });

    // Lightbox toolbar buttons
    DOM.lbSlideshowBtn.addEventListener('click', toggleSlideshow);
    DOM.lbZoomInBtn.addEventListener('click', zoomIn);
    DOM.lbZoomOutBtn.addEventListener('click', zoomOut);
    DOM.lbZoomResetBtn.addEventListener('click', toggleZoom);
    DOM.lbFullscreenBtn.addEventListener('click', toggleFullscreen);
    DOM.lbCopyLinkBtn.addEventListener('click', copyCurrentImageLink);

    DOM.lbFavoriteBtn.addEventListener('click', () => {
      const currentPhoto = AppState.filteredImages[AppState.lightbox.currentIndex];
      if (currentPhoto) {
        toggleFavorite(currentPhoto.id);
      }
    });

    // Lightbox image double click -> toggle zoom
    DOM.lbImage.addEventListener('dblclick', toggleZoom);

    // Lightbox Info Drawer Toggle
    DOM.lbInfoToggleBtn.addEventListener('click', () => {
      AppState.lightbox.isInfoDrawerOpen = !AppState.lightbox.isInfoDrawerOpen;
      if (AppState.lightbox.isInfoDrawerOpen) {
        DOM.lbInfoDrawer.classList.remove('collapsed');
        DOM.lbInfoToggleBtn.classList.add('active');
      } else {
        DOM.lbInfoDrawer.classList.add('collapsed');
        DOM.lbInfoToggleBtn.classList.remove('active');
      }
    });

    DOM.lbCloseInfoBtn.addEventListener('click', () => {
      AppState.lightbox.isInfoDrawerOpen = false;
      DOM.lbInfoDrawer.classList.add('collapsed');
      DOM.lbInfoToggleBtn.classList.remove('active');
    });

    // Lightbox Filmstrip Toggle
    DOM.toggleFilmstripBtn.addEventListener('click', toggleFilmstrip);

    // 11. Touch Swipe Navigation for Mobile
    DOM.lbViewport.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        AppState.lightbox.touchStartX = e.touches[0].clientX;
        AppState.lightbox.touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    DOM.lbViewport.addEventListener('touchend', (e) => {
      if (e.changedTouches.length === 1) {
        AppState.lightbox.touchEndX = e.changedTouches[0].clientX;
        AppState.lightbox.touchEndY = e.changedTouches[0].clientY;
        handleSwipeGesture();
      }
    }, { passive: true });

    // 12. Global Keyboard Shortcuts
    document.addEventListener('keydown', handleGlobalKeydown);

    // 13. Shortcuts Modal
    DOM.shortcutsBtn.addEventListener('click', openShortcutsModal);
    DOM.closeShortcutsBtn.addEventListener('click', closeShortcutsModal);
    DOM.shortcutsBackdrop.addEventListener('click', closeShortcutsModal);

    // 14. Back to top button & Scroll listener
    window.addEventListener('scroll', handleWindowScroll, { passive: true });
    DOM.backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // 15. Fullscreen change listener to sync icons
    document.addEventListener('fullscreenchange', () => {
      const isFullscreen = !!document.fullscreenElement;
      setFullscreenIcons(isFullscreen);
    });
  }

  /* ==========================================================================
     TOUCH SWIPE DETECTION
     ========================================================================== */
  function handleSwipeGesture() {
    const deltaX = AppState.lightbox.touchEndX - AppState.lightbox.touchStartX;
    const deltaY = AppState.lightbox.touchEndY - AppState.lightbox.touchStartY;

    // Minimum swipe threshold
    if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0) {
        // Swiped Left -> Next
        showNextImage();
      } else {
        // Swiped Right -> Previous
        showPreviousImage();
      }
    }
  }

  /* ==========================================================================
     GLOBAL KEYBOARD SHORTCUTS
     ========================================================================== */
  function handleGlobalKeydown(e) {
    const isTyping = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName);

    // If typing in search box
    if (isTyping) {
      if (e.key === 'Escape') {
        DOM.searchInput.blur();
      }
      return;
    }

    // '/' Key -> Focus search
    if (e.key === '/') {
      e.preventDefault();
      DOM.searchInput.focus();
      return;
    }

    // '?' Key -> Open shortcuts modal
    if (e.key === '?') {
      e.preventDefault();
      openShortcutsModal();
      return;
    }

    // When shortcuts modal is open, Esc closes it
    if (DOM.shortcutsModal.classList.contains('active')) {
      if (e.key === 'Escape') {
        closeShortcutsModal();
      }
      return;
    }

    // --- Lightbox-Specific Shortcuts ---
    if (AppState.lightbox.isOpen) {
      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          showNextImage();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          showPreviousImage();
          break;
        case 'Escape':
          e.preventDefault();
          closeLightbox();
          break;
        case ' ': // Space bar
          e.preventDefault();
          toggleSlideshow();
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'l':
        case 'L':
          e.preventDefault();
          const currentPhoto = AppState.filteredImages[AppState.lightbox.currentIndex];
          if (currentPhoto) toggleFavorite(currentPhoto.id);
          break;
        case 'z':
        case 'Z':
          e.preventDefault();
          toggleZoom();
          break;
        case 'i':
        case 'I':
          e.preventDefault();
          AppState.lightbox.isInfoDrawerOpen = !AppState.lightbox.isInfoDrawerOpen;
          if (AppState.lightbox.isInfoDrawerOpen) {
            DOM.lbInfoDrawer.classList.remove('collapsed');
            DOM.lbInfoToggleBtn.classList.add('active');
          } else {
            DOM.lbInfoDrawer.classList.add('collapsed');
            DOM.lbInfoToggleBtn.classList.remove('active');
          }
          break;
        case '+':
        case '=':
          e.preventDefault();
          zoomIn();
          break;
        case '-':
        case '_':
          e.preventDefault();
          zoomOut();
          break;
      }
    }
  }

  /* ==========================================================================
     SHORTCUTS MODAL CONTROLS
     ========================================================================== */
  function openShortcutsModal() {
    DOM.shortcutsModal.classList.add('active');
    DOM.shortcutsModal.setAttribute('aria-hidden', 'false');
    DOM.closeShortcutsBtn.focus();
  }

  function closeShortcutsModal() {
    DOM.shortcutsModal.classList.remove('active');
    DOM.shortcutsModal.setAttribute('aria-hidden', 'true');
  }

  /* ==========================================================================
     SCROLL & BACK TO TOP
     ========================================================================== */
  function handleWindowScroll() {
    if (window.scrollY > 400) {
      DOM.backToTopBtn.classList.add('visible');
    } else {
      DOM.backToTopBtn.classList.remove('visible');
    }
  }

  /* ==========================================================================
     UTILITIES
     ========================================================================== */
  function escapeHTML(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function formatDate(dateStr) {
    if (!dateStr) return 'Curated';
    try {
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(dateStr).toLocaleDateString('en-US', options);
    } catch (e) {
      return dateStr;
    }
  }

  // Self-execute initialization on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
