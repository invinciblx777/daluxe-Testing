// Page Navigation
const pages = document.querySelectorAll('.page');
const navLinks = document.querySelectorAll('.nav a');

// Save current page to localStorage
function saveCurrentPage(pageId) {
    localStorage.setItem('currentPage', pageId);
}

// Load saved page on refresh
function loadSavedPage() {
    const savedPage = localStorage.getItem('currentPage');
    if (savedPage) {
        navigateToPage(savedPage);
    }
}

function navigateToPage(pageId) {
    // Hide all pages
    pages.forEach(page => page.classList.remove('active'));

    // Show selected page
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
        saveCurrentPage(pageId);
    }

    // Show/hide ad banners based on page
    const homeBanners = document.getElementById('homeBanners');
    const productBanners = document.getElementById('productBanners');

    if (homeBanners && productBanners) {
        if (pageId === 'hero-page') {
            homeBanners.style.display = 'block';
            productBanners.style.display = 'none';
        } else if (pageId === 'products-page') {
            homeBanners.style.display = 'none';
            productBanners.style.display = 'block';
        } else {
            homeBanners.style.display = 'none';
            productBanners.style.display = 'none';
        }
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Load saved page on page load
window.addEventListener('load', loadSavedPage);

// Add click listeners to all navigation links
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const pageId = link.getAttribute('data-page');
        navigateToPage(pageId);
    });
});

// Add click listeners to all footer links with data-page attribute
document.addEventListener('DOMContentLoaded', function () {
    const footerLinks = document.querySelectorAll('.footer-links a[data-page]');
    footerLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pageId = link.getAttribute('data-page');
            navigateToPage(pageId);
        });
    });

    // Initialize mobile navigation
    initMobileNavigation();
});

// Mobile Navigation Functionality
function initMobileNavigation() {
    // Get all mobile navigation toggles and navs
    const mobileNavToggles = document.querySelectorAll('[id^="mobileNavToggle"]');
    const mobileNavs = document.querySelectorAll('.nav');
    const mobileNavOverlays = document.querySelectorAll('[id^="mobileNavOverlay"]');
    const navLinks = document.querySelectorAll('.nav a');

    // Add event listeners to all mobile nav toggles
    mobileNavToggles.forEach((toggle, index) => {
        if (toggle) {
            toggle.addEventListener('click', function () {
                toggleMobileNav(index + 1);
            });
        }
    });

    // Close mobile nav when overlay is clicked
    mobileNavOverlays.forEach((overlay, index) => {
        if (overlay) {
            overlay.addEventListener('click', function () {
                closeMobileNav(index + 1);
            });
        }
    });

    // Close mobile nav when a link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', function () {
            closeAllMobileNavs();
        });
    });

    // Close mobile nav on escape key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            closeAllMobileNavs();
        }
    });

    // Close mobile nav on window resize if screen becomes larger
    window.addEventListener('resize', function () {
        if (window.innerWidth > 768) {
            closeAllMobileNavs();
        }
    });
}

function toggleMobileNav(pageIndex = 1) {
    const mobileNavId = pageIndex === 1 ? 'mobileNav' : `mobileNav${pageIndex}`;
    const mobileNav = document.getElementById(mobileNavId) || document.querySelector('.nav');

    if (mobileNav && mobileNav.classList.contains('active')) {
        closeMobileNav(pageIndex);
    } else {
        openMobileNav(pageIndex);
    }
}

function openMobileNav(pageIndex = 1) {
    const mobileNavToggleId = pageIndex === 1 ? 'mobileNavToggle' : `mobileNavToggle${pageIndex}`;
    const mobileNavOverlayId = pageIndex === 1 ? 'mobileNavOverlay' : `mobileNavOverlay${pageIndex}`;

    const mobileNav = document.querySelector('.page.active .nav');
    const mobileNavOverlay = document.getElementById(mobileNavOverlayId);
    const mobileNavToggle = document.getElementById(mobileNavToggleId);

    if (mobileNav) {
        mobileNav.classList.add('active');
    }

    if (mobileNavOverlay) {
        mobileNavOverlay.style.display = 'block';
    }

    if (mobileNavToggle) {
        // Change hamburger to X
        mobileNavToggle.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        `;
    }

    // Prevent body scroll
    document.body.style.overflow = 'hidden';
}

function closeMobileNav(pageIndex = 1) {
    const mobileNavToggleId = pageIndex === 1 ? 'mobileNavToggle' : `mobileNavToggle${pageIndex}`;
    const mobileNavOverlayId = pageIndex === 1 ? 'mobileNavOverlay' : `mobileNavOverlay${pageIndex}`;

    const mobileNav = document.querySelector('.page.active .nav');
    const mobileNavOverlay = document.getElementById(mobileNavOverlayId);
    const mobileNavToggle = document.getElementById(mobileNavToggleId);

    if (mobileNav) {
        mobileNav.classList.remove('active');
    }

    if (mobileNavOverlay) {
        mobileNavOverlay.style.display = 'none';
    }

    if (mobileNavToggle) {
        // Change X back to hamburger
        mobileNavToggle.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
        `;
    }

    // Restore body scroll
    document.body.style.overflow = '';
}

