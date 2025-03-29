import config from '../config.js';
import { AppError } from '../utils/ErrorHandling.js';

export class APIService {
    constructor() {
        this.baseURL = config.API_BASE_URL;
        this.apiKey = config.API_KEY;
    }

    async fetchWithTimeout(url, options = {}) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), config.TIMEOUTS.API_REQUEST);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal,
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Accept': 'application/json',
                    ...options.headers
                }
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new AppError(
                    `HTTP error! status: ${response.status}`,
                    'API_ERROR',
                    { status: response.status }
                );
            }

            return await response.json();
        } catch (error) {
            if (error.name === 'AbortError') {
                throw new AppError('Request timed out', 'TIMEOUT_ERROR');
            }
            throw error;
        }
    }

    async getMovies(category, page = 1, searchQuery = '') {
        try {
            if (searchQuery) {
                return await this.searchMovies(searchQuery, page);
            }

            const url = this.getCategoryUrl(category, page);
            const data = await this.fetchWithTimeout(url);
            return this.processResults(data, category);
        } catch (error) {
            throw new AppError(
                'Failed to fetch movies',
                'FETCH_ERROR',
                { category, page, originalError: error }
            );
        }
    }

    async searchMovies(query, page = 1) {
        const [movieData, tvData] = await Promise.all([
            this.fetchWithTimeout(
                `${this.baseURL}/search/movie?query=${encodeURIComponent(query)}&page=${page}`
            ),
            this.fetchWithTimeout(
                `${this.baseURL}/search/tv?query=${encodeURIComponent(query)}&page=${page}`
            )
        ]);

        return [
            ...(movieData.results || []).map(item => this.normalizeItem(item, 'movie')),
            ...(tvData.results || []).map(item => this.normalizeItem(item, 'tv'))
        ].filter(item => item.poster_path);
    }

    getCategoryUrl(category, page) {
        switch(category) {
            case 'trending':
                return `${this.baseURL}/trending/movie/week?page=${page}`;
            case 'classics':
                return `${this.baseURL}/discover/movie?sort_by=vote_average.desc&vote_count.gte=1000&primary_release_date.lte=1990-01-01&page=${page}`;
            case 'favorites':
            case 'history':
                return null;
            default:
                return `${this.baseURL}/movie/${category}?page=${page}`;
        }
    }

    normalizeItem(item, type) {
        return {
            id: item.id,
            title: type === 'tv' ? item.name : item.title,
            type,
            poster_path: item.poster_path,
            backdrop_path: item.backdrop_path,
            vote_average: item.vote_average,
            release_date: item.release_date || item.first_air_date,
            overview: item.overview
        };
    }

    processResults(data, category) {
        if (!data || !Array.isArray(data.results)) {
            throw new AppError('Invalid API response', 'INVALID_RESPONSE');
        }
        
        return data.results
            .map(item => this.normalizeItem(item, 'movie'))
            .filter(item => item.poster_path);
    }
}