// Function to initialize speech recognition
function initRecognition() {
    // Check if SpeechRecognition is supported in the browser
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
        // Create a new instance of SpeechRecognition
        recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.continuous = false; // Set continuous recognition to false
        recognition.interimResults = false; // Set interim results to false
        recognition.lang = 'en-US'; // Set language to English (United States)
        
        // Event handler for recognition result
        recognition.onresult = function(event) {
            var transcript = event.results[0][0].transcript; // Get transcript of recognized speech
            document.getElementById("user-input").value = transcript; // Set user input field value to transcript
            sendMessage(); // Call sendMessage function to process user input
        };
        
        // Event handler for recognition error
        recognition.onerror = function(event) {
            console.error('Speech recognition error:', event.error); // Log recognition error
        };
    } else {
        console.error('Speech recognition not supported'); // Log speech recognition not supported
    }
}

// Function to toggle voice input
function toggleVoiceInput() {
    if (recognition) {
        if (recognition.isListening) {
            recognition.stop(); // Stop recognition if it's already listening
        } else {
            recognition.start(); // Start recognition if it's not listening
        }
    }
}

// Event listener for space key press to toggle voice input
document.addEventListener('keydown', function(event) {
    if (event.code === 'Space') {
        toggleVoiceInput(); // Call toggleVoiceInput function
    }
});

// Function to speak text
function speak(message) {
    var speechSynthesis = window.speechSynthesis; // Get speech synthesis instance
    var utterance = new SpeechSynthesisUtterance(); // Create new utterance
    utterance.text = "You said " + message; // Set utterance text to "You said" followed by user message
    // Find voice based on available voices
    utterance.voice = speechSynthesis.getVoices().find(function(voice) {
        return voice.name === "Google UK English Female";
    });
    speechSynthesis.speak(utterance); // Speak the utterance
}

// Function to simulate bot response (not implemented in this code snippet)
function simulateBotResponse() {
    setTimeout(function() {
        var chatBox = document.getElementById("chat-box");
        var botMessageElement = chatBox.lastElementChild;
        botMessageElement.innerText = botResponse;
        botMessageElement.classList.remove("loading");
    }, 1000); // Simulating delay for demonstration
}

// Initialize speech recognition
initRecognition();

// Event listener for user input field key press
document.getElementById("user-input").addEventListener("keyup", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        sendMessage(); // Call sendMessage function when Enter key is pressed
    }
});

// Function to animate typing effect (not used in this code snippet)
function typeText(text) {
    var chatBox = document.getElementById("chat-box");
    chatBox.textContent = ""; // Clear previous text
    // Loop through each character of the text
    var index = 0;
    var typingInterval = setInterval(function() {
      if (index < text.length) {
        // Add the next character to the chat box
        chatBox.textContent += text[index];
        index++;
      } else {
        // Stop the typing animation when all characters are displayed
        clearInterval(typingInterval);
        // Adjust scroll position after the typing animation completes
        chatBox.scrollTop = chatBox.scrollHeight;
      }
    }, 50); // Adjust the typing speed here (milliseconds per character)
}

// Function to append a message to the chat box
function appendMessage(message, sender) {
    var chatBox = document.getElementById("chat-box");
    var messageElement = document.createElement("div");
    messageElement.classList.add("message");
    // Determine the class based on the sender (user or bot)
    if (sender === "user") {
        messageElement.classList.add("user-message");
    } else {
        messageElement.classList.add("bot-message");
        messageElement.classList.add("loading");
    }
    // Append the message element to the chat box
    chatBox.appendChild(messageElement);
    // Initialize index to 0 for typing animation
    var index = 0;
    var typingInterval = setInterval(function() {
        if (index < message.length) {
            // Add the next character to the message element
            messageElement.innerText += message[index];
            index++;
        } else {
            // Stop the typing animation when all characters are displayed
            clearInterval(typingInterval);
            // Adjust scroll position after the typing animation completes
            chatBox.scrollTop = chatBox.scrollHeight;
        }
    }, 50); // Adjust the typing speed here (milliseconds per character)
}

// Function to send user message and get bot response
function sendMessage() {
    var userInput = document.getElementById("user-input").value;
    if (userInput.trim() !== "") {
        appendMessage("You said: " + userInput, "user"); // Display user input in chat-box
        speak(userInput); // Speak user input
        showLoadingIndicator();
        fetch('https://api.cohere.ai/baseline/bert-base-uncased/chat', { // CoHere API endpoint
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer 8LCPJMpRxSgMuXInjdwGSGeTZdfJSOzpKN5MEbmq' // Replace YOUR_COHERE_API_KEY with your actual API key
            },
            body: JSON.stringify({ context: userInput }) // Send user input as context to CoHere API
        })
        .then(response => response.json())
        .then(data => {
            appendMessage(data.responses[0], "bot"); // Append CoHere API response to chat-box
            speak(data.responses[0]); // Speak AI response
            hideLoadingIndicator();
        })
        .catch(error => {
            console.error('Error:', error); // Log error if fetch fails
            hideLoadingIndicator();
        });
        document.getElementById("user-input").value = ""; // Clear user input field
    }
}
