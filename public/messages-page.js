// Messages Page Management

let messages = [];

// Load messages from Supabase
async function loadMessages() {
    try {
        console.log('📨 Loading messages from Supabase...');
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        messages = data;
        renderMessages();
        updateMessageStats();
    } catch (error) {
        console.error('Error loading messages:', error);
        showNotification('Failed to load messages', 'error');
    }
}

// Render messages table
function renderMessages() {
    const container = document.getElementById('messagesTableBody');
    if (!container) return;

    if (messages.length === 0) {
        container.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 40px; color: var(--text-secondary);">
                    No messages yet
                </td>
            </tr>
        `;
        return;
    }

    container.innerHTML = messages.map(msg => {
        const date = new Date(msg.created_at);
        const formattedDate = date.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        return `
            <tr class="${msg.status === 'unread' ? 'unread-message' : ''}">
                <td>${msg.id}</td>
                <td>
                    <div class="message-sender">
                        <div class="sender-name">${msg.name}</div>
                        <div class="sender-email">${msg.email}</div>
                    </div>
                </td>
                <td>${msg.phone || '-'}</td>
                <td>
                    <div class="message-preview" onclick="viewMessage(${msg.id})">
                        ${msg.message.substring(0, 100)}${msg.message.length > 100 ? '...' : ''}
                    </div>
                </td>
                <td>
                    <span class="status-badge ${msg.status}">
                        ${msg.status === 'unread' ? '● Unread' : '✓ Read'}
                    </span>
                </td>
                <td>${formattedDate}</td>
                <td>
                    <div class="action-buttons">
                        ${msg.status === 'unread' ? `
                            <button class="btn-icon" onclick="markAsRead(${msg.id})" title="Mark as Read">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="20 6 9 17 4 12"/>
                                </svg>
                            </button>
                        ` : ''}
                        <button class="btn-icon" onclick="viewMessage(${msg.id})" title="View">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                <circle cx="12" cy="12" r="3"/>
                            </svg>
                        </button>
                        <button class="btn-icon btn-danger" onclick="deleteMessage(${msg.id})" title="Delete">
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
}

// Update message statistics
function updateMessageStats() {
    const totalMessages = messages.length;
    const unreadMessages = messages.filter(m => m.status === 'unread').length;

    const totalElement = document.getElementById('totalMessages');
    const unreadElement = document.getElementById('unreadMessages');

    if (totalElement) totalElement.textContent = totalMessages;
    if (unreadElement) unreadElement.textContent = unreadMessages;
}

// View message details
function viewMessage(id) {
    const message = messages.find(m => m.id === id);
    if (!message) return;

    const modal = document.getElementById('messageModal');
    if (!modal) return;

    document.getElementById('viewMessageName').textContent = message.name;
    document.getElementById('viewMessageEmail').textContent = message.email;
    document.getElementById('viewMessagePhone').textContent = message.phone || 'Not provided';
    document.getElementById('viewMessageDate').textContent = new Date(message.created_at).toLocaleString('en-IN');
    document.getElementById('viewMessageContent').textContent = message.message;

    modal.classList.add('active');
    modal.style.display = 'flex';

    // Mark as read if unread
    if (message.status === 'unread') {
        markAsRead(id);
    }
}

// Close message modal
function closeMessageModal() {
    const modal = document.getElementById('messageModal');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
}

// Mark message as read
async function markAsRead(id) {
    try {
        const { error } = await supabase
            .from('messages')
            .update({ status: 'read' })
            .eq('id', id);

        if (error) throw error;

        loadMessages();
    } catch (error) {
        console.error('Error marking message as read:', error);
    }
}

// Delete message
async function deleteMessage(id) {
    if (confirm('Are you sure you want to delete this message?\n\nThis action cannot be undone.')) {
        try {
            const { error } = await supabase
                .from('messages')
                .delete()
                .eq('id', id);

            if (error) throw error;

            showMessageNotification('Message deleted successfully', 'success');
            loadMessages();

        } catch (error) {
            console.error('Error deleting message:', error);
            showMessageNotification('Failed to delete message', 'error');
        }
    }
}

// Simple notification function for messages
function showMessageNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `message-notification ${type}`;
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

// Add CSS for animations if not already added
if (!document.getElementById('message-notification-styles')) {
    const style = document.createElement('style');
    style.id = 'message-notification-styles';
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

// Filter messages
function filterMessages(status) {
    // Basic filter UI toggle
    if (event && event.target) {
        const buttons = document.querySelectorAll('.filter-btn');
        buttons.forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
    }

    if (status === 'all') {
        renderMessages();
    } else {
        const filtered = messages.filter(m => m.status === status);
        const container = document.getElementById('messagesTableBody');

        if (filtered.length === 0) {
            container.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 40px; color: var(--text-secondary);">
                        No ${status} messages
                    </td>
                </tr>
            `;
            return;
        }

        // Render filtered messages (reuse render logic)
        container.innerHTML = filtered.map(msg => {
            const date = new Date(msg.created_at);
            const formattedDate = date.toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            return `
                <tr class="${msg.status === 'unread' ? 'unread-message' : ''}">
                    <td>${msg.id}</td>
                    <td>
                        <div class="message-sender">
                            <div class="sender-name">${msg.name}</div>
                            <div class="sender-email">${msg.email}</div>
                        </div>
                    </td>
                    <td>${msg.phone || '-'}</td>
                    <td>
                        <div class="message-preview" onclick="viewMessage(${msg.id})">
                            ${msg.message.substring(0, 100)}${msg.message.length > 100 ? '...' : ''}
                        </div>
                    </td>
                    <td>
                        <span class="status-badge ${msg.status}">
                            ${msg.status === 'unread' ? '● Unread' : '✓ Read'}
                        </span>
                    </td>
                    <td>${formattedDate}</td>
                    <td>
                        <div class="action-buttons">
                            ${msg.status === 'unread' ? `
                                <button class="btn-icon" onclick="markAsRead(${msg.id})" title="Mark as Read">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <polyline points="20 6 9 17 4 12"/>
                                    </svg>
                                </button>
                            ` : ''}
                            <button class="btn-icon" onclick="viewMessage(${msg.id})" title="View">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                    <circle cx="12" cy="12" r="3"/>
                                </svg>
                            </button>
                            <button class="btn-icon btn-danger" onclick="deleteMessage(${msg.id})" title="Delete">
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
    }
}

// Make functions globally available
window.loadMessages = loadMessages;
window.viewMessage = viewMessage;
window.closeMessageModal = closeMessageModal;
window.markAsRead = markAsRead;
window.deleteMessage = deleteMessage;
window.filterMessages = filterMessages;
window.showMessageNotification = showMessageNotification;

console.log('Messages page initialized');
