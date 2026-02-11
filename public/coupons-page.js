// Enhanced Coupon Management System with Animations

let coupons = [];
let currentCoupon = null;
let isLoading = false;

// Load coupons when page loads
document.addEventListener('DOMContentLoaded', function () {
    if (window.location.pathname.includes('admin') || document.getElementById('couponsSection')) {
        initializeCouponSystem();
    }
});

// Initialize the coupon system
function initializeCouponSystem() {
    loadCoupons();
    setupCouponEventListeners();
    setupAnimations();
}

// Setup enhanced animations
function setupAnimations() {
    // Add intersection observer for fade-in animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    });

    // Observe all coupon cards
    document.querySelectorAll('.stat-card, .coupon-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'all 0.6s ease';
        observer.observe(card);
    });
}

// Setup event listeners
function setupCouponEventListeners() {
    // Add coupon button
    const addCouponBtn = document.getElementById('addCouponBtn');
    if (addCouponBtn) {
        addCouponBtn.addEventListener('click', showAddCouponModal);
    }

    // Search functionality
    const searchInput = document.getElementById('couponSearch');
    if (searchInput) {
        searchInput.addEventListener('input', filterCoupons);
    }

    // Filter functionality
    const filterSelect = document.getElementById('couponFilter');
    if (filterSelect) {
        filterSelect.addEventListener('change', filterCoupons);
    }
}

// Load all coupons from Supabase
async function loadCoupons() {
    if (isLoading) return;

    try {
        isLoading = true;
        showEnhancedLoading('couponsTableBody');
        console.log('🎫 Loading coupons from Supabase...');

        const { data, error } = await supabase
            .from('coupons')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        coupons = data;

        // Add staggered animation delay
        setTimeout(() => {
            renderCoupons(coupons);
            updateCouponStats();
            isLoading = false;
        }, 500);

    } catch (error) {
        console.error('Error loading coupons:', error);
        showEnhancedError('Failed to load coupons');
        isLoading = false;
    }
}

