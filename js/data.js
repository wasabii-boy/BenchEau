// data.js — chargement et normalisation optimisée des données CSV

export function toNum(v) {
  const n = typeof v === 'string' ? parseFloat(v.replace(',', '.')) : v;
  return Number.isFinite(n) ? n : undefined;
}

function splitLines(text) {
  return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
}

export function parseCsvLine(line, delimiter) {
  const out = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') { cur += '"'; i++; } else { inQuotes = false; }
      } else { cur += ch; }
    } else {
      if (ch === '"') { inQuotes = true; }
      else if (ch === delimiter) { out.push(cur); cur = ''; }
      else { cur += ch; }
    }
  }
  out.push(cur);
  return out;
}

export function guessDelimiter(text) {
  const firstTwo = text.split(/\r?\n/).slice(0, 2).join('\n');
  const commas = (firstTwo.match(/,/g) || []).length;
  const semis = (firstTwo.match(/;/g) || []).length;
  return semis > commas ? ';' : ',';
}

export function categorizeMineralization(residuSec, csvCategory) {
  // Si on a une catégorie CSV, l'utiliser en priorité
  if (csvCategory) {
    const cat = csvCategory.toLowerCase();
    if (cat.includes('très faiblement') || cat.includes('<50')) return 'tres-faiblement-mineralisee';
    if (cat.includes('faiblement') || cat.includes('<500')) return 'faiblement-mineralisee';
    if (cat.includes('moyennement') || cat.includes('500-1500')) return 'moyennement-mineralisee';
    if (cat.includes('fortement') || cat.includes('>1500') || cat.includes('>3000')) return 'riche-en-sels-mineraux';
  }
  
  // Fallback sur le résidu sec
  if (residuSec === undefined || residuSec === null || Number.isNaN(residuSec)) return 'inconnue';
  if (residuSec < 50) return 'tres-faiblement-mineralisee';
  if (residuSec <= 500) return 'faiblement-mineralisee';
  if (residuSec <= 1500) return 'moyennement-mineralisee';
  return 'riche-en-sels-mineraux';
}

export function categorizeGeographicOrigin(region) {
  if (!region) return 'inconnu';
  const reg = region.toLowerCase();
  if (reg.includes('france') || reg.includes('français')) return 'france';
  if (reg.includes('alpes') || reg.includes('massif-central')) return 'montagne';
  if (reg.includes('vosges') || reg.includes('jura')) return 'montagne';
  if (reg.includes('bretagne') || reg.includes('normandie')) return 'atlantique';
  if (reg.includes('provence') || reg.includes('corse')) return 'mediterranee';
  return 'autre';
}

export function categorizeUsage(residuSec, sodium, ph, name, usages) {
  const categories = [];
  
  // Analyse des usages explicites dans les données
  if (usages) {
    const usageStr = usages.toLowerCase();
    if (usageStr.includes('nourrisson')) categories.push('nourrissons');
    if (usageStr.includes('enfant')) categories.push('enfants');
    if (usageStr.includes('digestion')) categories.push('digestion');
    if (usageStr.includes('magnésium') || usageStr.includes('calcium')) categories.push('apport-mineraux');
    if (usageStr.includes('sport')) categories.push('sport');
  }
  
  // Catégorisation basée sur les propriétés
  if (residuSec !== undefined && residuSec < 100 && sodium !== undefined && sodium < 20) {
    categories.push('nourrissons');
  }
  if (residuSec !== undefined && residuSec > 1500) {
    categories.push('apport-mineraux');
  }
  if (name && name.toLowerCase().includes('gazéifié')) {
    categories.push('digestion');
  }
  
  return categories.length > 0 ? categories : ['consommation-quotidienne'];
}

