document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('id');

    if (eventId) {
        fetchEventDetails(eventId);
    }
});

async function fetchEventDetails(eventId) {
    let event = null;

    // 1. Try finding in localStorage (My Events)
    const storedEvents = JSON.parse(localStorage.getItem('myEvents') || '[]');
    event = storedEvents.find(e => e.id == eventId);

    // 2. If not found locally, try fetching from backend
    if (!event) {
        try {
            const response = await fetch('http://localhost:8080/events/all');
            if (response.ok) {
                const events = await response.json();
                event = events.find(e => e.id == eventId);
            }
        } catch (error) {
            console.error('Error fetching backend events:', error);
        }
    }

    if (event) {
        displayEventDetails(event);
    } else {
        console.error('Event not found');
        document.querySelector('.event-details-container').innerHTML = '<h2>Event not found</h2>';
    }
}

async function displayEventDetails(event) {
    // Update Image
    const imgElement = document.querySelector('.event-details-image img');
    if (imgElement) {
        imgElement.src = event.image || event.imageUrl || '../assets/bgForcards.jpg';
    }

    document.querySelector('.event-title').textContent = event.title || 'Untitled Event';
    
    const creatorName = event.creatorName || (event.host ? event.host.name : 'Unknown Host');
    document.querySelector('.event-creator').textContent = `Hosted by ${creatorName}`;

    document.querySelector('.event-description').textContent = event.description || 'No description available';
    
    // Improved Date Formatting
    const eventDateRaw = event.eventDate || event.date;
    const displayDate = eventDateRaw ? `${formatDate(eventDateRaw)} at ${formatTime(eventDateRaw)}` : 'TBA';
    document.querySelector('.event-date').textContent = `📅 ${displayDate}`;
    
    document.querySelector('.event-location').textContent = `📍 ${event.location || 'Location TBA'}`;

    const joinBtn = document.querySelector('.join-btn');
    const joinReasonInput = document.getElementById('joinReason');
    const joinSection = document.querySelector('.join-section');
    const userId = localStorage.getItem('userId');
    
    // Check if current user is the owner
    // Note: event.userId might be from localStorage, event.host.id might be from backend
    const eventOwnerId = event.userId || (event.host ? event.host.id : null);
    
    if (userId && String(eventOwnerId) === String(userId)) {
        // Owner View: Show Delete Button instead of Join
        joinSection.innerHTML = ''; // Clear join section
        
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete Event';
        deleteBtn.className = 'join-btn'; // Re-use style
        deleteBtn.style.backgroundColor = '#e74c3c'; // Red for delete
        
        deleteBtn.onclick = () => {
            if (confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
                deleteEvent(event.id);
            }
        };
        
        joinSection.appendChild(deleteBtn);
    } else {
        // Not Owner: Standard Join Logic
        checkRequestStatus(event.id, userId, joinBtn, joinReasonInput);

        joinBtn.addEventListener('click', async () => {
            if (!userId) {
                window.location.href = 'login.html';
                return;
            }

            const reason = joinReasonInput.value;
            const userName = localStorage.getItem('userName') || 'Unknown User';

            // Simulate sending request (Store in localStorage)
            const newRequest = {
                id: Date.now(),
                eventId: event.id,
                eventTitle: event.title,
                requesterId: userId,
                requesterName: userName,
                ownerId: eventOwnerId, 
                reason: reason,
                status: 'pending',
                createdAt: new Date().toISOString()
            };

            // Add to 'eventRequests' in localStorage
            const allRequests = JSON.parse(localStorage.getItem('eventRequests') || '[]');
            allRequests.push(newRequest);
            localStorage.setItem('eventRequests', JSON.stringify(allRequests));

            // Also update 'joinRequestsSent' for button state persistence
            let requestsSent = JSON.parse(localStorage.getItem('joinRequestsSent') || '[]');
            if (!requestsSent.includes(event.id)) {
                requestsSent.push(event.id);
                localStorage.setItem('joinRequestsSent', JSON.stringify(requestsSent));
            }

            alert('Join request sent!');
            updateButtonState(joinBtn, joinReasonInput, 'pending');
        });
    }
}

