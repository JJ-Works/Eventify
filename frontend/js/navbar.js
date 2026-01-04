// Check login status on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('Navbar.js loaded');
    checkAuthStatus();
    setupAuthListeners();
});

function checkAuthStatus() {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const loginBtn = document.getElementById('loginBtn');
    const profileSection = document.getElementById('profileSection');

    console.log('Checking auth status - Token:', !!token, 'UserId:', !!userId);

    if (token && userId) {
        // User is logged in
        console.log('User is logged in');
        if (loginBtn) loginBtn.style.display = 'none';
        if (profileSection) profileSection.style.display = 'flex';
        loadUserProfile();
    } else {
        // User is NOT logged in
        console.log('User is NOT logged in');
        if (loginBtn) loginBtn.style.display = 'block';
        if (profileSection) profileSection.style.display = 'none';
    }
}

function loadUserProfile() {
    // Optional: Fetch user details from backend and update profile
    const userName = localStorage.getItem('userName') || 'U';
    
    const profileAvatar = document.getElementById('profileAvatar');
    if (profileAvatar) {
        // Clear previous background image if any
        profileAvatar.style.backgroundImage = 'none';
        profileAvatar.style.backgroundColor = 'transparent'; // Let CSS handle gradient or set here
        
        // Remove existing children
        profileAvatar.innerHTML = '';
        
        // Create initial element
        profileAvatar.classList.add('avatar-initial', 'navbar-avatar-initial');
        profileAvatar.textContent = userName.charAt(0).toUpperCase();
    }
}

function setupAuthListeners() {
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const profileAvatarBtn = document.getElementById('profileAvatarBtn');
    const profileSection = document.getElementById('profileSection');
    const profileDropdown = document.querySelector('.profile-dropdown');

    // Login button click
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            const currentPath = window.location.pathname;
            if (currentPath.includes('/pages/')) {
                window.location.href = 'login.html';
            } else {
                window.location.href = 'pages/login.html';
            }
        });
    }

    // Profile avatar button click - toggle dropdown
    if (profileAvatarBtn) {
        profileAvatarBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (profileDropdown) {
                profileDropdown.style.display = profileDropdown.style.display === 'block' ? 'none' : 'block';
            }
        });
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (profileSection && profileDropdown && !profileSection.contains(e.target)) {
            profileDropdown.style.display = 'none';
        }
    });

    // Logout button click
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            logout();
        });
    }
}

function logout() {
    console.log('Logging out...');
    // Clear all stored user data
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userInterest');

    // Check auth status again to update UI
    checkAuthStatus();

    // Redirect to home page
    const currentPath = window.location.pathname;
    if (currentPath.includes('/pages/')) {
        window.location.href = '../index.html';
    } else {
        window.location.href = 'index.html';
    }
}

function setUserLoggedIn(token, userId, userName, userEmail, userInterest = null) {
    console.log('Setting user logged in:', userName);
    // Store user data in localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('userId', userId);
    localStorage.setItem('userName', userName);
    localStorage.setItem('userEmail', userEmail);
    if (userInterest) {
        localStorage.setItem('userInterest', userInterest);
    }

    // Update UI
    checkAuthStatus();
}

function performSearch(event) {
    event.preventDefault();
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        const query = searchInput.value.trim();
        if (query) {
            // Determine path to explore.html
            const currentPath = window.location.pathname;
            let targetUrl = 'explore.html';
            
            // If we are in root (index.html), go to pages/explore.html
            // If we are in pages/, go to explore.html
            if (!currentPath.includes('/pages/')) {
                targetUrl = 'pages/explore.html';
            }

            window.location.href = `${targetUrl}?query=${encodeURIComponent(query)}`;
        }
    }
}