export function normalizeCsvRow(r) {
  const get = (...keys) => {
    for (const k of keys) { if (r[k] !== undefined && r[k] !== null && String(r[k]).trim() !== '') return r[k]; }
    return undefined;
  };
  const str = (v) => (v === undefined || v === null ? undefined : String(v).trim());
  const gaseuseRaw = str(get('Gazeuse', 'gazeuse', 'Carbonatée', 'Eau gazeuse'))?.toLowerCase() || '';
  const isSparkling = gaseuseRaw === 'oui' || gaseuseRaw.startsWith('o') || gaseuseRaw === '1' || gaseuseRaw === 'true' || gaseuseRaw === 'yes';
  const id = str(get('id','ID','Id')) || (globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : String(Date.now() + Math.random()));
  const name = str(get('Nom','name','libelle','label'));
  const typeRaw = str(get('Type_eau','type','Type','categorie'))?.toLowerCase();
  
  // Amélioration de la détection du type
  let type = 'plate';
  if (typeRaw === 'petillante' || typeRaw === 'pétillante' || isSparkling) {
    type = 'petillante';
  } else if (name && (name.toLowerCase().includes('gazéifié') || name.toLowerCase().includes('gazeuse') || name.toLowerCase().includes('pétillant'))) {
    type = 'petillante';
  }
  const source = str(get('source','Source','origine','ressource'));
  const region = str(get('Origine_geographique','region','Region','departement','dept','pays'));
  const usages = str(get('Mentions_therapeutiques_validees','Usages_recommandes', 'usages', 'usage'));
  const restrictions = str(get('Restrictions_usage','Contre_indications_medicales','Restrictions_sanitaires'));
  const typeOfficiel = str(get('Type_officiel_ANSES'));
  const conditionnement = str(get('Type_conditionnement'));
  const proprietaire = str(get('Proprietaire','Proprietaire_Marque'));
  const certifications = str(get('Label_certification'));
  const historique = str(get('Historique_Anecdotes'));
  
  // Nouvelles données ANSES 2025
  const typeEau = str(get('Type_eau'));
  const contreIndications = str(get('Contre_indications_medicales'));
  const dateAnalyse = str(get('Date_derniere_analyse'));
  const laboratoireControle = str(get('Laboratoire_controle'));
  const stabilite = str(get('Stabilite_microbiologique'));
  const conformiteEU = str(get('Conformite_EU_2008_100_CE'));
  const conformiteANSES = str(get('Conformite_ANSES_2025'));
  const mentionsEtiquetage = str(get('Mentions_obligatoires_etiquetage'));
  const residusMedicamenteux = str(get('Residus_medicamenteux_detection'));
  
  const lat = toNum(get('lat','latitude','Latitude'));
  const lon = toNum(get('lon','lng','longitude','Longitude'));
  // Données physico-chimiques
  const ph = toNum(get('pH','ph','PH','Ph'));
  const conductivite = toNum(get('Conductivite_µS_cm'));
  const residuSec = toNum(get('Residu_sec_180C_mg_L','residuSec','residu','residu sec','RS','residu_sec'));
  const temperature = toNum(get('Température_source_C','temperature'));
  
  // Minéraux principaux
  const bicarbonates = toNum(get('Bicarbonates_mg_L','bicarbonates','HCO3'));
  const calcium = toNum(get('Calcium_mg_L','calcium','Ca'));
  const magnesium = toNum(get('Magnesium_mg_L','magnesium','Mg','magnesium (mg/L)','Magnésium'));
  const sodium = toNum(get('Sodium_mg_L','sodium','Na','sodium (mg/L)','Sodium'));
  const potassium = toNum(get('Potassium_mg_L','potassium','K'));
  
  // Anions
  const chlorures = toNum(get('Chlorures_mg_L','chlorures','Cl'));
  const sulfates = toNum(get('Sulfates_mg_L','sulfates','SO4'));
  const nitrates = toNum(get('Nitrates_mg_L','nitrates','NO3'));
  const fluorures = toNum(get('Fluorures_mg_L','fluorures','F'));
  
  // Éléments traces
  const silice = toNum(get('Silice_mg_L','silice','SiO2'));
  const fer = toNum(get('Fer_mg_L','fer','Fe'));
  
  // PFAS (contaminants émergents)
  const tfa = toNum(get('TFA_ng_L'));
  const pfoa = toNum(get('PFOA_ng_L'));
  const pfos = toNum(get('PFOS_ng_L'));
  const sommePFAS = toNum(get('Somme_PFAS_ng_L'));
  
  // Pesticides
  const pesticidesPertinenets = toNum(get('Metabolites_pesticides_pertinents_µg_L'));
  const pesticidesNonPertinents = toNum(get('Metabolites_pesticides_non_pertinents_µg_L'));
  
  // Micropolluants
  const microplasticsParticlesPerLiter = toNum(get('Microplastiques_particules_L','microplasticsParticlesPerLiter','microplastiques','microplastiques (p/L)','microplastics (p/L)'));
  const bisphenols = toNum(get('Bisphenols_µg_L'));
  const phtalates = toNum(get('Phtalates_µg_L'));
  
  // Radioactivité
  const activiteAlpha = toNum(get('Activite_alpha_globale_Bq_L'));
  const activiteBeta = toNum(get('Activite_beta_globale_Bq_L'));
  const tritium = toNum(get('Tritium_Bq_L'));
  const dti = toNum(get('DTI_mSv_an'));
  const uranium = toNum(get('Uranium_µg_L'));
  const radon = toNum(get('Radon_222_Bq_L'));
  
  // Apports journaliers recommandés
  const ajrCalcium = toNum(get('AJR_Calcium_pourcentage_1L'));
  const ajrMagnesium = toNum(get('AJR_Magnesium_pourcentage_1L'));
  
  // Données environnementales
  const empreinteCarbone = toNum(get('Empreinte_carbone_kg_CO2_L','Empreinte_carbone_estimee'));
  const empreinteHydrique = toNum(get('Empreinte_hydrique_L_eau_L_produit'));
  const tauxRecyclage = toNum(get('Taux_recyclage_emballage_pourcentage'));
  
  // Données administratives
  const anneeReconnaissance = toNum(get('Annee_reconnaissance_officielle'));
  const coefficientVariation = toNum(get('Coefficient_variation_composition'));
  
  // Nouvelles catégorisations
  const csvMineralizationCategory = str(get('Categorie_mineralisation'));
  const mineralizationCategory = categorizeMineralization(residuSec, csvMineralizationCategory);
  const geographicCategory = categorizeGeographicOrigin(region);
  const usageCategories = categorizeUsage(residuSec, sodium, ph, name, usages);
  
  return {
    // Identifiants et infos de base
    id, name, type, typeEau, source, region, coordinates: [lat, lon],
    proprietaire, anneeReconnaissance, conditionnement,
    
    // Données physico-chimiques
    ph, conductivite, residuSec, temperature,
    
    // Composition minérale complète
    bicarbonates, calcium, magnesium, sodium, potassium,
    chlorures, sulfates, nitrates, fluorures, silice, fer,
    
    // Contaminants et qualité (ANSES 2025)
    microplasticsParticlesPerLiter, 
    tfa, pfoa, pfos, sommePFAS,
    pesticidesPertinenets, pesticidesNonPertinents,
    bisphenols, phtalates, residusMedicamenteux,
    
    // Radioactivité
    activiteAlpha, activiteBeta, tritium, dti, uranium, radon,
    
    // Apports nutritionnels
    ajrCalcium, ajrMagnesium,
    
    // Environnement
    empreinteCarbone, empreinteHydrique, tauxRecyclage,
    
    // Conformité et qualité
    conformiteEU, conformiteANSES, stabilite, coefficientVariation,
    laboratoireControle, dateAnalyse,
    
    // Usage et restrictions
    usages, restrictions, contreIndications, mentionsEtiquetage,
    certifications, historique, typeOfficiel,
    
    // Catégorisations
    categories: {
      mineralization: mineralizationCategory,
      geographic: geographicCategory,
      usage: usageCategories
    }
  };
}