function closeAllMobileNavs() {
    // Close all mobile navs
    for (let i = 1; i <= 4; i++) {
        closeMobileNav(i);
    }
}

// Modal Management
const productModal = document.getElementById('product-modal');
const cartModal = document.getElementById('cart-modal');
const modalCloses = document.querySelectorAll('.modal-close');
const modalBackdrops = document.querySelectorAll('.modal-backdrop');

// Open Product Modal
const productCards = document.querySelectorAll('.product-card');
productCards.forEach(card => {
    card.addEventListener('click', async (e) => {
        // Don't open modal if clicking "Add to cart" button
        if (!e.target.classList.contains('add-to-cart-btn')) {
            const productId = card.getAttribute('data-product');

            // Fetch product details from Supabase
            try {
                // Fetch product details
                const { data: product, error } = await supabase
                    .from('products')
                    .select('*, product_images(*)')
                    .eq('id', productId)
                    .single();

                if (error) throw error;

                // Transform data for compatibility
                let mainImage = 'placeholder-product.png';
                if (product.image) {
                    mainImage = product.image;
                } else if (product.product_images && product.product_images.length > 0) {
                    const main = product.product_images.find(img => img.is_main) || product.product_images[0];
                    mainImage = main.image_path;
                }

                const formattedProduct = {
                    ...product,
                    image: mainImage,
                    images: product.product_images // Keep raw images if needed
                };

                // Update modal content with product data
                updateProductModal(formattedProduct);
                openModal(productModal);
            } catch (error) {
                console.error('Error loading product:', error);
                // Fallback to basic info
                const productName = card.querySelector('h4').textContent;
                const productPrice = card.querySelector('.price').textContent;
                updateProductModalBasic(productId, productName, productPrice);
                openModal(productModal);
            }
        }
    });
});

// Open Cart Modal
const cartButtons = document.querySelectorAll('[id^="openCart"]');
cartButtons.forEach(button => {
    button.addEventListener('click', () => {
        openModal(cartModal);
    });
});

// Close Modal Functions
modalCloses.forEach(close => {
    close.addEventListener('click', () => {
        closeAllModals();
    });
});

modalBackdrops.forEach(backdrop => {
    backdrop.addEventListener('click', () => {
        closeAllModals();
    });
});

// ESC key to close modals
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeAllModals();
    }
});

function openModal(modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
    document.body.style.overflow = 'auto';
}

// Quantity Controls in Product Modal
const qtyInputs = document.querySelectorAll('.qty-input');
const qtyBtns = document.querySelectorAll('.qty-btn');

qtyBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const parent = btn.closest('.quantity-controls') || btn.closest('.cart-item-quantity');
        const input = parent.querySelector('.qty-input') || parent.querySelector('span');

        if (btn.classList.contains('plus')) {
            if (input.tagName === 'INPUT') {
                input.value = parseInt(input.value) + 1;
            } else {
                input.textContent = parseInt(input.textContent) + 1;
            }
        } else if (btn.classList.contains('minus')) {
            const currentValue = input.tagName === 'INPUT' ? parseInt(input.value) : parseInt(input.textContent);
            if (currentValue > 1) {
                if (input.tagName === 'INPUT') {
                    input.value = currentValue - 1;
                } else {
                    input.textContent = currentValue - 1;
                }
            }
        }

        updateCartTotal();
    });
});

// Cart functionality is now handled by cart.js
// Old cart code removed to prevent conflicts

