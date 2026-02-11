// Admin Panel JavaScript

// Check authentication
(async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        // Fallback or legacy check
        if (sessionStorage.getItem('adminLoggedIn') !== 'true') {
            // If no supabase session and no legacy flag, redirect
            // Using admin-login.html as that is the file name
            window.location.href = 'admin-login.html';
        } else {
            // If legacy flag exists but no Supabase session (edge case), 
            // maybe we should clear it or trust it? 
            // For now, let's respect the legacy flag to avoid loop if Supabase fails
            console.warn("Legacy auth flag found but no Supabase session.");
        }
    }
})();

// Page Navigation
function navigateToPage(pageName) {
    // Update URL hash to remember current page
    if (window.location.hash.slice(1) !== pageName) {
        window.location.hash = pageName;
    }

    // Load page content from admin-pages.js
    const content = window.adminPages && window.adminPages[pageName];
    if (content) {
        document.querySelector('.dashboard-content').innerHTML = content;

        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-page') === pageName) {
                link.classList.add('active');
            }
        });

        // Update page title
        document.title = `${pageName.charAt(0).toUpperCase() + pageName.slice(1)} - Luxe Beauty Admin`;

        // Scroll to top
        window.scrollTo(0, 0);

        // Re-initialize time if dashboard
        if (pageName === 'dashboard') {
            updateLastUpdatedTime();
            // Load dashboard data
            if (typeof loadDashboardData === 'function') {
                setTimeout(() => {
                    loadDashboardData();
                    // Reinitialize Quick Actions after dashboard loads
                    setTimeout(() => initQuickActions(), 200);
                }, 100);
            }
        }

        // Load products if products page
        if (pageName === 'products' && typeof loadProducts === 'function') {
            setTimeout(() => loadProducts(), 100);
        }

        // Load categories if categories page
        if (pageName === 'categories' && typeof loadCategories === 'function') {
            setTimeout(() => loadCategories(), 100);
        }

        // Load orders if orders page
        if (pageName === 'orders' && typeof loadOrders === 'function') {
            console.log('🔄 Navigating to orders page, loading orders...');
            setTimeout(() => loadOrders(), 100);
        }

        // Load customers if customers page
        if (pageName === 'customers' && typeof loadCustomers === 'function') {
            setTimeout(() => loadCustomers(), 100);
        }

        // Load messages if messages page
        if (pageName === 'messages' && typeof loadMessages === 'function') {
            setTimeout(() => loadMessages(), 100);
        }

        // Load payments if payments page
        if (pageName === 'payments' && typeof loadPayments === 'function') {
            setTimeout(() => loadPayments(), 100);
        }

        // Load offers if offers page
        if (pageName === 'offers' && typeof loadOffers === 'function') {
            setTimeout(() => loadOffers(), 100);
        }

        // Load ads if ads page
        if (pageName === 'ads' && typeof initAdsPage === 'function') {
            setTimeout(() => initAdsPage(), 100);
        }
    }
}

// Make it global
window.navigateToPage = navigateToPage;

// Update last updated time
function updateLastUpdatedTime() {
    const lastUpdatedElement = document.getElementById('lastUpdated');
    if (lastUpdatedElement) {
        const now = new Date();
        const options = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        lastUpdatedElement.textContent = now.toLocaleString('en-IN', options);
    }
}

// Theme Toggle
function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;
    const darkIcon = themeToggle.querySelector('.theme-icon-dark');
    const lightIcon = themeToggle.querySelector('.theme-icon-light');

    // Load saved theme
    const savedTheme = localStorage.getItem('adminTheme') || 'dark';
    html.setAttribute('data-theme', savedTheme);
    updateThemeIcons(savedTheme);

    themeToggle.addEventListener('click', () => {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('adminTheme', newTheme);
        updateThemeIcons(newTheme);
    });

    function updateThemeIcons(theme) {
        if (theme === 'dark') {
            darkIcon.style.display = 'block';
            lightIcon.style.display = 'none';
        } else {
            darkIcon.style.display = 'none';
            lightIcon.style.display = 'block';
        }
    }
}

// Logout
function initLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            if (confirm('Are you sure you want to logout?')) {
                await supabase.auth.signOut();
                sessionStorage.removeItem('adminLoggedIn');
                sessionStorage.removeItem('adminEmail');
                window.location.href = 'admin-login.html';
            }
        });
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function () {
    updateLastUpdatedTime();
    initThemeToggle();
    initLogout();

    // Update time every minute
    setInterval(updateLastUpdatedTime, 60000);

    // Handle nav link clicks
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const pageName = this.getAttribute('data-page');
            if (pageName) {
                navigateToPage(pageName);
            }
        });
    });

    // Load dashboard by default or from hash
    const hash = window.location.hash.slice(1) || 'dashboard';
    navigateToPage(hash);

    // Handle browser back/forward
    window.addEventListener('hashchange', () => {
        const page = window.location.hash.slice(1) || 'dashboard';
        navigateToPage(page);
    });

    // Initialize Quick Actions buttons
    initQuickActions();

    console.log('Luxe Beauty Admin Panel Initialized');
});

// Initialize Quick Actions
function initQuickActions() {
    // Add Product button
    const addProductBtns = document.querySelectorAll('.quick-action-btn');
    addProductBtns.forEach((btn, index) => {
        const text = btn.textContent.trim();
        if (text === 'Add Product') {
            btn.onclick = () => navigateToPage('products');
        } else if (text === 'View Orders') {
            btn.onclick = () => navigateToPage('orders');
        } else if (text === 'Customers') {
            btn.onclick = () => navigateToPage('customers');
        } else if (text === 'Analytics') {
            showNotification('Analytics feature coming soon!', 'info');
        } else if (text === 'Offers') {
            btn.onclick = () => navigateToPage('offers');
        } else if (text === 'Settings') {
            btn.onclick = () => navigateToPage('settings');
        }
    });
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 24px;
        background: var(--bg-card);
        border: 1px solid var(--border);
        border-left: 3px solid ${type === 'success' ? 'var(--success)' : type === 'error' ? 'var(--danger)' : 'var(--info)'};
        color: var(--text-primary);
        padding: 16px 20px;
        border-radius: 8px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        max-width: 300px;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
// Notification System
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;

    // Add to page
    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Make it global
window.showNotification = showNotification;