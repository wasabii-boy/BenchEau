// main.js — Application BenchEau moderne et optimisée
import { loadData } from './data.js?v=17';
import { calculateWaterScore, getQualityRating, getSafetyBadges, fmt, sanitizeHTML } from './utils/scoring.js?v=1';

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

// fmt function now imported from utils/scoring.js

function mean(arr) {
  const validNumbers = arr.filter(n => typeof n === 'number' && !isNaN(n));
  return validNumbers.length > 0 ? validNumbers.reduce((sum, n) => sum + n, 0) / validNumbers.length : undefined;
}

// Cache management with proper invalidation
class CacheManager {
  constructor() {
    this.cache = new Map();
  }

  get(key) {
    return this.cache.get(key);
  }

  set(key, value) {
    this.cache.set(key, value);
  }

  clear() {
    this.cache.clear();
  }

  invalidate(pattern) {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }
}

const cacheManager = new CacheManager();

// Legacy function removed - now using utils/scoring.js
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

  // Score sodium (plus c'est bas, mieux c'est, mais pas 0)
  if (water.sodium !== undefined && water.sodium !== null) {
    if (water.sodium <= 20) {
      score += 20; // Excellent pour consommation quotidienne
    } else if (water.sodium <= 50) {
      score += 15;
    } else if (water.sodium <= 200) {
      score += 10;
    } else {
      score += 0; // Trop salé
    }
    factors++;
  }

  // Score microplastiques (plus c'est bas, mieux c'est)
  if (water.microplasticsParticlesPerLiter !== undefined) {
    if (water.microplasticsParticlesPerLiter <= 1) {
      score += 20; // Excellent
    } else if (water.microplasticsParticlesPerLiter <= 3) {
      score += 15;
    } else if (water.microplasticsParticlesPerLiter <= 5) {
      score += 10;
    } else {
      score += 5;
    }
    factors++;
  }

  // Score minéralisation (modérée est optimale)
  if (water.residuSec) {
    if (water.residuSec >= 150 && water.residuSec <= 500) {
      score += 20; // Minéralisation idéale
    } else if (water.residuSec >= 50 && water.residuSec <= 1000) {
      score += 15;
    } else if (water.residuSec < 50) {
      score += 10; // Trop faiblement minéralisée
    } else {
      score += 5; // Trop minéralisée
    }
    factors++;
  }

  // Score nitrates (plus c'est bas, mieux c'est)
  if (water.nitrates !== undefined && water.nitrates !== null) {
    if (water.nitrates <= 2) {
      score += 15;
    } else if (water.nitrates <= 10) {
      score += 10;
    } else if (water.nitrates <= 25) {
      score += 5;
    }
    factors++;
  }

  // Score PFAS (contaminants émergents - CRITIQUE)
  if (water.sommePFAS !== undefined && water.sommePFAS !== null) {
    if (water.sommePFAS <= 10) {
      score += 20; // Très faible contamination PFAS
    } else if (water.sommePFAS <= 50) {
      score += 15;
    } else if (water.sommePFAS <= 100) {
      score += 10;
    } else {
      score += 0; // Contamination élevée
    }
    factors++;
  }

  // Score pesticides (métabolites pertinents)
  if (water.pesticidesPertinenets !== undefined && water.pesticidesPertinenets !== null) {
    if (water.pesticidesPertinenets <= 0.01) {
      score += 15; // Très peu de pesticides
    } else if (water.pesticidesPertinenets <= 0.1) {
      score += 10;
    } else if (water.pesticidesPertinenets <= 0.5) {
      score += 5;
    }
    factors++;
  }

  // Score conformité ANSES (nouveau critère 2025)
  if (water.conformiteANSES) {
    if (water.conformiteANSES.toLowerCase().includes('conforme')) {
      score += 15; // Conforme aux nouvelles normes ANSES
    }
    factors++;
  }

  // Score radioactivité (uranium comme indicateur)
  if (water.uranium !== undefined && water.uranium !== null) {
    if (water.uranium <= 5) {
      score += 10; // Très faible radioactivité
    } else if (water.uranium <= 15) {
      score += 5;
    }
    factors++;
  }

  // Bonus calcium/magnésium (bons pour la santé)
  if (water.calcium && water.calcium >= 50 && water.calcium <= 150) {
    score += 10;
  }
  if (water.magnesium && water.magnesium >= 10 && water.magnesium <= 50) {
    score += 10;
  }

  // Bonus pour certifications
  if (water.certifications && water.certifications.toLowerCase().includes('iso')) {
    score += 5;
  }

  // Malus pour restrictions sanitaires
  if (water.restrictions && !water.restrictions.toLowerCase().includes('aucune')) {
    score -= 10;
  }

  // Malus pour polluants détectés
  if (water.bisphenols && water.bisphenols > 0.1) {
    score -= 10; // Présence de bisphénols
  }
  
  if (water.phtalates && water.phtalates > 0.1) {
    score -= 10; // Présence de phtalates
  }
  
  if (water.residusMedicamenteux && water.residusMedicamenteux !== 'Négatif') {
    score -= 15; // Résidus médicamenteux détectés
  }

  // Bonus pour conformité européenne
  if (water.conformiteEU && water.conformiteEU.toLowerCase().includes('conforme')) {
    score += 5;
  }

  // Ajout de variation basée sur les valeurs exactes pour éviter les ex æquo
  let variation = 0;
  if (water.ph) variation += (water.ph - 7) * 0.1; // Bonus/malus pH précis
  if (water.sodium !== undefined) variation -= water.sodium * 0.01; // Malus sodium précis
  if (water.calcium) variation += Math.min(water.calcium * 0.01, 2); // Bonus calcium modéré
  
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