// Notification System
function showNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: linear-gradient(135deg, #E0A643 0%, #957900 100%);
        color: white;
        padding: 15px 30px;
        border-radius: 10px;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 15px rgba(224, 166, 67, 0.5);
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 2000);
}

// Add animation keyframes
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

// Filter Tabs (Product Collection Page)
const filterBtns = document.querySelectorAll('.filter-btn');
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Here you would filter products based on the selected category
        showNotification(`Showing ${btn.textContent}`);
    });
});

// Explore Collection Button Navigation
const exploreBtns = document.querySelectorAll('.explore-btn');
exploreBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        navigateToPage('products-page');
    });
});

// Contact Form Submission
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData);

        console.log('Form submitted:', data);

        showNotification('Message sent successfully!');
        contactForm.reset();
    });
}

// Thumbnail Selection in Product Modal
const thumbnails = document.querySelectorAll('.thumbnail');
const mainImage = document.querySelector('.main-image');

thumbnails.forEach((thumbnail, index) => {
    thumbnail.addEventListener('click', () => {
        thumbnails.forEach(t => t.classList.remove('active'));
        thumbnail.classList.add('active');

        // Change main image (in a real app, you'd update with actual images)
        mainImage.style.opacity = '0';
        setTimeout(() => {
            mainImage.style.opacity = '1';
        }, 200);
    });
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#') {
            e.preventDefault();
            const element = document.querySelector(href);
            if (element) {
                element.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        }
    });
});

// Add hover effects to product cards
productCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-5px)';
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
    });
});

// Proceed to Checkout
const proceedBtn = document.querySelector('.proceed-btn');
if (proceedBtn) {
    proceedBtn.addEventListener('click', () => {
        if (cartItems.length === 0) {
            showNotification('Your cart is empty!');
            return;
        }

        showNotification('Proceeding to checkout...');
        // In a real app, this would redirect to a checkout page
        console.log('Checkout with items:', cartItems);
    });
}

