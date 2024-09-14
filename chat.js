document.addEventListener('DOMContentLoaded', () => {
    const roomIdElem = document.getElementById('room-id');
    const copyRoomIdBtn = document.getElementById('copy-room-id');
    const sendMessageBtn = document.getElementById('send-message');
    const messageInput = document.getElementById('message-input');
    const chatBox = document.getElementById('chat-box');

    let db;

    // Initialize IndexedDB
    initDB().then(database => {
        db = database;

        const urlParams = new URLSearchParams(window.location.search);
        const roomId = urlParams.get('room');
        const nickname = urlParams.get('nickname');
        roomIdElem.textContent = `Room ID: ${roomId}`;

        copyRoomIdBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(roomId);
            alert('Room ID copied to clipboard!');
        });

        // Function to display messages
        const displayMessages = () => {
            const chatTransaction = db.transaction('messages');
            const chatStore = chatTransaction.objectStore('messages');
            const messagesRequest = chatStore.getAll();

            messagesRequest.onsuccess = () => {
                const messages = messagesRequest.result.filter(msg => msg.roomId == roomId);
                chatBox.innerHTML = messages.map(msg => `<div><strong>${msg.nickname}:</strong> ${msg.text}</div>`).join('');
            };
        };

        // Fetch and Display Previous Messages
        displayMessages();

        // Send Message
        sendMessageBtn.addEventListener('click', () => {
            const message = messageInput.value.trim();
            if (message) {
                const chatTransaction = db.transaction('messages', 'readwrite');
                const chatStore = chatTransaction.objectStore('messages');
                const newMessage = { roomId, nickname, text: message };

                const request = chatStore.add(newMessage);

                request.onsuccess = () => {
                    messageInput.value = '';  // Clear input field
                    displayMessages();       // Update chat box
                    chatBox.scrollTop = chatBox.scrollHeight; // Scroll to the bottom
                };

                request.onerror = (event) => {
                    console.error('Error storing message:', event.target.errorCode);
                };
            }
        });

        // Handle message input on Enter key press
        messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                sendMessageBtn.click();
            }
        });
    }).catch(error => {
        console.error('Database error:', error);
    });
});