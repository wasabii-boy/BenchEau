// eaux-en-detail-enhanced.js — Enhanced grid view with contextual quality ratings and mobile-first design
import { loadData } from './data.js?v=17';

const state = {
  data: [],
  filtered: [],
  filters: {
    type: { plate: true, petillante: true },
    query: '',
    mineralization: '',
    usage: ''
  }
};

function qs(id) { return document.getElementById(id); }

function fmt(v, decimals = 1) {
  if (v === undefined || v === null || Number.isNaN(v)) return '-';
  if (typeof v === 'number') {
    return Number.isInteger(v) ? String(v) : v.toFixed(decimals);
  }
  return String(v);
}

function mean(arr) {
  const validNumbers = arr.filter(n => typeof n === 'number' && !isNaN(n));
  return validNumbers.length > 0 ? validNumbers.reduce((sum, n) => sum + n, 0) / validNumbers.length : undefined;
}

// New contextual rating system
function getWaterQualityRating(water) {
  const ratings = {
    overall: 'fair',
    safety: 'safe',
    purity: 'good',
    minerals: 'adequate',
    suitability: []
  };

  let safetyScore = 0;
  let purityScore = 0;
  let mineralScore = 0;
  let totalFactors = 0;

  // Safety Assessment (most important)
  if (water.ph) {
    if (water.ph >= 6.5 && water.ph <= 8.5) safetyScore += 25;
    else if (water.ph >= 6.0 && water.ph <= 9.0) safetyScore += 15;
    else safetyScore -= 10;
    totalFactors++;
  }

  // Purity Assessment
  if (water.microplasticsParticlesPerLiter !== undefined) {
    if (water.microplasticsParticlesPerLiter <= 1) purityScore += 25;
    else if (water.microplasticsParticlesPerLiter <= 3) purityScore += 15;
    else purityScore += 5;
    totalFactors++;
  }

  if (water.sommePFAS !== undefined) {
    if (water.sommePFAS <= 10) purityScore += 20;
    else if (water.sommePFAS <= 50) purityScore += 10;
    else purityScore -= 15;
    totalFactors++;
  }

  // Sodium assessment
  if (water.sodium !== undefined) {
    if (water.sodium <= 20) safetyScore += 20;
    else if (water.sodium <= 50) safetyScore += 15;
    else if (water.sodium <= 200) safetyScore += 5;
    totalFactors++;
  }

  // Mineral balance
  if (water.residuSec) {
    if (water.residuSec >= 150 && water.residuSec <= 500) mineralScore += 20;
    else if (water.residuSec >= 50 && water.residuSec <= 1000) mineralScore += 15;
    else mineralScore += 5;
    totalFactors++;
  }

  // Calculate contextual ratings
  const avgSafety = totalFactors > 0 ? safetyScore / totalFactors : 0;
  const avgPurity = totalFactors > 0 ? purityScore / totalFactors : 0;
  const avgMinerals = totalFactors > 0 ? mineralScore / totalFactors : 0;
  const overallScore = (avgSafety + avgPurity + avgMinerals) / 3;

  // Determine contextual ratings
  if (overallScore >= 20) ratings.overall = 'excellent';
  else if (overallScore >= 15) ratings.overall = 'good';
  else if (overallScore >= 10) ratings.overall = 'fair';
  else if (overallScore >= 5) ratings.overall = 'poor';
  else ratings.overall = 'bad';

  // Safety rating for vulnerable groups
  const isSafeForBabies = water.sodium <= 20 && water.residuSec <= 500 && water.ph >= 6.5 && water.ph <= 8.0;
  const isSafeForElderly = water.sodium <= 200 && (water.sommePFAS === undefined || water.sommePFAS <= 50);
  
  if (isSafeForBabies) ratings.suitability.push('babies');
  if (isSafeForElderly) ratings.suitability.push('elderly');
  if (water.residuSec > 1000) ratings.suitability.push('sport');
  if (water.bicarbonates > 600) ratings.suitability.push('digestion');
  
  ratings.suitability.push('general'); // Always suitable for general use
  
  return ratings;
}

