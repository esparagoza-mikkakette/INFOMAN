document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.querySelector('.login-form');
    const userTypeRadios = document.querySelectorAll('input[name="userType"]');
    const lrnInput = document.querySelector('input[placeholder="Student LRN"]');
    const fullNameInput = document.querySelector('input[placeholder="Full Name"]');
    const birthMonthSelect = document.querySelector('.birthdate-fields select:nth-child(1)');
    const birthDaySelect = document.querySelector('.birthdate-fields select:nth-child(2)');
    const birthYearSelect = document.querySelector('.birthdate-fields select:nth-child(3)');
    const passwordInput = document.querySelector('input[type="password"]');
    const confirmPasswordInput = document.querySelectorAll('input[type="password"]')[1];
    const registerButton = document.querySelector('.btn-login');

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
        registerButton.textContent = 'Creating Account...';
        registerButton.disabled = true;
        registerButton.style.opacity = '0.7';
    }

    // Hide loading state
    function hideLoading() {
        registerButton.textContent = 'Register';
        registerButton.disabled = false;
        registerButton.style.opacity = '1';
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

    // Validate password strength
    function validatePassword(password) {
        if (password.length < 6) {
            return 'Password must be at least 6 characters long';
        }
        return null;
    }

    // Handle form submission
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Get form data
        const userType = document.querySelector('input[name="userType"]:checked').value;
        const lrn = lrnInput.value.trim();
        const fullName = fullNameInput.value.trim();
        const birthMonth = birthMonthSelect.value;
        const birthDay = birthDaySelect.value;
        const birthYear = birthYearSelect.value;
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        // Validate form data
        if (!lrn || !fullName || !birthMonth || !birthDay || !birthYear || !password || !confirmPassword) {
            showError('Please fill in all fields');
            return;
        }

        // Validate full name
        if (fullName.length < 2) {
            showError('Please enter your full name');
            return;
        }

        // Validate birthdate
        if (birthMonth === '' || birthDay === '' || birthYear === '') {
            showError('Please select your complete birthdate');
            return;
        }

        // Validate password
        const passwordError = validatePassword(password);
        if (passwordError) {
            showError(passwordError);
            return;
        }

        // Validate password confirmation
        if (password !== confirmPassword) {
            showError('Passwords do not match');
            return;
        }

        showLoading();

        try {
            const response = await fetch('../../api/auth/register.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userType: userType,
                    lrn: lrn,
                    fullName: fullName,
                    birthMonth: birthMonth,
                    birthDay: birthDay,
                    birthYear: birthYear,
                    password: password,
                    confirmPassword: confirmPassword
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                showSuccess('Registration successful! Redirecting to dashboard...');
                
                // Store user data in localStorage for dashboard access
                localStorage.setItem('userData', JSON.stringify(data.user));
                
                // Redirect to dashboard
                setTimeout(() => {
                    window.location.href = '../dashboard/index.html';
                }, 2000);
            } else {
                showError(data.error || 'Registration failed. Please try again.');
            }
        } catch (error) {
            console.error('Registration error:', error);
            showError('Network error. Please check your connection and try again.');
        } finally {
            hideLoading();
        }
    });

    // Add input validation
    lrnInput.addEventListener('input', function() {
        this.value = this.value.replace(/[^a-zA-Z0-9]/g, '');
    });

    fullNameInput.addEventListener('input', function() {
        this.value = this.value.replace(/[^a-zA-Z\s]/g, '');
    });

    // Real-time password confirmation validation
    confirmPasswordInput.addEventListener('input', function() {
        if (passwordInput.value !== this.value && this.value.length > 0) {
            this.style.borderColor = '#e57373';
        } else {
            this.style.borderColor = '#bdbdbd';
        }
    });

    passwordInput.addEventListener('input', function() {
        if (confirmPasswordInput.value.length > 0) {
            if (this.value !== confirmPasswordInput.value) {
                confirmPasswordInput.style.borderColor = '#e57373';
            } else {
                confirmPasswordInput.style.borderColor = '#bdbdbd';
            }
        }
    });

    // Initialize placeholder
    updateLRNPlaceholder();
}); 