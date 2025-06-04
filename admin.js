// Check admin authentication
function checkAuth() {
    const adminSession = localStorage.getItem('adminSession');
    if (!adminSession) {
        // Hide all admin-related elements
        document.getElementById('adminBar').style.display = 'none';
        document.querySelectorAll('.edit-overlay').forEach(overlay => {
            overlay.style.display = 'none';
        });
        document.querySelectorAll('[data-editable]').forEach(element => {
            element.style.cursor = 'default';
            element.removeAttribute('data-editable'); // Remove editable attribute for public view
        });
        return false;
    }
    return true;
}

// Logout function
function logout() {
    // Save all editable content before logging out
    saveAllContent();
    localStorage.removeItem('adminSession');
    window.location.reload();
}

// Function to save all editable content
function saveAllContent() {
    // Save profile information
    const profileData = {
        name: document.querySelector('.name').textContent,
        title: document.querySelector('.title').textContent,
        bio: document.querySelector('.about-section p').textContent
    };
    localStorage.setItem('profileData', JSON.stringify(profileData));

    // Save social links
    const socialLinks = Array.from(document.querySelectorAll('.social-icon')).map(link => ({
        href: link.getAttribute('href')
    }));
    localStorage.setItem('socialLinks', JSON.stringify(socialLinks));

    // Save contact information
    const contactInfo = Array.from(document.querySelectorAll('.contact-item')).map(item => ({
        text: item.querySelector('span').textContent
    }));
    localStorage.setItem('contactInfo', JSON.stringify(contactInfo));
}

// Show login modal
function showLoginModal() {
    const modal = document.getElementById('loginModal');
    modal.style.display = 'flex';
}

// Close login modal
function closeLoginModal() {
    const modal = document.getElementById('loginModal');
    modal.style.display = 'none';
    document.getElementById('errorMessage').textContent = '';
}

