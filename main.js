document.addEventListener('DOMContentLoaded', () => {
    const joinForm = document.getElementById('join-form');
    const createForm = document.getElementById('create-form');
    const copyRoomIdBtn = document.getElementById('copy-room-id');
    const roomIdDisplay = document.getElementById('room-id-display');
    const roomIdInput = document.getElementById('room-id-value');
    
    let db;

    // Initialize IndexedDB
    initDB().then(database => {
        db = database;

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
    }).catch(error => {
        console.error('Database error:', error);
    });
});