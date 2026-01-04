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

async function submitEvent(event) {
    event.preventDefault();
    
    const topic = document.getElementById('eventTopic').value;
    const name = document.getElementById('eventName').value;
    const description = document.getElementById('eventDescription').value;
    const location = document.getElementById('eventLocation').value;
    const eventDateInput = document.getElementById('eventDate').value;
    const maxParticipants = document.getElementById('maxParticipants').value;
    const step2Error = document.getElementById('step2Error');
    const imageInput = document.getElementById('eventImage');

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

    try {
        // 1. Upload Image if exists
        let imageUrl = "../assets/bgForcards.jpg"; // default
        if (imageInput.files[0]) {
            const formData = new FormData();
            formData.append("file", imageInput.files[0]);

            const uploadRes = await fetch('http://localhost:8080/api/upload', {
                method: 'POST',
                body: formData
            });

            if (uploadRes.ok) {
                const data = await uploadRes.json();
                imageUrl = data.url;
            } else {
                console.error("Image upload failed");
            }
        }

        // 2. Prepare Event Object
        const userId = localStorage.getItem('userId');
        if (!userId) {
            alert("You must be logged in to create an event.");
            window.location.href = 'login.html';
            return;
        }

        // Fetch user object to set as host (Required by backend entity)
        // This is a bit of a workaround because the entity needs the full User object
        // In a real JWT setup, backend would extract user from token.
        // For now, we'll fetch the user first.
        const userRes = await fetch(`http://localhost:8080/users/${userId}`);
        if (!userRes.ok) throw new Error("Could not fetch user details");
        const hostUser = await userRes.json();

        const eventData = {
            title: name,
            description: description,
            category: topic,
            location: location,
            eventDate: eventDateInput, // ISO format
            maxParticipants: parseInt(maxParticipants),
            imageUrl: imageUrl,
            host: hostUser // Pass the full user object
        };

        // 3. Send to Backend
        const response = await fetch('http://localhost:8080/events/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(eventData)
        });

        if (response.ok) {
            alert('Event created successfully!');
            window.location.href = 'profile.html';
        } else {
            const err = await response.json();
            alert('Failed to create event: ' + (err.message || 'Unknown error'));
        }

    } catch (error) {
        console.error('Error creating event:', error);
        alert('An error occurred. Please try again.');
    }
}