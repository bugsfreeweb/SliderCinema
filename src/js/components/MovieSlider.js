import { EventEmitter } from '../utils/EventEmitter.js';
import config from '../config.js';

export class MovieSlider extends EventEmitter {
    constructor(container, stateManager) {
        super();
        this.container = container;
        this.stateManager = stateManager;
        this.observer = this.setupIntersectionObserver();
        this.selectedMovie = null;
        this.render();
        this.setupEventListeners();
    }

    render() {
        this.container.innerHTML = `
            <div class="slider-container" id="sliderContainer">
                <div class="movie-slider" id="movieSlider"></div>
                <div class="loading-indicator">
                    <div class="loading-spinner"></div>
                </div>
            </div>
        `;
        
        this.sliderElement = this.container.querySelector('#movieSlider');
        this.updateMovies(this.stateManager.state.movies || []);
    }

    setupIntersectionObserver() {
        if (!window.IntersectionObserver) return null;

        return new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.add('loaded');
                    this.observer.unobserve(img);
                }
            });
        }, {
            root: null,
            rootMargin: '50px',
            threshold: 0.1
        });
    }

    updateMovies(movies) {
        if (!Array.isArray(movies)) return;

        const fragment = document.createDocumentFragment();
        const doubledMovies = [...movies, ...movies]; // Double for infinite scroll effect

        doubledMovies.forEach(movie => {
            const movieElement = this.createMovieElement(movie);
            fragment.appendChild(movieElement);
        });

        this.sliderElement.innerHTML = '';
        this.sliderElement.appendChild(fragment);
        this.initializeLazyLoading();
    }

    createMovieElement(movie) {
        const movieDiv = document.createElement('div');
        movieDiv.className = 'movie';
        movieDiv.dataset.id = movie.id;
        movieDiv.dataset.type = movie.type;

        const isFavorited = this.stateManager.state.favorites
            .some(fav => fav.id === movie.id && fav.type === movie.type);

        movieDiv.innerHTML = `
            <div class="movie-card">
                <div class="front">
                    <img data-src="${config.IMAGE_BASE_URL}/w300${movie.poster_path}"
                         alt="${movie.title}"
                         class="movie-poster lazy"
                         loading="lazy">
                </div>
                <div class="back">
                    <h2>${movie.title}</h2>
                    <p class="movie-year">${movie.release_date?.split('-')[0] || 'N/A'}</p>
                    <div class="movie-rating">
                        <i class="fas fa-star"></i>
                        <span>${movie.vote_average?.toFixed(1) || 'N/A'}</span>
                    </div>
                    <div class="actions">
                        <button class="play-btn" aria-label="Play ${movie.title}">
                            <i class="fas fa-play"></i>
                        </button>
                        <button class="favorite-btn ${isFavorited ? 'active' : ''}" 
                                aria-label="${isFavorited ? 'Remove from favorites' : 'Add to favorites'}">
                            <i class="fas fa-heart"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;

        return movieDiv;
    }

    initializeLazyLoading() {
        if (!this.observer) return;

        this.container.querySelectorAll('.lazy').forEach(img => {
            this.observer.observe(img);
        });
    }

    setupEventListeners() {
        this.sliderElement.addEventListener('click', this.handleClick.bind(this));
        this.container.addEventListener('mouseenter', () => this.pauseSlider());
        this.container.addEventListener('mouseleave', () => this.resumeSlider());

        this.stateManager.on('stateChanged', (newState, oldState) => {
            if (newState.movies !== oldState.movies) {
                this.updateMovies(newState.movies);
            }
        });
    }

    handleClick(event) {
        const movieElement = event.target.closest('.movie');
        if (!movieElement) return;

        const playButton = event.target.closest('.play-btn');
        const favoriteButton = event.target.closest('.favorite-btn');

        if (playButton) {
            this.emit('playMovie', {
                id: movieElement.dataset.id,
                type: movieElement.dataset.type
            });
        } else if (favoriteButton) {
            this.toggleFavorite(movieElement.dataset.id, movieElement.dataset.type);
        } else {
            this.toggleSelection(movieElement);
        }
    }

    toggleSelection(movieElement) {
        if (this.selectedMovie === movieElement) {
            movieElement.classList.remove('selected');
            this.selectedMovie = null;
        } else {
            if (this.selectedMovie) {
                this.selectedMovie.classList.remove('selected');
            }
            movieElement.classList.add('selected');
            this.selectedMovie = movieElement;
        }
    }

    toggleFavorite(id, type) {
        this.emit('toggleFavorite', { id, type });
    }

    pauseSlider() {
        this.sliderElement.style.animationPlayState = 'paused';
    }

    resumeSlider() {
        if (!this.selectedMovie) {
            this.sliderElement.style.animationPlayState = 'running';
        }
    }
}