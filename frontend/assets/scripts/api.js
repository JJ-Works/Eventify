const API_BASE_URL = 'http://localhost:8080/api';

const API = {
    // Auth
    login: async (email, password) => {
        const response = await fetch(`${API_BASE_URL}/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        if (!response.ok) throw new Error('Invalid credentials');
        return await response.json();
    },

    register: async (name, email, password, interests) => {
        const response = await fetch(`${API_BASE_URL}/users/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, interests })
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Registration failed');
        }
        return await response.json();
    },

    // Events
    getAllEvents: async () => {
        const response = await fetch(`${API_BASE_URL}/events`);
        return await response.json();
    },

    getEventById: async (id) => {
        const response = await fetch(`${API_BASE_URL}/events/${id}`);
        if (!response.ok) throw new Error('Event not found');
        return await response.json();
    },

    createEvent: async (eventData) => {
        const response = await fetch(`${API_BASE_URL}/events`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(eventData)
        });
        if (!response.ok) throw new Error('Failed to create event');
        return await response.json();
    },

    deleteEvent: async (id) => {
        const response = await fetch(`${API_BASE_URL}/events/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete event');
        return await response.json();
    },

    uploadImage: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        
        // Use regex to replace /api with /api/upload since API_BASE_URL ends in /api
        const uploadUrl = API_BASE_URL.replace(/\/api$/, '/api/upload');
        
        const response = await fetch(uploadUrl, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Image upload failed: ${response.status} ${errorText}`);
        }
        return await response.json();
    },

    joinEvent: async (eventId, userId) => {
        const response = await fetch(`${API_BASE_URL}/events/${eventId}/join`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId })
        });
        if (!response.ok) throw new Error('Failed to send join request');
        return await response.json();
    },

    getJoinStatus: async (eventId, userId) => {
        const response = await fetch(`${API_BASE_URL}/events/${eventId}/status/${userId}`);
        return await response.json();
    },

    getPendingRequests: async (eventId) => {
        const response = await fetch(`${API_BASE_URL}/events/${eventId}/requests`);
        return await response.json();
    },

    approveRequest: async (requestId) => {
        const response = await fetch(`${API_BASE_URL}/events/requests/${requestId}/approve`, {
            method: 'POST'
        });
        if (!response.ok) throw new Error('Failed to approve request');
        return await response.json();
    },

    leaveEvent: async (eventId, userId) => {
        const response = await fetch(`${API_BASE_URL}/events/${eventId}/join/${userId}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to update participation');
        return await response.json();
    },

    removeParticipant: async (eventId, userId) => {
        const response = await fetch(`${API_BASE_URL}/events/${eventId}/participants/${userId}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to remove participant');
        return await response.json();
    },

    sendMessage: async (eventId, senderId, receiverId, content) => {
        const response = await fetch(`${API_BASE_URL}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ eventId, senderId, receiverId, content })
        });
        return await response.json();
    },

    getChatHistory: async (eventId, user1, user2) => {
        const response = await fetch(`${API_BASE_URL}/messages/history?eventId=${eventId}&user1=${user1}&user2=${user2}`);
        return await response.json();
    },
};

// Auth State Helper
const Auth = {
    getUser: () => JSON.parse(localStorage.getItem('user')),
    setUser: (user) => localStorage.setItem('user', JSON.stringify(user)),
    logout: () => {
        localStorage.removeItem('user');
        window.location.href = '../index.html';
    },
    requireAuth: () => {
        if (!localStorage.getItem('user')) {
            const isRoot = !window.location.pathname.includes('/pages/');
            const prefix = isRoot ? 'pages/' : '';
            window.location.href = `${prefix}login.html`;
        }
    }
};
