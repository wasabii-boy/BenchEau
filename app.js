class BenchEauApp {
    constructor() {
        this.data = [];
        this.filteredData = [];
        this.currentView = 'home';
        this.darkMode = localStorage.getItem('darkMode') === 'true';
        this.searchDebounce = null;
        
        this.init();
    }

    async init() {
        try {
            await this.loadData();
            this.calculateScores();
            this.setupEventListeners();
            this.setupDarkMode();
            this.updateStats();
            this.switchView('home');
        } catch (error) {
            console.error('Erreur lors de l\'initialisation:', error);
            this.showError('Erreur lors du chargement de l\'application');
        }
    }

    async loadData() {
        try {
            const response = await fetch('data.csv');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const csvText = await response.text();
            this.data = this.parseCSV(csvText);
            console.log(`✅ Chargé ${this.data.length} eaux avec succès`);
        } catch (error) {
            console.error('❌ Erreur lors du chargement des données:', error);
            throw error;
        }
    }

    parseCSV(csvText) {
        try {
            // Nettoyer le BOM UTF-8 si présent
            const cleanText = csvText.replace(/^\uFEFF/, '');
            const lines = cleanText.trim().split('\n');
            
            if (lines.length < 2) {
                throw new Error('Fichier CSV vide ou malformé');
            }

            const headers = this.parseCSVLine(lines[0]);
            const data = [];

            for (let i = 1; i < lines.length; i++) {
                try {
                    const values = this.parseCSVLine(lines[i]);
                    if (values.length === headers.length) {
                        const water = {};
                        headers.forEach((header, index) => {
                            water[header.trim()] = values[index] ? values[index].trim() : '';
                        });
                        
                        // Validation des données essentielles
                        if (water.Nom && water.Type_eau) {
                            data.push(water);
                        }
                    }
                } catch (error) {
                    console.warn(`Ligne ${i + 1} ignorée: ${error.message}`);
                }
            }

            return data;
        } catch (error) {
            console.error('Erreur de parsing CSV:', error);
            throw new Error('Impossible de parser le fichier CSV');
        }
    }

    parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        let i = 0;
        
        while (i < line.length) {
            const char = line[i];
            
            if (char === '"') {
                if (inQuotes && line[i + 1] === '"') {
                    // Double quote escape
                    current += '"';
                    i += 2;
                } else {
                    inQuotes = !inQuotes;
                    i++;
                }
            } else if (char === ',' && !inQuotes) {
                result.push(current);
                current = '';
                i++;
            } else {
                current += char;
                i++;
            }
        }
        
        result.push(current);
        return result;
    }

    setupEventListeners() {
        try {
            // Navigation buttons
            document.querySelectorAll('.nav-btn, .category-card').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const view = e.currentTarget.dataset.view;
                    if (view) {
                        this.switchView(view);
                    }
                });
            });

            // Dark mode toggle
            const darkToggle = document.querySelector('.dark-mode-toggle');
            if (darkToggle) {
                darkToggle.addEventListener('click', () => this.toggleDarkMode());
            }

            // New unified search and filters
            this.setupSearchInput('searchEaux', 'eaux');
            this.setupFilters();
            this.setupViewToggle();
            this.setupTableSorting();

            // Compare selects
            this.setupCompareSelects();

            // Modal
            this.setupModal();

            console.log('✅ Event listeners configurés');
        } catch (error) {
            console.error('❌ Erreur configuration event listeners:', error);
        }
    }

    setupSearchInput(inputId, type) {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('input', (e) => {
                clearTimeout(this.searchDebounce);
                this.searchDebounce = setTimeout(() => {
                    this.searchWaters(type, e.target.value);
                }, 300);
            });
        }
    }

    setupCompareSelects() {
        const select1 = document.getElementById('compareSelect1');
        const select2 = document.getElementById('compareSelect2');
        
        if (select1) {
            select1.addEventListener('change', () => this.updateComparison());
        }
        if (select2) {
            select2.addEventListener('change', () => this.updateComparison());
        }
    }

    setupModal() {
        const modal = document.getElementById('waterModal');
        const closeBtn = document.querySelector('.modal-close');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeModal());
        }
        
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });
        }

        // ESC key pour fermer la modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
                this.closeModal();
            }
        });
    }

    setupDarkMode() {
        try {
            const toggle = document.querySelector('.dark-mode-toggle');
            if (this.darkMode) {
                document.body.classList.add('dark-mode');
                if (toggle) toggle.textContent = '☀️';
            } else {
                if (toggle) toggle.textContent = '🌙';
            }
        } catch (error) {
            console.error('Erreur setup dark mode:', error);
        }
    }

    toggleDarkMode() {
        try {
            this.darkMode = !this.darkMode;
            document.body.classList.toggle('dark-mode', this.darkMode);
            
            const toggle = document.querySelector('.dark-mode-toggle');
            if (toggle) {
                toggle.textContent = this.darkMode ? '☀️' : '🌙';
            }
            
            localStorage.setItem('darkMode', this.darkMode.toString());
        } catch (error) {
            console.error('Erreur toggle dark mode:', error);
        }
    }

    updateStats() {
        try {
            if (!this.data || this.data.length === 0) return;

            const mineralWaters = this.data.filter(w => w.Type_eau === 'Eau minérale naturelle').length;
            const sourceWaters = this.data.filter(w => w.Type_eau === 'Eau de source').length;
            const sparklingWaters = this.data.filter(w => w.Gazeuse === 'Oui').length;
            const totalWaters = this.data.length;

            // Update navigation counts
            const navText = document.querySelector('[data-view="eaux"] .nav-text');
            if (navText) {
                navText.textContent = `Toutes les eaux (${totalWaters})`;
            }

            console.log(`📊 Stats: ${totalWaters} eaux total (${mineralWaters} minérales, ${sourceWaters} sources, ${sparklingWaters} gazeuses)`);
        } catch (error) {
            console.error('Erreur update stats:', error);
        }
    }

    switchView(viewName) {
        try {
            // Validation du nom de vue
            const validViews = ['home', 'eaux', 'robinet', 'compare'];
            if (!validViews.includes(viewName)) {
                console.warn(`Vue invalide: ${viewName}`);
                return;
            }

            // Update active nav button
            document.querySelectorAll('.nav-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            
            const activeBtn = document.querySelector(`[data-view="${viewName}"]`);
            if (activeBtn) {
                activeBtn.classList.add('active');
            }

            // Hide all views
            document.querySelectorAll('.view').forEach(view => {
                view.classList.remove('active');
            });

            // Show target view
            const targetView = document.getElementById(viewName);
            if (targetView) {
                targetView.classList.add('active');
                this.currentView = viewName;

                // Load view content
                this.loadViewContent(viewName);
            } else {
                console.error(`Vue non trouvée: ${viewName}`);
            }
        } catch (error) {
            console.error('Erreur switch view:', error);
        }
    }

    loadViewContent(viewName) {
        try {
            switch (viewName) {
                case 'eaux':
                    this.loadAllWaters();
                    break;
                case 'compare':
                    this.loadCompareView();
                    break;
                case 'robinet':
                case 'home':
                    // Static content
                    break;
                default:
                    console.warn(`Contenu non défini pour la vue: ${viewName}`);
            }
        } catch (error) {
            console.error(`Erreur chargement vue ${viewName}:`, error);
        }
    }

    loadAllWaters() {
        this.currentFilters = {
            search: '',
            type: 'all',
            score: 'all',
            mineralization: 'all'
        };
        this.currentSort = 'score-desc';
        this.isTableView = false;
        
        this.applyFiltersAndSort();
    }

    setupFilters() {
        // Type filter
        const typeFilter = document.getElementById('filterType');
        if (typeFilter) {
            typeFilter.addEventListener('change', (e) => {
                this.currentFilters.type = e.target.value;
                this.applyFiltersAndSort();
            });
        }

        // Score filter
        const scoreFilter = document.getElementById('filterScore');
        if (scoreFilter) {
            scoreFilter.addEventListener('change', (e) => {
                this.currentFilters.score = e.target.value;
                this.applyFiltersAndSort();
            });
        }

        // Mineralization filter
        const mineralizationFilter = document.getElementById('filterMineralization');
        if (mineralizationFilter) {
            mineralizationFilter.addEventListener('change', (e) => {
                this.currentFilters.mineralization = e.target.value;
                this.applyFiltersAndSort();
            });
        }

        // Sort control
        const sortControl = document.getElementById('sortBy');
        if (sortControl) {
            sortControl.addEventListener('change', (e) => {
                this.currentSort = e.target.value;
                this.applyFiltersAndSort();
            });
        }
    }

    setupViewToggle() {
        const gridBtn = document.getElementById('gridViewBtn');
        const tableBtn = document.getElementById('tableViewBtn');

        if (gridBtn && tableBtn) {
            gridBtn.addEventListener('click', () => {
                this.isTableView = false;
                gridBtn.classList.add('active');
                tableBtn.classList.remove('active');
                this.toggleViewDisplay();
            });

            tableBtn.addEventListener('click', () => {
                this.isTableView = true;
                tableBtn.classList.add('active');
                gridBtn.classList.remove('active');
                this.toggleViewDisplay();
            });
        }
    }

    setupTableSorting() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('sortable')) {
                const sortKey = e.target.dataset.sort;
                this.handleTableSort(sortKey, e.target);
            }
        });
    }

    handleTableSort(sortKey, headerElement) {
        // Clear other headers
        document.querySelectorAll('.sortable').forEach(th => {
            th.classList.remove('sort-asc', 'sort-desc');
        });

        // Determine sort direction
        const isAsc = this.currentSort === `${sortKey}-asc`;
        this.currentSort = isAsc ? `${sortKey}-desc` : `${sortKey}-asc`;

        // Update header visual
        headerElement.classList.add(isAsc ? 'sort-desc' : 'sort-asc');

        this.applyFiltersAndSort();
    }

    applyFiltersAndSort() {
        try {
            let filteredWaters = [...this.data];

            // Apply search filter
            if (this.currentFilters.search && this.currentFilters.search.trim()) {
                const searchTerm = this.currentFilters.search.toLowerCase().trim();
                filteredWaters = filteredWaters.filter(water => 
                    (water.Nom && water.Nom.toLowerCase().includes(searchTerm)) ||
                    (water.Origine_geographique && water.Origine_geographique.toLowerCase().includes(searchTerm))
                );
            }

            // Apply type filter
            if (this.currentFilters.type !== 'all') {
                switch (this.currentFilters.type) {
                    case 'minerale':
                        filteredWaters = filteredWaters.filter(w => w.Type_eau === 'Eau minérale naturelle');
                        break;
                    case 'source':
                        filteredWaters = filteredWaters.filter(w => w.Type_eau === 'Eau de source');
                        break;
                    case 'gazeuse':
                        filteredWaters = filteredWaters.filter(w => w.Gazeuse === 'Oui');
                        break;
                }
            }

            // Apply score filter
            if (this.currentFilters.score !== 'all') {
                filteredWaters = filteredWaters.filter(water => {
                    const score = water.score || 0;
                    switch (this.currentFilters.score) {
                        case 'excellent': return score >= 90;
                        case 'good': return score >= 75 && score < 90;
                        case 'average': return score >= 60 && score < 75;
                        case 'poor': return score < 60;
                        default: return true;
                    }
                });
            }

            // Apply mineralization filter
            if (this.currentFilters.mineralization !== 'all') {
                filteredWaters = filteredWaters.filter(water => {
                    if (!water.Categorie_mineralisation) return false;
                    
                    const mineralization = water.Categorie_mineralisation.toLowerCase();
                    switch (this.currentFilters.mineralization) {
                        case 'tres-faible':
                            return mineralization.includes('très faiblement');
                        case 'faible':
                            return mineralization.includes('faiblement') && !mineralization.includes('très');
                        case 'moyenne':
                            return mineralization.includes('moyennement');
                        case 'forte':
                            return mineralization.includes('fortement');
                        default:
                            return true;
                    }
                });
            }

            // Apply sorting
            this.sortWaters(filteredWaters);

            // Update results count
            this.updateResultsCount(filteredWaters.length);

            // Render results
            if (this.isTableView) {
                this.renderWatersTable(filteredWaters);
            } else {
                this.renderWaters('eauxGrid', filteredWaters);
            }

        } catch (error) {
            console.error('Erreur application filtres:', error);
        }
    }

    sortWaters(waters) {
        const [sortKey, direction] = this.currentSort.split('-');
        const isAsc = direction === 'asc';

        waters.sort((a, b) => {
            let valueA, valueB;

            switch (sortKey) {
                case 'name':
                    valueA = (a.Nom || '').toLowerCase();
                    valueB = (b.Nom || '').toLowerCase();
                    break;
                case 'type':
                    valueA = a.Type_eau || '';
                    valueB = b.Type_eau || '';
                    break;
                case 'score':
                    valueA = a.score || 0;
                    valueB = b.score || 0;
                    break;
                case 'ph':
                    valueA = parseFloat(a.pH) || 0;
                    valueB = parseFloat(b.pH) || 0;
                    break;
                case 'calcium':
                    valueA = parseFloat(a.Calcium_mg_L) || 0;
                    valueB = parseFloat(b.Calcium_mg_L) || 0;
                    break;
                case 'magnesium':
                    valueA = parseFloat(a.Magnesium_mg_L) || 0;
                    valueB = parseFloat(b.Magnesium_mg_L) || 0;
                    break;
                case 'gazeuse':
                    valueA = a.Gazeuse || '';
                    valueB = b.Gazeuse || '';
                    break;
                case 'origine':
                    valueA = (a.Origine_geographique || '').toLowerCase();
                    valueB = (b.Origine_geographique || '').toLowerCase();
                    break;
                default:
                    valueA = a.score || 0;
                    valueB = b.score || 0;
            }

            if (valueA < valueB) return isAsc ? -1 : 1;
            if (valueA > valueB) return isAsc ? 1 : -1;
            return 0;
        });
    }

    toggleViewDisplay() {
        const gridContainer = document.getElementById('eauxGrid');
        const tableContainer = document.getElementById('eauxTable');

        if (gridContainer && tableContainer) {
            if (this.isTableView) {
                gridContainer.style.display = 'none';
                tableContainer.style.display = 'block';
            } else {
                gridContainer.style.display = 'grid';
                tableContainer.style.display = 'none';
            }
            this.applyFiltersAndSort();
        }
    }

    updateResultsCount(count) {
        const resultsInfo = document.getElementById('resultsCount');
        if (resultsInfo) {
            resultsInfo.textContent = `${count} eau${count > 1 ? 's' : ''} affichée${count > 1 ? 's' : ''}`;
        }
    }

    renderWatersTable(waters) {
        try {
            const tableBody = document.getElementById('tableBody');
            if (!tableBody) return;

            if (!waters || waters.length === 0) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="9" class="empty-state">
                            <h3>🔍 Aucune eau trouvée</h3>
                            <p>Essayez de modifier vos critères de recherche</p>
                        </td>
                    </tr>
                `;
                return;
            }

            const rows = waters.map(water => this.createTableRow(water)).join('');
            tableBody.innerHTML = rows;

            console.log(`✅ Tableau rendu avec ${waters.length} lignes`);
        } catch (error) {
            console.error('Erreur render table:', error);
        }
    }

    createTableRow(water) {
        try {
            if (!water || !water.Nom) return '';

            const scoreInfo = this.getScoreInfo(water.score || 0);
            const shortOrigin = this.getShortOrigin(water.Origine_geographique);

            return `
                <tr onclick="app.showWaterDetails('${this.escapeHtml(water.Nom)}')">
                    <td class="table-name">${this.escapeHtml(water.Nom)}</td>
                    <td class="table-type">${this.escapeHtml(water.Type_eau || 'N/A')}</td>
                    <td class="table-score">
                        <span class="score-badge ${scoreInfo.class}">${water.score || 0}/100</span>
                    </td>
                    <td>${water.pH || 'N/A'}</td>
                    <td>${water.Calcium_mg_L || 'N/A'} mg/L</td>
                    <td>${water.Magnesium_mg_L || 'N/A'} mg/L</td>
                    <td>${water.Gazeuse || 'N/A'}</td>
                    <td>${this.escapeHtml(shortOrigin)}</td>
                    <td class="table-actions">
                        <button class="action-btn" onclick="event.stopPropagation(); app.showWaterDetails('${this.escapeHtml(water.Nom)}')">
                            Détails
                        </button>
                    </td>
                </tr>
            `;
        } catch (error) {
            console.error('Erreur création ligne tableau:', error);
            return '';
        }
    }

    loadCompareView() {
        const select1 = document.getElementById('compareSelect1');
        const select2 = document.getElementById('compareSelect2');

        if (select1 && select2) {
            [select1, select2].forEach(select => {
                select.innerHTML = '<option value="">Sélectionner une eau</option>';
                this.data.forEach(water => {
                    const option = document.createElement('option');
                    option.value = water.Nom;
                    option.textContent = water.Nom;
                    select.appendChild(option);
                });
            });
        }
    }

    renderWaters(containerId, waters) {
        try {
            const container = document.getElementById(containerId);
            if (!container) {
                console.warn(`Container non trouvé: ${containerId}`);
                return;
            }

            if (!waters || waters.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <h3>🔍 Aucune eau trouvée</h3>
                        <p>Essayez de modifier vos critères de recherche</p>
                    </div>
                `;
                return;
            }

            const cards = waters.map(water => this.createWaterCard(water)).join('');
            container.innerHTML = cards;

            console.log(`✅ Rendu ${waters.length} cartes dans ${containerId}`);
        } catch (error) {
            console.error('Erreur render waters:', error);
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = `
                    <div class="empty-state">
                        <h3>❌ Erreur d'affichage</h3>
                        <p>Impossible de charger les eaux</p>
                    </div>
                `;
            }
        }
    }

    createWaterCard(water) {
        try {
            if (!water || !water.Nom) {
                return '';
            }

            const isGazeuse = water.Gazeuse === 'Oui';
            const isSource = water.Type_eau === 'Eau de source';
            
            let badgeClass = '';
            let badgeText = '';
            
            if (isGazeuse) {
                badgeClass = 'gazeuse';
                badgeText = '🥤 Gazeuse';
            } else if (isSource) {
                badgeClass = 'source';
                badgeText = '🔍 Source';
            } else {
                badgeText = '⛰️ Minérale';
            }

            const origin = this.getShortOrigin(water.Origine_geographique);
            const mineralization = this.getShortMineralization(water.Categorie_mineralisation);
            const scoreInfo = this.getScoreInfo(water.score || 0);

            return `
                <div class="water-card" onclick="app.showWaterDetails('${this.escapeHtml(water.Nom)}')">
                    <div class="water-header">
                        <div>
                            <h3 class="water-name">${this.escapeHtml(water.Nom)}</h3>
                            <div class="water-type">${this.escapeHtml(water.Type_eau || 'N/A')}</div>
                            <div class="water-score">
                                <span class="score-badge ${scoreInfo.class}">${water.score || 0}/100</span>
                                <span class="score-label">${scoreInfo.label}</span>
                            </div>
                        </div>
                        <div class="water-badge ${badgeClass}">${badgeText}</div>
                    </div>
                    
                    <div class="water-info">
                        <div class="info-item">
                            <div class="info-label">pH</div>
                            <div class="info-value">${water.pH || 'N/A'}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Calcium</div>
                            <div class="info-value">${water.Calcium_mg_L || 'N/A'} mg/L</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Magnésium</div>
                            <div class="info-value">${water.Magnesium_mg_L || 'N/A'} mg/L</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Minéralisation</div>
                            <div class="info-value">${mineralization}</div>
                        </div>
                    </div>
                    
                    <div class="water-origin">
                        📍 ${origin}
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Erreur création carte:', error);
            return '';
        }
    }

    searchWaters(type, query) {
        try {
            if (type === 'eaux') {
                this.currentFilters.search = query || '';
                this.applyFiltersAndSort();
            }
        } catch (error) {
            console.error('Erreur recherche:', error);
        }
    }

    filterMinerales(filter) {
        try {
            let waters = this.data.filter(w => w.Type_eau === 'Eau minérale naturelle');

            if (filter && filter !== 'all') {
                waters = waters.filter(water => {
                    if (!water.Categorie_mineralisation) return false;
                    
                    const mineralization = water.Categorie_mineralisation.toLowerCase();
                    switch (filter) {
                        case 'tres-faible':
                            return mineralization.includes('très faiblement');
                        case 'faible':
                            return mineralization.includes('faiblement') && !mineralization.includes('très');
                        case 'moyenne':
                            return mineralization.includes('moyennement');
                        case 'forte':
                            return mineralization.includes('fortement');
                        default:
                            return true;
                    }
                });
            }

            this.renderWaters('mineralesGrid', waters);
        } catch (error) {
            console.error('Erreur filtre minérales:', error);
        }
    }

    updateComparison() {
        try {
            const select1 = document.getElementById('compareSelect1');
            const select2 = document.getElementById('compareSelect2');
            const resultsContainer = document.getElementById('compareResults');

            if (!select1 || !select2 || !resultsContainer) return;

            const water1Name = select1.value;
            const water2Name = select2.value;

            if (!water1Name || !water2Name) {
                resultsContainer.innerHTML = `
                    <div class="empty-state">
                        <h3>⚖️ Sélectionnez deux eaux</h3>
                        <p>Choisissez deux eaux dans les listes déroulantes pour les comparer</p>
                    </div>
                `;
                return;
            }

            const water1 = this.data.find(w => w.Nom === water1Name);
            const water2 = this.data.find(w => w.Nom === water2Name);

            if (!water1 || !water2) {
                resultsContainer.innerHTML = `
                    <div class="empty-state">
                        <h3>❌ Eaux non trouvées</h3>
                        <p>Impossible de charger les données de comparaison</p>
                    </div>
                `;
                return;
            }

            resultsContainer.innerHTML = `
                <div class="compare-card">
                    <h4>${this.escapeHtml(water1.Nom)}</h4>
                    ${this.createCompareDetails(water1)}
                </div>
                <div class="compare-card">
                    <h4>${this.escapeHtml(water2.Nom)}</h4>
                    ${this.createCompareDetails(water2)}
                </div>
            `;
        } catch (error) {
            console.error('Erreur update comparison:', error);
        }
    }

    createCompareDetails(water) {
        if (!water) return '';
        
        return `
            <div class="compare-detail">
                <span class="compare-label">Type</span>
                <span class="compare-value">${this.escapeHtml(water.Type_eau || 'N/A')}</span>
            </div>
            <div class="compare-detail">
                <span class="compare-label">pH</span>
                <span class="compare-value">${water.pH || 'N/A'}</span>
            </div>
            <div class="compare-detail">
                <span class="compare-label">Calcium</span>
                <span class="compare-value">${water.Calcium_mg_L || 'N/A'} mg/L</span>
            </div>
            <div class="compare-detail">
                <span class="compare-label">Magnésium</span>
                <span class="compare-value">${water.Magnesium_mg_L || 'N/A'} mg/L</span>
            </div>
            <div class="compare-detail">
                <span class="compare-label">Sodium</span>
                <span class="compare-value">${water.Sodium_mg_L || 'N/A'} mg/L</span>
            </div>
            <div class="compare-detail">
                <span class="compare-label">Gazeuse</span>
                <span class="compare-value">${water.Gazeuse || 'N/A'}</span>
            </div>
            <div class="compare-detail">
                <span class="compare-label">Minéralisation</span>
                <span class="compare-value">${this.getShortMineralization(water.Categorie_mineralisation)}</span>
            </div>
            <div class="compare-detail">
                <span class="compare-label">Score qualité</span>
                <span class="compare-value">${water.score || 0}/100</span>
            </div>
            <div class="compare-detail">
                <span class="compare-label">Origine</span>
                <span class="compare-value">${this.getShortOrigin(water.Origine_geographique)}</span>
            </div>
        `;
    }

    showWaterDetails(waterName) {
        try {
            const water = this.data.find(w => w.Nom === waterName);
            if (!water) {
                console.error(`Eau non trouvée: ${waterName}`);
                return;
            }

            const modal = document.getElementById('waterModal');
            const modalTitle = document.getElementById('modalTitle');
            const modalBody = document.getElementById('modalBody');

            if (!modal || !modalTitle || !modalBody) {
                console.error('Éléments modal non trouvés');
                return;
            }

            // Reset scroll position to top when opening modal
            window.scrollTo({ top: 0, behavior: 'smooth' });

            modalTitle.textContent = water.Nom;
            modalBody.innerHTML = this.createWaterDetailsHTML(water);

            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        } catch (error) {
            console.error('Erreur affichage détails:', error);
        }
    }

    createWaterDetailsHTML(water) {
        if (!water) return '';
        
        const scoreInfo = this.getScoreInfo(water.score || 0);
        
        return `
            <div class="modal-section">
                <h4>🏆 Score de qualité</h4>
                <div class="score-display">
                    <div class="score-badge-large ${scoreInfo.class}">${water.score || 0}/100</div>
                    <div class="score-breakdown">
                        <p><strong>${scoreInfo.label}</strong></p>
                        <p>Basé sur les critères ANSES 2025, PFAS, microplastiques et impact environnemental</p>
                    </div>
                </div>
            </div>
            
            <div class="modal-section">
                <h4>ℹ️ Informations générales</h4>
                <div class="modal-detail">
                    <span class="modal-label">Nom</span>
                    <span class="modal-value">${this.escapeHtml(water.Nom || 'N/A')}</span>
                </div>
                <div class="modal-detail">
                    <span class="modal-label">Type</span>
                    <span class="modal-value">${this.escapeHtml(water.Type_eau || 'N/A')}</span>
                </div>
                <div class="modal-detail">
                    <span class="modal-label">Origine</span>
                    <span class="modal-value">${this.escapeHtml(water.Origine_geographique || 'N/A')}</span>
                </div>
                <div class="modal-detail">
                    <span class="modal-label">Propriétaire</span>
                    <span class="modal-value">${this.escapeHtml(water.Proprietaire || 'N/A')}</span>
                </div>
                <div class="modal-detail">
                    <span class="modal-label">Gazeuse</span>
                    <span class="modal-value">${water.Gazeuse || 'N/A'}</span>
                </div>
            </div>
            
            <div class="modal-section">
                <h4>🧪 Composition minérale</h4>
                <div class="modal-detail">
                    <span class="modal-label">pH</span>
                    <span class="modal-value">${water.pH || 'N/A'}</span>
                </div>
                <div class="modal-detail">
                    <span class="modal-label">Minéralisation</span>
                    <span class="modal-value">${this.escapeHtml(water.Categorie_mineralisation || 'N/A')}</span>
                </div>
                <div class="modal-detail">
                    <span class="modal-label">Calcium</span>
                    <span class="modal-value">${water.Calcium_mg_L || 'N/A'} mg/L</span>
                </div>
                <div class="modal-detail">
                    <span class="modal-label">Magnésium</span>
                    <span class="modal-value">${water.Magnesium_mg_L || 'N/A'} mg/L</span>
                </div>
                <div class="modal-detail">
                    <span class="modal-label">Sodium</span>
                    <span class="modal-value">${water.Sodium_mg_L || 'N/A'} mg/L</span>
                </div>
                <div class="modal-detail">
                    <span class="modal-label">Potassium</span>
                    <span class="modal-value">${water.Potassium_mg_L || 'N/A'} mg/L</span>
                </div>
                <div class="modal-detail">
                    <span class="modal-label">Bicarbonates</span>
                    <span class="modal-value">${water.Bicarbonates_mg_L || 'N/A'} mg/L</span>
                </div>
                <div class="modal-detail">
                    <span class="modal-label">Sulfates</span>
                    <span class="modal-value">${water.Sulfates_mg_L || 'N/A'} mg/L</span>
                </div>
            </div>

            <div class="modal-section">
                <h4>🛡️ Qualité et conformité</h4>
                <div class="modal-detail">
                    <span class="modal-label">Conformité ANSES 2025</span>
                    <span class="modal-value">${water.Conformite_ANSES_2025 || 'N/A'}</span>
                </div>
                <div class="modal-detail">
                    <span class="modal-label">PFAS totaux</span>
                    <span class="modal-value">${water.Somme_PFAS_ng_L || 'N/A'} ng/L</span>
                </div>
                <div class="modal-detail">
                    <span class="modal-label">Microplastiques</span>
                    <span class="modal-value">${water.Microplastiques_particules_L || 'N/A'} particules/L</span>
                </div>
            </div>

            <div class="modal-section">
                <h4>🌍 Impact environnemental</h4>
                <div class="modal-detail">
                    <span class="modal-label">Empreinte carbone</span>
                    <span class="modal-value">${water.Empreinte_carbone_kg_CO2_L || 'N/A'} kg CO₂/L</span>
                </div>
                <div class="modal-detail">
                    <span class="modal-label">Taux de recyclage</span>
                    <span class="modal-value">${water.Taux_recyclage_emballage_pourcentage || 'N/A'}%</span>
                </div>
                <div class="modal-detail">
                    <span class="modal-label">Type d'emballage</span>
                    <span class="modal-value">${this.escapeHtml(water.Type_conditionnement || 'N/A')}</span>
                </div>
            </div>
        `;
    }

    closeModal() {
        try {
            const modal = document.getElementById('waterModal');
            if (modal) {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            }
        } catch (error) {
            console.error('Erreur fermeture modal:', error);
        }
    }

    calculateScores() {
        try {
            this.data.forEach(water => {
                water.score = this.calculateWaterScore(water);
            });
            console.log('✅ Scores calculés pour toutes les eaux');
        } catch (error) {
            console.error('❌ Erreur calcul scores:', error);
        }
    }

    calculateWaterScore(water) {
        try {
            let score = 100;
            
            // Conformité ANSES (facteur principal)
            if (water.Conformite_ANSES_2025 !== 'Conforme') {
                score -= 30;
            }
            
            // PFAS (substances perfluorées)
            const pfas = this.parseFloat(water.Somme_PFAS_ng_L);
            if (pfas > 100) score -= 25;
            else if (pfas > 50) score -= 15;
            else if (pfas > 10) score -= 8;
            
            // Microplastiques
            const microplastiques = this.parseFloat(water.Microplastiques_particules_L);
            if (microplastiques > 10) score -= 15;
            else if (microplastiques > 5) score -= 8;
            else if (microplastiques > 1) score -= 3;
            
            // Impact environnemental
            const carbone = this.parseFloat(water.Empreinte_carbone_kg_CO2_L);
            if (carbone > 0.5) score -= 10;
            else if (carbone > 0.3) score -= 5;
            else if (carbone > 0.1) score -= 2;
            
            // Taux de recyclage
            const recyclage = this.parseFloat(water.Taux_recyclage_emballage_pourcentage);
            if (recyclage < 30) score -= 8;
            else if (recyclage < 50) score -= 4;
            else if (recyclage > 80) score += 2;
            
            // Pesticides
            const pesticides = this.parseFloat(water.Metabolites_pesticides_pertinents_µg_L);
            if (pesticides > 0.1) score -= 10;
            else if (pesticides > 0.05) score -= 5;
            
            // Résidus médicamenteux
            if (water.Residus_medicamenteux_detection === 'Détecté') {
                score -= 8;
            } else if (water.Residus_medicamenteux_detection === 'Traces détectées') {
                score -= 4;
            }
            
            // Équilibre minéral (bonus)
            const calcium = this.parseFloat(water.Calcium_mg_L);
            const magnesium = this.parseFloat(water.Magnesium_mg_L);
            if (calcium > 50 && calcium < 200 && magnesium > 10 && magnesium < 100) {
                score += 3;
            }
            
            return Math.max(0, Math.min(100, Math.round(score)));
        } catch (error) {
            console.error('Erreur calcul score individuel:', error);
            return 50; // Score par défaut en cas d'erreur
        }
    }

    // Utility functions
    parseFloat(value) {
        const parsed = parseFloat(value);
        return isNaN(parsed) ? 0 : parsed;
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    getScoreInfo(score) {
        if (score >= 90) return { class: 'score-excellent', label: 'Excellent' };
        if (score >= 75) return { class: 'score-good', label: 'Très bon' };
        if (score >= 60) return { class: 'score-average', label: 'Bon' };
        return { class: 'score-poor', label: 'Faible' };
    }

    getShortMineralization(full) {
        if (!full) return 'N/A';
        if (full.includes('Très faiblement')) return 'Très faible';
        if (full.includes('Faiblement')) return 'Faible';
        if (full.includes('Moyennement')) return 'Moyenne';
        if (full.includes('Fortement')) return 'Forte';
        return full.split(' ')[0] || 'N/A';
    }

    getShortOrigin(full) {
        if (!full) return 'N/A';
        const parts = full.split(',');
        return parts.length > 1 ? parts.slice(-2).join(',').trim() : full;
    }

    showError(message) {
        console.error(message);
        // Vous pouvez ajouter ici une notification utilisateur
    }
}

// Initialize app avec gestion d'erreur
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.app = new BenchEauApp();
        console.log('🚀 Application BenchEau initialisée avec succès');
    } catch (error) {
        console.error('💥 Erreur fatale lors de l\'initialisation:', error);
    }
});