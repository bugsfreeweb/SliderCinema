export class AppError extends Error {
    constructor(message, type = 'GENERIC', data = {}) {
        super(message);
        this.name = 'AppError';
        this.type = type;
        this.data = data;
        this.timestamp = new Date().toISOString();
    }

    static isAppError(error) {
        return error instanceof AppError;
    }
}

export function showErrorNotification(message, duration = 5000) {
    const container = document.getElementById('notificationContainer');
    if (!container) return;

    const notification = document.createElement('div');
    notification.className = 'notification error';
    notification.setAttribute('role', 'alert');
    
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-exclamation-circle" aria-hidden="true"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" aria-label="Close notification">
            <i class="fas fa-times" aria-hidden="true"></i>
        </button>
    `;

    container.appendChild(notification);

    const close = () => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 300);
    };

    notification.querySelector('.notification-close').addEventListener('click', close);
    setTimeout(close, duration);
}

export function handleError(error) {
    console.error('[Error Handler]:', error);

    if (error instanceof AppError) {
        showErrorNotification(error.message);
        return error;
    }

    const appError = new AppError(
        'An unexpected error occurred',
        'UNEXPECTED',
        { originalError: error }
    );

    showErrorNotification(appError.message);
    return appError;
}