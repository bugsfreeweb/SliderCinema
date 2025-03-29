import { EventEmitter } from '../utils/EventEmitter.js';
import config from '../config.js';

export class StateManager extends EventEmitter {
    constructor() {
        super();
        this.state = {
            currentCategory: config.DEFAULTS.CATEGORY,
            currentMovie: null,
            movies: [],
            loading: false,
            error: null,
            searchQuery: '',
            favorites: [],
            history: [],
            theme: config.DEFAULTS.THEME
        };

        this.loadPersistedState();
    }

    setState(updates) {
        const oldState = { ...this.state };
        this.state = { ...this.state, ...updates };
        this.emit('stateChanged', this.state, oldState);
        this.persistState();
    }

    loadPersistedState() {
        try {
            const theme = localStorage.getItem(config.STORAGE_KEYS.THEME);
            const favorites = JSON.parse(localStorage.getItem(config.STORAGE_KEYS.FAVORITES) || '[]');
            const history = JSON.parse(localStorage.getItem(config.STORAGE_KEYS.HISTORY) || '[]');

            this.setState({
                theme: theme || config.DEFAULTS.THEME,
                favorites,
                history
            });
        } catch (error) {
            console.error('Failed to load persisted state:', error);
        }
    }

    persistState() {
        try {
            localStorage.setItem(config.STORAGE_KEYS.THEME, this.state.theme);
            localStorage.setItem(config.STORAGE_KEYS.FAVORITES, JSON.stringify(this.state.favorites));
            localStorage.setItem(config.STORAGE_KEYS.HISTORY, JSON.stringify(this.state.history));
        } catch (error) {
            console.error('Failed to persist state:', error);
        }
    }

    addToHistory(movie) {
        const history = [movie, ...this.state.history.filter(m => m.id !== movie.id)];
        if (history.length > config.DEFAULTS.HISTORY_LIMIT) {
            history.pop();
        }
        this.setState({ history });
    }

    toggleFavorite(movie) {
        const favorites = [...this.state.favorites];
        const index = favorites.findIndex(m => m.id === movie.id);

        if (index === -1) {
            favorites.push(movie);
        } else {
            favorites.splice(index, 1);
        }

        this.setState({ favorites });
    }

    clearError() {
        this.setState({ error: null });
    }
}