// Render coupons table with enhanced animations
function renderCoupons(couponsToRender) {
    const tbody = document.getElementById('couponsTableBody');
    if (!tbody) return;

    if (couponsToRender.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center">
                    <div class="empty-state">
                        <div class="empty-icon">🎫</div>
                        <h3>No Coupons Found</h3>
                        <p>Create your first coupon to get started with promotional campaigns</p>
                        <button class="btn btn-primary" onclick="showAddCouponModal()" style="margin-top: 16px;">
                            <i class="fas fa-plus"></i> Create First Coupon
                        </button>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = couponsToRender.map((coupon, index) => {
        const statusClass = getStatusClass(coupon.status);
        const discountDisplay = coupon.discount_type === 'percentage'
            ? `${coupon.discount_value}%`
            : `₹${coupon.discount_value}`;

        const usagePercentage = coupon.usage_limit ? (coupon.used_count / coupon.usage_limit) * 100 : 0;

        return `
            <tr style="animation-delay: ${index * 0.1}s" class="coupon-row">
                <td>
                    <div class="coupon-code">
                        <strong>${coupon.code}</strong>
                        <small class="text-muted d-block" style="margin-top: 4px;">${coupon.description || 'No description'}</small>
                    </div>
                </td>
                <td>
                    <span class="discount-badge ${coupon.discount_type}">
                        ${discountDisplay}
                    </span>
                </td>
                <td>
                    <span style="font-weight: 600; color: var(--text-primary);">₹${coupon.minimum_order_amount}</span>
                </td>
                <td>
                    <div class="usage-info">
                        <span>${coupon.used_count}${coupon.usage_limit ? `/${coupon.usage_limit}` : ''}</span>
                        <div class="usage-bar">
                            <div class="usage-fill" style="width: ${usagePercentage}%"></div>
                        </div>
                    </div>
                </td>
                <td>
                    <small class="text-muted" style="line-height: 1.4;">
                        <strong>From:</strong> ${formatDate(coupon.valid_from)}<br>
                        <strong>Until:</strong> ${formatDate(coupon.valid_until)}
                    </small>
                </td>
                <td>
                    <span class="status-badge ${statusClass}">
                        ${getStatusIcon(coupon.status)} ${coupon.status.charAt(0).toUpperCase() + coupon.status.slice(1)}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon" onclick="viewCouponUsage(${coupon.id})" title="View Usage Analytics">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M3 3v5h5M21 21v-5h-5"/>
                                <path d="M21 3a16 16 0 0 0-13.8 8M3 21a16 16 0 0 1 13.8-8"/>
                            </svg>
                        </button>
                        <button class="btn-icon" onclick="editCoupon(${coupon.id})" title="Edit Coupon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                        </button>
                        <button class="btn-icon btn-danger" onclick="deleteCoupon(${coupon.id})" title="Delete Coupon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    // Trigger animations
    setTimeout(() => {
        document.querySelectorAll('.coupon-row').forEach((row, index) => {
            setTimeout(() => {
                row.style.opacity = '1';
                row.style.transform = 'translateX(0)';
            }, index * 100);
        });
    }, 50);
}

// Get status class for styling with enhanced visual feedback
function getStatusClass(status) {
    const statusClasses = {
        'active': 'success',
        'expired': 'danger',
        'scheduled': 'warning',
        'exhausted': 'secondary',
        'inactive': 'dark'
    };
    return statusClasses[status] || 'secondary';
}

// Get status icon for better visual representation
function getStatusIcon(status) {
    const statusIcons = {
        'active': '✅',
        'expired': '⏰',
        'scheduled': '📅',
        'exhausted': '🚫',
        'inactive': '⏸️'
    };
    return statusIcons[status] || '❓';
}

// Update coupon statistics with animated counters
function updateCouponStats() {
    const totalCoupons = coupons.length;
    const activeCoupons = coupons.filter(c => c.status === 'active').length;
    const totalUsage = coupons.reduce((sum, c) => sum + (c.used_count || 0), 0);
    // Approximate discount calculation since we don't have total order value history here easily without joining
    const totalDiscount = coupons.reduce((sum, c) => sum + ((c.used_count || 0) * (c.discount_type === 'percentage' ? 50 : c.discount_value)), 0);

    // Animate counters
    animateCounter('totalCoupons', totalCoupons);
    animateCounter('activeCoupons', activeCoupons);
    animateCounter('totalUsage', totalUsage);
    animateCounter('totalDiscount', totalDiscount, '₹');
}

// Animate counter with easing
function animateCounter(elementId, targetValue, prefix = '') {
    const element = document.getElementById(elementId);
    if (!element) return;

    const startValue = 0;
    const duration = 2000;
    const startTime = performance.now();

    function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentValue = Math.floor(startValue + (targetValue - startValue) * easeOutQuart);

        element.textContent = prefix + currentValue.toLocaleString();

        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        }
    }

    requestAnimationFrame(updateCounter);
}

// Save coupon (create or update) using Supabase
async function saveCoupon() {
    const formData = new FormData(document.getElementById('couponForm'));
    const couponData = {
        code: formData.get('code'),
        description: formData.get('description'),
        discount_type: formData.get('discount_type'),
        discount_value: parseFloat(formData.get('discount_value')),
        minimum_order_amount: parseFloat(formData.get('minimum_order_amount')) || 0,
        maximum_discount_amount: formData.get('maximum_discount_amount') ? parseFloat(formData.get('maximum_discount_amount')) : null,
        usage_limit: formData.get('usage_limit') ? parseInt(formData.get('usage_limit')) : null,
        valid_from: formData.get('valid_from'),
        valid_until: formData.get('valid_until'),
        is_active: formData.get('is_active') === 'on'
    };

    // Status logic (simplified for frontend, ideal status is computed column or trigger)
    const now = new Date();
    const validFrom = new Date(couponData.valid_from);
    const validUntil = new Date(couponData.valid_until);

    if (!couponData.is_active) {
        couponData.status = 'inactive';
    } else if (now > validUntil) {
        couponData.status = 'expired';
    } else if (now < validFrom) {
        couponData.status = 'scheduled';
    } else {
        couponData.status = 'active';
    }

    // Validation
    if (!couponData.code || !couponData.discount_value || !couponData.valid_from || !couponData.valid_until) {
        showError('Please fill in all required fields');
        return;
    }

    if (new Date(couponData.valid_from) >= new Date(couponData.valid_until)) {
        showError('Valid until date must be after valid from date');
        return;
    }

    try {
        if (currentCoupon) {
            // Update
            const { error } = await supabase
                .from('coupons')
                .update(couponData)
                .eq('id', currentCoupon.id);

            if (error) throw error;
            showNotification('Coupon updated successfully', 'success');
        } else {
            // Insert
            const { error } = await supabase
                .from('coupons')
                .insert([couponData]);

            if (error) throw error;
            showNotification('Coupon created successfully', 'success');
        }

        closeCouponModal();
        loadCoupons();

    } catch (error) {
        console.error('Error saving coupon:', error);
        showError('Failed to save coupon');
    }
}

// Delete coupon using Supabase
async function deleteCoupon(couponId) {
    const coupon = coupons.find(c => c.id === couponId);
    if (!coupon) return;

    if (!confirm(`Are you sure you want to delete the coupon "${coupon.code}"?`)) {
        return;
    }

    try {
        const { error } = await supabase
            .from('coupons')
            .delete()
            .eq('id', couponId);

        if (error) throw error;

        showNotification('Coupon deleted successfully', 'success');
        loadCoupons();

    } catch (error) {
        console.error('Error deleting coupon:', error);
        showError('Failed to delete coupon');
    }
}

// View coupon usage using Supabase
async function viewCouponUsage(couponId) {
    try {
        // Fetch usage with order details
        const { data: usage, error } = await supabase
            .from('coupon_usage')
            .select('*, orders(order_id, customer_name, customer_email, total_amount)')
            .eq('coupon_id', couponId)
            .order('used_at', { ascending: false });

        if (error) throw error;

        // Transform data for modal
        const transformedUsage = usage.map(u => ({
            customer_name: u.orders?.customer_name,
            customer_email: u.orders?.customer_email,
            order_id: u.orders?.order_id,
            discount_amount: u.discount_amount,
            used_at: u.used_at
        }));

        showCouponUsageModal(transformedUsage);
    } catch (error) {
        console.error('Error loading coupon usage:', error);
        showError('Failed to load coupon usage');
    }
}

// Show coupon usage modal
function showCouponUsageModal(usage) {
    const modal = document.getElementById('couponUsageModal');
    const tbody = document.getElementById('couponUsageTableBody');

    if (usage.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">
                    <div class="empty-state">
                        <div class="empty-icon">📊</div>
                        <h4>No Usage Data</h4>
                        <p>This coupon hasn't been used yet</p>
                    </div>
                </td>
            </tr>
        `;
    } else {
        tbody.innerHTML = usage.map(u => `
            <tr>
                <td>${u.customer_name || 'N/A'}</td>
                <td>${u.customer_email || 'N/A'}</td>
                <td>#${u.order_id || 'N/A'}</td>
                <td>₹${u.discount_amount}</td>
                <td>${formatDateTime(u.used_at)}</td>
            </tr>
        `).join('');
    }

    modal.style.display = 'flex';
}

// Filter coupons
function filterCoupons() {
    const searchTerm = document.getElementById('couponSearch')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('couponFilter')?.value || 'all';

    let filteredCoupons = coupons.filter(coupon => {
        const matchesSearch = coupon.code.toLowerCase().includes(searchTerm) ||
            (coupon.description && coupon.description.toLowerCase().includes(searchTerm));

        const matchesStatus = statusFilter === 'all' || coupon.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    renderCoupons(filteredCoupons);
}

// Close coupon modal
function closeCouponModal() {
    document.getElementById('couponModal').style.display = 'none';
    currentCoupon = null;
}

// Close coupon usage modal
function closeCouponUsageModal() {
    document.getElementById('couponUsageModal').style.display = 'none';
}

// Utility functions
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-IN');
}

function formatDateTime(dateString) {
    return new Date(dateString).toLocaleString('en-IN');
}

function formatDateForInput(date) {
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
}

function showLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `
            <tr>
                <td colspan="8" class="text-center">
                    <div class="loading-spinner">
                        <i class="fas fa-spinner fa-spin"></i> Loading coupons...
                    </div>
                </td>
            </tr>
        `;
    }
}

function showError(message) {
    showNotification(message, 'error');
}

function showNotification(message, type) {
    // Check if using enhanced function
    if (typeof showEnhancedNotification === 'function') {
        showEnhancedNotification(message, type);
        return;
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${message}</span>
    `;

    // Add to page
    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Make functions globally available
window.loadCoupons = loadCoupons;
window.showAddCouponModal = showAddCouponModal;
window.editCoupon = editCoupon;
window.saveCoupon = saveCoupon;
window.deleteCoupon = deleteCoupon;
window.viewCouponUsage = viewCouponUsage;
window.filterCoupons = filterCoupons;
window.closeCouponModal = closeCouponModal;
window.closeCouponUsageModal = closeCouponUsageModal;

// Toggle discount fields based on type
function toggleDiscountFields() {
    const discountType = document.getElementById('discountType').value;
    const maxDiscountGroup = document.getElementById('maxDiscountGroup');

    if (maxDiscountGroup) {
        if (discountType === 'percentage') {
            maxDiscountGroup.style.display = 'block';
            maxDiscountGroup.classList.remove('hidden');
        } else {
            maxDiscountGroup.style.display = 'none';
            maxDiscountGroup.classList.add('hidden');
            document.getElementById('maximumDiscount').value = '';
        }
    }
}

// Make function globally available
window.toggleDiscountFields = toggleDiscountFields;

// Enhanced loading animation
function showEnhancedLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `
            <tr>
                <td colspan="8" class="text-center">
                    <div class="loading-spinner" style="padding: 60px;">
                        <div style="display: flex; align-items: center; justify-content: center; gap: 12px;">
                            <div class="spinner-dots">
                                <div class="dot1"></div>
                                <div class="dot2"></div>
                                <div class="dot3"></div>
                            </div>
                            <span style="font-size: 16px; color: var(--text-muted);">Loading coupons...</span>
                        </div>
                    </div>
                </td>
            </tr>
        `;

        // Add CSS for spinner if not exists
        if (!document.getElementById('spinner-styles')) {
            const style = document.createElement('style');
            style.id = 'spinner-styles';
            style.textContent = `
                .spinner-dots {
                    display: flex;
                    gap: 4px;
                }
                .spinner-dots div {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: var(--gold);
                    animation: bounce 1.4s ease-in-out infinite both;
                }
                .dot1 { animation-delay: -0.32s; }
                .dot2 { animation-delay: -0.16s; }
                .dot3 { animation-delay: 0s; }
                @keyframes bounce {
                    0%, 80%, 100% { transform: scale(0); }
                    40% { transform: scale(1); }
                }
            `;
            document.head.appendChild(style);
        }
    }
}

// Enhanced error display
function showEnhancedError(message) {
    showEnhancedNotification(message, 'error', 5000);
}

// Enhanced notification system
function showEnhancedNotification(message, type = 'info', duration = 3000) {
    // Remove existing notifications
    document.querySelectorAll('.enhanced-notification').forEach(n => n.remove());

    const notification = document.createElement('div');
    notification.className = `enhanced-notification ${type}`;

    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };

    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${icons[type] || icons.info}</span>
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;

    // Add styles if not exists
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .enhanced-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                min-width: 300px;
                max-width: 500px;
                padding: 0;
                border-radius: 12px;
                z-index: 10001;
                animation: slideInRight 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
            .enhanced-notification.success {
                background: linear-gradient(135deg, rgba(34, 197, 94, 0.9) 0%, rgba(22, 163, 74, 0.9) 100%);
                color: white;
            }
            .enhanced-notification.error {
                background: linear-gradient(135deg, rgba(239, 68, 68, 0.9) 0%, rgba(220, 38, 38, 0.9) 100%);
                color: white;
            }
            .enhanced-notification.warning {
                background: linear-gradient(135deg, rgba(245, 158, 11, 0.9) 0%, rgba(217, 119, 6, 0.9) 100%);
                color: white;
            }
            .enhanced-notification.info {
                background: linear-gradient(135deg, rgba(59, 130, 246, 0.9) 0%, rgba(37, 99, 235, 0.9) 100%);
                color: white;
            }
            .notification-content {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 16px 20px;
            }
            .notification-icon {
                font-size: 20px;
                flex-shrink: 0;
            }
            .notification-message {
                flex: 1;
                font-weight: 500;
                line-height: 1.4;
            }
            .notification-close {
                background: none;
                border: none;
                color: inherit;
                font-size: 20px;
                cursor: pointer;
                padding: 4px;
                border-radius: 4px;
                transition: background 0.2s;
                flex-shrink: 0;
            }
            .notification-close:hover {
                background: rgba(255, 255, 255, 0.2);
            }
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    // Auto remove after duration
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOutRight 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
            setTimeout(() => notification.remove(), 400);
        }
    }, duration);
}

// Enhanced close modal with animation
function closeCouponModal() {
    const modal = document.getElementById('couponModal');
    modal.classList.remove('show');

    setTimeout(() => {
        modal.style.display = 'none';
        currentCoupon = null;
    }, 300);

    // Remove escape key listener
    document.removeEventListener('keydown', handleModalEscape);
}

// Enhanced form validation with visual feedback
function validateCouponForm(formData) {
    const errors = [];

    // Clear previous error states
    document.querySelectorAll('.form-input.error').forEach(input => {
        input.classList.remove('error');
    });

    if (!formData.get('code') || formData.get('code').trim().length < 3) {
        errors.push('Coupon code must be at least 3 characters long');
        document.getElementById('couponCode').classList.add('error');
    }

    if (!formData.get('discount_value') || parseFloat(formData.get('discount_value')) <= 0) {
        errors.push('Discount value must be greater than 0');
        document.getElementById('discountValue').classList.add('error');
    }

    const validFrom = new Date(formData.get('valid_from'));
    const validUntil = new Date(formData.get('valid_until'));

    if (validFrom >= validUntil) {
        errors.push('Valid until date must be after valid from date');
        document.getElementById('validUntil').classList.add('error');
    }

    if (validFrom < new Date()) {
        errors.push('Valid from date cannot be in the past');
        document.getElementById('validFrom').classList.add('error');
    }

    // Add error input styles if not exists
    if (!document.getElementById('form-error-styles')) {
        const style = document.createElement('style');
        style.id = 'form-error-styles';
        style.textContent = `
            .form-input.error {
                border-color: var(--danger) !important;
                box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1) !important;
                animation: shake 0.5s ease-in-out;
            }
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-5px); }
                75% { transform: translateX(5px); }
            }
        `;
        document.head.appendChild(style);
    }

    return errors;
}

// Add CSS for coupon row animations
if (!document.getElementById('coupon-row-styles')) {
    const style = document.createElement('style');
    style.id = 'coupon-row-styles';
    style.textContent = `
        .coupon-row {
            opacity: 0;
            transform: translateX(-20px);
            transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
    `;
    document.head.appendChild(style);
}

// Professional Modal Step Navigation
let currentStep = 1;
const totalSteps = 3;

// Navigate to next step
function nextStep() {
    if (currentStep < totalSteps) {
        // Validate current step before proceeding
        if (validateCurrentStep()) {
            currentStep++;
            updateStepDisplay();
        }
    }
}

// Navigate to previous step
function prevStep() {
    if (currentStep > 1) {
        currentStep--;
        updateStepDisplay();
    }
}

// Update step display for professional modal
function updateStepDisplay() {
    // Update step indicators
    document.querySelectorAll('.step-professional').forEach((step, index) => {
        const stepNumber = index + 1;
        if (stepNumber <= currentStep) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });

    // Update form steps
    document.querySelectorAll('.form-step-professional').forEach((step, index) => {
        const stepNumber = index + 1;
        if (stepNumber === currentStep) {
            step.classList.add('active');
            step.style.display = 'block';
        } else {
            step.classList.remove('active');
            step.style.display = 'none';
        }
    });

    // Update step dividers
    document.querySelectorAll('.step-divider-professional').forEach((divider, index) => {
        const stepNumber = index + 1;
        if (stepNumber < currentStep) {
            divider.classList.add('completed');
        } else {
            divider.classList.remove('completed');
        }
    });
}

// Validate current step before proceeding
function validateCurrentStep() {
    const errors = [];

    // Clear previous error states
    document.querySelectorAll('.form-input-professional.error').forEach(input => {
        input.classList.remove('error');
    });

    switch (currentStep) {
        case 1:
            const code = document.getElementById('couponCode').value.trim();
            if (!code || code.length < 3) {
                errors.push('Coupon code must be at least 3 characters long');
                document.getElementById('couponCode').classList.add('error');
            }
            break;

        case 2:
            const discountValue = parseFloat(document.getElementById('discountValue').value);
            if (!discountValue || discountValue <= 0) {
                errors.push('Discount value must be greater than 0');
                document.getElementById('discountValue').classList.add('error');
            }

            // Additional validation for percentage
            const isPercentage = document.getElementById('percentageType').checked;
            if (isPercentage && discountValue > 100) {
                errors.push('Percentage discount cannot exceed 100%');
                document.getElementById('discountValue').classList.add('error');
            }
            break;

        case 3:
            const validFrom = new Date(document.getElementById('validFrom').value);
            const validUntil = new Date(document.getElementById('validUntil').value);
            const now = new Date();

            if (!document.getElementById('validFrom').value) {
                errors.push('Valid from date is required');
                document.getElementById('validFrom').classList.add('error');
            }

            if (!document.getElementById('validUntil').value) {
                errors.push('Valid until date is required');
                document.getElementById('validUntil').classList.add('error');
            }

            if (validFrom >= validUntil) {
                errors.push('Valid until date must be after valid from date');
                document.getElementById('validUntil').classList.add('error');
            }

            if (validFrom < now) {
                errors.push('Valid from date cannot be in the past');
                document.getElementById('validFrom').classList.add('error');
            }
            break;
    }

    if (errors.length > 0) {
        showEnhancedNotification(errors[0], 'error');
        return false;
    }

    return true;
}

// Enhanced professional modal show function
function showAddCouponModal() {
    currentCoupon = null;
    currentStep = 1;

    document.getElementById('couponModalTitle').textContent = 'Create New Coupon';
    document.getElementById('couponForm').reset();

    // Set default dates
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    document.getElementById('validFrom').value = formatDateForInput(tomorrow);
    document.getElementById('validUntil').value = formatDateForInput(nextMonth);

    // Reset submit button text for create mode
    const submitBtn = document.querySelector('.btn-primary-professional');
    if (submitBtn) {
        submitBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17,21 17,13 7,13 7,21"></polyline>
                <polyline points="7,3 7,8 15,8"></polyline>
            </svg>
            Create Coupon
        `;
    }

    // Reset step display
    updateStepDisplay();

    // Setup handlers
    setupProfessionalDiscountTypeHandlers();

    // Show modal
    const modal = document.getElementById('couponModal');
    modal.style.display = 'flex';
    modal.classList.add('show');

    // Focus first input
    setTimeout(() => {
        document.getElementById('couponCode').focus();
    }, 300);

    // Add escape key listener
    document.addEventListener('keydown', handleModalEscape);
}

