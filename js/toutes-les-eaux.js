// toutes-les-eaux.js — Page dédiée pour afficher toutes les eaux
import { loadData } from './data.js?v=16';

const state = {
  data: [],
  filtered: [],
  sortBy: 'score-desc',
  query: ''
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

// Algorithme de scoring pour déterminer les meilleures eaux - ANSES 2025
function calculateWaterScore(water) {
  let score = 0;
  let factors = 0;

  // Score pH (optimal: 6.5-8.5)
  if (water.ph) {
    if (water.ph >= 6.5 && water.ph <= 8.5) {
      score += 20;
    } else if (water.ph >= 6.0 && water.ph <= 9.0) {
      score += 10;
    }
    factors++;
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
  
  // Normaliser le score sur 100 avec variation
  // Score max théorique: 20+20+20+20+15+20+15+15+10+10+10+5+5 = 185 points + bonus
  const maxPossible = 200;
  const baseScore = Math.min(100, Math.round((score / maxPossible) * 100));
  return Math.max(0, Math.min(100, Math.round(baseScore + variation)));
}

function getQualityIndicator(value, thresholds, reverse = false) {
  if (value === undefined || value === null || isNaN(value)) return '⚪';
  const isGood = reverse ? value > thresholds.good : value <= thresholds.good;
  const isModerate = reverse ? value > thresholds.moderate : value <= thresholds.moderate;
  
  if (isGood) return '🟢';
  if (isModerate) return '🟡';
  return '🔴';
}

function getStrengths(water) {
  const strengths = [];
  if (water.ph >= 6.5 && water.ph <= 8.5) strengths.push('pH optimal');
  if (water.sodium <= 20) strengths.push('Faible sodium');
  if (water.microplasticsParticlesPerLiter <= 1.5) strengths.push('Très pur');
  if (water.residuSec >= 150 && water.residuSec <= 500) strengths.push('Bien minéralisé');
  if (water.calcium >= 50 && water.calcium <= 150) strengths.push('Bon calcium');
  if (water.magnesium >= 10 && water.magnesium <= 50) strengths.push('Bon magnésium');
  return strengths;
}

function applySortAndFilter() {
  const query = state.query.toLowerCase();
  
  // Filtrer par recherche
  state.filtered = state.data.filter(water => {
    if (!query) return true;
    const searchText = `${water.name} ${water.region || ''} ${water.proprietaire || ''}`.toLowerCase();
    return searchText.includes(query);
  });

  // Calculer les scores et trier
  state.filtered = state.filtered.map(water => ({
    ...water,
    score: calculateWaterScore(water)
  }));

  // Appliquer le tri
  switch (state.sortBy) {
    case 'score-desc':
      state.filtered.sort((a, b) => b.score - a.score);
      break;
    case 'score-asc':
      state.filtered.sort((a, b) => a.score - b.score);
      break;
    case 'name-asc':
      state.filtered.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'name-desc':
      state.filtered.sort((a, b) => b.name.localeCompare(a.name));
      break;
    case 'ph-asc':
      state.filtered.sort((a, b) => (a.ph || 0) - (b.ph || 0));
      break;
    case 'ph-desc':
      state.filtered.sort((a, b) => (b.ph || 0) - (a.ph || 0));
      break;
  }
}

function renderTable() {
  const tbody = qs('waters-table-body');
  const emptyState = qs('empty-state');
  
  if (!tbody) return;

  if (state.filtered.length === 0) {
    tbody.innerHTML = '';
    if (emptyState) emptyState.classList.remove('hidden');
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');

  tbody.innerHTML = state.filtered.map((water, index) => {
    const strengths = getStrengths(water);
    const scoreColor = water.score >= 80 ? 'text-green-600 dark:text-green-400' : 
                     water.score >= 60 ? 'text-yellow-600 dark:text-yellow-400' : 
                     'text-red-600 dark:text-red-400';

    // Indicateurs de qualité
    const phIndicator = getQualityIndicator(water.ph, { good: 7.5, moderate: 8.5 });
    const sodiumIndicator = getQualityIndicator(water.sodium, { good: 20, moderate: 200 });
    const microplasticsIndicator = getQualityIndicator(water.microplasticsParticlesPerLiter, { good: 1, moderate: 5 });

    return `
      <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors" 
          data-water-id="${water.id}">
        <td class="px-4 py-3 text-sm font-medium text-slate-500 dark:text-slate-400">
          ${index + 1}
        </td>
        <td class="px-4 py-3">
          <div class="flex items-center space-x-3">
            <span class="text-lg">${water.type === 'petillante' ? '🫧' : '💧'}</span>
            <div>
              <div class="text-sm font-semibold text-slate-900 dark:text-white">${water.name}</div>
              <div class="text-xs text-slate-500 dark:text-slate-400">${water.proprietaire || 'Marque inconnue'}</div>
            </div>
          </div>
        </td>
        <td class="px-4 py-3">
          <div class="flex items-center space-x-2">
            <div class="text-sm font-bold ${scoreColor}">${water.score}</div>
            <div class="text-xs text-slate-400">/100</div>
          </div>
        </td>
        <td class="px-4 py-3">
          <div class="flex items-center space-x-1">
            <span class="text-xs">${phIndicator}</span>
            <span class="text-sm font-mono">${fmt(water.ph)}</span>
          </div>
        </td>
        <td class="px-4 py-3">
          <div class="flex items-center space-x-1">
            <span class="text-xs">${sodiumIndicator}</span>
            <span class="text-sm font-mono">${fmt(water.sodium)} mg/L</span>
          </div>
        </td>
        <td class="px-4 py-3">
          <div class="flex items-center space-x-1">
            <span class="text-xs">${microplasticsIndicator}</span>
            <span class="text-sm font-mono">${fmt(water.microplasticsParticlesPerLiter)} p/L</span>
          </div>
        </td>
        <td class="px-4 py-3">
          <span class="text-sm font-mono">${fmt(water.residuSec)} mg/L</span>
        </td>
        <td class="px-4 py-3">
          <div class="flex flex-wrap gap-1">
            ${strengths.slice(0, 2).map(strength => `
              <span class="inline-block px-1.5 py-0.5 rounded text-xs bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300">
                ✓ ${strength}
              </span>
            `).join('')}
            ${strengths.length > 2 ? `<span class="text-xs text-slate-400">+${strengths.length - 2}</span>` : ''}
          </div>
        </td>
      </tr>
    `;
  }).join('');

  // Event listeners pour les lignes
  tbody.querySelectorAll('[data-water-id]').forEach(row => {
    row.addEventListener('click', () => {
      const waterId = row.getAttribute('data-water-id');
      const water = state.filtered.find(w => w.id === waterId);
      if (water) showWaterDetail(water);
    });
  });
}

function updateStats() {
  const count = qs('count');
  const avgScore = qs('avg-score');
  
  if (count) count.textContent = state.filtered.length;
  
  if (avgScore && state.filtered.length > 0) {
    const avg = mean(state.filtered.map(w => w.score));
    avgScore.textContent = fmt(avg, 0);
  } else if (avgScore) {
    avgScore.textContent = '-';
  }
}

// Fonction showWaterDetail avec système complet ANSES 2025
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

function render() {
  applySortAndFilter();
  updateStats();
  renderTable();
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

  // Sort controls
  const sortBy = qs('sort-by');
  if (sortBy) {
    sortBy.addEventListener('change', (e) => {
      state.sortBy = e.target.value;
      render();
    });
  }

  // Search control
  const search = qs('search');
  if (search) {
    search.addEventListener('input', (e) => {
      state.query = e.target.value;
      renderDebounced();
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

// Initialize app
window.addEventListener('DOMContentLoaded', () => {
  bindControls();
  initialize();
});