import { Header } from './components/Header.js';
import { SearchBar } from './components/SearchBar.js';
import { CategoryButtons } from './components/CategoryButtons.js';
import { MovieSlider } from './components/MovieSlider.js';
import { Player } from './components/Player.js';
import { StateManager } from './services/StateManager.js';
import { APIService } from './services/APIService.js';
import { StorageService } from './services/StorageService.js';
import { handleError } from './utils/ErrorHandling.js';

class App {
    constructor() {
        this.initializeServices();
        this.initializeComponents();
        this.setupEventListeners();
        this.loadInitialData();
    }

    initializeServices() {
        this.stateManager = new StateManager();
        this.apiService = new APIService();
        this.storageService = new StorageService();
    }

    initializeComponents() {
        const containers = {
            header: document.getElementById('header'),
            search: document.getElementById('searchContainer'),
            categories: document.getElementById('categoriesContainer'),
            slider: document.getElementById('sliderContainer'),
            player: document.getElementById('playerContainer')
        };

        this.components = {
            header: new Header(containers.header, this.stateManager),
            searchBar: new SearchBar(containers.search, this.stateManager),
            categoryButtons: new CategoryButtons(containers.categories, this.stateManager),
            movieSlider: new MovieSlider(containers.slider, this.stateManager),
            player: new Player(containers.player, this.stateManager)
        };
    }

    setupEventListeners() {
        this.components.searchBar.on('search', query => this.handleSearch(query));
        this.components.categoryButtons.on('categoryChanged', category => this.loadMovies(category));
        this.components.movieSlider.on('playMovie', movie => this.handlePlayMovie(movie));
        this.components.movieSlider.on('toggleFavorite', movie => this.handleToggleFavorite(movie));
    }

    async loadInitialData() {
        try {
            const category = this.stateManager.state.currentCategory;
            await this.loadMovies(category);
        } catch (error) {
            handleError(error);
        }
    }

    async handleSearch(query) {
        try {
            const movies = await this.apiService.getMovies('search', 1, query);
            this.stateManager.setState({ movies });
        } catch (error) {
            handleError(error);
        }
    }

    async loadMovies(category) {
        try {
            if (category === 'favorites') {
                const favorites = this.stateManager.state.favorites;
                this.stateManager.setState({ movies: favorites });
                return;
            }

            if (category === 'history') {
                const history = this.stateManager.state.history;
                this.stateManager.setState({ movies: history });
                return;
            }

            const movies = await this.apiService.getMovies(category);
            this.stateManager.setState({ movies });
        } catch (error) {
            handleError(error);
        }
    }

    handlePlayMovie(movie) {
        this.stateManager.addToHistory(movie);
        this.stateManager.setState({ currentMovie: movie });
    }

    handleToggleFavorite(movie) {
        this.stateManager.toggleFavorite(movie);
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new App();
});