// Handle escape key for modal
function handleModalEscape(e) {
    if (e.key === 'Escape') {
        closeCouponModal();
    }
}

// Enhanced professional discount type handling
function setupProfessionalDiscountTypeHandlers() {
    const percentageRadio = document.getElementById('percentageType');
    const fixedRadio = document.getElementById('fixedType');
    const discountUnit = document.getElementById('discountUnit');
    const discountHelp = document.getElementById('discountHelp');
    const maxDiscountGroup = document.getElementById('maxDiscountGroup');

    function updateDiscountType() {
        const isPercentage = percentageRadio.checked;

        // Update unit display
        discountUnit.textContent = isPercentage ? '%' : '₹';

        // Update help text
        discountHelp.textContent = isPercentage
            ? 'Enter the percentage value between 1-100'
            : 'Enter the fixed discount amount in rupees';

        // Show/hide max discount for percentage
        if (isPercentage) {
            maxDiscountGroup.style.display = 'block';
            maxDiscountGroup.style.opacity = '1';
        } else {
            maxDiscountGroup.style.display = 'none';
            maxDiscountGroup.style.opacity = '0.5';
            document.getElementById('maximumDiscount').value = '';
        }

        // Update input constraints
        const discountInput = document.getElementById('discountValue');
        if (isPercentage) {
            discountInput.max = '100';
            discountInput.placeholder = '10';
        } else {
            discountInput.removeAttribute('max');
            discountInput.placeholder = '100';
        }
    }

    percentageRadio.addEventListener('change', updateDiscountType);
    fixedRadio.addEventListener('change', updateDiscountType);

    // Initialize
    updateDiscountType();
}