// Get contextual quality display
function getContextualQualityDisplay(water) {
  const rating = getWaterQualityRating(water);
  const qualityLabels = {
    'excellent': { text: 'Excellente qualité', class: 'quality-excellent', icon: '⭐' },
    'good': { text: 'Bonne qualité', class: 'quality-good', icon: '✓' },
    'fair': { text: 'Qualité correcte', class: 'quality-fair', icon: '○' },
    'poor': { text: 'Qualité moyenne', class: 'quality-poor', icon: '⚠' },
    'bad': { text: 'Qualité médiocre', class: 'quality-bad', icon: '✗' }
  };
  
  return {
    ...qualityLabels[rating.overall],
    rating: rating,
    suitabilityBadges: rating.suitability.map(suit => {
      const badges = {
        'babies': { icon: '👶', text: 'Nourrissons', class: 'safety-baby' },
        'elderly': { icon: '🧓', text: 'Seniors', class: 'safety-elderly' },
        'sport': { icon: '🏃', text: 'Sport', class: 'safety-general' },
        'digestion': { icon: '🌿', text: 'Digestion', class: 'safety-general' },
        'general': { icon: '🏠', text: 'Quotidien', class: 'safety-general' }
      };
      return badges[suit] || { icon: '📋', text: suit, class: 'safety-general' };
    })
  };
}

// Legacy compatibility - convert ratings to numeric score
function calculateWaterScore(water) {
  const rating = getWaterQualityRating(water);
  const scoreMap = {
    'excellent': 90,
    'good': 75,
    'fair': 60,
    'poor': 45,
    'bad': 30
  };
  return scoreMap[rating.overall] || 50;
}

// Configuration for labels and classes
const USAGE_LABELS = {
  'nourrissons': '👶', 'enfants': '🧒', 'consommation-quotidienne': '🏠',
  'digestion': '🌿', 'apport-mineraux': '💪', 'sport': '🏃'
};

const MINERALIZATION_LABELS = {
  'tres-faiblement-mineralisee': 'Très faible',
  'faiblement-mineralisee': 'Faible', 
  'moyennement-mineralisee': 'Modérée',
  'riche-en-sels-mineraux': 'Riche'
};

const MINERALIZATION_CLASSES = {
  'tres-faiblement-mineralisee': 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200',
  'faiblement-mineralisee': 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200',
  'moyennement-mineralisee': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200',
  'riche-en-sels-mineraux': 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200'
};

function applyFilters() {
  readControls();
  const { type, query, mineralization, usage } = state.filters;
  
  state.filtered = state.data.filter(water => {
    // Type filter
    const typeOk = (water.type === 'plate' && type.plate) || (water.type === 'petillante' && type.petillante);
    
    // Text search
    const searchText = `${water.name} ${water.region || ''} ${water.proprietaire || ''}`.toLowerCase();
    const queryOk = !query || searchText.includes(query.toLowerCase());
    
    // Mineralization filter
    const mineralizationOk = !mineralization || (water.categories?.mineralization === mineralization);
    
    // Usage filter
    const usageOk = !usage || (water.categories?.usage && Array.isArray(water.categories.usage) && water.categories.usage.includes(usage));
    
    return typeOk && queryOk && mineralizationOk && usageOk;
  });
}

function readControls() {
  state.filters.type.plate = qs('filter-flat')?.checked ?? true;
  state.filters.type.petillante = qs('filter-sparkling')?.checked ?? true;
  state.filters.query = (qs('search')?.value || '').trim();
  state.filters.mineralization = qs('filter-mineralization')?.value || '';
  state.filters.usage = qs('filter-usage')?.value || '';
}

