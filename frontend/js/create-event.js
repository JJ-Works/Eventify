document.addEventListener('DOMContentLoaded', () => {
    const descriptionInput = document.getElementById('eventDescription');
    const charCount = document.getElementById('charCount');
    
    // Character count listener
    descriptionInput.addEventListener('input', () => {
        const length = descriptionInput.value.length;
        charCount.textContent = `${length} characters`;
        if (length < 60) {
            charCount.classList.add('error');
        } else {
            charCount.classList.remove('error');
        }
    });

    // Image Upload Listener
    const imageInput = document.getElementById('eventImage');
    if (imageInput) {
        imageInput.addEventListener('change', handleImageUpload);
    }
});

let currentStep = 1;
let uploadedImageBase64 = null;

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        // Basic validation
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file.');
            event.target.value = '';
            return;
        }
        
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            alert('File is too large. Max 5MB.');
            event.target.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            uploadedImageBase64 = e.target.result;
            const previewContainer = document.getElementById('imagePreviewContainer');
            const previewImg = document.getElementById('imagePreview');
            previewImg.src = uploadedImageBase64;
            previewContainer.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

function removeImage() {
    uploadedImageBase64 = null;
    document.getElementById('eventImage').value = '';
    document.getElementById('imagePreviewContainer').style.display = 'none';
}

function nextStep() {
    const errorMsg = document.getElementById('step1Error');
    const locationSelect = document.getElementById('eventLocation');
    const eventDate = document.getElementById('eventDate');
    const maxParticipants = document.getElementById('maxParticipants');

    if (currentStep === 1) {
        if (!locationSelect.value) {
            errorMsg.style.display = 'block';
            errorMsg.textContent = 'Please select a location.';
            return;
        }
        if (!eventDate.value) {
            errorMsg.style.display = 'block';
            errorMsg.textContent = 'Please select a date and time.';
            return;
        }
        if (!maxParticipants.value || maxParticipants.value < 1) {
            errorMsg.style.display = 'block';
            errorMsg.textContent = 'Please enter a valid number of participants.';
            return;
        }

        errorMsg.style.display = 'none';
        showStep(2);
    }
}

function prevStep() {
    if (currentStep === 2) {
        showStep(1);
    }
}

function showStep(step) {
    document.getElementById(`step${currentStep}`).classList.remove('active');
    document.getElementById(`dot${currentStep}`).classList.remove('active');
    
    currentStep = step;
    
    document.getElementById(`step${currentStep}`).classList.add('active');
    document.getElementById(`dot${currentStep}`).classList.add('active');
}

function submitEvent(event) {
    event.preventDefault();
    
    const topic = document.getElementById('eventTopic').value;
    const name = document.getElementById('eventName').value;
    const description = document.getElementById('eventDescription').value;
    const location = document.getElementById('eventLocation').value;
    const eventDateInput = document.getElementById('eventDate').value;
    const maxParticipants = document.getElementById('maxParticipants').value;
    const step2Error = document.getElementById('step2Error');

    // Validation
    if (!topic || !name || !description) {
        step2Error.style.display = 'block';
        step2Error.textContent = 'Please fill in all fields.';
        return;
    }

    if (description.length < 60) {
        step2Error.style.display = 'block';
        step2Error.textContent = 'Description must be at least 60 characters long.';
        return;
    }

    step2Error.style.display = 'none';

    // Format date for display
    const dateObj = new Date(eventDateInput);
    const formattedDate = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) + " • " + dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    // Log the data (Mock submission)
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName') || 'Unknown User';
    const eventData = {
        id: Date.now(), // Simple unique ID
        userId: userId, // Associate event with user
        creatorName: userName,
        location,
        eventDate: eventDateInput, // Store ISO format for DB matching
        maxParticipants: parseInt(maxParticipants),
        topic,
        title: name, // Profile.js expects 'title'
        description,
        date: formattedDate, // Store formatted string for display
        image: uploadedImageBase64 || "../assets/bgForcards.jpg", // Use uploaded image or default
        createdAt: new Date().toISOString()
    };
    
    // Save to localStorage (Simulating DB)
    const storedEvents = JSON.parse(localStorage.getItem('myEvents') || '[]');
    storedEvents.push(eventData);
    localStorage.setItem('myEvents', JSON.stringify(storedEvents));
    
    console.log('Event Created:', eventData);
    alert('Event created successfully!');
    
    // Redirect to profile page to see the event
    window.location.href = 'profile.html';
}