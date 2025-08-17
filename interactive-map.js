// Carte interactive France - Gestion séparée pour meilleure performance
class InteractiveMap {
    constructor(app) {
        this.app = app;
        this.tooltip = null;
        this.regions = [];
        this.init();
    }

    init() {
        // Attendre que le DOM soit prêt
        setTimeout(() => {
            this.setupMap();
        }, 100);
    }

    setupMap() {
        try {
            this.regions = document.querySelectorAll('.region');
            this.tooltip = document.getElementById('regionTooltip');
            
            if (!this.tooltip || this.regions.length === 0) {
                console.warn('Carte interactive: éléments non trouvés');
                return;
            }

            this.bindEvents();
            console.log('✅ Carte interactive configurée:', this.regions.length, 'régions');
        } catch (error) {
            console.error('Erreur configuration carte:', error);
        }
    }

    bindEvents() {
        this.regions.forEach(region => {
            // Hover - afficher tooltip
            region.addEventListener('mouseenter', (e) => this.showTooltip(e));
            region.addEventListener('mousemove', (e) => this.moveTooltip(e));
            region.addEventListener('mouseleave', () => this.hideTooltip());
            
            // Click - modal détaillée
            region.addEventListener('click', (e) => this.showRegionModal(e));
            
            // Effets visuels
            region.addEventListener('mouseenter', (e) => this.addHoverEffect(e));
            region.addEventListener('mouseleave', (e) => this.removeHoverEffect(e));
        });
    }

    showTooltip(e) {
        const { region, quality, info } = e.target.dataset;
        
        if (region && quality && info) {
            // Contenu tooltip
            document.getElementById('tooltipRegion').textContent = region;
            document.getElementById('tooltipInfo').textContent = info;
            
            const qualityBadge = document.getElementById('tooltipQuality');
            qualityBadge.textContent = this.getQualityLabel(quality);
            qualityBadge.className = `quality-badge quality-${quality}`;
            
            // Position initiale
            this.positionTooltip(e);
            
            // Affichage
            this.tooltip.style.display = 'block';
            this.tooltip.style.opacity = '1';
            this.tooltip.style.visibility = 'visible';
            this.tooltip.style.zIndex = '1000';
        }
    }

    moveTooltip(e) {
        if (this.tooltip.style.opacity === '1') {
            this.positionTooltip(e);
        }
    }

    positionTooltip(e) {
        const mapContainer = document.querySelector('.france-map');
        const mapRect = mapContainer.getBoundingClientRect();
        const rect = e.target.getBoundingClientRect();
        
        const x = rect.left - mapRect.left + rect.width / 2;
        const y = rect.top - mapRect.top;
        
        this.tooltip.style.left = x + 'px';
        this.tooltip.style.top = (y - 90) + 'px';
        this.tooltip.style.transform = 'translateX(-50%)';
    }

    hideTooltip() {
        this.tooltip.style.opacity = '0';
        this.tooltip.style.visibility = 'hidden';
        
        setTimeout(() => {
            if (this.tooltip.style.opacity === '0') {
                this.tooltip.style.display = 'none';
            }
        }, 200);
    }

    showRegionModal(e) {
        const { region, quality, info } = e.target.dataset;
        
        if (region && quality && info && this.app) {
            this.app.showRegionDetails(region, quality, info);
        }
    }

    addHoverEffect(e) {
        e.target.style.transform = 'scale(1.05)';
        e.target.style.filter = 'brightness(1.1) saturate(1.2)';
        e.target.style.transition = 'all 0.2s ease-out';
        e.target.style.cursor = 'pointer';
    }

    removeHoverEffect(e) {
        e.target.style.transform = 'scale(1)';
        e.target.style.filter = 'brightness(1) saturate(1)';
        e.target.style.cursor = 'default';
    }

    getQualityLabel(quality) {
        const labels = {
            'excellent': 'Excellente',
            'good': 'Bonne', 
            'average': 'Surveillée',
            'poor': 'Risques'
        };
        return labels[quality] || quality;
    }

    // Méthode publique pour réinitialiser
    refresh() {
        this.setupMap();
    }

    // Nettoyage
    destroy() {
        if (this.regions) {
            this.regions.forEach(region => {
                region.replaceWith(region.cloneNode(true));
            });
        }
    }
}

// Export pour utilisation dans app.js
window.InteractiveMap = InteractiveMap;