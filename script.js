document.addEventListener('DOMContentLoaded', () => {
    const joinForm = document.getElementById('join-form');
    const createForm = document.getElementById('create-form');
    const copyRoomIdBtn = document.getElementById('copy-room-id');
    const sendMessageBtn = document.getElementById('send-message');
    const messageInput = document.getElementById('message-input');
    const chatBox = document.getElementById('chat-box');
    const roomIdElem = document.getElementById('room-id');
    const roomIdDisplay = document.getElementById('room-id-display');
    const roomIdInput = document.getElementById('room-id-value');
    
    const dbPromise = indexedDB.open('chatDB', 1);

    dbPromise.onupgradeneeded = (event) => {
        const db = event.target.result;
        db.createObjectStore('rooms', { keyPath: 'id' });
        db.createObjectStore('messages', { keyPath: 'id', autoIncrement: true });
    };

    dbPromise.onsuccess = (event) => {
        const db = event.target.result;

        // Join Chat Form Submission
        joinForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const roomId = document.getElementById('room-id').value;
            const roomCode = document.getElementById('room-code').value;
            const nickname = document.getElementById('nickname').value;

            const transaction = db.transaction('rooms');
            const store = transaction.objectStore('rooms');
            const request = store.get(Number(roomId));

            request.onsuccess = () => {
                if (request.result && request.result.code === roomCode) {
                    window.location.href = `chat.html?room=${roomId}&nickname=${nickname}`;
                } else {
                    alert('Invalid room ID or code');
                }
            };
        });

        // Create Chat Form Submission
        createForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const chatName = document.getElementById('chat-name').value;
            const chatCode = document.getElementById('chat-code').value;
            const description = document.getElementById('description').value;

            const transaction = db.transaction('rooms', 'readwrite');
            const store = transaction.objectStore('rooms');
            const roomId = Math.floor(Math.random() * 100000); // Generate a random room ID

            store.put({ id: roomId, name: chatName, code: chatCode, description });

            roomIdDisplay.textContent = `Room ID: ${roomId}`;
            roomIdInput.value = roomId;
        });

        // Chat Room Page
        if (roomIdElem) {
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
                        messageInput.value = '';
                        displayMessages(); // Refresh the messages list
                        chatBox.scrollTop = chatBox.scrollHeight;
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
        }
    };

    dbPromise.onerror = (event) => {
        console.error('Database error:', event.target.errorCode);
    };
});