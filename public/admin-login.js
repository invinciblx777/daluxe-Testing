// Admin Login JavaScript

// Security code remains hardcoded as a secondary check or we could move it to Supabase data if needed.
// For now, preserving existing specific behavior.
const SECURITY_CODE = '2026';

document.addEventListener('DOMContentLoaded', async function () {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    const loginBtn = loginForm.querySelector('.login-btn');
    const btnText = loginBtn.querySelector('.btn-text');
    const btnLoader = loginBtn.querySelector('.btn-loader');

    // Check if already logged in via Supabase
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        window.location.href = '/admin-dashboard.html';
        return;
    }

    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const securityCode = document.getElementById('securityCode').value.trim();

        // Hide previous error
        errorMessage.classList.remove('show');

        // Security Code Check
        if (securityCode !== SECURITY_CODE) {
            showError('Invalid security code.');
            return;
        }

        // Show loading state
        setLoading(true);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) {
                throw error;
            }

            // Success
            // We set the legacy session storage just in case other parts of the app rely on it,
            // but the source of truth is now Supabase.
            sessionStorage.setItem('adminLoggedIn', 'true');
            sessionStorage.setItem('adminEmail', email);

            showSuccess('✓ Login successful! Redirecting...');

            setTimeout(() => {
                window.location.href = '/admin-dashboard.html';
            }, 1000);

        } catch (err) {
            console.error('Login error:', err);
            showError('✕ Login failed: ' + err.message);
        } finally {
            if (!errorMessage.classList.contains('show') || errorMessage.textContent.includes('failed')) {
                setLoading(false);
            }
        }
    });

    function setLoading(isLoading) {
        loginBtn.disabled = isLoading;
        btnText.style.display = isLoading ? 'none' : 'inline';
        btnLoader.style.display = isLoading ? 'inline' : 'none';
    }

    function showError(msg) {
        errorMessage.textContent = msg;
        errorMessage.style.background = 'rgba(239, 68, 68, 0.1)';
        errorMessage.style.borderColor = 'rgba(239, 68, 68, 0.3)';
        errorMessage.style.color = '#ef4444';
        errorMessage.classList.add('show');

        // Shake animation
        loginForm.classList.add('shake');
        setTimeout(() => {
            loginForm.classList.remove('shake');
        }, 400);

        setLoading(false);
    }

    function showSuccess(msg) {
        errorMessage.textContent = msg;
        errorMessage.style.background = 'rgba(34, 197, 94, 0.1)';
        errorMessage.style.borderColor = 'rgba(34, 197, 94, 0.3)';
        errorMessage.style.color = '#22c55e';
        errorMessage.classList.add('show');
    }
});
