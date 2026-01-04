const API_BASE_URL = 'http://localhost:8080';

/**
 * Common fetch wrapper to handle errors and boilerplate
 */
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Default headers
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    try {
        const response = await fetch(url, { ...options, headers });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `API Error: ${response.status}`);
        }

        // Return null for 204 No Content
        if (response.status === 204) return null;
        
        return await response.json();
    } catch (error) {
        console.error(`API Request Failed [${url}]:`, error);
        throw error;
    }
}

/**
 * Centralized API methods
 */
const API = {
    events: {
        getAll: () => apiRequest('/events/all'),
        getById: (id) => apiRequest(`/events/${id}`),
        search: (query, location) => {
            let path = '/events/search?';
            if (query) path += `query=${encodeURIComponent(query)}&`;
            if (location) path += `location=${encodeURIComponent(location)}`;
            return apiRequest(path);
        },
        create: (eventData) => apiRequest('/events/create', {
            method: 'POST',
            body: JSON.stringify(eventData)
        }),
        delete: (id) => apiRequest(`/events/${id}`, { method: 'DELETE' })
    },
    users: {
        getAll: () => apiRequest('/users/all'),
        getById: (id) => apiRequest(`/users/${userId}`),
        login: (email, password) => apiRequest('/users/login', { // If you implement this later
            method: 'POST',
            body: JSON.stringify({ email, password })
        })
    },
    upload: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch(`${API_BASE_URL}/api/upload`, {
            method: 'POST',
            body: formData
            // Note: Don't set Content-Type header for FormData, browser does it with boundary
        });
        
        if (!response.ok) throw new Error('Upload failed');
        return await response.json();
    }
};