document.addEventListener('DOMContentLoaded', () => {
    // Load saved profile image for all users
    const profileImage = document.getElementById('profileImage');
    const savedProfileImage = localStorage.getItem('profile_image');
    if (savedProfileImage) {
        profileImage.src = savedProfileImage;
    }

    // Check authentication first
    const isAdmin = checkAuth();
    
    // Load saved content
    loadSavedContent();
    
    // Load saved videos for all users
    loadSavedVideos();
    
    if (isAdmin) {
        // Set up admin session info
        const adminSession = JSON.parse(localStorage.getItem('adminSession'));
        const adminSessionInfo = document.getElementById('adminBar');
        const adminName = adminSessionInfo.querySelector('.admin-name');
        
        adminName.textContent = adminSession.username;
        adminSessionInfo.style.display = 'flex';
        document.getElementById('loginBtn').style.display = 'none';
        document.getElementById('addVideoBtn').style.display = 'block';

        // Show edit overlay for profile image
        document.querySelector('.profile-image .edit-overlay').style.display = 'flex';

        // Add editable attributes for admin
        document.querySelectorAll('.name, .title, .about-section p').forEach(element => {
            element.setAttribute('data-editable', 'text');
        });
        document.querySelectorAll('.social-icon').forEach(element => {
            element.setAttribute('data-editable', 'link');
        });
        document.querySelectorAll('.contact-item').forEach(element => {
            element.setAttribute('data-editable', 'contact');
        });

        // Handle profile image upload
        const profileImageInput = document.getElementById('profileImageInput');
        profileImageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                // Validate file type
                if (!file.type.startsWith('image/')) {
                    alert('Please select an image file');
                    return;
                }

                // Validate file size (max 5MB)
                if (file.size > 5 * 1024 * 1024) {
                    alert('Image size should be less than 5MB');
                    return;
                }

                const reader = new FileReader();
                reader.onload = (event) => {
                    const imageUrl = event.target.result;
                    profileImage.src = imageUrl;
                    localStorage.setItem('profile_image', imageUrl);
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Handle login form submission
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // In a real application, this would be handled by a server
        // For demo purposes, we'll use a hardcoded admin account
        if (username === 'admin' && password === 'admin123') {
            // Create admin session
            const adminSession = {
                username: username,
                loginTime: new Date().toISOString(),
                token: generateToken()
            };

            // Save session to localStorage
            localStorage.setItem('adminSession', JSON.stringify(adminSession));

            // Close modal and reload page
            closeLoginModal();
            window.location.reload();
        } else {
            errorMessage.textContent = 'Invalid username or password';
        }
    });

    // Generate a simple token (in a real app, this would be more secure)
    function generateToken() {
        return Math.random().toString(36).substring(2) + Date.now().toString(36);
    }

    // Load saved videos from localStorage
    function loadSavedVideos() {
        const videosContainer = document.getElementById('videosContainer');
        const savedVideos = JSON.parse(localStorage.getItem('videos') || '[]');
        
        videosContainer.innerHTML = '';
        savedVideos.forEach((video, index) => {
            const videoCard = createVideoCard(video, index);
            videosContainer.appendChild(videoCard);
        });
    }

    // Create a video card element
    function createVideoCard(video, index) {
        const card = document.createElement('div');
        card.className = 'video-card';
        card.innerHTML = `
            <div class="video-container">
                <video controls preload="metadata" class="video-player">
                    <source src="${video.url}" type="video/mp4">
                    Your browser does not support the video tag.
                </video>
                ${isAdmin ? `
                <div class="edit-overlay">
                    <button onclick="document.getElementById('videoInput${index}').click()">
                        <i class="fas fa-upload"></i> Change Video
                    </button>
                    <input type="file" id="videoInput${index}" accept="video/*" style="display: none;">
                </div>
                ` : ''}
            </div>
            <div class="video-info">
                <h3 class="video-title" ${isAdmin ? 'data-editable="text"' : ''}>${video.title}</h3>
                <p class="video-description" ${isAdmin ? 'data-editable="text"' : ''}>${video.description}</p>
                <div class="rating">
                    <div class="stars">
                        <i class="fas fa-star" data-rating="1"></i>
                        <i class="fas fa-star" data-rating="2"></i>
                        <i class="fas fa-star" data-rating="3"></i>
                        <i class="fas fa-star" data-rating="4"></i>
                        <i class="fas fa-star" data-rating="5"></i>
                    </div>
                    <p class="rating-count">Average Rating: <span>${video.rating ? video.rating.toFixed(1) : '0.0'}</span> (<span>${video.ratingCount || 0}</span> ratings)</p>
                </div>
                <button class="feedback-btn" onclick="showFeedbackForm(${index})">
                    <i class="fas fa-comment"></i> Send Feedback to Author
                </button>
                <div id="feedbackForm${index}" class="feedback-form" style="display: none;">
                    <form onsubmit="submitFeedback(event, ${index})">
                        <div class="form-group">
                            <label for="feedbackName${index}">Name:</label>
                            <input type="text" id="feedbackName${index}" required>
                        </div>
                        <div class="form-group">
                            <label for="feedbackEmail${index}">Email:</label>
                            <input type="email" id="feedbackEmail${index}" required>
                        </div>
                        <div class="form-group">
                            <label for="feedbackMessage${index}">Message:</label>
                            <textarea id="feedbackMessage${index}" rows="3" required></textarea>
                        </div>
                        <div class="feedback-buttons">
                            <button type="submit" class="submit-btn">Send Feedback</button>
                            <button type="button" class="cancel-btn" onclick="hideFeedbackForm(${index})">Cancel</button>
                        </div>
                    </form>
                    <div id="feedbackStatus${index}" class="form-status"></div>
                </div>
            </div>
            ${isAdmin ? `
            <div class="video-controls">
                <button onclick="deleteVideo(${index})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
            ` : ''}
        `;

        // Add event listeners for video upload (admin only)
        if (isAdmin) {
            const videoInput = card.querySelector(`#videoInput${index}`);
            videoInput.addEventListener('change', (e) => handleVideoUpload(e, index));
        }

        // Add event listeners for rating (all users)
        const stars = card.querySelectorAll('.stars i');
        stars.forEach(star => {
            star.addEventListener('mouseover', () => {
                const rating = parseInt(star.getAttribute('data-rating'));
                stars.forEach((s, i) => {
                    s.style.color = i < rating ? '#ffd700' : '#ccc';
                });
            });

            star.addEventListener('mouseout', () => {
                const currentRating = video.rating || 0;
                stars.forEach((s, i) => {
                    s.style.color = i < currentRating ? '#ffd700' : '#ccc';
                });
            });

            star.addEventListener('click', () => handleRating(star, index));
        });

        // Set initial star colors
        const currentRating = video.rating || 0;
        stars.forEach((s, i) => {
            s.style.color = i < currentRating ? '#ffd700' : '#ccc';
        });

        // Add video player event listeners
        const videoPlayer = card.querySelector('.video-player');
        videoPlayer.addEventListener('error', (e) => {
            console.error('Error loading video:', e);
            videoPlayer.innerHTML = 'Error loading video. Please try again later.';
        });

        return card;
    }

    // Handle video upload
    function handleVideoUpload(event, index) {
        const file = event.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('video/')) {
                alert('Please select a video file');
                return;
            }

            // Validate file size (max 50MB)
            if (file.size > 50 * 1024 * 1024) {
                alert('Video size should be less than 50MB');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const videoUrl = e.target.result;
                const videos = JSON.parse(localStorage.getItem('videos') || '[]');
                
                if (index === undefined) {
                    // New video
                    videos.push({
                        url: videoUrl,
                        title: 'New Video',
                        description: 'Add a description',
                        rating: 0,
                        ratingCount: 0
                    });
                } else {
                    // Update existing video
                    videos[index].url = videoUrl;
                }

                localStorage.setItem('videos', JSON.stringify(videos));
                loadSavedVideos();
            };
            reader.readAsDataURL(file);
        }
    }

    // Handle video deletion
    window.deleteVideo = function(index) {
        if (confirm('Are you sure you want to delete this video?')) {
            const videos = JSON.parse(localStorage.getItem('videos') || '[]');
            videos.splice(index, 1);
            localStorage.setItem('videos', JSON.stringify(videos));
            loadSavedVideos();
        }
    };

    // Handle video rating
    function handleRating(star, videoIndex) {
        const rating = parseInt(star.getAttribute('data-rating'));
        const videos = JSON.parse(localStorage.getItem('videos') || '[]');
        const video = videos[videoIndex];

        // Update rating
        const newCount = (video.ratingCount || 0) + 1;
        const newRating = ((video.rating || 0) * (newCount - 1) + rating) / newCount;

        video.rating = newRating;
        video.ratingCount = newCount;

        localStorage.setItem('videos', JSON.stringify(videos));
        loadSavedVideos();
    }

    // Handle new video upload
    const videoInput = document.getElementById('videoInput');
    videoInput.addEventListener('change', (e) => handleVideoUpload(e));

    // Handle text editing
    document.querySelectorAll('[data-editable="text"]').forEach(element => {
        element.addEventListener('click', (e) => {
            if (!isAdmin) return;
            const currentText = element.textContent;
            const input = document.createElement('input');
            input.value = currentText;
            input.style.width = '100%';
            input.style.padding = '0.5rem';
            input.style.border = '1px solid #3498db';
            input.style.borderRadius = '4px';

            input.addEventListener('blur', () => {
                element.textContent = input.value;
                input.remove();
            });

            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    element.textContent = input.value;
                    input.remove();
                }
            });

            element.textContent = '';
            element.appendChild(input);
            input.focus();
        });
    });

    // Handle link editing
    document.querySelectorAll('[data-editable="link"]').forEach(link => {
        link.addEventListener('click', (e) => {
            if (!isAdmin) return;
            e.preventDefault();
            const currentHref = link.getAttribute('href');
            const newHref = prompt('Enter new URL:', currentHref);
            if (newHref) {
                link.setAttribute('href', newHref);
            }
        });
    });

    // Handle contact information editing
    document.querySelectorAll('[data-editable="contact"]').forEach(contact => {
        contact.addEventListener('click', (e) => {
            if (!isAdmin) return;
            const currentText = contact.querySelector('span').textContent;
            const newText = prompt('Enter new contact information:', currentText);
            if (newText) {
                contact.querySelector('span').textContent = newText;
            }
        });
    });

    // Contact Form Handling
    document.getElementById('contactForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = e.target;
        const submitBtn = form.querySelector('.submit-btn');
        const status = document.getElementById('formStatus');
        
        try {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';
            
            const response = await fetch('http://localhost:3000/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: form.name.value,
                    email: form.email.value,
                    subject: form.subject.value,
                    message: form.message.value
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                status.textContent = data.message;
                status.className = 'form-status success';
                form.reset();
                setTimeout(() => status.style.display = 'none', 3000);
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            status.textContent = error.message || 'Failed to send message';
            status.className = 'form-status error';
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send Message';
        }
    });

    // Add these new functions for feedback handling
    window.showFeedbackForm = function(index) {
        const form = document.getElementById(`feedbackForm${index}`);
        const button = form.previousElementSibling; // Get the button element
        
        if (form.style.display === 'block') {
            // If form is visible, hide it
            form.style.display = 'none';
            button.innerHTML = '<i class="fas fa-comment"></i> Send Feedback to Author';
        } else {
            // If form is hidden, show it
            form.style.display = 'block';
            button.innerHTML = '<i class="fas fa-times"></i> Hide Feedback Form';
        }
    };

    window.hideFeedbackForm = function(index) {
        const form = document.getElementById(`feedbackForm${index}`);
        form.style.display = 'none';
        form.reset();
        const status = document.getElementById(`feedbackStatus${index}`);
        status.style.display = 'none';
    };

    window.submitFeedback = async function(event, index) {
        event.preventDefault();
        
        const formStatus = document.getElementById(`feedbackStatus${index}`);
        const submitBtn = event.target.querySelector('.submit-btn');
        
        const formData = {
            name: document.getElementById(`feedbackName${index}`).value,
            email: document.getElementById(`feedbackEmail${index}`).value,
            subject: `Feedback for video: ${document.querySelectorAll('.video-title')[index].textContent}`,
            message: document.getElementById(`feedbackMessage${index}`).value
        };
        
        try {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';
            
            const response = await fetch('http://localhost:3000/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            
            if (response.ok) {
                formStatus.textContent = data.message;
                formStatus.className = 'form-status success';
                event.target.reset();
                setTimeout(() => hideFeedbackForm(index), 2000);
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            formStatus.textContent = error.message || 'Failed to send feedback. Please try again later.';
            formStatus.className = 'form-status error';
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send Feedback';
        }
    };
});

// Function to load saved content
function loadSavedContent() {
    // Load profile information
    const profileData = JSON.parse(localStorage.getItem('profileData'));
    if (profileData) {
        document.querySelector('.name').textContent = profileData.name;
        document.querySelector('.title').textContent = profileData.title;
        document.querySelector('.about-section p').textContent = profileData.bio;
    }

    // Load social links
    const socialLinks = JSON.parse(localStorage.getItem('socialLinks'));
    if (socialLinks) {
        document.querySelectorAll('.social-icon').forEach((link, index) => {
            if (socialLinks[index]) {
                link.setAttribute('href', socialLinks[index].href);
            }
        });
    }

    // Load contact information
    const contactInfo = JSON.parse(localStorage.getItem('contactInfo'));
    if (contactInfo) {
        document.querySelectorAll('.contact-item').forEach((item, index) => {
            if (contactInfo[index]) {
                item.querySelector('span').textContent = contactInfo[index].text;
            }
        });
    }
} 