// calculateWaterScore is now imported from utils/scoring.js

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

function getQualityIndicator(value, thresholds, reverse = false, includeText = false) {
  if (value === undefined || value === null || isNaN(value)) {
    return includeText ? 
      { icon: '⚪', text: 'Inconnu', class: 'quality-indicator bg-slate-300 text-slate-700' } :
      '⚪';
  }
  
  const isGood = reverse ? value > thresholds.good : value <= thresholds.good;
  const isModerate = reverse ? value > thresholds.moderate : value <= thresholds.moderate;
  
  if (includeText) {
    if (isGood) return { icon: '✓', text: 'Excellent', class: 'quality-indicator quality-excellent' };
    if (isModerate) return { icon: '○', text: 'Acceptable', class: 'quality-indicator quality-fair' };
    return { icon: '!', text: 'Attention', class: 'quality-indicator quality-poor' };
  }
  
  if (isGood) return '🟢';
  if (isModerate) return '🟡';
  return '🔴';
}

// New function for contextual quality display
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

function getMineralColor(value, max) {
  if (!value || max <= 0) return '#e2e8f0';
  const intensity = Math.min(value / max, 1);
  const hue = Math.max(0, 220 - (intensity * 80)); // Blue to cyan gradient
  return `hsl(${hue}, 70%, ${60 + intensity * 20}%)`;
}

// Configuration globale pour éviter les répétitions
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

// Cache pour éviter les recalculs
let maxValuesCache = null;

function getMaxValues() {
  if (!maxValuesCache && state.data.length > 0) {
    maxValuesCache = {
      calcium: Math.max(...state.data.map(w => w.calcium || 0)),
      magnesium: Math.max(...state.data.map(w => w.magnesium || 0)),
      sodium: Math.max(...state.data.map(w => w.sodium || 0)),
      bicarbonates: Math.max(...state.data.map(w => w.bicarbonates || 0))
    };
  }
  return maxValuesCache || {};
}

function createMineralBar(mineral, value, maxValues) {
  const width = maxValues[mineral] > 0 ? (value / maxValues[mineral]) * 100 : 0;
  const color = getMineralColor(value, maxValues[mineral]);
  const label = mineral === 'bicarbonates' ? 'HCO₃' : mineral;
  
  return `
    <div class="flex items-center justify-between text-xs mb-1">
      <span class="text-slate-600 dark:text-slate-400 capitalize">${label}</span>
      <span class="font-mono font-medium">${fmt(value)} mg/L</span>
    </div>
    <div class="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 mb-2">
      <div class="mineral-bar rounded-full h-1.5" style="width: ${width}%; background-color: ${color}"></div>
    </div>
  `;
}