async function deleteEvent(eventId) {
    // 1. Remove from myEvents (localStorage)
    let storedEvents = JSON.parse(localStorage.getItem('myEvents') || '[]');
    storedEvents = storedEvents.filter(e => e.id != eventId);
    localStorage.setItem('myEvents', JSON.stringify(storedEvents));

    // 2. Remove associated requests
    let allRequests = JSON.parse(localStorage.getItem('eventRequests') || '[]');
    allRequests = allRequests.filter(req => req.eventId != eventId);
    localStorage.setItem('eventRequests', JSON.stringify(allRequests));

    // 3. Try deleting from backend if it exists there
    try {
        await fetch(`http://localhost:8080/events/${eventId}`, {
            method: 'DELETE'
        });
    } catch (e) {
        console.log("Could not delete from backend (maybe it was local only)");
    }

    alert('Event deleted successfully.');
    window.location.href = 'profile.html';
}

function checkRequestStatus(eventId, userId, btn, input) {
    if (!userId) return;

    // Check localStorage 'eventRequests'
    const allRequests = JSON.parse(localStorage.getItem('eventRequests') || '[]');
    const existingRequest = allRequests.find(req => req.eventId == eventId && req.requesterId == userId);

    if (existingRequest) {
        updateButtonState(btn, input, existingRequest.status);
    } else {
        // Fallback check (simple list)
        const requestsSent = JSON.parse(localStorage.getItem('joinRequestsSent') || '[]');
        if (requestsSent.includes(String(eventId)) || requestsSent.includes(Number(eventId))) {
            updateButtonState(btn, input, 'pending');
        }
    }
}

function updateButtonState(btn, input, status) {
    // Remove any existing "Leave" button first to avoid duplicates
    const existingLeaveBtn = document.querySelector('.leave-btn');
    if (existingLeaveBtn) existingLeaveBtn.remove();

    if (status === 'accepted') {
        btn.textContent = 'Joined';
        btn.disabled = true;
        btn.style.backgroundColor = '#2ecc71';
        input.style.display = 'none';

        // Create Leave Button
        const leaveBtn = document.createElement('button');
        leaveBtn.textContent = 'Leave Event';
        leaveBtn.className = 'leave-btn btn'; 
        leaveBtn.style.backgroundColor = '#e74c3c';
        leaveBtn.style.marginLeft = '10px';
        
        leaveBtn.onclick = leaveEvent;
        
        // Append next to the join button
        btn.parentNode.appendChild(leaveBtn);

    } else if (status === 'pending') {
        btn.textContent = 'Request Sent';
        btn.disabled = true;
        btn.style.backgroundColor = '#95a5a6';
        input.style.display = 'none';
    } else if (status === 'rejected') {
        btn.textContent = 'Join Request Rejected'; 
        btn.disabled = true; 
        input.style.display = 'none';
    } else {
        // Reset state (e.g. if leaving)
        btn.textContent = 'Join Event';
        btn.disabled = false;
        btn.style.backgroundColor = ''; // Reset to default CSS
        input.style.display = 'block';
        input.value = '';
    }
}

function leaveEvent() {
    if (!confirm('Are you sure you want to leave this event?')) return;

    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('id');
    const userId = localStorage.getItem('userId');

    if (!eventId || !userId) return;

    // 1. Remove from eventRequests (localStorage)
    let allRequests = JSON.parse(localStorage.getItem('eventRequests') || '[]');
    const initialLength = allRequests.length;
    allRequests = allRequests.filter(req => !(req.eventId == eventId && req.requesterId == userId));
    
    if (allRequests.length < initialLength) {
        localStorage.setItem('eventRequests', JSON.stringify(allRequests));
        
        // 2. Remove from joinRequestsSent (legacy fallback)
        let requestsSent = JSON.parse(localStorage.getItem('joinRequestsSent') || '[]');
        requestsSent = requestsSent.filter(id => id != eventId);
        localStorage.setItem('joinRequestsSent', JSON.stringify(requestsSent));

        alert('You have left the event.');
        
        // Update UI immediately without reload
        const joinBtn = document.querySelector('.join-btn');
        const joinReasonInput = document.getElementById('joinReason');
        updateButtonState(joinBtn, joinReasonInput, null); // null status resets to default
    } else {
        alert('Error: Could not find your participation record.');
    }
}

function formatDate(dateTimeString) {
    if (!dateTimeString) return 'Date TBA';
    try {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateTimeString).toLocaleDateString('en-US', options);
    } catch (e) {
        return 'Date TBA';
    }
}

function formatTime(dateTimeString) {
    if (!dateTimeString) return 'Time TBA';
    try {
        const options = { hour: '2-digit', minute: '2-digit' };
        return new Date(dateTimeString).toLocaleTimeString('en-US', options);
    } catch (e) {
        return 'Time TBA';
    }
}