export async function parseTextToRows(text) {
  const finalize = (rows) => rows.map(normalizeCsvRow).filter(w => w && w.name);
  if (!text || !text.trim()) return [];
  if (typeof Papa !== 'undefined' && Papa.parse) {
    return new Promise((resolve) => {
      Papa.parse(text, { header: true, dynamicTyping: false, skipEmptyLines: true, delimiter: guessDelimiter(text), complete: (r) => resolve(finalize(r.data || [])) });
    });
  }
  const delimiter = guessDelimiter(text);
  const lines = splitLines(text).filter(l => l.trim().length > 0);
  if (!lines.length) return [];
  const headers = parseCsvLine(lines[0], delimiter);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i], delimiter);
    if (values.length === 1 && values[0] === '') continue;
    const obj = {};
    for (let j = 0; j < headers.length; j++) { obj[headers[j]] = values[j] ?? ''; }
    rows.push(obj);
  }
  return finalize(rows);
}

export async function loadData() {
  // Chargement unique et obligatoire de 73780c22.csv
  const file = '73780c22.csv';
  try {
    const res = await fetch(`./${file}`, { cache: 'no-store' });
    if (res.ok) {
      const text = await res.text();
      const rows = await parseTextToRows(text);
      return { rows, source: file };
    }
    return { rows: [], source: 'aucune', error: `Échec de chargement de ${file}` };
  } catch (_) {
    return { rows: [], source: 'aucune', error: `Impossible de charger ${file}` };
  }
}
