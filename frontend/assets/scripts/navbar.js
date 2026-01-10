document.addEventListener('DOMContentLoaded', () => {
    renderNavbar();
    renderFooter();
});

function renderNavbar() {
    const navMenu = document.getElementById('navMenu');
    if (!navMenu) return; // Navbar not present on this page (e.g., Auth pages)

    const user = Auth.getUser();
    const isRoot = !window.location.pathname.includes('/pages/');
    const prefix = isRoot ? 'pages/' : '';
    const rootPrefix = isRoot ? '' : '../';
    const assetsPrefix = isRoot ? 'assets/' : '../assets/';

    const searchBarHtml = `
        <div class="nav-search">
            <img src="${assetsPrefix}images/magnifying-glass-solid-full.svg" class="search-icon" alt="Search">
            <input type="text" id="globalSearch" class="search-input" placeholder="Search events by title or location...">
        </div>
    `;

    if (user) {
        // Logged In Navbar
        navMenu.innerHTML = `
            <div style="display:flex; align-items:center; width:100%;">
                ${searchBarHtml}
                <div class="nav-links">
                    <a href="${rootPrefix}index.html" class="nav-link">Home</a>
                    <a href="${prefix}dashboard.html" class="nav-link">Explore</a>
                    <a href="${prefix}create-event.html" class="nav-link">Create Event</a>
                    <a href="${prefix}profile.html" class="nav-link">My Profile</a>
                    <span class="user-tag">${user.name}</span>
                    <button id="logoutBtn" class="btn btn-secondary" style="padding: 6px 12px; font-size: 0.85rem;">Logout</button>
                </div>
            </div>
        `;
        document.getElementById('logoutBtn').addEventListener('click', Auth.logout);
    } else {
        // Logged Out Navbar
        navMenu.innerHTML = `
            <div style="display:flex; align-items:center; width:100%;">
                ${searchBarHtml}
                <div class="nav-links">
                    <a href="${rootPrefix}index.html" class="nav-link">Home</a>
                    <a href="${prefix}dashboard.html" class="nav-link">Explore</a>
                    <a href="${prefix}login.html" class="btn btn-secondary" style="padding: 8px 16px;">Login</a>
                    <a href="${prefix}register.html" class="btn btn-primary" style="padding: 8px 16px;">Sign Up</a>
                </div>
            </div>
        `;
    }

    // Mark active link
    const currentPath = window.location.pathname;
    document.querySelectorAll('.nav-link').forEach(link => {
        if (currentPath.endsWith(link.getAttribute('href'))) {
            link.classList.add('active');
        }
    });

    // Add search listener
    const searchInput = document.getElementById('globalSearch');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            // Trigger a custom event that pages can listen to
            window.dispatchEvent(new CustomEvent('eventSearch', { detail: query }));
        });

        // Navigate to dashboard on Enter if not already there
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const isDashboard = window.location.pathname.includes('dashboard.html');
                if (!isDashboard) {
                    const prefix = isRoot ? 'pages/' : '';
                    window.location.href = `${rootPrefix}${prefix}dashboard.html?q=${encodeURIComponent(searchInput.value)}`;
                }
            }
        });
    }
}

function renderFooter() {
    const footer = document.createElement('footer');
    footer.className = 'main-footer';
    
    // Check if we are in pages/ or root
    const isRoot = !window.location.pathname.includes('/pages/');
    const homeLink = isRoot ? 'index.html' : '../index.html';

    footer.innerHTML = `
        <div class="container">
            <div class="footer-content">
                <div class="footer-column">
                    <h3>Eventify</h3>
                    <p>Connecting people through shared experiences. Discover, create, and join events that matter to you.</p>
                </div>
                <div class="footer-column">
                    <h3>Quick Links</h3>
                    <ul>
                        <li><a href="${homeLink}">Home</a></li>
                        <li><a href="${isRoot ? 'pages/' : ''}dashboard.html">Explore Events</a></li>
                        <li><a href="${isRoot ? 'pages/' : ''}create-event.html">Host an Event</a></li>
                    </ul>
                </div>
                <div class="footer-column">
                    <h3>Community</h3>
                    <ul>
                        <li><a href="#">Help Center</a></li>
                        <li><a href="#">Guidelines</a></li>
                        <li><a href="#">Blog</a></li>
                    </ul>
                </div>
                <div class="footer-column">
                    <h3>Contact</h3>
                    <ul>
                        <li><a href="#">support@eventify.com</a></li>
                        <li><a href="#">Twitter</a></li>
                        <li><a href="#">Instagram</a></li>
                    </ul>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; ${new Date().getFullYear()} Eventify. All rights reserved.</p>
            </div>
        </div>
    `;

    document.body.appendChild(footer);
}