function updateProductModal(product) {
    const modal = document.getElementById('product-modal');

    // Update product name
    const nameElement = modal.querySelector('.product-details h2');
    if (nameElement) nameElement.textContent = product.name;

    // Calculate pricing with offers
    const hasOffer = product.offer_percentage && product.offer_percentage > 0;
    const originalPrice = parseFloat(product.price);
    const discountedPrice = hasOffer ? originalPrice * (1 - product.offer_percentage / 100) : originalPrice;

    // Update product price with offer support
    const priceElement = modal.querySelector('.product-price');
    if (priceElement) {
        if (hasOffer) {
            priceElement.innerHTML = `
                <span class="original-price" style="text-decoration: line-through; color: #999; margin-right: 10px;">₹${originalPrice.toLocaleString('en-IN')}</span>
                <span class="discounted-price">₹${discountedPrice.toLocaleString('en-IN')}</span>
                <span class="offer-text" style="color: #e74c3c; font-size: 14px; margin-left: 10px;">${product.offer_percentage}% OFF</span>
            `;
        } else {
            priceElement.textContent = `₹${discountedPrice.toLocaleString('en-IN')}`;
        }
    }

    // Update rating
    const ratingElement = modal.querySelector('.product-rating span');
    if (ratingElement) ratingElement.textContent = `(${product.rating || 0}/5)`;

    // Update stock status
    const stockElement = modal.querySelector('.stock-status');
    if (stockElement) {
        if (product.stock === 0) {
            stockElement.textContent = 'Out of Stock';
            stockElement.style.color = '#dc3545';
        } else if (product.stock < 10) {
            stockElement.textContent = 'Low Stock';
            stockElement.style.color = '#ff9800';
        } else {
            stockElement.textContent = 'Available';
            stockElement.style.color = '#28a745';
        }
    }

    // Setup image gallery with navigation
    let currentImageIndex = 0;
    let productImages = [];

    if (product.images && product.images.length > 0) {
        productImages = product.images;
    } else if (product.image) {
        productImages = [{ image_path: product.image, is_main: true }];
    }

    const mainImage = modal.querySelector('.main-image');
    const prevBtn = document.getElementById('prevImageBtn');
    const nextBtn = document.getElementById('nextImageBtn');
    const indicator = document.getElementById('imageIndicator');

    function updateImage() {
        if (mainImage && productImages.length > 0) {
            mainImage.style.backgroundImage = `url('${productImages[currentImageIndex].image_path || '/placeholder-product.png'}')`;
            mainImage.style.backgroundSize = 'cover';
            mainImage.style.backgroundPosition = 'center';
        }

        // Update indicator
        if (indicator) {
            indicator.textContent = `${currentImageIndex + 1} / ${productImages.length}`;
        }

        // Show/hide buttons based on number of images
        if (prevBtn) {
            prevBtn.style.display = productImages.length > 1 ? 'flex' : 'none';
        }
        if (nextBtn) {
            nextBtn.style.display = productImages.length > 1 ? 'flex' : 'none';
        }

        // Hide indicator if only one image
        if (indicator) {
            indicator.style.display = productImages.length > 1 ? 'block' : 'none';
        }
    }

    // Initialize
    updateImage();

    // Remove old event listeners
    const newPrevBtn = prevBtn.cloneNode(true);
    const newNextBtn = nextBtn.cloneNode(true);
    prevBtn.parentNode.replaceChild(newPrevBtn, prevBtn);
    nextBtn.parentNode.replaceChild(newNextBtn, nextBtn);

    // Add new event listeners with looping
    newPrevBtn.addEventListener('click', () => {
        if (productImages.length > 1) {
            currentImageIndex = currentImageIndex === 0 ? productImages.length - 1 : currentImageIndex - 1;
            updateImage();
        }
    });

    newNextBtn.addEventListener('click', () => {
        if (productImages.length > 1) {
            currentImageIndex = currentImageIndex === productImages.length - 1 ? 0 : currentImageIndex + 1;
            updateImage();
        }
    });

    // Keyboard navigation with looping
    const handleKeyPress = (e) => {
        if (modal.classList.contains('active') && productImages.length > 1) {
            if (e.key === 'ArrowLeft') {
                currentImageIndex = currentImageIndex === 0 ? productImages.length - 1 : currentImageIndex - 1;
                updateImage();
            } else if (e.key === 'ArrowRight') {
                currentImageIndex = currentImageIndex === productImages.length - 1 ? 0 : currentImageIndex + 1;
                updateImage();
            }
        }
    };

    document.removeEventListener('keydown', handleKeyPress);
    document.addEventListener('keydown', handleKeyPress);

    // Update description
    const descElement = modal.querySelector('.product-description p');
    if (descElement && product.description) {
        descElement.textContent = product.description;
    }

    // Update benefits
    const benefitsList = modal.querySelector('.product-description ul');
    if (benefitsList && product.benefits) {
        const benefits = product.benefits.split(',').map(b => b.trim()).filter(b => b);
        benefitsList.innerHTML = benefits.map(benefit => `<li>${benefit}</li>`).join('');
    }

    // Update wishlist button
    const wishlistBtn = modal.querySelector('.wishlist-btn');
    if (wishlistBtn && typeof updateWishlistButton === 'function') {
        updateWishlistButton(product.id);

        // Remove old event listener and add new one
        const newWishlistBtn = wishlistBtn.cloneNode(true);
        wishlistBtn.parentNode.replaceChild(newWishlistBtn, wishlistBtn);

        newWishlistBtn.addEventListener('click', () => {
            if (typeof handleWishlistButtonClick === 'function') {
                handleWishlistButtonClick(product);
            }
        });
    }

    // Update Add to Cart button
    const addToCartBtn = modal.querySelector('.add-to-cart-btn.large');
    if (addToCartBtn) {
        // Remove old event listener and add new one
        const newAddToCartBtn = addToCartBtn.cloneNode(true);
        addToCartBtn.parentNode.replaceChild(newAddToCartBtn, addToCartBtn);

        newAddToCartBtn.addEventListener('click', () => {
            const quantityInput = modal.querySelector('.qty-input');
            const quantity = quantityInput ? parseInt(quantityInput.value) || 1 : 1;

            // Add the specified quantity to cart
            for (let i = 0; i < quantity; i++) {
                addToCart(product.id);
            }

            // Close modal after adding to cart
            closeProductModal();
        });
    }
}

