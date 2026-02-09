// Admin Login JavaScript

const CREDENTIALS = {
    email: 'daluxe@gmail.com',
    password: 'admin123',
    securityCode: '2026'
};

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    const loginBtn = loginForm.querySelector('.login-btn');
    const btnText = loginBtn.querySelector('.btn-text');
    const btnLoader = loginBtn.querySelector('.btn-loader');
    
    // Check if already logged in
    if (sessionStorage.getItem('adminLoggedIn') === 'true') {
        window.location.href = '/admin-dashboard.html';
        return;
    }
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const securityCode = document.getElementById('securityCode').value.trim();
        
        // Hide previous error
        errorMessage.classList.remove('show');
        
        // Show loading state
        loginBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline';
        
        // Simulate authentication delay
        setTimeout(() => {
            if (email === CREDENTIALS.email && 
                password === CREDENTIALS.password && 
                securityCode === CREDENTIALS.securityCode) {
                
                // Success
                sessionStorage.setItem('adminLoggedIn', 'true');
                sessionStorage.setItem('adminEmail', email);
                
                // Show success and redirect
                errorMessage.textContent = '✓ Login successful! Redirecting...';
                errorMessage.style.background = 'rgba(34, 197, 94, 0.1)';
                errorMessage.style.borderColor = 'rgba(34, 197, 94, 0.3)';
                errorMessage.style.color = '#22c55e';
                errorMessage.classList.add('show');
                
                setTimeout(() => {
                    window.location.href = '/admin-dashboard.html';
                }, 1000);
                
            } else {
                // Error
                loginBtn.disabled = false;
                btnText.style.display = 'inline';
                btnLoader.style.display = 'none';
                
                errorMessage.textContent = '✕ Invalid credentials. Please check your email, password, and security code.';
                errorMessage.style.background = 'rgba(239, 68, 68, 0.1)';
                errorMessage.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                errorMessage.style.color = '#ef4444';
                errorMessage.classList.add('show');
                
                // Shake animation
                loginForm.classList.add('shake');
                setTimeout(() => {
                    loginForm.classList.remove('shake');
                }, 400);
            }
        }, 800);
    });
});
