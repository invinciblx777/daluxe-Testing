// Ads Management Page
let currentAds = [];
let editingAdId = null;

// Initialize ads page
function initAdsPage() {
    console.log('🎯 Initializing Ads Management Page');
    loadAds();
}

// Load all ads
async function loadAds() {
    try {
        console.log('📥 Loading ads from Supabase...');
        const { data, error } = await supabase
            .from('ads')
            .select('*')
            .order('display_order', { ascending: true });

        if (error) throw error;

        console.log('✅ Ads loaded:', data.length);

        currentAds = data;
        renderAdsTable();
        updateAdsStats();

    } catch (error) {
        console.error('❌ Error loading ads:', error);
        showNotification('Failed to load ads', 'error');
    }
}

// Render ads table
function renderAdsTable() {
    const tableBody = document.querySelector('#adsTableBody');
    if (!tableBody) return;

    if (currentAds.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="no-data">
                    <div class="no-data-content">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                            <line x1="8" y1="21" x2="16" y2="21"/>
                            <line x1="12" y1="17" x2="12" y2="21"/>
                        </svg>
                        <h3>No ads found</h3>
                        <p>Create your first ad banner to get started</p>
                        <button class="btn btn-primary" onclick="showAddAdModal()">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="12" y1="5" x2="12" y2="19"/>
                                <line x1="5" y1="12" x2="19" y2="12"/>
                            </svg>
                            Add First Ad
                        </button>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = currentAds.map(ad => `
        <tr>
            <td>
                <div class="ad-preview">
                    <img src="${ad.image_path}" alt="${ad.title}" class="ad-thumbnail" onerror="this.src='placeholder.png'">
                    <div class="ad-info">
                        <div class="ad-title">${ad.title}</div>
                        <div class="ad-id">#${ad.id}</div>
                    </div>
                </div>
            </td>
            <td>
                <span class="location-badge location-${ad.location}">
                    ${ad.location === 'home' ? 'Home Page' : 'Products Page'}
                </span>
            </td>
            <td>
                <span class="status-badge ${ad.is_active ? 'active' : 'inactive'}">
                    ${ad.is_active ? 'Active' : 'Inactive'}
                </span>
            </td>
            <td>${ad.display_order}</td>
            <td>${formatDate(ad.created_at)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon btn-edit" onclick="editAd(${ad.id})" title="Edit Ad">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                    </button>
                    <button class="btn-icon btn-toggle" onclick="toggleAdStatus(${ad.id})" title="${ad.is_active ? 'Deactivate' : 'Activate'} Ad">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            ${ad.is_active ?
            '<path d="M10 9V6a4 4 0 1 1 8 0v3"/><rect x="8" y="9" width="8" height="5" rx="1" ry="1"/>' :
            '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><circle cx="12" cy="16" r="1"/>'
        }
                        </svg>
                    </button>
                    <button class="btn-icon btn-delete" onclick="deleteAd(${ad.id})" title="Delete Ad">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3,6 5,6 21,6"/>
                            <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"/>
                            <line x1="10" y1="11" x2="10" y2="17"/>
                            <line x1="14" y1="11" x2="14" y2="17"/>
                        </svg>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Update ads statistics
function updateAdsStats() {
    const totalAds = currentAds.length;
    const activeAds = currentAds.filter(ad => ad.is_active).length;
    const homeAds = currentAds.filter(ad => ad.location === 'home').length;
    const productAds = currentAds.filter(ad => ad.location === 'products').length;

    const statsElements = {
        totalAds: document.querySelector('#totalAdsCount'),
        activeAds: document.querySelector('#activeAdsCount'),
        homeAds: document.querySelector('#homeAdsCount'),
        productAds: document.querySelector('#productAdsCount')
    };

    if (statsElements.totalAds) statsElements.totalAds.textContent = totalAds;
    if (statsElements.activeAds) statsElements.activeAds.textContent = activeAds;
    if (statsElements.homeAds) statsElements.homeAds.textContent = homeAds;
    if (statsElements.productAds) statsElements.productAds.textContent = productAds;
}

// Show add ad modal
function showAddAdModal() {
    editingAdId = null;
    const modal = document.getElementById('adModal');
    const form = document.getElementById('adForm');
    const modalTitle = document.querySelector('#adModal .modal-title');

    modalTitle.textContent = 'Add New Ad Banner';
    form.reset();

    // Reset image preview
    const imagePreview = document.getElementById('imagePreview');
    const imageUpload = document.getElementById('imageUpload');
    imagePreview.style.display = 'none';
    imageUpload.style.display = 'block';

    modal.style.display = 'flex';

    // Setup enhanced features after modal is shown
    setTimeout(() => {
        setupDragAndDrop();
        updateImageUploadHandler();
        setupAutoSave();
        loadDraft();
    }, 100);
}

// Edit ad
async function editAd(adId) {
    try {
        const ad = currentAds.find(a => a.id === adId);
        if (!ad) throw new Error('Ad not found');

        editingAdId = adId;
        const modal = document.getElementById('adModal');
        const form = document.getElementById('adForm');
        const modalTitle = document.querySelector('#adModal .modal-title');

        modalTitle.textContent = 'Edit Ad Banner';

        // Fill form with ad data
        document.getElementById('adTitle').value = ad.title;
        document.getElementById('adLocation').value = ad.location;
        document.getElementById('adDisplayOrder').value = ad.display_order;
        document.getElementById('adIsActive').checked = ad.is_active;

        // Show current image
        const imagePreview = document.getElementById('imagePreview');
        const imageUpload = document.getElementById('imageUpload');
        const currentImage = document.getElementById('currentImage');

        currentImage.src = ad.image_path;
        imagePreview.style.display = 'block';
        imageUpload.style.display = 'none';

        modal.style.display = 'flex';

        // Setup enhanced features after modal is shown
        setTimeout(() => {
            setupDragAndDrop();
            updateImageUploadHandler();
            setupAutoSave();
        }, 100);

    } catch (error) {
        console.error('Error loading ad:', error);
        showNotification('Failed to load ad details', 'error');
    }
}

// Handle ad form submission
async function handleAdSubmit(event) {
    event.preventDefault();

    const form = event.target;
    // Create form data 
    // We will extract data manually to handle Supabase logic

    const title = document.getElementById('adTitle').value;
    const location = document.getElementById('adLocation').value;
    const displayOrder = parseInt(document.getElementById('adDisplayOrder').value) || 0;
    const isActive = document.getElementById('adIsActive').checked;

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;

    // Show loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
            <div class="loading-spinner" style="width: 16px; height: 16px; border-width: 2px;"></div>
            ${editingAdId ? 'Updating...' : 'Creating...'}
        </div>
    `;

    try {
        console.log(`${editingAdId ? 'Updating' : 'Creating'} ad...`);

        // Handle Image Upload if selected
        const fileInput = document.getElementById('adImage');
        let imagePath = null;

        if (fileInput.files.length > 0) {
            const file = fileInput.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `ads/${fileName}`;

            console.log('Uploading image to Supabase Storage...');
            const { error: uploadError } = await supabase.storage
                .from('ads')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('ads')
                .getPublicUrl(fileName);

            imagePath = publicUrl;
        } else if (editingAdId) {
            // Keep existing image if editing and no new file
            const currentAd = currentAds.find(a => a.id === editingAdId);
            imagePath = currentAd ? currentAd.image_path : null;
        }

        if (!imagePath) throw new Error('Image is required');

        // Database operation
        const adData = {
            title,
            location,
            display_order: displayOrder,
            is_active: isActive,
            image_path: imagePath
        };

        let error;
        if (editingAdId) {
            const { error: updateError } = await supabase
                .from('ads')
                .update(adData)
                .eq('id', editingAdId);
            error = updateError;
        } else {
            const { error: insertError } = await supabase
                .from('ads')
                .insert([adData]);
            error = insertError;
        }

        if (error) throw error;

        console.log('✅ Ad saved successfully');
        showNotification(editingAdId ? 'Ad updated successfully' : 'Ad created successfully', 'success');

        // Clear draft on successful save
        clearDraft();

        // Close modal and reload ads
        closeAdModal();
        loadAds();

        // Show success animation on the add button
        const addBtn = document.querySelector('.primary-btn');
        showSuccessAnimation(addBtn);

    } catch (error) {
        console.error('❌ Error saving ad:', error);
        showNotification(error.message, 'error');
    } finally {
        // Restore button state
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

// Toggle ad status
async function toggleAdStatus(adId) {
    try {
        const ad = currentAds.find(a => a.id === adId);
        if (!ad) return;

        const newStatus = !ad.is_active;

        const { error } = await supabase
            .from('ads')
            .update({ is_active: newStatus })
            .eq('id', adId);

        if (error) throw error;

        showNotification('Ad status updated', 'success');
        loadAds();

    } catch (error) {
        console.error('Error toggling ad status:', error);
        showNotification('Failed to update status', 'error');
    }
}

// Delete ad
async function deleteAd(adId) {
    const ad = currentAds.find(a => a.id === adId);
    if (!ad) return;

    // Check if confirmDelete global exists (from enhanced code), else use confirm
    let confirmed = false;
    if (window.confirmDelete) {
        confirmed = await window.confirmDelete(ad.title);
    } else {
        confirmed = confirm(`Are you sure you want to delete "${ad.title}"?`);
    }

    if (!confirmed) return;

    try {
        const { error } = await supabase
            .from('ads')
            .delete()
            .eq('id', adId);

        if (error) throw error;

        showNotification('Ad deleted successfully', 'success');
        loadAds();

    } catch (error) {
        console.error('Error deleting ad:', error);
        showNotification(error.message, 'error');
    }
}

// Close ad modal
function closeAdModal() {
    const modal = document.getElementById('adModal');
    modal.style.display = 'none';
    editingAdId = null;
}

// Handle image upload preview
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
        showNotification('Please select a valid image file', 'error');
        event.target.value = '';
        return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
        showNotification('Image size must be less than 5MB', 'error');
        event.target.value = '';
        return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = function (e) {
        const imagePreview = document.getElementById('imagePreview');
        const imageUpload = document.getElementById('imageUpload');
        const currentImage = document.getElementById('currentImage');

        currentImage.src = e.target.result;
        imagePreview.style.display = 'block';
        imageUpload.style.display = 'none';
    };
    reader.readAsDataURL(file);
}

// Enhanced drag and drop functionality
function setupDragAndDrop() {
    const uploadArea = document.getElementById('imageUpload');
    if (!uploadArea) return;

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        uploadArea.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, unhighlight, false);
    });

    function highlight(e) {
        uploadArea.classList.add('dragover');
    }

    function unhighlight(e) {
        uploadArea.classList.remove('dragover');
    }

    uploadArea.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;

        if (files.length > 0) {
            const fileInput = document.getElementById('adImage');
            fileInput.files = files;

            // Trigger the change event
            const event = new Event('change', { bubbles: true });
            fileInput.dispatchEvent(event);
        }
    }
}

