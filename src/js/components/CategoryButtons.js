import { EventEmitter } from '../utils/EventEmitter.js';
import config from '../config.js';

export class CategoryButtons extends EventEmitter {
    constructor(container, stateManager) {
        super();
        this.container = container;
        this.stateManager = stateManager;
        this.render();
        this.setupEventListeners();
    }

    render() {
        const categoryContainer = document.createElement('div');
        categoryContainer.className = 'category-controls';
        
        categoryContainer.innerHTML = `
            <div class="category-buttons">
                ${config.CATEGORIES.map(category => `
                    <button class="category-btn ${this.stateManager.state.currentCategory === category.id ? 'active' : ''}"
                            data-category="${category.id}"
                            aria-pressed="${this.stateManager.state.currentCategory === category.id}"
                            aria-label="Show ${category.name} movies">
                        ${category.name}
                    </button>
                `).join('')}
            </div>
            <div class="category-menu">
                <button class="category-toggle" aria-label="Show categories menu">
                    <i class="fas fa-ellipsis-v"></i>
                </button>
                <div class="category-dropdown">
                    ${config.CATEGORIES.map(category => `
                        <button class="category-btn ${this.stateManager.state.currentCategory === category.id ? 'active' : ''}"
                                data-category="${category.id}"
                                aria-pressed="${this.stateManager.state.currentCategory === category.id}">
                            ${category.name}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;

        this.container.appendChild(categoryContainer);
    }

    setupEventListeners() {
        const categoryButtons = this.container.querySelectorAll('.category-btn');
        const categoryToggle = this.container.querySelector('.category-toggle');
        const categoryDropdown = this.container.querySelector('.category-dropdown');

        categoryButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.handleCategoryChange(button.dataset.category);
                categoryDropdown.classList.remove('active');
            });
        });

        categoryToggle.addEventListener('click', () => {
            categoryDropdown.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (!categoryToggle.contains(e.target) && !categoryDropdown.contains(e.target)) {
                categoryDropdown.classList.remove('active');
            }
        });

        this.stateManager.on('stateChanged', (newState, oldState) => {
            if (newState.currentCategory !== oldState.currentCategory) {
                this.updateActiveCategory(newState.currentCategory);
            }
        });
    }

    handleCategoryChange(category) {
        this.stateManager.setState({
            currentCategory: category,
            searchQuery: ''
        });
        this.emit('categoryChanged', category);
    }

    updateActiveCategory(category) {
        this.container.querySelectorAll('.category-btn').forEach(button => {
            const isActive = button.dataset.category === category;
            button.classList.toggle('active', isActive);
            button.setAttribute('aria-pressed', isActive);
        });
    }
}