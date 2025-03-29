export function debounce(func, wait) {
    let timeout;
    
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };

        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

export function throttle(func, limit) {
    let inThrottle;
    
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

export class LazyLoader {
    constructor(options = {}) {
        this.options = {
            root: options.root || null,
            rootMargin: options.rootMargin || '50px',
            threshold: options.threshold || 0.1
        };
        
        this.observer = this.createObserver();
    }

    createObserver() {
        if (!window.IntersectionObserver) return null;

        return new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadElement(entry.target);
                    this.observer.unobserve(entry.target);
                }
            });
        }, this.options);
    }

    observe(elements) {
        if (!this.observer) return;

        elements.forEach(element => {
            this.observer.observe(element);
        });
    }

    loadElement(element) {
        if (element.tagName.toLowerCase() === 'img') {
            element.src = element.dataset.src;
        } else {
            element.style.backgroundImage = `url(${element.dataset.src})`;
        }

        element.classList.add('loaded');
    }

    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
    }
}