// Fallback function for basic product info
function updateProductModalBasic(productId, productName, productPrice) {
    const modal = document.getElementById('product-modal');

    // Update product name
    const nameElement = modal.querySelector('.product-details h2');
    if (nameElement) nameElement.textContent = productName;

    // Update product price
    const priceElement = modal.querySelector('.product-price');
    if (priceElement) priceElement.textContent = productPrice;

    // Update main image based on product ID
    const mainImage = modal.querySelector('.main-image');
    if (mainImage) {
        mainImage.style.background = `url('product${productId}.png') center/cover`;
    }

    // Update thumbnails
    const thumbnails = modal.querySelectorAll('.thumbnail');
    thumbnails.forEach(thumb => {
        thumb.style.background = `url('product${productId}.png') center/cover`;
    });
}

// Cart initialization is now handled by cart.js

// Lazy loading for images (performance optimization)
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// Accessibility: Focus trap in modals
function trapFocus(element) {
    const focusableElements = element.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    element.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            if (e.shiftKey) {
                if (document.activeElement === firstFocusable) {
                    lastFocusable.focus();
                    e.preventDefault();
                }
            } else {
                if (document.activeElement === lastFocusable) {
                    firstFocusable.focus();
                    e.preventDefault();
                }
            }
        }
    });
}

// Apply focus trap to modals when they open
document.querySelectorAll('.modal').forEach(modal => {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'class') {
                if (modal.classList.contains('active')) {
                    trapFocus(modal);
                }
            }
        });
    });

    observer.observe(modal, { attributes: true });
});

// Counter Animation for Stats
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');

    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        const suffix = counter.getAttribute('data-suffix') || '';
        const increment = target / 100;
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
                counter.textContent = current + suffix;
            } else {
                counter.textContent = Math.floor(current);
            }
        }, 20);
    });
}

// Start counter animation when About page is visible
const aboutObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCounters();
            aboutObserver.unobserve(entry.target);
        }
    });
});

const aboutPage = document.getElementById('about-page');
if (aboutPage) {
    aboutObserver.observe(aboutPage);
}

// Make updateProductModal globally available
window.updateProductModal = updateProductModal;

console.log('Virgin 5.0 - Luxury Skincare Application Initialized');


// Contact Form Submission
async function submitContactForm(event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);
    const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        message: formData.get('message')
    };

    try {
        const { error } = await supabase
            .from('messages')
            .insert([data]);

        if (!error) {
            showNotification('Message sent successfully! We will get back to you soon.');
            form.reset();
        } else {
            console.error('Error sending message:', error);
            showNotification('Failed to send message. Please try again.');
        }
    } catch (error) {
        console.error('Error sending message:', error);
        showNotification('Failed to send message. Please try again.');
    }
}

// Make function globally available
window.submitContactForm = submitContactForm;

// Enhanced Ad Banner Carousel Management
let carouselInstances = new Map();

class AdCarousel {
    constructor(container, ads, location) {
        this.container = container;
        this.ads = ads;
        this.location = location;
        this.currentIndex = 0;
        this.autoPlayInterval = null;
        this.autoPlayDuration = 30000; // 30 seconds
        this.progressInterval = null;
        this.isTransitioning = false;
        this.touchStartX = 0;
        this.touchEndX = 0;

        this.init();
    }

    init() {
        this.createCarouselHTML();
        this.setupEventListeners();
        this.startAutoPlay();
    }

    createCarouselHTML() {
        const carouselHTML = `
            <div class="ad-banner-carousel">
                <div class="carousel-container">
                    <div class="carousel-track">
                        ${this.ads.map((ad, index) => `
                            <div class="ad-banner" data-ad-id="${ad.id}">
                                <img src="http://localhost:3001${ad.image_path}" 
                                     alt="${ad.title}" 
                                     class="ad-image"
                                     loading="${index === 0 ? 'eager' : 'lazy'}"
                                     onload="this.parentElement.classList.add('loaded')"
                                     onerror="this.style.display='none'">
                            </div>
                        `).join('')}
                    </div>
                    
                    ${this.ads.length > 1 ? `
                        <button class="carousel-nav prev" aria-label="Previous slide">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="15,18 9,12 15,6"></polyline>
                            </svg>
                        </button>
                        
                        <button class="carousel-nav next" aria-label="Next slide">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="9,18 15,12 9,6"></polyline>
                            </svg>
                        </button>
                        
                        <div class="carousel-indicators">
                            ${this.ads.map((_, index) => `
                                <button class="carousel-indicator ${index === 0 ? 'active' : ''}" 
                                        data-index="${index}" 
                                        aria-label="Go to slide ${index + 1}"></button>
                            `).join('')}
                        </div>
                        
                        <div class="carousel-progress"></div>
                    ` : ''}
                </div>
            </div>
        `;

        this.container.innerHTML = carouselHTML;

        // Cache DOM elements
        this.track = this.container.querySelector('.carousel-track');
        this.prevBtn = this.container.querySelector('.carousel-nav.prev');
        this.nextBtn = this.container.querySelector('.carousel-nav.next');
        this.indicators = this.container.querySelectorAll('.carousel-indicator');
        this.progress = this.container.querySelector('.carousel-progress');
        this.carouselContainer = this.container.querySelector('.carousel-container');
    }

