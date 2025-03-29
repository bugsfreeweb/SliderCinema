import { EventEmitter } from '../utils/EventEmitter.js';

export class Header extends EventEmitter {
    constructor(container, stateManager) {
        super();
        this.container = container;
        this.stateManager = stateManager;
        this.render();
        this.setupEventListeners();
    }

    render() {
        this.container.innerHTML = `
            <div class="header-content">
                <h1>Slider Cinema</h1>
                <button class="theme-toggle" id="themeToggle" aria-label="Toggle theme">
                    <i class="fas fa-${this.stateManager.state.theme === 'dark' ? 'moon' : 'sun'}" 
                       aria-hidden="true"></i>
                </button>
            </div>
        `;
    }

    setupEventListeners() {
        const themeToggle = this.container.querySelector('#themeToggle');
        themeToggle.addEventListener('click', () => this.toggleTheme());

        this.stateManager.on('stateChanged', (newState, oldState) => {
            if (newState.theme !== oldState.theme) {
                this.updateThemeIcon(newState.theme);
            }
        });
    }

    toggleTheme() {
        const newTheme = this.stateManager.state.theme === 'dark' ? 'light' : 'dark';
        this.stateManager.setState({ theme: newTheme });
    }

    updateThemeIcon(theme) {
        const icon = this.container.querySelector('.theme-toggle i');
        icon.className = `fas fa-${theme === 'dark' ? 'moon' : 'sun'}`;
    }
}