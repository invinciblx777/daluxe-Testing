// Script to generate admin-pages.js
const fs = require('fs');

const content = `// Admin Pages Content - All page templates

const adminPages = {};

// Dashboard page
adminPages.dashboard = \`
    <div class="dashboard-header">
        <div>
            <h1 class="page-title">Dashboard</h1>
            <p class="page-subtitle">Welcome back! Here's what's happening with your store today.</p>
        </div>
        <div class="last-updated">
            <p class="update-label">Last updated</p>
            <p class="update-time" id="lastUpdated"></p>
        </div>
    </div>
    
    <div class="kpi-grid">
        <div class="kpi-card gold">
            <div class="kpi-header">
                <svg class="kpi-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                <span class="kpi-title">Total Revenue</span>
            </div>
            <div class="kpi-value">₹24.5L</div>
            <div class="kpi-change positive">
                <span class="change-arrow">↑</span>
                <span>12.5% vs last month</span>
            </div>
        </div>
        <div class="kpi-card">
            <div class="kpi-header">
                <svg class="kpi-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                <span class="kpi-title">Total Orders</span>
            </div>
            <div class="kpi-value">1,248</div>
            <div class="kpi-change positive">
                <span class="change-arrow">↑</span>
                <span>8.2% vs last month</span>
            </div>
        </div>
        <div class="kpi-card">
            <div class="kpi-header">
                <svg class="kpi-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                <span class="kpi-title">Conversion Rate</span>
            </div>
            <div class="kpi-value">3.24%</div>
            <div class="kpi-change negative">
                <span class="change-arrow">↓</span>
                <span>2.1% vs last month</span>
            </div>
        </div>
        <div class="kpi-card">
            <div class="kpi-header">
                <svg class="kpi-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                <span class="kpi-title">Avg Order Value</span>
            </div>
            <div class="kpi-value">₹3,890</div>
            <div class="kpi-change positive">
                <span class="change-arrow">↑</span>
                <span>5.7% vs last month</span>
            </div>
        </div>
