document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.querySelector('.login-form');
    const userTypeRadios = document.querySelectorAll('input[name="userType"]');
    const lrnInput = document.querySelector('input[placeholder="Student LRN"]');
    const birthMonthSelect = document.querySelector('.birthdate-fields select:nth-child(1)');
    const birthDaySelect = document.querySelector('.birthdate-fields select:nth-child(2)');
    const birthYearSelect = document.querySelector('.birthdate-fields select:nth-child(3)');
    const passwordInput = document.querySelector('input[type="password"]');
    const loginButton = document.querySelector('.btn-login');

    // Update LRN placeholder based on user type
    function updateLRNPlaceholder() {
        const selectedType = document.querySelector('input[name="userType"]:checked').value;
        switch(selectedType) {
            case 'student':
                lrnInput.placeholder = 'Student LRN';
                break;
            case 'faculty':
                lrnInput.placeholder = 'Faculty ID';
                break;
            case 'clinic':
                lrnInput.placeholder = 'Staff ID';
                break;
        }
    }

    // Add event listeners for user type changes
    userTypeRadios.forEach(radio => {
        radio.addEventListener('change', updateLRNPlaceholder);
    });

    // Show loading state
    function showLoading() {
        loginButton.textContent = 'Signing in...';
        loginButton.disabled = true;
        loginButton.style.opacity = '0.7';
    }

    // Hide loading state
    function hideLoading() {
        loginButton.textContent = 'Sign in';
        loginButton.disabled = false;
        loginButton.style.opacity = '1';
    }

    // Show error message
    function showError(message) {
        // Remove existing error message
        const existingError = document.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        // Create new error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.cssText = `
            color: #e57373;
            background: #ffebee;
            border: 1px solid #e57373;
            border-radius: 4px;
            padding: 10px;
            margin-bottom: 15px;
            text-align: center;
            font-size: 0.9rem;
        `;
        errorDiv.textContent = message;

        // Insert error message after the form title
        const formTitle = document.querySelector('.login-instruction');
        formTitle.parentNode.insertBefore(errorDiv, formTitle.nextSibling);

        // Auto-remove error after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 5000);
    }

    // Show success message
    function showSuccess(message) {
        // Remove existing success message
        const existingSuccess = document.querySelector('.success-message');
        if (existingSuccess) {
            existingSuccess.remove();
        }

        // Create new success message
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.style.cssText = `
            color: #4caf50;
            background: #e8f5e8;
            border: 1px solid #4caf50;
            border-radius: 4px;
            padding: 10px;
            margin-bottom: 15px;
            text-align: center;
            font-size: 0.9rem;
        `;
        successDiv.textContent = message;

        // Insert success message after the form title
        const formTitle = document.querySelector('.login-instruction');
        formTitle.parentNode.insertBefore(successDiv, formTitle.nextSibling);
    }

    // Handle form submission
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Get form data
        const userType = document.querySelector('input[name="userType"]:checked').value;
        const lrn = lrnInput.value.trim();
        const birthMonth = birthMonthSelect.value;
        const birthDay = birthDaySelect.value;
        const birthYear = birthYearSelect.value;
        const password = passwordInput.value;

        // Validate form data
        if (!lrn || !birthMonth || !birthDay || !birthYear || !password) {
            showError('Please fill in all fields');
            return;
        }

        // Validate birthdate
        if (birthMonth === '' || birthDay === '' || birthYear === '') {
            showError('Please select your complete birthdate');
            return;
        }

        showLoading();

        try {
            const response = await fetch('../../api/auth/login.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userType: userType,
                    lrn: lrn,
                    birthMonth: birthMonth,
                    birthDay: birthDay,
                    birthYear: birthYear,
                    password: password
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                showSuccess('Login successful! Redirecting...');
                
                // Store user data in localStorage for dashboard access
                localStorage.setItem('userData', JSON.stringify(data.user));
                
                // Redirect based on user type
                setTimeout(() => {
                    switch(data.user.user_type) {
                        case 'student':
                            window.location.href = '../dashboard/index.html';
                            break;
                        case 'faculty':
                            window.location.href = '../dashboard/index.html';
                            break;
                        case 'clinic':
                            window.location.href = '../dashboard/index.html';
                            break;
                        default:
                            window.location.href = '../dashboard/index.html';
                    }
                }, 1500);
            } else {
                showError(data.error || 'Login failed. Please try again.');
            }
        } catch (error) {
            console.error('Login error:', error);
            showError('Network error. Please check your connection and try again.');
        } finally {
            hideLoading();
        }
    });

    // Add input validation
    lrnInput.addEventListener('input', function() {
        this.value = this.value.replace(/[^a-zA-Z0-9]/g, '');
    });

    // Initialize placeholder
    updateLRNPlaceholder();
}); 