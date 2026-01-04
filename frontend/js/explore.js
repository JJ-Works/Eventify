let allEvents = [];
let filteredEvents = [];

// Load events on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('Explore page loaded');

    // Check for search query in URL (from Navbar redirect)
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('query');
    const locationQuery = urlParams.get('location');

    if (searchQuery || locationQuery) {
        // Perform backend search
        searchEventsBackend(searchQuery, locationQuery);
        
        // Update Search Input UI
        const searchInput = document.getElementById('searchInput');
        if (searchInput && searchQuery) searchInput.value = searchQuery;
        
        const exploreTitle = document.getElementById('exploreTitle');
        if (exploreTitle && searchQuery) exploreTitle.textContent = `${searchQuery.charAt(0).toUpperCase() + searchQuery.slice(1)} Events`;

    } else {
        // Load all events
        loadAllEvents();
    }

    setupFilterButtons();
    setupCreateEventButton();
});

async function loadAllEvents() {
    try {
        let backendEvents = [];
        try {
            console.log('Fetching events from: http://localhost:8080/events/all');
            const response = await fetch('http://localhost:8080/events/all');
            
            if (response.ok) {
                let responseData = await response.json();
                if (responseData && Array.isArray(responseData.content)) {
                    backendEvents = responseData.content;
                } else if (Array.isArray(responseData)) {
                    backendEvents = responseData;
                }
            } else {
                console.warn('Backend fetch failed, falling back to local storage.');
            }
        } catch (apiError) {
            console.warn('Backend unavailable:', apiError);
        }

        // Merge with local storage (legacy support)
        const storedEvents = JSON.parse(localStorage.getItem('myEvents') || '[]');
        allEvents = [...storedEvents.reverse(), ...backendEvents];
        
        if (allEvents.length === 0) {
            showNoResults();
            return;
        }

        filteredEvents = [...allEvents];
        displayEvents(filteredEvents);

    } catch (error) {
        console.error('Error loading events:', error);
        showNoResults();
    }
}

async function searchEventsBackend(query, location) {
    try {
        let url = 'http://localhost:8080/events/search?';
        if (query) url += `query=${encodeURIComponent(query)}&`;
        if (location) url += `location=${encodeURIComponent(location)}`;

        const response = await fetch(url);
        if (response.ok) {
            const events = await response.json();
            allEvents = events; // Reset allEvents to search results
            filteredEvents = events;
            displayEvents(events);
        } else {
            console.error('Search failed');
            showNoResults();
        }
    } catch (e) {
        console.error("Error searching:", e);
    }
}

function displayEvents(events) {
    const grid = document.getElementById('eventsGrid');
    const noResults = document.getElementById('noResults');

    if (!events || events.length === 0) {
        grid.innerHTML = '';
        noResults.style.display = 'block';
        return;
    }

    noResults.style.display = 'none';
    grid.innerHTML = events.map(event => {
        const formattedDate = formatDate(event.eventDate || event.date);
        let imageSrc = event.image || event.imageUrl || '../assets/bgForcards.jpg';
        
        return `
            <div class="event-card" data-event-id="${event.id}">
                <img src="${imageSrc}" alt="Event Image" class="event-card-image">
                <div class="event-card-body">
                    <p class="event-card-date-small">${formattedDate}</p>
                    <h3 class="event-card-title-new">${escapeHtml(event.title || 'Untitled Event')}</h3>
                </div>
                <a href="event-details.html?id=${event.id}" class="view-details-btn">View Details</a>
            </div>
        `;
    }).join('');

    // Add click functionality to the entire event card
    document.querySelectorAll('.event-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (!e.target.classList.contains('view-details-btn')) {
                const eventId = card.dataset.eventId;
                if (eventId) {
                    window.location.href = `event-details.html?id=${eventId}`;
                }
            }
        });
        const viewDetailsBtn = card.querySelector('.view-details-btn');
        if (viewDetailsBtn) {
            viewDetailsBtn.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }
    });
}

function performSearch(e) {
    e.preventDefault();
    const searchQuery = document.getElementById('searchInput').value.trim();
    
    // If on explore page, just search directly
    searchEventsBackend(searchQuery, null);
    
    // Update Title
    const title = document.getElementById('exploreTitle');
    if (searchQuery) {
        title.textContent = `Search results for "${searchQuery}"`;
    }
}

function setupFilterButtons() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            const filter = this.dataset.filter;
            
            if (filter === 'all') {
                filteredEvents = [...allEvents];
            } else if (filter === 'upcoming') {
                filteredEvents = allEvents.filter(event => event.status === 'upcoming' || !event.status);
            } else if (filter === 'popular') {
                filteredEvents = [...allEvents].sort((a, b) => 
                    (b.participantCount || 0) - (a.participantCount || 0)
                );
            }

            displayEvents(filteredEvents);
        });
    });
}

function setupCreateEventButton() {
    const createBtn = document.getElementById('createEventBtn');
    if (createBtn) {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            createBtn.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = 'login.html';
            });
        }
    }
}

function showNoResults() {
    document.getElementById('eventsGrid').innerHTML = '';
    document.getElementById('noResults').style.display = 'block';
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateTimeString) {
    if (!dateTimeString) return 'Date TBA';
    try {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateTimeString).toLocaleDateString('en-US', options);
    } catch (e) {
        console.warn('Date format error:', e);
        return 'Date TBA';
    }
}