// Enhanced water card with contextual quality display
function createEnhancedWaterCard(water) {
  const card = document.createElement('div');
  card.className = 'water-card-enhanced animate-slide-up';
  
  const qualityDisplay = getContextualQualityDisplay(water);
  
  // Progressive disclosure - show key info first
  const keyMetrics = [
    { label: 'pH', value: water.ph, unit: '', ideal: water.ph >= 6.5 && water.ph <= 8.5 },
    { label: 'Sodium', value: water.sodium, unit: 'mg/L', warning: water.sodium > 50 },
    { label: 'Pureté', value: water.microplasticsParticlesPerLiter, unit: 'p/L', good: water.microplasticsParticlesPerLiter <= 1 }
  ].filter(metric => metric.value !== undefined && metric.value !== null);
  
  card.innerHTML = `
    <div class="flex items-start justify-between mb-5">
      <div class="flex items-center space-x-4">
        <div class="w-14 h-14 bg-gradient-to-br ${
          water.type === 'petillante' 
            ? 'from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900' 
            : 'from-emerald-100 to-teal-100 dark:from-emerald-900 dark:to-teal-900'
        } rounded-2xl flex items-center justify-center text-2xl shadow-lg">
          ${water.type === 'petillante' ? '🫧' : '💧'}
        </div>
        <div class="flex-1 min-w-0">
          <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-1 line-clamp-1">${water.name}</h3>
          <p class="text-sm text-slate-600 dark:text-slate-400 line-clamp-1">${water.proprietaire || 'Marque inconnue'}</p>
        </div>
      </div>
      
      <div class="${qualityDisplay.class} px-4 py-2 rounded-xl font-semibold flex items-center gap-2 shrink-0">
        <span>${qualityDisplay.icon}</span>
        <span class="hidden sm:inline">${qualityDisplay.text}</span>
      </div>
    </div>

    <!-- Key Metrics Grid -->
    <div class="mb-5">
      <div class="text-sm font-semibold text-slate-900 dark:text-white mb-3">Paramètres clés</div>
      <div class="grid grid-cols-${Math.min(keyMetrics.length, 3)} gap-3">
        ${keyMetrics.map(metric => `
          <div class="parameter-pill ${
            metric.warning ? 'warning' : metric.ideal || metric.good ? 'ideal' : ''
          } text-center">
            <div class="font-medium">${metric.label}</div>
            <div class="font-mono font-bold">${fmt(metric.value)} ${metric.unit}</div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Suitability Badges -->
    <div class="mb-5">
      <div class="text-sm font-semibold text-slate-900 dark:text-white mb-3">Adapté pour</div>
      <div class="flex flex-wrap gap-2">
        ${qualityDisplay.suitabilityBadges.slice(0, 3).map(badge => `
          <span class="safety-badge ${badge.class}">
            <span aria-label="${badge.text}">${badge.icon}</span>
            <span class="hidden sm:inline">${badge.text}</span>
          </span>
        `).join('')}
      </div>
    </div>

    <!-- Expandable Details -->
    <div class="details-expandable" id="details-${water.id}">
      <div class="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-3">
        ${water.region ? `
          <div class="flex items-center justify-between">
            <span class="text-sm text-slate-600 dark:text-slate-400">Origine</span>
            <span class="text-sm font-medium text-slate-900 dark:text-white">${water.region}</span>
          </div>
        ` : ''}
        
        <div class="flex items-center justify-between">
          <span class="text-sm text-slate-600 dark:text-slate-400">Minéralisation</span>
          <span class="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium ${MINERALIZATION_CLASSES[water.categories?.mineralization] || 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200'}">
            ${MINERALIZATION_LABELS[water.categories?.mineralization] || 'Inconnue'}
          </span>
        </div>
        
        ${water.residuSec ? `
          <div class="flex items-center justify-between">
            <span class="text-sm text-slate-600 dark:text-slate-400">Résidu sec</span>
            <span class="text-sm font-medium text-slate-900 dark:text-white">${fmt(water.residuSec)} mg/L</span>
          </div>
        ` : ''}
      </div>
    </div>

    <!-- Expand/Collapse Button -->
    <div class="mt-5 pt-4 border-t border-slate-200 dark:border-slate-700">
      <button class="toggle-details w-full flex items-center justify-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors" data-target="details-${water.id}">
        <span class="expand-text">Voir plus de détails</span>
        <span class="collapse-text hidden">Voir moins</span>
        <span class="expand-icon">▼</span>
      </button>
    </div>
  `;

  // Add click handler for full details modal
  card.addEventListener('click', (e) => {
    if (!e.target.closest('.toggle-details')) {
      showWaterDetail(water);
    }
  });
  
  return card;
}

// Enhanced modal display with contextual ratings
function showWaterDetail(water) {
  const modal = qs('modal');
  const title = qs('modal-title');
  const subtitle = qs('modal-subtitle');
  const icon = qs('modal-icon');
  const content = qs('modal-content');

  if (!modal || !title || !subtitle || !icon || !content) return;

  title.textContent = water.name;
  subtitle.textContent = `${water.typeEau || water.type} • ${water.proprietaire || 'Marque inconnue'}`;
  icon.textContent = water.type === 'petillante' ? '🫧' : '💧';

  const qualityDisplay = getContextualQualityDisplay(water);
  const score = calculateWaterScore(water);

  content.innerHTML = `
    <!-- Enhanced Quality Header -->
    <div class="mb-6 p-6 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-blue-900 rounded-2xl border border-slate-200 dark:border-slate-700">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h4 class="text-xl font-bold text-slate-900 dark:text-white">Évaluation BenchEau</h4>
          <p class="text-sm text-slate-600 dark:text-slate-400">Analyse basée sur les critères ANSES 2025</p>
        </div>
        <div class="${qualityDisplay.class} px-6 py-3 rounded-2xl font-bold text-lg flex items-center gap-2">
          <span>${qualityDisplay.icon}</span>
          <span>${qualityDisplay.text}</span>
        </div>
      </div>
      
      <!-- Suitability Summary -->
      <div class="flex flex-wrap gap-2">
        ${qualityDisplay.suitabilityBadges.map(badge => `
          <span class="safety-badge ${badge.class}">
            ${badge.icon} ${badge.text}
          </span>
        `).join('')}
      </div>
    </div>

    <!-- Key Metrics Dashboard -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div class="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
        <div class="text-2xl mb-2">⚗️</div>
        <div class="text-xs text-slate-600 dark:text-slate-400 uppercase">pH</div>
        <div class="font-mono font-bold text-lg ${water.ph >= 6.5 && water.ph <= 8.5 ? 'text-green-600' : 'text-orange-600'}">${fmt(water.ph)}</div>
      </div>
      
      <div class="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
        <div class="text-2xl mb-2">🧂</div>
        <div class="text-xs text-slate-600 dark:text-slate-400 uppercase">Sodium</div>
        <div class="font-mono font-bold text-lg ${water.sodium <= 50 ? 'text-green-600' : 'text-orange-600'}">${fmt(water.sodium)} mg/L</div>
      </div>
      
      <div class="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
        <div class="text-2xl mb-2">🔬</div>
        <div class="text-xs text-slate-600 dark:text-slate-400 uppercase">Pureté</div>
        <div class="font-mono font-bold text-lg ${(water.microplasticsParticlesPerLiter || 0) <= 1 ? 'text-green-600' : 'text-orange-600'}">${fmt(water.microplasticsParticlesPerLiter)} p/L</div>
      </div>
      
      <div class="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
        <div class="text-2xl mb-2">⚖️</div>
        <div class="text-xs text-slate-600 dark:text-slate-400 uppercase">Minéraux</div>
        <div class="font-mono font-bold text-lg text-blue-600">${fmt(water.residuSec)} mg/L</div>
      </div>
    </div>

    <!-- Additional technical details would go here -->
    <div class="text-center mt-8">
      <p class="text-sm text-slate-500 dark:text-slate-400">
        Données basées sur les dernières analyses disponibles • Score calculé selon les critères ANSES 2025
      </p>
    </div>
  `;

  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function updateStats() {
  const total = state.filtered.length;
  const plates = state.filtered.filter(w => w.type === 'plate').length;
  const petillantes = state.filtered.filter(w => w.type === 'petillante').length;
  
  const avgPh = mean(state.filtered.map(w => w.ph));
  const avgRs = mean(state.filtered.map(w => w.residuSec));

  qs('count')?.textContent && (qs('count').textContent = total);
  qs('stats-total')?.textContent && (qs('stats-total').textContent = total);
  qs('stats-plates')?.textContent && (qs('stats-plates').textContent = plates);
  qs('stats-petillantes')?.textContent && (qs('stats-petillantes').textContent = petillantes);
  qs('stats-ph')?.textContent && (qs('stats-ph').textContent = fmt(avgPh));
  qs('stats-rs')?.textContent && (qs('stats-rs').textContent = fmt(avgRs, 0));
}

// Enhanced rendering with contextual quality ratings
function renderWaters() {
  const container = qs('waters-container');
  const emptyState = qs('empty-state');
  const resultsCount = qs('results-count');
  
  if (!container) return;
  
  // Update results count
  if (resultsCount) {
    resultsCount.textContent = state.filtered.length;
  }
  
  if (state.filtered.length === 0) {
    container.innerHTML = '';
    emptyState?.classList.remove('hidden');
    return;
  }
  
  emptyState?.classList.add('hidden');
  container.innerHTML = '';
  
  // Sort waters based on selection
  const sortSelect = qs('sort-waters');
  const sortValue = sortSelect?.value || 'quality-desc';
  const sortedWaters = [...state.filtered].sort((a, b) => {
    switch (sortValue) {
      case 'quality-desc':
        return calculateWaterScore(b) - calculateWaterScore(a);
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'sodium-asc':
        return (a.sodium || 999) - (b.sodium || 999);
      case 'minerals-desc':
        return (b.residuSec || 0) - (a.residuSec || 0);
      default:
        return 0;
    }
  });
  
  sortedWaters.forEach((water, index) => {
    const card = createEnhancedWaterCard(water);
    card.style.animationDelay = `${Math.min(index * 0.05, 1)}s`;
    container.appendChild(card);
  });
}

// Update active filters indicator
function updateActiveFiltersIndicator() {
  const indicator = qs('active-filters-count');
  if (!indicator) return;
  
  let activeCount = 0;
  
  // Count active filters
  const flatChecked = qs('filter-flat')?.checked ?? true;
  const sparklingChecked = qs('filter-sparkling')?.checked ?? true;
  if (!flatChecked || !sparklingChecked) activeCount++;
  
  const query = (qs('search')?.value || '').trim();
  if (query) activeCount++;
  
  const mineralization = qs('filter-mineralization')?.value || '';
  if (mineralization) activeCount++;
  
  const usage = qs('filter-usage')?.value || '';
  if (usage) activeCount++;
  
  if (activeCount > 0) {
    indicator.textContent = activeCount;
    indicator.classList.remove('hidden');
  } else {
    indicator.classList.add('hidden');
  }
}

// Enhanced rendering with contextual quality ratings
function render() {
  applyFilters();
  updateStats();
  renderWaters();
  updateActiveFiltersIndicator();
}

// Enhanced mobile filter panel management
function setupMobileFilterPanel() {
  const trigger = qs('filter-trigger');
  const panel = qs('filter-panel');
  const closeBtn = qs('filter-panel-close');
  const applyBtn = qs('apply-filters');
  
  if (!trigger || !panel) return;
  
  // Show panel
  trigger.addEventListener('click', () => {
    panel.classList.add('show');
    trigger.classList.add('hide');
    document.body.style.overflow = 'hidden';
  });
  
  // Hide panel
  const hidePanel = () => {
    panel.classList.remove('show');
    trigger.classList.remove('hide');
    document.body.style.overflow = '';
  };
  
  if (closeBtn) closeBtn.addEventListener('click', hidePanel);
  if (applyBtn) applyBtn.addEventListener('click', hidePanel);
  
  // Quick filters
  const quickFilters = document.querySelectorAll('.quick-filter');
  quickFilters.forEach(btn => {
    btn.addEventListener('click', () => {
      const filterType = btn.getAttribute('data-filter');
      applyQuickFilter(filterType);
      
      // Visual feedback
      quickFilters.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}

// Apply quick filters based on user intent
function applyQuickFilter(filterType) {
  // Reset current filters
  qs('filter-flat').checked = true;
  qs('filter-sparkling').checked = true;
  qs('search').value = '';
  qs('filter-mineralization').value = '';
  qs('filter-usage').value = '';
  
  switch (filterType) {
    case 'family':
      qs('filter-usage').value = 'nourrissons';
      qs('filter-mineralization').value = 'faiblement-mineralisee';
      break;
    case 'sport':
      qs('filter-usage').value = 'sport';
      qs('filter-mineralization').value = 'riche-en-sels-mineraux';
      break;
    case 'digestion':
      qs('filter-usage').value = 'digestion';
      qs('filter-sparkling').checked = true;
      qs('filter-flat').checked = false;
      break;
  }
  
  render();
}

// Setup toggle details functionality
function setupToggleDetails() {
  document.addEventListener('click', (e) => {
    if (e.target.closest('.toggle-details')) {
      e.preventDefault();
      const btn = e.target.closest('.toggle-details');
      const targetId = btn.getAttribute('data-target');
      const details = document.getElementById(targetId);
      const expandText = btn.querySelector('.expand-text');
      const collapseText = btn.querySelector('.collapse-text');
      const icon = btn.querySelector('.expand-icon');
      
      if (details) {
        const isExpanded = details.classList.contains('expanded');
        
        if (isExpanded) {
          details.classList.remove('expanded');
          expandText.classList.remove('hidden');
          collapseText.classList.add('hidden');
          icon.textContent = '▼';
        } else {
          details.classList.add('expanded');
          expandText.classList.add('hidden');
          collapseText.classList.remove('hidden');
          icon.textContent = '▲';
        }
      }
    }
  });
}

// Setup empty state actions
function setupEmptyStateActions() {
  const clearBtn = qs('clear-all-filters');
  const showPopularBtn = qs('show-popular');
  
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      qs('filter-flat').checked = true;
      qs('filter-sparkling').checked = true;
      qs('search').value = '';
      qs('filter-mineralization').value = '';
      qs('filter-usage').value = '';
      render();
    });
  }
  
  if (showPopularBtn) {
    showPopularBtn.addEventListener('click', () => {
      // Show top rated waters
      qs('filter-flat').checked = true;
      qs('filter-sparkling').checked = true;
      qs('search').value = '';
      qs('filter-mineralization').value = 'faiblement-mineralisee';
      qs('filter-usage').value = 'consommation-quotidienne';
      render();
    });
  }
}

function bindControls() {
  const debounce = (fn, ms) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn(...args), ms);
    };
  };

  const renderDebounced = debounce(() => render(), 200);

  // Dark mode toggle
  const darkModeToggle = qs('dark-mode-toggle');
  if (darkModeToggle) {
    darkModeToggle.addEventListener('click', () => {
      const isDark = document.documentElement.classList.contains('dark');
      if (isDark) {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('darkMode', 'false');
      } else {
        document.documentElement.classList.add('dark');
        localStorage.setItem('darkMode', 'true');
      }
    });
  }
  
  // Filter controls
  ['filter-flat', 'filter-sparkling', 'search', 'filter-mineralization', 'filter-usage'].forEach(id => {
    const el = qs(id);
    if (el) {
      el.addEventListener(el.tagName === 'SELECT' ? 'change' : 'input', renderDebounced);
    }
  });

  // Sort control
  const sortSelect = qs('sort-waters');
  if (sortSelect) {
    sortSelect.addEventListener('change', renderDebounced);
  }

  // Reset filters
  const resetBtn = qs('reset-filters');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      qs('filter-flat').checked = true;
      qs('filter-sparkling').checked = true;
      qs('search').value = '';
      qs('filter-mineralization').value = '';
      qs('filter-usage').value = '';
      render();
    });
  }

  // Modal close
  const modalClose = qs('modal-close');
  const modal = qs('modal');
  
  const closeModal = () => {
    if (modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    }
  };
  
  if (modalClose && modal) {
    modalClose.addEventListener('click', closeModal);
    
    modal.addEventListener('click', (e) => {
      // Fermer si on clique sur l'overlay
      if (e.target === modal || e.target.classList.contains('min-h-screen')) {
        closeModal();
      }
    });
    
    // ESC key to close modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
        closeModal();
      }
    });
  }
}

function showLoading(show) {
  const banner = qs('loading-banner');
  if (banner) banner.classList.toggle('hidden', !show);
}

function showError(msg) {
  const banner = qs('error-banner');
  const content = banner?.querySelector('[role="alert"]');
  if (banner && content) {
    content.textContent = msg || '';
    banner.classList.toggle('hidden', !msg);
  }
}

async function initialize() {
  showLoading(true);
  
  try {
    const { rows, error } = await loadData();
    state.data = rows;
    
    if (error) {
      showError(error);
    } else {
      showError('');
    }
    
    render();
  } catch (err) {
    showError('Erreur lors du chargement des données');
  } finally {
    showLoading(false);
  }
}

// Initialize enhanced app
window.addEventListener('DOMContentLoaded', () => {
  bindControls();
  setupMobileFilterPanel();
  setupToggleDetails();
  setupEmptyStateActions();
  initialize();
});