    setupEventListeners() {
        if (this.ads.length <= 1) return;

        // Navigation buttons
        this.prevBtn?.addEventListener('click', () => this.goToPrevious());
        this.nextBtn?.addEventListener('click', () => this.goToNext());

        // Indicators
        this.indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => this.goToSlide(index));
        });

        // Touch/Swipe events
        this.carouselContainer.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: true });
        this.carouselContainer.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: true });

        // Mouse events for desktop dragging
        this.carouselContainer.addEventListener('mousedown', (e) => this.handleMouseDown(e));

        // Keyboard navigation
        this.container.addEventListener('keydown', (e) => this.handleKeyDown(e));

        // Pause auto-play on hover
        this.container.addEventListener('mouseenter', () => this.pauseAutoPlay());
        this.container.addEventListener('mouseleave', () => this.resumeAutoPlay());

        // Pause auto-play when tab is not visible
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAutoPlay();
            } else {
                this.resumeAutoPlay();
            }
        });
    }

    goToSlide(index, direction = 'next') {
        if (this.isTransitioning || index === this.currentIndex) return;

        this.isTransitioning = true;
        this.currentIndex = index;

        // Update track position
        const translateX = -index * 100;
        this.track.style.transform = `translateX(${translateX}%)`;

        // Update indicators
        this.updateIndicators();

        // Reset and restart auto-play progress
        this.resetAutoPlayProgress();

        // Add click tracking
        const currentAd = this.ads[index];
        if (currentAd) {
            console.log(`Ad banner viewed: ${currentAd.id}`);
        }

        setTimeout(() => {
            this.isTransitioning = false;
        }, 600);
    }

    goToNext() {
        const nextIndex = (this.currentIndex + 1) % this.ads.length;
        this.goToSlide(nextIndex, 'next');
    }

    goToPrevious() {
        const prevIndex = (this.currentIndex - 1 + this.ads.length) % this.ads.length;
        this.goToSlide(prevIndex, 'prev');
    }

    updateIndicators() {
        this.indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.currentIndex);
        });
    }

    handleTouchStart(e) {
        this.touchStartX = e.touches[0].clientX;
        this.pauseAutoPlay();
    }

    handleTouchEnd(e) {
        this.touchEndX = e.changedTouches[0].clientX;
        this.handleSwipe();
        this.resumeAutoPlay();
    }

    handleMouseDown(e) {
        this.touchStartX = e.clientX;
        this.pauseAutoPlay();

        const handleMouseMove = (e) => {
            e.preventDefault();
        };

        const handleMouseUp = (e) => {
            this.touchEndX = e.clientX;
            this.handleSwipe();
            this.resumeAutoPlay();

            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }

    handleSwipe() {
        const swipeThreshold = 50;
        const swipeDistance = this.touchEndX - this.touchStartX;

        if (Math.abs(swipeDistance) > swipeThreshold) {
            if (swipeDistance > 0) {
                this.goToPrevious();
            } else {
                this.goToNext();
            }
        }
    }

    handleKeyDown(e) {
        switch (e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                this.goToPrevious();
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.goToNext();
                break;
            case ' ':
                e.preventDefault();
                this.toggleAutoPlay();
                break;
        }
    }

    startAutoPlay() {
        if (this.ads.length <= 1) return;

        this.autoPlayInterval = setInterval(() => {
            this.goToNext();
        }, this.autoPlayDuration);

        this.startAutoPlayProgress();
    }

    pauseAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }

        if (this.progressInterval) {
            clearInterval(this.progressInterval);
            this.progressInterval = null;
        }
    }

    resumeAutoPlay() {
        if (!this.autoPlayInterval && this.ads.length > 1) {
            this.startAutoPlay();
        }
    }

    toggleAutoPlay() {
        if (this.autoPlayInterval) {
            this.pauseAutoPlay();
        } else {
            this.resumeAutoPlay();
        }
    }

    startAutoPlayProgress() {
        if (!this.progress) return;

        let progress = 0;
        const increment = 100 / (this.autoPlayDuration / 100);

        this.progressInterval = setInterval(() => {
            progress += increment;
            if (this.progress) {
                this.progress.style.width = `${Math.min(progress, 100)}%`;
            }

            if (progress >= 100) {
                progress = 0;
            }
        }, 100);
    }

    resetAutoPlayProgress() {
        if (this.progress) {
            this.progress.style.width = '0%';
        }

        if (this.progressInterval) {
            clearInterval(this.progressInterval);
        }

        this.startAutoPlayProgress();
    }

    destroy() {
        this.pauseAutoPlay();

        // Remove event listeners
        this.prevBtn?.removeEventListener('click', this.goToPrevious);
        this.nextBtn?.removeEventListener('click', this.goToNext);

        // Clear container
        this.container.innerHTML = '';
    }
}

