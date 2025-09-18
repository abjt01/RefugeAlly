document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const chatHistory = document.getElementById('chat-history');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-btn');
    const voiceButton = document.getElementById('voice-btn');
    const emojiElements = document.querySelectorAll('.emoji');
    const crisisModal = document.getElementById('crisis-modal');
    const closeModal = document.getElementById('close-modal');
    const languageSelector = document.getElementById('language-selector');
    const typingIndicator = document.getElementById('typing-indicator');
    
    // State variables
    let conversationHistory = [];
    let recognition = null;
    let isListening = false;
    let currentLanguage = 'en';
    
    // Initialize speech recognition if available
    initializeSpeechRecognition();
    
    // Event listeners
    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', handleKeyPress);
    closeModal.addEventListener('click', closeCrisisModal);
    
    if (recognition) {
        voiceButton.addEventListener('click', toggleSpeechRecognition);
    }
    
    emojiElements.forEach(emoji => {
        emoji.addEventListener('click', function() {
            trackMood(this.dataset.emoji);
        });
    });
    
    if (languageSelector) {
        languageSelector.addEventListener('change', function(e) {
            changeLanguage(e.target.value);
        });
    }
    
    // Initialize with a welcome message
    setTimeout(() => {
        addMessageToChat('bot', "Hello, I'm here to listen and support you. How are you feeling today?");
    }, 500);
    
    // Functions
    function sendMessage() {
        const message = userInput.value.trim();
        if (message) {
            addMessageToChat('user', message);
            userInput.value = '';
            userInput.style.height = 'auto';
            
            // Show typing indicator
            showTypingIndicator();
            
            // Send to backend
            fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: message,
                    history: conversationHistory,
                    language: currentLanguage
                })
            })
            .then(response => response.json())
            .then(data => {
                hideTypingIndicator();
                addMessageToChat('bot', data.message);
                
                if (data.crisis_detected) {
                    showCrisisResources(data.emergency_resources);
                }
            })
            .catch(error => {
                hideTypingIndicator();
                console.error('Error:', error);
                addMessageToChat('bot', "I'm having trouble connecting. Please try again.");
            });
        }
    }
    
    function handleKeyPress(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
        
        // Auto-resize textarea
        setTimeout(() => {
            userInput.style.height = 'auto';
            userInput.style.height = (userInput.scrollHeight) + 'px';
        }, 0);
    }
    
    function addMessageToChat(sender, message) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        messageElement.classList.add(sender + '-message');
        
        const messageText = document.createElement('div');
        messageText.textContent = message;
        
        const messageTime = document.createElement('span');
        messageTime.classList.add('message-time');
        messageTime.textContent = new Date().toLocaleTimeString();
        
        messageElement.appendChild(messageText);
        messageElement.appendChild(messageTime);
        
        chatHistory.appendChild(messageElement);
        chatHistory.scrollTop = chatHistory.scrollHeight;
        
        // Add to conversation history
        conversationHistory.push({
            sender: sender,
            message: message,
            timestamp: new Date().toISOString()
        });
        
        // Keep history manageable
        if (conversationHistory.length > 50) {
            conversationHistory = conversationHistory.slice(-50);
        }
    }
    
    function showTypingIndicator() {
        typingIndicator.style.display = 'block';
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }
    
    function hideTypingIndicator() {
        typingIndicator.style.display = 'none';
    }
    
    function initializeSpeechRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = currentLanguage;
            
            recognition.onresult = function(event) {
                const transcript = event.results[0][0].transcript;
                userInput.value = transcript;
                isListening = false;
                voiceButton.classList.remove('listening');
                
                // Auto-send if it seems like a complete thought
                if (transcript.length > 3 && (transcript.endsWith('.') || transcript.endsWith('?') || transcript.endsWith('!'))) {
                    setTimeout(sendMessage, 300);
                }
            };
            
            recognition.onerror = function(event) {
                console.error('Speech recognition error', event.error);
                isListening = false;
                voiceButton.classList.remove('listening');
                
                if (event.error === 'not-allowed') {
                    alert('Microphone access is required for voice input. Please allow microphone access in your browser settings.');
                }
            };
            
            recognition.onend = function() {
                isListening = false;
                voiceButton.classList.remove('listening');
            };
        } else {
            voiceButton.style.display = 'none';
            console.warn('Speech recognition not supported in this browser');
        }
    }
    
    function toggleSpeechRecognition() {
        if (!recognition) return;
        
        if (isListening) {
            recognition.stop();
            isListening = false;
            voiceButton.classList.remove('listening');
        } else {
            try {
                recognition.start();
                isListening = true;
                voiceButton.classList.add('listening');
            } catch (error) {
                console.error('Speech recognition error:', error);
            }
        }
    }
    
    function trackMood(emoji) {
        // Visual feedback
        emojiElements.forEach(e => e.classList.remove('selected'));
        event.target.classList.add('selected');
        
        fetch('/track_mood', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                emoji: emoji,
                note: '' // Can be extended to allow notes
            })
        })
        .then(response => response.json())
        .then(data => {
            addMessageToChat('bot', data.suggestion);
        })
        .catch(error => {
            console.error('Error tracking mood:', error);
        });
    }
    
    function showCrisisResources(resources) {
        document.getElementById('emergency-info').textContent = resources;
        crisisModal.style.display = 'flex';
    }
    
    function closeCrisisModal() {
        crisisModal.style.display = 'none';
    }
    
    function changeLanguage(lang) {
        currentLanguage = lang;
        
        if (recognition) {
            recognition.lang = lang;
        }
        
        // Show loading state
        const loadingSpinner = document.createElement('div');
        loadingSpinner.classList.add('loading-spinner');
        loadingSpinner.innerHTML = '<div class="spinner"></div><p>Changing language...</p>';
        chatHistory.appendChild(loadingSpinner);
        
        // In a real app, you might send a request to the server to change language
        // For now, we'll just simulate a delay and add a message
        setTimeout(() => {
            loadingSpinner.remove();
            addMessageToChat('bot', `Language changed. How can I help you today?`);
        }, 1000);
    }
    
    // Accessibility features
    document.addEventListener('keydown', function(e) {
        // Escape key closes modal
        if (e.key === 'Escape' && crisisModal.style.display === 'flex') {
            closeCrisisModal();
        }
        
        // Ctrl+Alt+H for high contrast mode
        if (e.ctrlKey && e.altKey && e.key === 'h') {
            document.body.classList.toggle('high-contrast');
        }
    });
    
    // Handle page visibility change (stop listening if tab is hidden)
    document.addEventListener('visibilitychange', function() {
        if (document.hidden && isListening && recognition) {
            recognition.stop();
        }
    });
});