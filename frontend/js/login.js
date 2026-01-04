document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
});

async function handleLogin(e) {
    e.preventDefault();
    console.log('Login form submitted');

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const formMessage = document.getElementById('formMessage');
    const submitBtn = document.getElementById('loginSubmitBtn');

    console.log('Email:', email, 'Password length:', password.length);

    // Clear previous messages
    formMessage.textContent = '';
    formMessage.className = 'form-message';
    document.getElementById('emailError').textContent = '';
    document.getElementById('passwordError').textContent = '';

    // Validation
    if (!email) {
        document.getElementById('emailError').textContent = 'Email is required';
        return;
    }

    if (!password) {
        document.getElementById('passwordError').textContent = 'Password is required';
        return;
    }

    if (password.length < 6) {
        document.getElementById('passwordError').textContent = 'Password must be at least 6 characters';
        return;
    }

    try {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Logging in...';

        // For now, use the /all endpoint to verify credentials
        // In production, implement a proper authentication endpoint
        console.log('Attempting login with email:', email);
        const response = await fetch('http://localhost:8080/users/all', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        console.log('Response status:', response.status);

        if (response.ok) {
            const users = await response.json();
            
            // Find user by email and verify password
            const user = users.find(u => u.email === email);
            
            if (user && user.password === password) {
                // Login successful
                console.log('Login successful for user:', user.name);
                formMessage.textContent = 'Login successful! Redirecting...';
                formMessage.className = 'form-message success';

                // Store user data using navbar.js function
                // Generate a simple token for now
                const token = btoa(`${user.id}:${user.email}:${Date.now()}`);
                
                console.log('Setting user logged in...');
                if (typeof setUserLoggedIn === 'function') {
                    setUserLoggedIn(
                        token,
                        user.id,
                        user.name || user.username,
                        user.email,
                        user.interest || null
                    );
                } else {
                    console.error("setUserLoggedIn function not found in navbar.js");
                    // Fallback if navbar.js isn't loaded or doesn't have the function
                    localStorage.setItem('authToken', token);
                    localStorage.setItem('userId', user.id);
                    localStorage.setItem('userName', user.name || user.username);
                    localStorage.setItem('userEmail', user.email);
                }

        
                // Redirect to home page
                setTimeout(() => {
                    console.log('Redirecting to home...');
                    window.location.href = '../index.html';
                }, 800);
            } else {
                // Login failed - incorrect credentials
                console.log('Invalid credentials');
                formMessage.textContent = 'Invalid email or password. Please try again.';
                formMessage.className = 'form-message error';
            }
        } else {
            // Server error
            console.log('Server error:', response.status);
            formMessage.textContent = 'Unable to connect to the server. Please try again later.';
            formMessage.className = 'form-message error';
        }
    } catch (error) {
        console.error('Login error:', error);
        
        if (!navigator.onLine) {
            formMessage.textContent = 'No internet connection. Please check your network.';
        } else if (error.message === 'Failed to fetch' || error.type === 'network') {
            formMessage.textContent = 'Cannot connect to server. Make sure the backend is running on http://localhost:8080';
        } else {
            formMessage.textContent = 'An error occurred while logging in. Please try again.';
        }
        formMessage.className = 'form-message error';
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Login';
    }
}