async function loadAdBanners(location) {
    try {
        const response = await fetch(`http://localhost:3002/api/ads/active/${location}`);
        if (!response.ok) {
            console.log(`No ads found for ${location} page`);
            return;
        }

        const ads = await response.json();

        if (location === 'home') {
            displayHomeBanners(ads);
        } else if (location === 'products') {
            displayProductBanners(ads);
        }

    } catch (error) {
        console.error(`Error loading ${location} ads:`, error);
    }
}

// Enhanced display home page banners with carousel
function displayHomeBanners(ads) {
    const bannersContainer = document.getElementById('homeBanners');
    if (!bannersContainer) return;

    if (ads.length === 0) {
        bannersContainer.innerHTML = '';
        return;
    }

    // Destroy existing carousel if any
    const existingCarousel = carouselInstances.get('home');
    if (existingCarousel) {
        existingCarousel.destroy();
    }

    // Create new carousel
    const carousel = new AdCarousel(bannersContainer, ads, 'home');
    carouselInstances.set('home', carousel);
}

// Enhanced display product page banners with carousel
function displayProductBanners(ads) {
    const bannersContainer = document.getElementById('productBanners');
    if (!bannersContainer) return;

    if (ads.length === 0) {
        bannersContainer.innerHTML = '';
        return;
    }

    // Destroy existing carousel if any
    const existingCarousel = carouselInstances.get('products');
    if (existingCarousel) {
        existingCarousel.destroy();
    }

    // Create new carousel
    const carousel = new AdCarousel(bannersContainer, ads, 'products');
    carouselInstances.set('products', carousel);
}

// Preload banner images for better performance
function preloadBannerImages() {
    // Preload home banners
    fetch('http://localhost:3002/api/ads/active/home')
        .then(response => response.json())
        .then(ads => {
            ads.forEach(ad => {
                const img = new Image();
                img.src = `http://localhost:3001${ad.image_path}`;
            });
        })
        .catch(() => { }); // Silently fail

    // Preload product banners
    fetch('http://localhost:3002/api/ads/active/products')
        .then(response => response.json())
        .then(ads => {
            ads.forEach(ad => {
                const img = new Image();
                img.src = `http://localhost:3001${ad.image_path}`;
            });
        })
        .catch(() => { }); // Silently fail
}

// Enhanced page navigation with carousel management
const originalNavigateToPage = window.navigateToPage || navigateToPage;
window.navigateToPage = function (pageId) {
    originalNavigateToPage(pageId);

    // Add page transition effect
    document.body.style.transition = 'opacity 0.3s ease';
    document.body.style.opacity = '0.95';
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 150);

    // Load appropriate ads based on page with delay for smooth transition
    setTimeout(() => {
        if (pageId === 'hero-page') {
            loadAdBanners('home');
        } else if (pageId === 'products-page') {
            loadAdBanners('products');
        }
    }, 200);
};

// Load ads when page loads
document.addEventListener('DOMContentLoaded', function () {
    // Preload banner images for better performance
    preloadBannerImages();

    // Load home page ads with a slight delay for better UX
    setTimeout(() => {
        loadAdBanners('home');
    }, 300);
});

// Cleanup carousels when page unloads
window.addEventListener('beforeunload', function () {
    carouselInstances.forEach(carousel => {
        carousel.destroy();
    });
    carouselInstances.clear();
});