function createWaterCard(water) {
  const card = document.createElement('div');
  card.className = 'water-card glass rounded-xl p-5 cursor-pointer animate-slide-up hover:scale-[1.02] transition-all duration-300';
  
  // Get contextual quality display
  const qualityDisplay = getContextualQualityDisplay(water);
  
  // Progressive disclosure - only show key minerals
  const keyMinerals = [
    { key: 'sodium', label: 'Sodium', value: water.sodium, unit: 'mg/L', warning: water.sodium > 200 },
    { key: 'calcium', label: 'Calcium', value: water.calcium, unit: 'mg/L' },
    { key: 'ph', label: 'pH', value: water.ph, unit: '', ideal: water.ph >= 6.5 && water.ph <= 8.5 }
  ].filter(mineral => mineral.value !== undefined && mineral.value !== null);

  // Suitability badges (max 3 for clean design)
  const suitabilityBadges = qualityDisplay.suitabilityBadges
    .slice(0, 3)
    .map(badge => `
      <span class="safety-badge ${badge.class} text-xs">
        <span aria-label="${badge.text}">${badge.icon}</span>
        <span class="hidden sm:inline">${badge.text}</span>
      </span>
    `).join('');

  card.innerHTML = `
    <div class="flex items-start justify-between mb-4">
      <div class="flex items-center space-x-3">
        <div class="w-12 h-12 bg-gradient-to-br ${water.type === 'petillante' ? 'from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900' : 'from-emerald-100 to-teal-100 dark:from-emerald-900 dark:to-teal-900'} rounded-xl flex items-center justify-center text-xl">
          ${water.type === 'petillante' ? '🫧' : '💧'}
        </div>
        <div class="flex-1 min-w-0">
          <h3 class="text-lg font-bold text-slate-900 dark:text-white truncate">${water.name}</h3>
          <p class="text-sm text-slate-600 dark:text-slate-400 truncate">${water.proprietaire || 'Marque inconnue'}</p>
        </div>
      </div>
      
      <!-- Quality Rating Badge -->
      <div class="${qualityDisplay.class} px-3 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1.5 shrink-0">
        <span>${qualityDisplay.icon}</span>
        <span class="hidden sm:inline">${qualityDisplay.text}</span>
      </div>
    </div>

    <!-- Key Parameters -->
    <div class="mb-4">
      <div class="text-sm font-medium text-slate-900 dark:text-white mb-3">Paramètres clés</div>
      <div class="grid grid-cols-${Math.min(keyMinerals.length, 3)} gap-3">
        ${keyMinerals.map(mineral => `
          <div class="text-center p-2 bg-slate-50 dark:bg-slate-800 rounded-lg ${
            mineral.warning ? 'ring-1 ring-orange-300 dark:ring-orange-700' : ''
          } ${
            mineral.ideal ? 'ring-1 ring-green-300 dark:ring-green-700' : ''
          }">
            <div class="text-xs font-medium text-slate-900 dark:text-white">${mineral.label}</div>
            <div class="text-sm font-mono font-bold ${mineral.warning ? 'text-orange-600 dark:text-orange-400' : mineral.ideal ? 'text-green-600 dark:text-green-400' : 'text-slate-900 dark:text-white'}">
              ${fmt(mineral.value)} ${mineral.unit}
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Suitability & Usage -->
    <div class="mb-3">
      <div class="text-sm font-medium text-slate-900 dark:text-white mb-2">Adapté pour</div>
      <div class="flex flex-wrap gap-2">
        ${suitabilityBadges}
      </div>
    </div>

    <!-- Mineralization & Origin -->
    <div class="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-700">
      <span class="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium ${MINERALIZATION_CLASSES[water.categories?.mineralization] || 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200'}">
        ${MINERALIZATION_LABELS[water.categories?.mineralization] || 'Inconnue'}
      </span>
      ${water.region ? `
        <div class="flex items-center text-xs text-slate-500 dark:text-slate-400">
          <span class="mr-1">📍</span>
          <span class="truncate max-w-[120px]">${water.region}</span>
        </div>
      ` : ''}
    </div>
    
    <!-- Expandable Details Hint -->
    <div class="mt-3 pt-2 border-t border-slate-200 dark:border-slate-700">
      <div class="flex items-center justify-center text-xs text-slate-500 dark:text-slate-400">
        <span class="mr-1">👆</span>
        <span>Cliquer pour plus de détails</span>
      </div>
    </div>
  `;

  card.addEventListener('click', () => showWaterDetail(water));
  return card;
}

function showWaterDetail(water) {
  const modal = qs('modal');
  const title = qs('modal-title');
  const subtitle = qs('modal-subtitle');
  const icon = qs('modal-icon');
  const content = qs('modal-content');

  title.textContent = water.name;
  subtitle.textContent = `${water.typeEau || water.type} • ${water.proprietaire || 'Marque inconnue'}`;
  icon.textContent = water.type === 'petillante' ? '🫧' : '💧';

  // Score de qualité
  const qualityScore = calculateWaterScore(water);
  
  // Composition minérale de base
  const baseComposition = [
    { label: 'pH', value: water.ph, unit: '', quality: getQualityIndicator(water.ph, { good: 7.5, moderate: 8.5 }) },
    { label: 'Conductivité', value: water.conductivite, unit: 'µS/cm' },
    { label: 'Résidu sec', value: water.residuSec, unit: 'mg/L' },
    { label: 'Température source', value: water.temperature, unit: '°C' },
  ].filter(item => item.value !== undefined && item.value !== null);

  // Minéraux principaux
  const minerals = [
    { label: 'Calcium', value: water.calcium, unit: 'mg/L' },
    { label: 'Magnésium', value: water.magnesium, unit: 'mg/L' },
    { label: 'Sodium', value: water.sodium, unit: 'mg/L', quality: getQualityIndicator(water.sodium, { good: 20, moderate: 200 }) },
    { label: 'Potassium', value: water.potassium, unit: 'mg/L' },
    { label: 'Bicarbonates', value: water.bicarbonates, unit: 'mg/L' },
    { label: 'Chlorures', value: water.chlorures, unit: 'mg/L' },
    { label: 'Sulfates', value: water.sulfates, unit: 'mg/L' },
    { label: 'Nitrates', value: water.nitrates, unit: 'mg/L' },
    { label: 'Fluorures', value: water.fluorures, unit: 'mg/L' },
    { label: 'Silice', value: water.silice, unit: 'mg/L' },
  ].filter(item => item.value !== undefined && item.value !== null);

  // Contaminants ANSES 2025
  const contaminants = [
    { label: 'Microplastiques', value: water.microplasticsParticlesPerLiter, unit: 'p/L', quality: getQualityIndicator(water.microplasticsParticlesPerLiter, { good: 1, moderate: 5 }) },
    { label: 'PFAS Total', value: water.sommePFAS, unit: 'ng/L', quality: getQualityIndicator(water.sommePFAS, { good: 10, moderate: 100 }) },
    { label: 'TFA', value: water.tfa, unit: 'ng/L' },
    { label: 'PFOA', value: water.pfoa, unit: 'ng/L' },
    { label: 'PFOS', value: water.pfos, unit: 'ng/L' },
    { label: 'Pesticides pertinents', value: water.pesticidesPertinenets, unit: 'µg/L' },
    { label: 'Bisphénols', value: water.bisphenols, unit: 'µg/L' },
    { label: 'Phtalates', value: water.phtalates, unit: 'µg/L' },
  ].filter(item => item.value !== undefined && item.value !== null);

  // Radioactivité
  const radioactivity = [
    { label: 'Uranium', value: water.uranium, unit: 'µg/L' },
    { label: 'Activité alpha', value: water.activiteAlpha, unit: 'Bq/L' },
    { label: 'Activité beta', value: water.activiteBeta, unit: 'Bq/L' },
    { label: 'Tritium', value: water.tritium, unit: 'Bq/L' },
    { label: 'Radon 222', value: water.radon, unit: 'Bq/L' },
    { label: 'DTI annuelle', value: water.dti, unit: 'mSv/an' },
  ].filter(item => item.value !== undefined && item.value !== null);

  // Données environnementales
  const environmental = [
    { label: 'Empreinte carbone', value: water.empreinteCarbone, unit: 'kg CO₂/L' },
    { label: 'Empreinte hydrique', value: water.empreinteHydrique, unit: 'L eau/L produit' },
    { label: 'Taux recyclage', value: water.tauxRecyclage, unit: '%' },
  ].filter(item => item.value !== undefined && item.value !== null);

  content.innerHTML = `
    <!-- Score de qualité en en-tête -->
    <div class="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl border border-green-200 dark:border-green-700">
      <div class="flex items-center justify-between">
        <div>
          <h4 class="text-lg font-semibold text-slate-900 dark:text-white">Score BenchEau</h4>
          <p class="text-sm text-slate-600 dark:text-slate-400">Évaluation basée sur 12 critères ANSES 2025</p>
        </div>
        <div class="text-3xl font-bold text-green-600 dark:text-green-400">${qualityScore}/100</div>
      </div>
    </div>

    <div class="grid lg:grid-cols-3 gap-6">
      <!-- Composition de base -->
      <div class="glass rounded-xl p-4">
        <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
          <span class="w-5 h-5 bg-blue-100 dark:bg-blue-900 rounded mr-2 flex items-center justify-center">
            <span class="text-xs">🧪</span>
          </span>
          Paramètres physiques
        </h3>
        <div class="space-y-2">
          ${baseComposition.map(item => `
            <div class="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-700 last:border-b-0">
              <span class="text-sm text-slate-600 dark:text-slate-400">${item.label} ${item.quality || ''}</span>
              <span class="font-mono font-semibold text-slate-900 dark:text-white text-sm">
                ${fmt(item.value)} ${item.unit}
              </span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Minéraux -->
      <div class="glass rounded-xl p-4">
        <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
          <span class="w-5 h-5 bg-green-100 dark:bg-green-900 rounded mr-2 flex items-center justify-center">
            <span class="text-xs">⚛️</span>
          </span>
          Minéraux
        </h3>
        <div class="space-y-2">
          ${minerals.map(item => `
            <div class="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-700 last:border-b-0">
              <span class="text-sm text-slate-600 dark:text-slate-400">${item.label} ${item.quality || ''}</span>
              <span class="font-mono font-semibold text-slate-900 dark:text-white text-sm">
                ${fmt(item.value)} ${item.unit}
              </span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Contaminants ANSES 2025 -->
      <div class="glass rounded-xl p-4">
        <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
          <span class="w-5 h-5 bg-red-100 dark:bg-red-900 rounded mr-2 flex items-center justify-center">
            <span class="text-xs">⚠️</span>
          </span>
          Contaminants
        </h3>
        <div class="space-y-2">
          ${contaminants.length > 0 ? contaminants.map(item => `
            <div class="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-700 last:border-b-0">
              <span class="text-sm text-slate-600 dark:text-slate-400">${item.label} ${item.quality || ''}</span>
              <span class="font-mono font-semibold text-slate-900 dark:text-white text-sm">
                ${fmt(item.value)} ${item.unit}
              </span>
            </div>
          `).join('') : '<p class="text-sm text-slate-500 dark:text-slate-400">Données non disponibles</p>'}
        </div>
      </div>
    </div>

    ${radioactivity.length > 0 || environmental.length > 0 ? `
    <div class="grid lg:grid-cols-2 gap-6 mt-6">
      ${radioactivity.length > 0 ? `
      <!-- Radioactivité -->
      <div class="glass rounded-xl p-4">
        <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
          <span class="w-5 h-5 bg-yellow-100 dark:bg-yellow-900 rounded mr-2 flex items-center justify-center">
            <span class="text-xs">☢️</span>
          </span>
          Radioactivité
        </h3>
        <div class="space-y-2">
          ${radioactivity.map(item => `
            <div class="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-700 last:border-b-0">
              <span class="text-sm text-slate-600 dark:text-slate-400">${item.label}</span>
              <span class="font-mono font-semibold text-slate-900 dark:text-white text-sm">
                ${fmt(item.value)} ${item.unit}
              </span>
            </div>
          `).join('')}
        </div>
      </div>
      ` : ''}

      ${environmental.length > 0 ? `
      <!-- Environnement -->
      <div class="glass rounded-xl p-4">
        <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
          <span class="w-5 h-5 bg-green-100 dark:bg-green-900 rounded mr-2 flex items-center justify-center">
            <span class="text-xs">🌱</span>
          </span>
          Impact environnemental
        </h3>
        <div class="space-y-2">
          ${environmental.map(item => `
            <div class="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-700 last:border-b-0">
              <span class="text-sm text-slate-600 dark:text-slate-400">${item.label}</span>
              <span class="font-mono font-semibold text-slate-900 dark:text-white text-sm">
                ${fmt(item.value)} ${item.unit}
              </span>
            </div>
          `).join('')}
        </div>
      </div>
      ` : ''}
    </div>
    ` : ''}

    <!-- Informations complémentaires -->
    <div class="grid lg:grid-cols-2 gap-6 mt-6">
      <div class="space-y-4">
        ${water.usages ? `
          <div class="glass rounded-xl p-4">
            <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-3 flex items-center">
              <span class="w-5 h-5 bg-green-100 dark:bg-green-900 rounded mr-2 flex items-center justify-center">
                <span class="text-xs">🎯</span>
              </span>
              Usages recommandés
            </h3>
            <p class="text-sm text-slate-600 dark:text-slate-400">${water.usages}</p>
          </div>
        ` : ''}

        ${water.restrictions ? `
          <div class="glass rounded-xl p-4">
            <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-3 flex items-center">
              <span class="w-5 h-5 bg-yellow-100 dark:bg-yellow-900 rounded mr-2 flex items-center justify-center">
                <span class="text-xs">⚠️</span>
              </span>
              Restrictions sanitaires
            </h3>
            <p class="text-sm text-slate-600 dark:text-slate-400">${water.restrictions}</p>
          </div>
        ` : ''}

        ${water.region ? `
          <div class="glass rounded-xl p-4">
            <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-3 flex items-center">
              <span class="w-5 h-5 bg-purple-100 dark:bg-purple-900 rounded mr-2 flex items-center justify-center">
                <span class="text-xs">📍</span>
              </span>
              Origine & Production
            </h3>
            <p class="text-sm text-slate-600 dark:text-slate-400">${water.region}</p>
            ${water.anneeReconnaissance ? `<p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Reconnaissance officielle: ${water.anneeReconnaissance}</p>` : ''}
            ${water.conditionnement ? `<p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Conditionnement: ${water.conditionnement}</p>` : ''}
          </div>
        ` : ''}
      </div>

      <div class="space-y-4">
        ${(water.conformiteANSES || water.conformiteEU) ? `
          <div class="glass rounded-xl p-4">
            <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-3 flex items-center">
              <span class="w-5 h-5 bg-blue-100 dark:bg-blue-900 rounded mr-2 flex items-center justify-center">
                <span class="text-xs">✅</span>
              </span>
              Conformité réglementaire
            </h3>
            ${water.conformiteANSES ? `<p class="text-sm text-slate-600 dark:text-slate-400"><strong>ANSES 2025:</strong> ${water.conformiteANSES}</p>` : ''}
            ${water.conformiteEU ? `<p class="text-sm text-slate-600 dark:text-slate-400 mt-1"><strong>UE 2008/100/CE:</strong> ${water.conformiteEU}</p>` : ''}
            ${water.laboratoireControle ? `<p class="text-xs text-slate-500 dark:text-slate-400 mt-2">Laboratoire: ${water.laboratoireControle}</p>` : ''}
            ${water.dateAnalyse ? `<p class="text-xs text-slate-500 dark:text-slate-400">Dernière analyse: ${water.dateAnalyse}</p>` : ''}
          </div>
        ` : ''}

        ${water.residusMedicamenteux && water.residusMedicamenteux !== 'Négatif' ? `
          <div class="glass rounded-xl p-4 border-l-4 border-red-400">
            <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-3 flex items-center">
              <span class="w-5 h-5 bg-red-100 dark:bg-red-900 rounded mr-2 flex items-center justify-center">
                <span class="text-xs">💊</span>
              </span>
              Résidus médicamenteux détectés
            </h3>
            <p class="text-sm text-red-600 dark:text-red-400">${water.residusMedicamenteux}</p>
          </div>
        ` : ''}

        ${(water.ajrCalcium || water.ajrMagnesium) ? `
          <div class="glass rounded-xl p-4">
            <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-3 flex items-center">
              <span class="w-5 h-5 bg-orange-100 dark:bg-orange-900 rounded mr-2 flex items-center justify-center">
                <span class="text-xs">🥛</span>
              </span>
              Apports journaliers (pour 1L)
            </h3>
            ${water.ajrCalcium ? `<p class="text-sm text-slate-600 dark:text-slate-400">Calcium: ${fmt(water.ajrCalcium)}% AJR</p>` : ''}
            ${water.ajrMagnesium ? `<p class="text-sm text-slate-600 dark:text-slate-400 mt-1">Magnésium: ${fmt(water.ajrMagnesium)}% AJR</p>` : ''}
          </div>
        ` : ''}
      </div>
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

  qs('count').textContent = total;
  qs('stats-total').textContent = total;
  qs('stats-plates').textContent = plates;
  qs('stats-petillantes').textContent = petillantes;
  qs('stats-ph').textContent = fmt(avgPh);
  qs('stats-rs').textContent = fmt(avgRs, 0);
  
  // Update filter indicator
  updateFilterIndicator();
}

function updateFilterIndicator() {
  const filterIndicator = qs('filter-indicator');
  const filterCount = qs('filter-count');
  
  if (!filterIndicator || !filterCount) return;
  
  let activeFilters = 0;
  
  // Count active filters
  const flatChecked = qs('filter-flat')?.checked ?? true;
  const sparklingChecked = qs('filter-sparkling')?.checked ?? true;
  if (!flatChecked || !sparklingChecked) activeFilters++;
  
  const query = (qs('search')?.value || '').trim();
  if (query) activeFilters++;
  
  const mineralization = qs('filter-mineralization')?.value || '';
  if (mineralization) activeFilters++;
  
  const usage = qs('filter-usage')?.value || '';
  if (usage) activeFilters++;
  
  // Show/hide indicator
  if (activeFilters > 0) {
    filterCount.textContent = activeFilters;
    filterIndicator.classList.remove('hidden');
  } else {
    filterIndicator.classList.add('hidden');
  }
}

// New intent-based filtering
function filterByIntent(intent) {
  const intentFilters = {
    'family': {
      maxSodium: 50,
      maxResiduSec: 500,
      minPh: 6.5,
      maxPh: 8.0,
      suitability: ['babies', 'general'],
      title: 'Eaux familiales et pour nourrissons',
      description: 'Sélection sécurisée pour toute la famille'
    },
    'sport': {
      minResiduSec: 500,
      minCalcium: 50,
      suitability: ['sport', 'general'],
      title: 'Eaux pour sportifs et effort',
      description: 'Riches en minéraux pour la performance'
    },
    'health': {
      maxSodium: 200,
      suitability: ['elderly', 'digestion', 'general'],
      title: 'Eaux santé et thérapeutiques',
      description: 'Adaptées aux besoins spécifiques de santé'
    }
  };

  const filter = intentFilters[intent];
  if (!filter) return state.filtered;

  const filtered = state.filtered.filter(water => {
    const qualityDisplay = getContextualQualityDisplay(water);
    
    // Check suitability
    const hasSuitability = filter.suitability.some(suit => 
      qualityDisplay.suitability.includes(suit)
    );
    if (!hasSuitability) return false;

    // Check numeric filters
    if (filter.maxSodium && water.sodium > filter.maxSodium) return false;
    if (filter.minResiduSec && water.residuSec < filter.minResiduSec) return false;
    if (filter.maxResiduSec && water.residuSec > filter.maxResiduSec) return false;
    if (filter.minPh && water.ph < filter.minPh) return false;
    if (filter.maxPh && water.ph > filter.maxPh) return false;
    if (filter.minCalcium && water.calcium < filter.minCalcium) return false;

    return true;
  });

  // Update UI
  const subtitle = qs('recommendations-subtitle');
  if (subtitle) {
    subtitle.textContent = filter.description;
  }

  return filtered.sort((a, b) => {
    const scoreA = calculateWaterScore(a);
    const scoreB = calculateWaterScore(b);
    return scoreB - scoreA;
  });
}

function renderRecommendations(intent = null) {
  const chartContainer = qs('top5-chart');
  if (!chartContainer) return;

  let watersToShow;
  if (intent) {
    watersToShow = filterByIntent(intent).slice(0, 6);
  } else {
    // Default: show top quality waters
    watersToShow = state.filtered
      .map(water => ({ ...water, score: calculateWaterScore(water) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);
  }

  
  // Générer le graphique avec informations complètes
  if (chartContainer) {
    if (scoredWaters.length === 0) {
      chartContainer.innerHTML = `
        <div class="text-center py-8 text-slate-500 dark:text-slate-400">
          <div class="text-4xl mb-3">📊</div>
          <p class="text-sm">Aucune eau ne correspond aux filtres sélectionnés</p>
        </div>
      `;
      return;
    }
    
    if (scoredWaters.length > 0) {
    const maxScore = Math.max(...scoredWaters.map(w => w.score), 1); // Éviter division par zéro
    
  chartContainer.innerHTML = watersToShow.map((water, index) => {
    const qualityDisplay = getContextualQualityDisplay(water);
    
    // Key selling points for this water
    const highlights = [];
    if (water.ph >= 6.5 && water.ph <= 8.5) highlights.push({ icon: '⚗️', text: 'pH idéal' });
    if (water.sodium <= 20) highlights.push({ icon: '🧂', text: 'Très peu salée' });
    if (water.microplasticsParticlesPerLiter <= 1) highlights.push({ icon: '🔬', text: 'Très pure' });
    if (qualityDisplay.suitability.includes('babies')) highlights.push({ icon: '👶', text: 'Bébés OK' });
    if (water.residuSec > 1000) highlights.push({ icon: '💪', text: 'Riche minéraux' });
    
    return `
      <div class="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-5 cursor-pointer hover:from-slate-50 hover:to-slate-100 dark:hover:from-slate-700 dark:hover:to-slate-800 transition-all duration-300 shadow-soft hover:shadow-soft-lg border border-slate-200 dark:border-slate-700" data-water-chart-id="${water.id}">
        
        <!-- Header with ranking and quality -->
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-lg">
              ${index + 1}
            </div>
            <div class="${qualityDisplay.class} px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
              <span>${qualityDisplay.icon}</span>
              <span class="hidden sm:inline">${qualityDisplay.text}</span>
            </div>
          </div>
        </div>
        
        <!-- Water name and type -->
        <div class="mb-4">
          <div class="flex items-center space-x-2 mb-1">
            <span class="text-lg">${water.type === 'petillante' ? '🫧' : '💧'}</span>
            <h3 class="font-bold text-slate-900 dark:text-white text-base leading-tight">${water.name}</h3>
          </div>
          <p class="text-sm text-slate-600 dark:text-slate-400">${water.proprietaire || 'Marque inconnue'}</p>
        </div>
        
        <!-- Highlights/Strengths -->
        ${highlights.length > 0 ? `
          <div class="mb-4 space-y-2">
            ${highlights.slice(0, 2).map(highlight => `
              <div class="flex items-center text-emerald-600 dark:text-emerald-400 text-sm">
                <span class="mr-2">${highlight.icon}</span>
                <span>${highlight.text}</span>
              </div>
            `).join('')}
          </div>
        ` : ''}
        
        <!-- Key specs in pills -->
        <div class="flex flex-wrap gap-2 mb-4">
          <span class="inline-flex items-center px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-xs font-medium text-slate-700 dark:text-slate-300">
            pH ${fmt(water.ph)}
          </span>
          <span class="inline-flex items-center px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-xs font-medium text-slate-700 dark:text-slate-300">
            ${fmt(water.sodium)}mg Na
          </span>
          ${water.residuSec ? `
            <span class="inline-flex items-center px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-xs font-medium text-slate-700 dark:text-slate-300">
              ${fmt(water.residuSec)}mg RS
            </span>
          ` : ''}
        </div>
        
        <!-- Suitability badges -->
        <div class="flex flex-wrap gap-1.5">
          ${qualityDisplay.suitabilityBadges.slice(0, 2).map(badge => `
            <span class="safety-badge ${badge.class} text-xs">
              ${badge.icon} <span class="hidden sm:inline">${badge.text}</span>
            </span>
          `).join('')}
        </div>
        
        <!-- Call to action -->
        <div class="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
          <div class="flex items-center justify-center text-xs text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
            <span class="mr-1">📊</span>
            <span>Voir l'analyse complète</span>
          </div>
        </div>
      </div>
    `;
  }).join('')};
    
    // Ajouter les event listeners pour le graphique
    chartContainer.querySelectorAll('[data-water-chart-id]').forEach(element => {
      element.addEventListener('click', () => {
        const waterId = element.getAttribute('data-water-chart-id');
        const water = scoredWaters.find(w => w.id === waterId);
        if (water) showWaterDetail(water);
      });
    });
    
    }
  }
}


function render() {
  applyFilters();
  updateStats();
  renderRecommendations();
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
  
  // Intent-based filtering
  const intentButtons = document.querySelectorAll('.intent-filter');
  let activeIntent = null;
  
  intentButtons.forEach(button => {
    button.addEventListener('click', () => {
      const intent = button.getAttribute('data-intent');
      
      // Toggle active state
      intentButtons.forEach(btn => btn.classList.remove('ring-2', 'ring-primary-500'));
      
      if (activeIntent === intent) {
        activeIntent = null;
      } else {
        activeIntent = intent;
        button.classList.add('ring-2', 'ring-primary-500');
      }
      
      renderRecommendations(activeIntent);
    });
  });
  
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
      // Fermer si on clique sur l'overlay (pas sur le contenu de la modal)
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

// Expose showWaterDetail globally
window.showWaterDetail = showWaterDetail;

// Initialize app
window.addEventListener('DOMContentLoaded', () => {
  bindControls();
  initialize();
});