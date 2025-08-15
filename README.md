# 💧 BenchEau

**Comparateur d'eaux minérales françaises avec données ANSES 2025**

BenchEau est une application web moderne qui analyse et compare 81 eaux minérales françaises selon 52 critères de qualité basés sur les données officielles ANSES 2025.

## ✨ Fonctionnalités

### 🏠 Vue d'ensemble
- **81 eaux analysées** : 65 eaux minérales naturelles + 16 eaux de source
- **52 critères de qualité** : composition minérale, PFAS, microplastiques, impact environnemental
- **Système de scoring** : notation de 0 à 100 basée sur les standards ANSES 2025

### 📊 Tableau interactif
- **Filtrage avancé** : par type d'eau, score qualité, minéralisation
- **Tri dynamique** : sur tous les critères (nom, score, pH, calcium, etc.)
- **Vue double** : cartes visuelles ou tableau détaillé
- **Recherche temps réel** : par nom d'eau ou région

### 🚰 Eau du robinet
- **Analyse régionale** : qualité par région française
- **Carte interactive** : zones de risque et pollution
- **Alertes pollution** : nitrates, pesticides, pollution industrielle
- **Comparaison** : coût et impact vs eaux embouteillées

### ⚖️ Comparateur
- **Comparaison côte à côte** : analyse détaillée de 2 eaux
- **Critères complets** : composition, qualité, environnement

## 🛠️ Technologies

- **Frontend** : HTML5, CSS3, JavaScript ES6+
- **Design** : Glassmorphism, responsive, mode sombre
- **Data** : CSV parsing, filtrage client-side
- **Performance** : Single Page Application, lazy loading

## 🚀 Installation

```bash
# Cloner le projet
git clone https://github.com/votre-username/BenchEau.git
cd BenchEau

# Lancer le serveur local
python3 -m http.server 8000
# ou
npx http-server

# Ouvrir dans le navigateur
open http://localhost:8000
```

## 📁 Structure

```
BenchEau/
├── index.html          # Interface principale
├── app.js             # Logique application
├── style.css          # Styles glassmorphism
├── data.csv           # Données ANSES 2025
├── CLAUDE.md          # Instructions développement
└── README.md          # Documentation
```

## 🎯 Données

Les données proviennent des analyses officielles ANSES 2025 et incluent :

- **Composition minérale** : pH, calcium, magnésium, sodium, etc.
- **Qualité sanitaire** : PFAS, microplastiques, pesticides
- **Impact environnemental** : empreinte carbone, recyclage
- **Conformité** : standards européens et français

## 🌟 Scoring

Le système de notation évalue chaque eau sur 100 points :

- **90-100** : Excellent
- **75-89** : Très bon  
- **60-74** : Bon
- **0-59** : Faible

Critères pris en compte :
- Conformité ANSES 2025 (30 points)
- Taux de PFAS (25 points)
- Microplastiques (15 points)
- Impact environnemental (10 points)
- Autres polluants (20 points)

## 🎨 Design

Interface moderne avec :
- **Glassmorphism** : effets de transparence et flou
- **Responsive** : adaptation mobile/desktop
- **Mode sombre** : basculement automatique
- **Animations** : transitions fluides

## 📱 Compatibilité

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Support mobile complet

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature
3. Commit les changements
4. Push vers la branche
5. Ouvrir une Pull Request

## 📄 Licence

MIT License - voir le fichier LICENSE pour les détails.

## 📊 Statistiques

- **81 eaux** analysées
- **52 critères** par eau
- **6 régions** couvertes
- **100% open source**

---

*Développé avec ❤️ pour une consommation d'eau éclairée*