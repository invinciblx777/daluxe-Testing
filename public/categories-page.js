// Categories Page Management

let categories = [];

// Load categories from API
async function loadCategories() {
    try {
        const response = await fetch('http://localhost:3002/api/categories');
        categories = await response.json();
        renderCategories();
    } catch (error) {
        console.error('Error loading categories:', error);
        showNotification('Failed to load categories', 'error');
    }
}

// Render categories table
function renderCategories() {
    const container = document.getElementById('categoriesTableBody');
    if (!container) return;
    
    if (categories.length === 0) {
        container.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 40px; color: var(--text-secondary);">
                    No categories found. Add your first category!
                </td>
            </tr>
        `;
        return;
    }
    
    container.innerHTML = categories.map(category => `
        <tr>
            <td>${category.id}</td>
            <td>
                <div class="category-name">
                    ${category.name}
                    ${!category.is_active ? '<span class="status-badge inactive">Inactive</span>' : ''}
                </div>
            </td>
            <td>${category.description || '-'}</td>
            <td>${category.display_order}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon" onclick="editCategory(${category.id})" title="Edit">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                    </button>
                    <button class="btn-icon btn-danger" onclick="deleteCategory(${category.id}, '${category.name}')" title="Delete">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Show add category modal
function showAddCategoryModal() {
    const modal = document.getElementById('categoryModal');
    if (!modal) return;
    
    document.getElementById('modalTitle').textContent = 'Add New Category';
    document.getElementById('categoryId').value = '';
    document.getElementById('categoryName').value = '';
    document.getElementById('categoryDescription').value = '';
    document.getElementById('categoryActive').checked = true;
    
    // Hide display order field for new categories (auto-assigned)
    const displayOrderGroup = document.getElementById('displayOrderGroup');
    if (displayOrderGroup) {
        displayOrderGroup.style.display = 'none';
    }
    
    modal.classList.add('active');
    modal.style.display = 'flex';
}

// Close category modal
function closeCategoryModal() {
    const modal = document.getElementById('categoryModal');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
}

// Save category (add or update)
async function saveCategory(event) {
    event.preventDefault();
    
    const categoryId = document.getElementById('categoryId').value;
    const name = document.getElementById('categoryName').value.trim();
    const description = document.getElementById('categoryDescription').value.trim();
    const is_active = document.getElementById('categoryActive').checked;
    
    if (!name) {
        showNotification('Category name is required', 'error');
        return;
    }
    
    // Only include display_order when editing
    const data = { name, description, is_active };
    if (categoryId) {
        data.display_order = parseInt(document.getElementById('categoryOrder').value) || 0;
    }
    
    try {
        const url = categoryId ? 
            `http://localhost:3002/api/categories/${categoryId}` : 
            'http://localhost:3002/api/categories';
        const method = categoryId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification(result.message, 'success');
            closeCategoryModal();
            loadCategories();
        } else {
            showNotification(result.error || 'Failed to save category', 'error');
        }
    } catch (error) {
        console.error('Error saving category:', error);
        showNotification('Failed to save category', 'error');
    }
}

// Edit category
async function editCategory(id) {
    try {
        const response = await fetch(`http://localhost:3002/api/categories/${id}`);
        const category = await response.json();
        
        const modal = document.getElementById('categoryModal');
        modal.classList.add('active');
        modal.style.display = 'flex';
        
        document.getElementById('modalTitle').textContent = 'Edit Category';
        document.getElementById('categoryId').value = category.id;
        document.getElementById('categoryName').value = category.name;
        document.getElementById('categoryDescription').value = category.description || '';
        document.getElementById('categoryOrder').value = category.display_order;
        document.getElementById('categoryActive').checked = category.is_active;
        
        // Show display order field for editing
        const displayOrderGroup = document.getElementById('displayOrderGroup');
        if (displayOrderGroup) {
            displayOrderGroup.style.display = 'block';
        }
    } catch (error) {
        console.error('Error loading category:', error);
        showNotification('Failed to load category', 'error');
    }
}

// Delete category
async function deleteCategory(id, name) {
    if (confirm(`Are you sure you want to delete "${name}"?\n\nThis action cannot be undone. Products using this category will need to be reassigned.`)) {
        try {
            const response = await fetch(`http://localhost:3002/api/categories/${id}`, {
                method: 'DELETE'
            });
            
            const result = await response.json();
            
            if (result.success) {
                showCategoryNotification('Category deleted successfully', 'success');
                loadCategories();
            } else {
                showCategoryNotification(result.error || 'Failed to delete category', 'error');
            }
        } catch (error) {
            console.error('Error deleting category:', error);
            showCategoryNotification('Failed to delete category', 'error');
        }
    }
}

// Simple notification function for categories
function showCategoryNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `category-notification ${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        max-width: 400px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    
    // Set background color based on type
    const colors = {
        success: '#22c55e',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6'
    };
    notification.style.background = colors[type] || colors.info;
    
    notification.textContent = message;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add CSS for animations
if (!document.getElementById('category-notification-styles')) {
    const style = document.createElement('style');
    style.id = 'category-notification-styles';
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

// Make functions globally available
window.loadCategories = loadCategories;
window.showAddCategoryModal = showAddCategoryModal;
window.closeCategoryModal = closeCategoryModal;
window.saveCategory = saveCategory;
window.editCategory = editCategory;
window.deleteCategory = deleteCategory;
window.showCategoryNotification = showCategoryNotification;

console.log('Categories page initialized');
