document.addEventListener('DOMContentLoaded', () => {
    // Protected Route Check
    if (window.location.pathname.includes('create-event.html')) {
        Auth.requireAuth();
    }

    const user = Auth.getUser();
    const userNameDisplay = document.getElementById('userNameDisplay');
    if (userNameDisplay && user) userNameDisplay.textContent = user.name;

    // Search Listener
    window.addEventListener('eventSearch', (e) => {
        const query = e.detail;
        filterEventsLocally(query);
    });

    // Logout Handler
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', Auth.logout);

    // Load Events (Dashboard)
    const eventsContainer = document.getElementById('eventsContainer');
    if (eventsContainer) {
        loadEvents();
    }

    // Create Event Handler
    const createEventForm = document.getElementById('createEventForm');
    if (createEventForm) {
        createEventForm.addEventListener('submit', handleCreateEvent);
    }
});

let allEventsCache = []; // Store all events for filtering

function showMessage(type, text) {
    const authMessage = document.getElementById('authMessage');
    if (!authMessage) {
        alert(text);
        return;
    }
    authMessage.textContent = text;
    authMessage.className = `auth-message ${type}`;
    authMessage.style.display = 'block';
    
    if (type === 'error') {
        setTimeout(() => {
            authMessage.style.display = 'none';
        }, 5000);
    }
}

async function loadEvents() {
    const container = document.getElementById('eventsContainer');
    const user = Auth.getUser();
    container.innerHTML = '<p>Loading events...</p>';

    try {
        const events = await API.getAllEvents();
        
        if (events.length === 0) {
            container.innerHTML = '<p>No events found. Be the first to create one!</p>';
            return;
        }

        // Fetch statuses for all events to show correct button state
        const eventsWithStatus = await Promise.all(events.map(async (event) => {
            const isHost = user && event.host && event.host.id === user.id;
            const isJoined = user && event.participants && event.participants.some(p => p.id === user.id);
            let status = 'NONE';
            
            if (user && !isHost && !isJoined) {
                const statusData = await API.getJoinStatus(event.id, user.id);
                status = statusData.status;
            }
            
            return { ...event, isHost, isJoined, status };
        }));

        allEventsCache = eventsWithStatus; // Cache the data
        
        // Check for initial search query in URL
        const urlParams = new URLSearchParams(window.location.search);
        const initialQuery = urlParams.get('q');
        if (initialQuery) {
            const searchInput = document.getElementById('globalSearch');
            if (searchInput) searchInput.value = initialQuery;
            filterEventsLocally(initialQuery.toLowerCase());
        } else {
            renderEventsList(allEventsCache);
        }

    } catch (error) {
        container.innerHTML = `<p style="color:red">Failed to load events: ${error.message}</p>`;
    }
}

function filterEventsLocally(query) {
    if (!query) {
        renderEventsList(allEventsCache);
        return;
    }

    const filtered = allEventsCache.filter(event => 
        event.title.toLowerCase().includes(query) || 
        event.location.toLowerCase().includes(query)
    );
    renderEventsList(filtered);
}

function renderEventsList(events) {
    const container = document.getElementById('eventsContainer');
    const user = Auth.getUser();

    if (events.length === 0) {
        container.innerHTML = '<p>No events match your search.</p>';
        return;
    }

    container.innerHTML = events.map(event => {
        let actionBtn = '';
        if (!user) {
            actionBtn = `<button onclick="event.stopPropagation(); window.location.href='login.html'" class="btn btn-primary" style="padding: 6px 12px; font-size: 0.8rem;">Join</button>`;
        } else if (event.isHost) {
            actionBtn = `<span class="user-tag" style="background:#e0e7ff; color:var(--primary)">Hosting</span>`;
        } else if (event.isJoined) {
            actionBtn = `<button class="btn btn-secondary" disabled style="padding: 6px 12px; font-size: 0.8rem; background: #d1fae5; color: #065f46; border:none;">Joined</button>`;
        } else if (event.status === 'PENDING') {
            actionBtn = `<button class="btn btn-secondary" disabled style="padding: 6px 12px; font-size: 0.8rem; background: #fef3c7; color: #92400e; border:none;">Requested</button>`;
        } else {
            actionBtn = `<button onclick="event.stopPropagation(); joinEvent(${event.id})" class="btn btn-primary" style="padding: 6px 12px; font-size: 0.8rem;">Join</button>`;
        }

        return `
            <div class="event-card" onclick="window.location.href='event-details.html?id=${event.id}'">
                <div class="event-header" style="${event.imageUrl ? `background-image: url('${event.imageUrl}');` : ''}">
                </div>
                <div class="event-body">
                    <span class="event-date">${new Date(event.eventDate).toLocaleDateString()}</span>
                    <h3 class="event-title">${event.title}</h3>
                    <div class="event-info">
                        <p>📍 ${event.location}</p>
                        <p style="margin-top: 0.5rem;">${event.description || 'No description provided.'}</p>
                    </div>
                    <div class="event-host">
                        <div class="host-avatar">${event.host ? event.host.name.charAt(0) : '?'}</div>
                        <span>Hosted by ${event.host ? event.host.name : 'Unknown'}</span>
                        <div style="margin-left: auto;">${actionBtn}</div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

async function handleCreateEvent(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    const user = Auth.getUser();
    const authMessage = document.getElementById('authMessage');

    try {
        btn.disabled = true;
        const originalText = 'Create Event';
        btn.textContent = 'Processing...';
        if(authMessage) authMessage.style.display = 'none';

        // 1. Upload Image (if selected)
        let imageUrl = null;
        const imageInput = document.getElementById('eventImage');
        if (imageInput.files.length > 0) {
            btn.textContent = 'Uploading Image...';
            const uploadRes = await API.uploadImage(imageInput.files[0]);
            imageUrl = `http://localhost:8080${uploadRes.url}`;
        }

        // 2. Create Event
        btn.textContent = 'Creating Event...';
        const eventData = {
            title: document.getElementById('title').value,
            description: document.getElementById('description').value,
            location: document.getElementById('location').value,
            eventDate: document.getElementById('eventDate').value,
            host: { id: user.id },
            imageUrl: imageUrl
        };
        
        await API.createEvent(eventData);
        
        showMessage('success', 'Success! Event created. Redirecting to dashboard...');
        
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 2000);

    } catch (error) {
        showMessage('error', error.message);
        btn.disabled = false;
        btn.textContent = 'Create Event';
    }
}

async function joinEvent(eventId) {
    const user = Auth.getUser();
    try {
        await API.joinEvent(eventId, user.id);
        alert('Join request sent successfully! The host will review your request.');
        window.location.reload(); // Reload to update button state to "Requested"
    } catch (error) {
        alert('Failed to send request: ' + error.message);
    }
}