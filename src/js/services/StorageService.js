import config from '../config.js';

export class StorageService {
    constructor() {
        this.storage = window.localStorage;
    }

    get(key) {
        try {
            const item = this.storage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error(`Error reading from storage: ${key}`, error);
            return null;
        }
    }

    set(key, value) {
        try {
            const serialized = JSON.stringify(value);
            this.storage.setItem(key, serialized);
            return true;
        } catch (error) {
            console.error(`Error writing to storage: ${key}`, error);
            return false;
        }
    }

    remove(key) {
        try {
            this.storage.removeItem(key);
            return true;
        } catch (error) {
            console.error(`Error removing from storage: ${key}`, error);
            return false;
        }
    }

    clear() {
        try {
            this.storage.clear();
            return true;
        } catch (error) {
            console.error('Error clearing storage', error);
            return false;
        }
    }

    getFavorites() {
        return this.get(config.STORAGE_KEYS.FAVORITES) || [];
    }

    setFavorites(favorites) {
        return this.set(config.STORAGE_KEYS.FAVORITES, favorites);
    }

    getHistory() {
        return this.get(config.STORAGE_KEYS.HISTORY) || [];
    }

    setHistory(history) {
        return this.set(config.STORAGE_KEYS.HISTORY, history);
    }

    getTheme() {
        return this.get(config.STORAGE_KEYS.THEME) || config.DEFAULTS.THEME;
    }

    setTheme(theme) {
        return this.set(config.STORAGE_KEYS.THEME, theme);
    }
}