// Enhanced professional edit coupon function
function editCoupon(couponId) {
    const coupon = coupons.find(c => c.id === couponId);
    if (!coupon) return;

    currentCoupon = coupon;
    currentStep = 1;

    document.getElementById('couponModalTitle').textContent = 'Edit Coupon';

    // Fill form with coupon data
    document.getElementById('couponCode').value = coupon.code;
    document.getElementById('couponDescription').value = coupon.description || '';

    // Set discount type
    if (coupon.discount_type === 'percentage') {
        document.getElementById('percentageType').checked = true;
    } else {
        document.getElementById('fixedType').checked = true;
    }

    document.getElementById('discountValue').value = coupon.discount_value;
    document.getElementById('minimumAmount').value = coupon.minimum_order_amount;
    document.getElementById('maximumDiscount').value = coupon.maximum_discount_amount || '';
    document.getElementById('usageLimit').value = coupon.usage_limit || '';
    document.getElementById('validFrom').value = formatDateForInput(new Date(coupon.valid_from));
    document.getElementById('validUntil').value = formatDateForInput(new Date(coupon.valid_until));
    document.getElementById('isActive').checked = coupon.is_active;

    // Update submit button text for edit mode
    const submitBtn = document.querySelector('.btn-primary-professional');
    if (submitBtn) {
        submitBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17,21 17,13 7,13 7,21"></polyline>
                <polyline points="7,3 7,8 15,8"></polyline>
            </svg>
            Update Coupon
        `;
    }

    // Reset step display
    updateStepDisplay();

    // Setup handlers
    setupProfessionalDiscountTypeHandlers();

    // Show modal
    const modal = document.getElementById('couponModal');
    modal.style.display = 'flex';
    modal.classList.add('show');

    // Add escape key listener
    document.addEventListener('keydown', handleModalEscape);
}

// Make functions globally available
window.nextStep = nextStep;
window.prevStep = prevStep;
window.updateStepDisplay = updateStepDisplay;
window.validateCurrentStep = validateCurrentStep;
window.setupProfessionalDiscountTypeHandlers = setupProfessionalDiscountTypeHandlers;