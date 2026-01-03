const API_BASE_URL = 'http://localhost:8080'; // Change to your backend URL

async function loadRecommendations() {
    const eventsGrid = document.getElementById('eventsGrid');
    
    try {
        console.log('Fetching events from:', `${API_BASE_URL}/events/all`);
        
        const response = await fetch(`${API_BASE_URL}/events/all`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            },
            credentials: 'include'
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
            throw new Error(`Failed to fetch events: ${response.status}`);
        }

        let responseData = await response.json();
        console.log('Parsed Events (raw):', responseData);

        let processedEvents = [];
        if (typeof responseData === 'object' && responseData !== null && Array.isArray(responseData.content)) {
            processedEvents = responseData.content;
            console.log('Unwrapped events from "content" property:', processedEvents);
        } else if (Array.isArray(responseData)) {
            processedEvents = responseData;
            console.log('Direct array of events:', processedEvents);
        } else {
            console.warn('API response is not a recognized event array or paginated object, got:', typeof responseData, responseData);
            processedEvents = [];
        }

        // Merge with local events
        const storedEvents = JSON.parse(localStorage.getItem('myEvents') || '[]');
        let events = [...storedEvents.reverse(), ...processedEvents];
        
        if (events.length === 0) {
            console.log('No events received from API or local storage.');
            eventsGrid.innerHTML = '<p class="error-message">No events found. Check back soon!</p>';
            return;
        }

        // Limit to 8 events for landing page
        events = events.slice(0, 8);
        console.log('Processed events (limited to 8):', events);
        
        // Clear skeleton loaders
        eventsGrid.innerHTML = '';
        
        if (events.length === 0) {
            console.log('No events found');
            eventsGrid.innerHTML = '<p class="error-message">No events found. Check back soon!</p>';
            return;
        }

        console.log('Creating cards for', events.length, 'events');

        // Create and append event cards
        events.forEach((event, index) => {
            console.log('Creating card for event:', event.title);
            const card = createEventCard(event);
            card.style.animationDelay = `${index * 0.1}s`;
            eventsGrid.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading events:', error);
        eventsGrid.innerHTML = '<p class="error-message">Unable to load events. Please try again later.</p>';
    }
}

function createEventCard(event) {
    const card = document.createElement('article');
    card.className = 'event-card';
    
    // Generate a random color for the placeholder image
    const colors = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    const formattedDate = formatDate(event.eventDate);
    const formattedTime = formatTime(event.eventDate);
    
    // Determine image source (backend uses imageUrl, frontend mocks use image)
    // Handle empty strings by using || operator which treats "" as falsy
    let imageSrc = event.image || event.imageUrl || 'assets/bgForcards.jpg';
    
    console.log('Event details:', {
        title: event.title,
        date: formattedDate,
        time: formattedTime,
        category: event.category
    });
    
    card.innerHTML = `
        <img src="${imageSrc}" alt="Event Image" class="event-card-image">
        <div class="event-card-body">
            <p class="event-card-date-small">${formattedDate}</p>
            <h3 class="event-card-title-new">${escapeHtml(event.title)}</h3>
        </div>
        <a href="pages/event-details.html?id=${event.id}" class="view-details-btn">View Details</a>
    `;
    
    card.addEventListener('click', (e) => {
        // Only navigate if the click is not on the button itself
        if (!e.target.classList.contains('view-details-btn')) {
            window.location.href = `pages/event-details.html?id=${event.id}`;
        }
    });
    
    // Prevent the button's click from also triggering the card's click event
    card.querySelector('.view-details-btn').addEventListener('click', (e) => {
        e.stopPropagation();
    });
    
    return card;
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

function formatTime(dateTimeString) {
    if (!dateTimeString) return 'Time TBA';
    try {
        const options = { hour: '2-digit', minute: '2-digit' };
        return new Date(dateTimeString).toLocaleTimeString('en-US', options);
    } catch (e) {
        console.warn('Time format error:', e);
        return 'Time TBA';
    }
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Load events when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, starting to load recommendations');
    loadRecommendations();
});

// Also try loading on window load for safety
window.addEventListener('load', () => {
    const eventsGrid = document.getElementById('eventsGrid');
    if (eventsGrid && eventsGrid.children.length === 0) {
        console.log('Events grid empty on window load, attempting reload');
        loadRecommendations();
    }
});