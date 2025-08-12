// utils/scoring.js — Système de scoring unifié ANSES 2025 pour BenchEau

export function calculateWaterScore(water) {
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
  const maxPossible = 200;
  const baseScore = Math.min(100, Math.round((score / maxPossible) * 100));
  return Math.max(0, Math.min(100, Math.round(baseScore + variation)));
}

// Nouvelle fonction pour obtenir une évaluation contextuelle
export function getQualityRating(score) {
  if (score >= 85) {
    return {
      level: 'excellente',
      label: 'Excellente qualité',
      description: 'Idéale pour toute la famille',
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
      borderColor: 'border-green-200 dark:border-green-700',
      icon: '⭐'
    };
  } else if (score >= 70) {
    return {
      level: 'bonne',
      label: 'Bonne qualité', 
      description: 'Recommandée pour usage quotidien',
      color: 'text-lime-600 dark:text-lime-400',
      bgColor: 'bg-gradient-to-r from-lime-50 to-green-50 dark:from-lime-900/20 dark:to-green-900/20',
      borderColor: 'border-lime-200 dark:border-lime-700',
      icon: '✓'
    };
  } else if (score >= 55) {
    return {
      level: 'correcte',
      label: 'Qualité correcte',
      description: 'Convenable pour consommation occasionnelle',
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20',
      borderColor: 'border-yellow-200 dark:border-yellow-700',
      icon: '○'
    };
  } else if (score >= 40) {
    return {
      level: 'moyenne',
      label: 'Qualité moyenne',
      description: 'À consommer avec modération',
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20',
      borderColor: 'border-orange-200 dark:border-orange-700',
      icon: '⚠'
    };
  } else {
    return {
      level: 'mediocre',
      label: 'Qualité médiocre',
      description: 'Non recommandée',
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20',
      borderColor: 'border-red-200 dark:border-red-700',
      icon: '✗'
    };
  }
}

// Déterminer les badges de sécurité pour groupes vulnérables
export function getSafetyBadges(water) {
  const badges = [];
  
  // Badge nourrissons
  if (water.sodium <= 20 && water.ph >= 6.5 && water.ph <= 7.5 && 
      (water.sommePFAS === undefined || water.sommePFAS <= 10) &&
      (water.nitrates === undefined || water.nitrates <= 2)) {
    badges.push({
      type: 'nourrissons',
      label: '👶 Nourrissons',
      description: 'Adapté aux bébés',
      color: 'bg-pink-100 text-pink-800 dark:bg-pink-900/50 dark:text-pink-200'
    });
  }
  
  // Badge seniors  
  if (water.sodium <= 50 && water.calcium >= 30 && water.magnesium >= 5) {
    badges.push({
      type: 'seniors',
      label: '🧓 Seniors',
      description: 'Adapté aux seniors',
      color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200'
    });
  }
  
  // Badge sport
  if (water.calcium >= 100 && water.magnesium >= 20 && water.residuSec >= 500) {
    badges.push({
      type: 'sport',
      label: '🏃 Sport',
      description: 'Riche en minéraux',
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200'
    });
  }
  
  // Badge digestion
  if (water.type === 'petillante' || (water.bicarbonates >= 600)) {
    badges.push({
      type: 'digestion',
      label: '🌿 Digestion',
      description: 'Facilite la digestion',
      color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200'
    });
  }
  
  return badges;
}

// Utilitaire pour formater les valeurs
export function fmt(v, decimals = 1) {
  if (v === undefined || v === null || Number.isNaN(v)) return '-';
  if (typeof v === 'number') {
    return Number.isInteger(v) ? String(v) : v.toFixed(decimals);
  }
  return String(v);
}

// Sanitisation HTML pour éviter XSS
export function sanitizeHTML(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}