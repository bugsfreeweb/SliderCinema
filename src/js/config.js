export default {
    // API Configuration
    API_BASE_URL: 'https://api.themoviedb.org/3',
    API_KEY: process.env.TMDB_API_KEY,
    IMAGE_BASE_URL: 'https://image.tmdb.org/t/p',
    
    // Video Sources Configuration
    VIDEO_SOURCES: [
        {
            id: 'source1',
            name: 'Primary Source',
            allowed: true,
            urls: {
                movie: 'https://primary-source.com/movie/{id}',
                tv: 'https://primary-source.com/tv/{id}/{season}/{episode}'
            }
        },
        {
            id: 'source2',
            name: 'Backup Source',
            allowed: true,
            urls: {
                movie: 'https://backup-source.com/movie/{id}',
                tv: 'https://backup-source.com/tv/{id}/{season}/{episode}'
            }
        }
    ],

    // Categories Configuration
    CATEGORIES: [
        { id: 'popular', name: 'Popular' },
        { id: 'trending', name: 'Trending' },
        { id: 'top_rated', name: 'Top Rated' },
        { id: 'upcoming', name: 'Upcoming' },
        { id: 'now_playing', name: 'Now Playing' }
    ],

    // Storage Keys
    STORAGE_KEYS: {
        THEME: 'slider_cinema_theme',
        FAVORITES: 'slider_cinema_favorites',
        HISTORY: 'slider_cinema_history'
    },

    // Default Values
    DEFAULTS: {
        THEME: 'dark',
        CATEGORY: 'popular',
        HISTORY_LIMIT: 50
    },

    // API Request Timeouts (in milliseconds)
    TIMEOUTS: {
        API_REQUEST: 10000,
        SEARCH_DEBOUNCE: 300
    },

    // Z-index layers
    Z_LAYERS: {
        BASE: 1,
        HEADER: 10,
        MODAL: 100,
        NOTIFICATION: 1000
    }
};