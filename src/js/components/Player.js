import { EventEmitter } from '../utils/EventEmitter.js';
import config from '../config.js';

export class Player extends EventEmitter {
    constructor(container, stateManager) {
        super();
        this.container = container;
        this.stateManager = stateManager;
        this.currentSource = 0;
        this.failedSources = new Set();
        this.render();
        this.setupEventListeners();
    }

    render() {
        this.container.innerHTML = `
            <div class="movie-player">
                <div class="player-controls">
                    <button class="source-select-btn" aria-label="Select video source">
                        <i class="fas fa-film"></i>
                    </button>
                    <button class="player-close-btn" aria-label="Close player">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="source-dropdown"></div>
                <iframe id="playerIframe" 
                        allowfullscreen 
                        allow="autoplay"
                        sandbox="allow-scripts allow-same-origin allow-forms">
                </iframe>
                <div class="error-message" role="alert"></div>
            </div>
        `;

        this.initializeSourceDropdown();
    }

    initializeSourceDropdown() {
        const dropdown = this.container.querySelector('.source-dropdown');
        const allowedSources = config.VIDEO_SOURCES.filter(s => s.allowed);

        dropdown.innerHTML = allowedSources.map((source, index) => `
            <div class="source-option" data-index="${index}">
                ${source.name}
            </div>
        `).join('');
    }

    setupEventListeners() {
        const closeBtn = this.container.querySelector('.player-close-btn');
        const sourceBtn = this.container.querySelector('.source-select-btn');
        const dropdown = this.container.querySelector('.source-dropdown');

        closeBtn.addEventListener('click', () => this.close());
        sourceBtn.addEventListener('click', () => this.toggleSourceDropdown());
        dropdown.addEventListener('click', (e) => this.handleSourceSelection(e));

        this.stateManager.on('stateChanged', (newState, oldState) => {
            if (newState.currentMovie !== oldState.currentMovie && newState.currentMovie) {
                this.playMovie(newState.currentMovie);
            }
        });
    }

    toggleSourceDropdown() {
        this.container.querySelector('.source-dropdown').classList.toggle('active');
    }

    handleSourceSelection(event) {
        const option = event.target.closest('.source-option');
        if (!option) return;

        this.currentSource = parseInt(option.dataset.index);
        this.failedSources.clear();
        this.toggleSourceDropdown();
        
        const currentMovie = this.stateManager.state.currentMovie;
        if (currentMovie) {
            this.trySource(currentMovie);
        }
    }

    playMovie(movie) {
        this.currentSource = 0;
        this.failedSources.clear();
        this.container.classList.add('active');
        this.trySource(movie);
    }

    trySource(movie) {
        const allowedSources = config.VIDEO_SOURCES.filter(s => s.allowed);
        
        if (this.currentSource >= allowedSources.length) {
            this.showError('Failed to load movie from all sources.');
            return;
        }

        const source = allowedSources[this.currentSource];
        if (this.failedSources.has(source.id)) {
            this.currentSource++;
            this.trySource(movie);
            return;
        }

        const url = this.getSourceUrl(source, movie);
        this.loadVideo(url, source);
    }

    getSourceUrl(source, movie) {
        const urls = source.urls[movie.type];
        return urls.replace('{id}', movie.id)
                  .replace('{season}', movie.season || '1')
                  .replace('{episode}', movie.episode || '1');
    }

    loadVideo(url, source) {
        const iframe = this.container.querySelector('#playerIframe');
        this.showMessage(`Loading ${source.name}...`);

        iframe.src = url;
        iframe.onerror = () => {
            this.failedSources.add(source.id);
            this.currentSource++;
            this.trySource(this.stateManager.state.currentMovie);
        };

        iframe.onload = () => {
            this.hideMessage();
        };
    }

    showError(message) {
        const errorElement = this.container.querySelector('.error-message');
        errorElement.textContent = message;
        errorElement.classList.add('active');

        setTimeout(() => {
            this.close();
        }, 3000);
    }

    showMessage(message) {
        const errorElement = this.container.querySelector('.error-message');
        errorElement.textContent = message;
        errorElement.classList.add('active');
    }

    hideMessage() {
        this.container.querySelector('.error-message').classList.remove('active');
    }

    close() {
        this.container.classList.remove('active');
        const iframe = this.container.querySelector('#playerIframe');
        iframe.src = '';
        this.hideMessage();
        this.stateManager.setState({ currentMovie: null });
    }
}