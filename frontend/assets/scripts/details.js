let currentChatPartnerId = null;
let currentEventId = null;
let chatInterval = null;

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('id');

    if (!eventId) {
        alert('No event specified');
        window.location.href = 'dashboard.html';
        return;
    }

    try {
        const event = await API.getEventById(eventId);
        renderEventDetails(event);

        // Setup Chat Form Listener
        const chatForm = document.getElementById('chatForm');
        if (chatForm) {
            chatForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                Auth.requireAuth(); // Ensure logged in to chat
                const input = document.getElementById('chatInput');
                const content = input.value.trim();
                
                if (!content) return;
                if (!currentEventId || !currentChatPartnerId) {
                    alert('Chat session error. Please reopen the chat.');
                    return;
                }

                const currentUser = Auth.getUser();
                try {
                    await API.sendMessage(currentEventId, currentUser.id, currentChatPartnerId, content);
                    input.value = '';
                    loadChatHistory();
                } catch (err) {
                    alert('Failed to send message: ' + err.message);
                }
            });
        }
    } catch (error) {
        document.querySelector('.container').innerHTML = `<h1 style="margin-top:2rem;">Error: ${error.message}</h1>`;
    }
});

function renderEventDetails(event) {
    const user = Auth.getUser();
    
    // Main Content
    document.getElementById('eventTitle').textContent = event.title;
    
    // Image Logic
    if (event.imageUrl) {
        const header = document.querySelector('.details-header');
        const existingImg = header.querySelector('img');
        if(!existingImg) {
            const img = document.createElement('img');
            img.src = event.imageUrl;
            img.className = 'event-detail-banner'; // We can add this to CSS
            img.style.width = '100%';
            img.style.maxHeight = '400px';
            img.style.objectFit = 'cover';
            img.style.borderRadius = 'var(--radius)';
            img.style.marginBottom = '2rem';
            header.insertBefore(img, header.firstChild);
        }
    }

    document.getElementById('eventLocation').textContent = `📍 ${event.location}`;
    document.getElementById('eventDate').textContent = `📅 ${new Date(event.eventDate).toLocaleString()}`;
    document.getElementById('eventDescription').textContent = event.description || 'No description provided.';
    
    // Sidebar: Host Info
    const hostName = event.host ? event.host.name : 'Unknown';
    document.getElementById('hostName').textContent = hostName;
    document.getElementById('hostAvatar').textContent = hostName.charAt(0);

    // Action Button Logic
    const actionContainer = document.getElementById('actionContainer');
    const isHost = user && event.host && event.host.id === user.id;
    const isJoined = user && event.participants && event.participants.some(p => p.id === user.id);

    if (!user) {
        actionContainer.innerHTML = `<button onclick="window.location.href='login.html'" class="btn btn-primary" style="width:100%;">Join Event</button>`;
    } else if (isHost) {
        actionContainer.innerHTML = `
            <p class="text-muted" style="margin-bottom:10px;">You are hosting this event.</p>
            <button id="deleteBtn" class="btn btn-danger" style="width:100%; background-color: var(--danger); color: white;">Delete Event</button>
        `;
        document.getElementById('deleteBtn').addEventListener('click', () => deleteEventHandler(event.id));
        renderRequestsCard(event.id);
    } else if (isJoined) {
        actionContainer.innerHTML = `
            <button id="leaveBtn" class="btn btn-secondary" style="width:100%; background: #fee2e2; color: #991b1b; border:none; margin-bottom:10px;">Leave Event</button>
            <button class="btn btn-secondary" disabled style="width:100%; background: #d1fae5; color: #065f46; border:none;">✓ You are going</button>
        `;
        document.getElementById('leaveBtn').addEventListener('click', () => leaveEventHandler(event.id, user.id));
    } else {
        checkStatusAndRenderButton(event.id, user.id, actionContainer);
    }

    renderParticipants(event);
}

async function leaveEventHandler(eventId, userId) {
    if(!confirm('Are you sure you want to leave this event?')) return;
    try {
        await API.leaveEvent(eventId, userId);
        alert('You have left the event.');
        window.location.reload();
    } catch (e) {
        alert(e.message);
    }
}

async function checkStatusAndRenderButton(eventId, userId, container) {
    try {
        const statusData = await API.getJoinStatus(eventId, userId);
        if (statusData.status === 'PENDING') {
            container.innerHTML = `
                <button id="cancelReqBtn" class="btn btn-secondary" style="width:100%; border: 1px solid #d1d5db; margin-bottom:10px;">Cancel Request</button>
                <button class="btn btn-secondary" disabled style="width:100%; background: #fef3c7; color: #92400e; border:none;">⏳ Requested</button>
            `;
            document.getElementById('cancelReqBtn').addEventListener('click', () => leaveEventHandler(eventId, userId));
        } else {
            container.innerHTML = `<button id="joinBtn" class="btn btn-primary" style="width:100%;">Join Event</button>`;
            document.getElementById('joinBtn').addEventListener('click', () => joinEventHandler(eventId));
        }
    } catch (e) {
        console.error(e);
    }
}