// Remove image preview
function removeImagePreview() {
    const imagePreview = document.getElementById('imagePreview');
    const imageUpload = document.getElementById('imageUpload');
    const imageInput = document.getElementById('adImage');

    imagePreview.style.display = 'none';
    imageUpload.style.display = 'block';
    imageInput.value = '';
}

// Filter ads
function filterAds() {
    const searchTerm = document.getElementById('adSearch').value.toLowerCase();
    const locationFilter = document.getElementById('locationFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;

    let filteredAds = currentAds;

    // Apply search filter
    if (searchTerm) {
        filteredAds = filteredAds.filter(ad =>
            ad.title.toLowerCase().includes(searchTerm)
        );
    }

    // Apply location filter
    if (locationFilter) {
        filteredAds = filteredAds.filter(ad => ad.location === locationFilter);
    }

    // Apply status filter
    if (statusFilter) {
        const isActive = statusFilter === 'active';
        filteredAds = filteredAds.filter(ad => ad.is_active === isActive);
    }

    // Update table with filtered results
    const originalAds = currentAds;
    currentAds = filteredAds;
    renderAdsTable();
    currentAds = originalAds;
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Export functions for global access
window.initAdsPage = initAdsPage;
window.showAddAdModal = showAddAdModal;
window.editAd = editAd;
window.handleAdSubmit = handleAdSubmit;
window.toggleAdStatus = toggleAdStatus;
window.deleteAd = deleteAd;
window.closeAdModal = closeAdModal;
window.handleImageUpload = handleImageUpload;
window.removeImagePreview = removeImagePreview;
window.filterAds = filterAds;

// Add loading states and better feedback
function showLoading(element, text = 'Loading...') {
    if (element) {
        element.innerHTML = `
            <div class="loading-state">
                <div class="loading-spinner"></div>
                <span>${text}</span>
            </div>
        `;
    }
}

// Add success animation for actions
function showSuccessAnimation(element) {
    if (element) {
        element.style.transform = 'scale(1.05)';
        element.style.transition = 'transform 0.2s ease';
        setTimeout(() => {
            element.style.transform = 'scale(1)';
        }, 200);
    }
}

// Enhanced delete confirmation
function confirmDelete(adTitle) {
    return new Promise((resolve) => {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'flex';
        modal.innerHTML = `
            <div class="modal-backdrop"></div>
            <div class="modal-content confirm-modal">
                <div class="modal-header">
                    <h2 class="modal-title">Delete Ad Banner</h2>
                </div>
                <div class="modal-body">
                    <div class="confirm-icon">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="15" y1="9" x2="9" y2="15"/>
                            <line x1="9" y1="9" x2="15" y2="15"/>
                        </svg>
                    </div>
                    <p>Are you sure you want to delete "<strong>${adTitle}</strong>"?</p>
                    <p class="warning-text">This action cannot be undone.</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn-secondary cancel-btn">Cancel</button>
                    <button type="button" class="btn-danger confirm-btn">Delete</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const cancelBtn = modal.querySelector('.cancel-btn');
        const confirmBtn = modal.querySelector('.confirm-btn');
        const backdrop = modal.querySelector('.modal-backdrop');

        function cleanup() {
            document.body.removeChild(modal);
        }

        cancelBtn.onclick = () => {
            cleanup();
            resolve(false);
        };

        backdrop.onclick = () => {
            cleanup();
            resolve(false);
        };

        confirmBtn.onclick = () => {
            cleanup();
            resolve(true);
        };
    });
}
window.confirmDelete = confirmDelete;

// Auto-save draft functionality
let draftTimer;
function saveDraft() {
    const form = document.getElementById('adForm');
    if (!form) return;

    // Basic draft saving with limited fields since file inputs can't be saved
    const draft = {
        title: document.getElementById('adTitle').value,
        location: document.getElementById('adLocation').value,
        display_order: document.getElementById('adDisplayOrder').value,
        is_active: document.getElementById('adIsActive').checked,
        timestamp: Date.now()
    };

    localStorage.setItem('adDraft', JSON.stringify(draft));
}

function loadDraft() {
    const draftStr = localStorage.getItem('adDraft');
    if (!draftStr) return;

    try {
        const draft = JSON.parse(draftStr);

        // Only load if draft is less than 1 hour old
        if (Date.now() - draft.timestamp > 3600000) {
            localStorage.removeItem('adDraft');
            return;
        }

        // Fill form with draft data
        const form = document.getElementById('adForm');
        if (form && !editingAdId) {
            document.getElementById('adTitle').value = draft.title || '';
            document.getElementById('adLocation').value = draft.location || '';
            document.getElementById('adDisplayOrder').value = draft.display_order || '';
            document.getElementById('adIsActive').checked = draft.is_active;
        }
    } catch (error) {
        console.error('Error loading draft:', error);
        localStorage.removeItem('adDraft');
    }
}

// Setup auto-save on form inputs
function setupAutoSave() {
    const form = document.getElementById('adForm');
    if (!form) return;

    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            clearTimeout(draftTimer);
            draftTimer = setTimeout(saveDraft, 1000);
        });
    });
}

// Clear draft when form is submitted successfully
function clearDraft() {
    localStorage.removeItem('adDraft');
}

// Export functions for global access
window.setupDragAndDrop = setupDragAndDrop;
window.showLoading = showLoading;
window.showSuccessAnimation = showSuccessAnimation;
window.saveDraft = saveDraft;
window.loadDraft = loadDraft;
window.setupAutoSave = setupAutoSave;
window.clearDraft = clearDraft;

// Image optimization and validation
function validateImageFile(file) {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    const minWidth = 300;
    const minHeight = 200;

    return new Promise((resolve, reject) => {
        // Check file type
        if (!validTypes.includes(file.type)) {
            reject(new Error('Please select a valid image file (JPEG, PNG, GIF, or WebP)'));
            return;
        }

        // Check file size
        if (file.size > maxSize) {
            reject(new Error('Image size must be less than 5MB'));
            return;
        }

        // Check image dimensions
        const img = new Image();
        img.onload = function () {
            if (this.width < minWidth || this.height < minHeight) {
                reject(new Error(`Image must be at least ${minWidth}x${minHeight} pixels`));
                return;
            }
            resolve({
                width: this.width,
                height: this.height,
                size: file.size
            });
        };

        img.onerror = function () {
            reject(new Error('Invalid image file'));
        };

        img.src = URL.createObjectURL(file);
    });
}

// Enhanced image upload with validation
async function handleImageUploadWithValidation(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
        const imageInfo = await validateImageFile(file);

        // Show preview
        const reader = new FileReader();
        reader.onload = function (e) {
            const imagePreview = document.getElementById('imagePreview');
            const imageUpload = document.getElementById('imageUpload');
            const currentImage = document.getElementById('currentImage');

            currentImage.src = e.target.result;
            imagePreview.style.display = 'block';
            imageUpload.style.display = 'none';

            // Add image info display
            const infoDiv = document.createElement('div');
            infoDiv.className = 'image-info';
            infoDiv.innerHTML = `
                <small style="color: var(--text-secondary); margin-top: 8px; display: block;">
                    ${imageInfo.width}×${imageInfo.height}px • ${(file.size / 1024 / 1024).toFixed(2)}MB
                </small>
            `;

            // Remove existing info
            const existingInfo = imagePreview.querySelector('.image-info');
            if (existingInfo) existingInfo.remove();

            imagePreview.appendChild(infoDiv);
        };
        reader.readAsDataURL(file);

    } catch (error) {
        showNotification(error.message, 'error');
        event.target.value = '';
    }
}

// Update the image upload handler
function updateImageUploadHandler() {
    const imageInput = document.getElementById('adImage');
    if (imageInput) {
        // Remove old handler
        imageInput.removeEventListener('change', handleImageUpload);
        // Add new enhanced handler
        imageInput.addEventListener('change', handleImageUploadWithValidation);
    }
}

window.validateImageFile = validateImageFile;
window.handleImageUploadWithValidation = handleImageUploadWithValidation;
window.updateImageUploadHandler = updateImageUploadHandler;

// Initialize
if (window.location.hash === '#ads' || document.getElementById('adsTableBody')) {
    initAdsPage();
}