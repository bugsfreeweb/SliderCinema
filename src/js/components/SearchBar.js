import { debounce } from '../utils/Performance.js';
import { EventEmitter } from '../utils/EventEmitter.js';

export class SearchBar extends EventEmitter {
    constructor(container, stateManager) {
        super();
        this.container = container;
        this.stateManager = stateManager;
        this.debouncedSearch = debounce(this.performSearch.bind(this), 300);
        this.render();
        this.setupEventListeners();
    }

    render() {
        const searchBarContainer = document.createElement('div');
        searchBarContainer.className = 'search-bar-container';
        searchBarContainer.innerHTML = `
            <div class="search-bar" role="search">
                <input type="text" 
                       id="searchInput" 
                       placeholder="Search Movies or TV..." 
                       aria-label="Search movies and TV shows">
                <button class="clear-search" id="clearSearch" aria-label="Clear search">
                    <i class="fas fa-times" aria-hidden="true"></i>
                </button>
                <button class="search-button" id="searchButton" aria-label="Search">
                    <i class="fas fa-search" aria-hidden="true"></i>
                </button>
            </div>
        `;
        this.container.prepend(searchBarContainer);
    }

    setupEventListeners() {
        const searchInput = this.container.querySelector('#searchInput');
        const clearButton = this.container.querySelector('#clearSearch');
        const searchButton = this.container.querySelector('#searchButton');

        searchInput.addEventListener('input', () => {
            this.toggleClearButton();
            this.debouncedSearch();
        });

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch();
            }
        });

        clearButton.addEventListener('click', () => this.clearSearch());
        searchButton.addEventListener('click', () => this.performSearch());
    }

    async performSearch() {
        const searchInput = this.container.querySelector('#searchInput');
        const query = searchInput.value.trim();

        if (!query) {
            this.stateManager.setState({
                currentCategory: 'popular',
                searchQuery: ''
            });
            return;
        }

        this.stateManager.setState({
            loading: true,
            searchQuery: query
        });

        try {
            this.emit('search', query);
        } catch (error) {
            console.error('Search error:', error);
            this.stateManager.setState({ error: 'Search failed. Please try again.' });
        } finally {
            this.stateManager.setState({ loading: false });
        }
    }

    clearSearch() {
        const searchInput = this.container.querySelector('#searchInput');
        searchInput.value = '';
        this.toggleClearButton();
        this.stateManager.setState({
            currentCategory: 'popular',
            searchQuery: ''
        });
    }

    toggleClearButton() {
        const searchInput = this.container.querySelector('#searchInput');
        const clearButton = this.container.querySelector('#clearSearch');
        clearButton.style.display = searchInput.value ? 'block' : 'none';
    }
}