async function renderRequestsCard(eventId) {
    // ... existing renderRequestsCard code ...
}

async function approveHandler(requestId) {
    // ... existing approveHandler code ...
}

function renderParticipants(event) {
    const participantList = document.getElementById('participantList');
    const countDisplay = document.getElementById('participantCount');
    const currentUser = Auth.getUser();
    
    const isParticipant = currentUser && event.participants && event.participants.some(p => p.id === currentUser.id);
    const isHost = currentUser && event.host && event.host.id === currentUser.id;

    if (event.participants && event.participants.length > 0) {
        countDisplay.textContent = `${event.participants.length} going`;
        participantList.innerHTML = event.participants.map(p => {
            const isMe = currentUser && p.id === currentUser.id;
            const isTargetHost = event.host && p.id === event.host.id;
            
            // Message button for participants
            const messageBtn = (isParticipant && !isMe) 
                ? `<button onclick="openChat(${p.id}, '${p.name}', ${event.id})" style="background:none; border:none; color:var(--primary); cursor:pointer; font-size:0.8rem; font-weight:600;">Message</button>` 
                : '';

            // Remove button for host
            const removeBtn = (isHost && !isTargetHost)
                ? `<button onclick="removeParticipantHandler(${event.id}, ${p.id}, '${p.name}')" style="background:none; border:none; color:var(--danger); cursor:pointer; font-size:0.8rem; font-weight:600; margin-left:10px;">Remove</button>`
                : '';

            return `
                <li class="participant-item" style="justify-content: space-between;">
                    <div style="display: flex; align-items: center;">
                        <div class="participant-avatar">${p.name.charAt(0)}</div>
                        <span>${p.name} ${isTargetHost ? '<span style="font-size:0.8rem; background:#eee; padding:2px 6px; border-radius:4px; margin-left:5px;">Host</span>' : ''}</span>
                    </div>
                    <div style="display:flex; gap:5px;">
                        ${messageBtn}
                        ${removeBtn}
                    </div>
                </li>
            `;
        }).join('');
    } else {
        countDisplay.textContent = '0 going';
        participantList.innerHTML = '<li class="text-muted">No participants yet.</li>';
    }
}

async function removeParticipantHandler(eventId, userId, userName) {
    if(!confirm(`Are you sure you want to remove ${userName} from the event?`)) return;
    try {
        await API.removeParticipant(eventId, userId);
        alert('Participant removed.');
        window.location.reload();
    } catch (e) {
        alert(e.message);
    }
}

// CHAT LOGIC
function openChat(partnerId, partnerName, eventId) {
    currentChatPartnerId = partnerId;
    currentEventId = eventId;
    document.getElementById('chatTitle').textContent = `Chat with ${partnerName}`;
    document.getElementById('chatModal').style.display = 'flex';
    loadChatHistory();
    if(chatInterval) clearInterval(chatInterval);
    chatInterval = setInterval(loadChatHistory, 3000);
}

function closeChat() {
    document.getElementById('chatModal').style.display = 'none';
    if(chatInterval) clearInterval(chatInterval);
}

async function loadChatHistory() {
    if (!currentChatPartnerId || !currentEventId) return;
    const currentUser = Auth.getUser();
    try {
        const history = await API.getChatHistory(currentEventId, currentUser.id, currentChatPartnerId);
        const chatMessages = document.getElementById('chatMessages');
        chatMessages.innerHTML = history.map(msg => `
            <div class="message-bubble ${msg.sender.id === currentUser.id ? 'message-sent' : 'message-received'}">
                ${msg.content}
            </div>
        `).join('');
        chatMessages.scrollTop = chatMessages.scrollHeight;
    } catch (e) {
        console.error(e);
    }
}

async function joinEventHandler(eventId) {
    const user = Auth.getUser();
    try {
        await API.joinEvent(eventId, user.id);
        alert('Join request sent successfully!');
        window.location.reload();
    } catch (error) {
        alert(error.message);
    }
}

async function deleteEventHandler(eventId) {
    if(!confirm('Are you sure you want to delete this event?')) return;
    try {
        await API.deleteEvent(eventId);
        alert('Event deleted.');
        window.location.href = 'dashboard.html';
    } catch (error) {
        alert(error.message);
    }
}