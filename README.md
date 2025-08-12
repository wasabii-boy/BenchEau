# 💧 BenchEau - Comparateur d'Eaux Minérales

> **Application web moderne pour comparer et analyser les eaux minérales françaises**

[![Status](https://img.shields.io/badge/Status-Active-success)](.)
[![Version](https://img.shields.io/badge/Version-2.0-blue)](.)
[![License](https://img.shields.io/badge/License-MIT-green)](.)

---

## 🎯 **Vue d'ensemble**

**BenchEau** est une application web interactive qui permet de comparer **79 eaux minérales** françaises basée sur des analyses complètes ANSES 2025 incluant la composition minérale, les microplastiques, PFAS, et les recommandations d'usage.

### ✨ **Fonctionnalités principales**

- 🏆 **Top 10 des meilleures eaux** avec scoring scientifique
- 🔍 **Filtrage avancé** par type, minéralisation, et usage
- 📊 **Statistiques en temps réel** sur la composition
- 🗂️ **Interface en cartes modernes** avec détails complets
- 📱 **Design 100% responsive** mobile/tablette/desktop
- ⚡ **Performance optimisée** avec animations fluides

---

## 📊 **Données analysées**

### 🧪 **Composition complète (52 critères)**
- **Paramètres physiques** : pH, conductivité, résidu sec, température source
- **Minéraux essentiels** : Calcium, Magnésium, Sodium, Potassium, Bicarbonates
- **Éléments traces** : Chlorures, Sulfates, Nitrates, Fluorures, Silice, Fer
- **Contaminants émergents** : PFAS (TFA, PFOA, PFOS), Microplastiques (ANSES 2025)
- **Polluants** : Pesticides, résidus médicamenteux, bisphénols, phtalates
- **Radioactivité** : Activité alpha/beta, tritium, uranium, radon
- **Qualité sanitaire** : Conformité EU/ANSES, restrictions d'usage
- **Environnement** : Empreinte carbone, empreinte hydrique, recyclage
- **Géographiques** : Origine précise, propriétaire, année de reconnaissance

### 🎯 **Système de notation**
```javascript
Score = pH optimal (20pts) + Faible sodium (20pts) + 
        Microplastiques (20pts) + Minéralisation équilibrée (20pts) +
        Pureté (15pts) + Bonus minéraux (20pts) + Certifications (5pts)
```

---

## 🚀 **Installation & Usage**

### **Prérequis**
- Navigateur web moderne (Chrome, Firefox, Safari, Edge)
- Serveur web local (optionnel)

### **Démarrage rapide**
```bash
# Cloner le projet
git clone https://github.com/wasabii-boy/BenchEau.git
cd BenchEau

# Serveur local (optionnel)
python3 -m http.server 8000
# ou
npx http-server

# Ouvrir dans le navigateur
open http://localhost:8000
# ou directement
open index.html
```

### **Structure du projet**
```
BenchEau/
├── index.html              # Interface principale
├── eaux-en-detail.html     # Vue cartes détaillées
├── toutes-les-eaux.html    # Vue tableau complète
├── js/
│   ├── main.js             # Logique application
│   ├── data.js             # Chargement données CSV
│   ├── eaux-en-detail.js   # Scripts vue cartes
│   └── toutes-les-eaux.js  # Scripts vue tableau
├── 73780c22.csv            # Base de données (79 eaux ANSES 2025)
├── favicon.svg             # Icône du site
└── README.md               # Documentation
```

---

## 🎨 **Architecture technique**

### **Frontend moderne**
- **HTML5** sémantique avec accessibilité
- **CSS moderne** avec TailwindCSS + animations personnalisées  
- **JavaScript ES6+** avec modules et async/await
- **Design System** glassmorphism avec thème sombre

### **Traitement des données**
- **Parsing CSV** intelligent avec Papa Parse
- **Normalisation** automatique des colonnes
- **Catégorisation** par minéralisation, usage, origine
- **Calculs statistiques** en temps réel

### **Performance**
- **Lazy loading** avec animations CSS
- **Debouncing** sur les filtres (200ms)
- **Event delegation** optimisée
- **Cache busting** avec versioning

---

## 🔍 **Fonctionnalités détaillées**

### 🏆 **Top 10 Intelligence**
Algorithme de scoring multi-critères basé sur :
- **Santé** : pH optimal (6.5-8.5), sodium faible (≤20mg/L)
- **Pureté** : Microplastiques minimal (≤1.5p/L), nitrates (≤2mg/L)  
- **Équilibre** : Minéralisation modérée (150-500mg/L)
- **Bonus** : Calcium/Magnésium optimaux, certifications ISO

### 🎛️ **Filtres avancés**
- **Panel coulissant** au hover avec bouton flottant
- **Types** : Plates vs Pétillantes
- **Minéralisation** : Très faible → Riche en sels
- **Usage** : Nourrissons, Sport, Digestion, etc.
- **Recherche textuelle** : Nom, marque, région

### 📊 **Visualisation**
- **Cartes interactives** avec composition minérale
- **Barres de progression** colorées par intensité
- **Indicateurs qualité** : 🟢🟡🔴 selon les seuils
- **Modal détaillée** avec analyse complète
- **Statistiques dynamiques** sur la sélection

---

## 🛠️ **Personnalisation**

### **Modifier les critères de scoring**
```javascript
// Dans js/main.js - fonction calculateWaterScore()
// Ajuster les seuils et pondérations
if (water.ph >= 6.5 && water.ph <= 8.5) {
  score += 20; // Pondération pH
}
```

### **Ajouter de nouvelles données**
```javascript
// Dans js/data.js - fonction normalizeCsvRow()
// Mapper nouvelles colonnes CSV (format français)
const nouvelleColonne = toNum(get('Nouvelle_Colonne_CSV_mg_L'));

// Exemple pour les données ANSES 2025
const pfas = toNum(get('Somme_PFAS_ng_L'));
const microplastiques = toNum(get('Microplastiques_particules_L'));

// Pour changer de dataset, modifier loadData()
const file = 'votre-nouveau-fichier.csv';
```

### **Personnaliser l'apparence**
```css
/* Modifier les couleurs dans index.html */
:root {
  --primary-color: #0891b2;   /* Bleu principal */
  --glass-bg: rgba(255,255,255,0.95);  /* Fond glassmorphism */
}
```

---

## 📈 **Métriques & Performance**

### **Données**
- ✅ **79 eaux minérales** analysées (ANSES 2025)
- ✅ **52 critères** par eau (4,100+ points de données)
- ✅ **5 catégories** d'usage recommandé
- ✅ **4 niveaux** de minéralisation

### **Interface**
- ⚡ **<100ms** temps de filtrage
- 🎨 **60fps** animations CSS
- 📱 **280px+** support mobile
- ♿ **WCAG 2.1** accessibilité

### **Compatibilité**
- ✅ Chrome 90+ / Firefox 88+ / Safari 14+ / Edge 90+
- ✅ iOS 14+ / Android 8+
- ✅ Fonctionne hors ligne après premier chargement

---

## 🤝 **Contribution**

### **Guidelines**
1. **Fork** le projet
2. **Branche** pour nouvelles fonctionnalités : `git checkout -b feature/nom`
3. **Commit** avec messages clairs : `git commit -m "feat: nouvelle fonctionnalité"`
4. **Push** et créer une **Pull Request**

### **Standards de code**
- **ES6+** modules avec import/export
- **Functions** pures privilégiées
- **Comments** JSDoc pour fonctions publiques
- **Naming** camelCase JavaScript, kebab-case CSS

---

## 🐛 **Dépannage**

### **Problèmes fréquents**

| Problème | Solution |
|----------|----------|
| Données non chargées | Vérifier `73780c22.csv` présent |
| Filtres non fonctionnels | Ctrl+F5 pour vider le cache |
| Interface cassée | Vérifier console navigateur |
| Performance lente | Réduire animations avec `prefers-reduced-motion` |

### **Debug mode**
```javascript
// Dans la console navigateur
window.state         // État application
window.showWaterDetail(water)  // Ouvrir modal détaillée
localStorage.clear() // Reset préférences

// Test du chargement de données
import { loadData } from './js/data.js';
loadData().then(result => console.log(result.rows));

// Test de la page de diagnostic
// Ouvrir: http://localhost:8000/test.html
```

---

## 📜 **Licence & Crédits**

### **Licence MIT**
```
MIT License - Libre d'utilisation commerciale et personnelle
Copyright (c) 2024 BenchEau Project
```

### **Sources de données**
- **ANSES** (Agence nationale de sécurité sanitaire) - Analyses microplastiques 2025
- **Ministère de la Santé** - Réglementation eaux minérales
- **Fabricants** - Informations officielles produits

### **Technologies**
- [TailwindCSS](https://tailwindcss.com) - Framework CSS utilitaire
- [Papa Parse](https://papaparse.com) - Parser CSV JavaScript

---

## 🎯 **Roadmap**

### **Version 2.2** *(Q4 2025)*
- [ ] 🗺️ Carte interactive des sources géographiques
- [ ] 💾 Export PDF des analyses détaillées
- [ ] 📊 Graphiques comparatifs temporels
- [ ] 🔗 API REST pour développeurs

### **Version 2.3** *(Q1 2026)*
- [ ] 🤖 IA recommandations personnalisées selon profil utilisateur
- [ ] 📈 Historique évolution qualité des eaux dans le temps
- [ ] 🌍 Support eaux internationales (EU, Suisse, etc.)
- [ ] 📱 PWA avec mode hors ligne complet

---

**Made with 💧 for water quality transparency**

*Dernière mise à jour : Août 2025*

---

## 📋 **Changelog**

### **v2.1** *(Août 2025)*
- ✨ **Nouveau dataset ANSES 2025** avec 79 eaux minérales
- 🧪 **Analyses étendues** : PFAS, microplastiques, contaminants émergents  
- 🔧 **Mapping CSV corrigé** pour les colonnes françaises
- 📊 **Top 10** au lieu de Top 5 pour plus de choix
- 🎯 **Catégorisation intelligente** basée sur les données officielles
- ⚡ **Performance améliorée** avec gestion d'erreurs optimisée

### **v2.0** *(2024)*
- 🎨 Interface moderne avec glassmorphism
- 🌙 Mode sombre automatique
- 📱 Design 100% responsive
- 🏆 Système de scoring scientifique