

document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.getElementById('search-form');
    const updateForm = document.getElementById('update-form');
    const roomDetails = document.getElementById('room-details');
    const searchRoomIdInput = document.getElementById('search-room-id');
    const updateChatNameInput = document.getElementById('update-chat-name');
    const updateChatCodeInput = document.getElementById('update-chat-code');
    const updateDescriptionInput = document.getElementById('update-description');
    const deleteRoomBtn = document.getElementById('delete-room');

    let db;

    // Initialize IndexedDB
    initDB().then(database => {
        db = database;

        // Search for Room
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const roomId = Number(searchRoomIdInput.value);

            const transaction = db.transaction('rooms');
            const store = transaction.objectStore('rooms');
            const request = store.get(roomId);

            request.onsuccess = () => {
                if (request.result) {
                    const room = request.result;
                    updateChatNameInput.value = room.name;
                    updateChatCodeInput.value = room.code;
                    updateDescriptionInput.value = room.description;
                    roomDetails.style.display = 'block';
                } else {
                    alert('Room not found');
                }
            };
        });

        // Update Room
        updateForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const roomId = Number(searchRoomIdInput.value);
            const name = updateChatNameInput.value.trim();
            const code = updateChatCodeInput.value.trim();
            const description = updateDescriptionInput.value.trim();

            const transaction = db.transaction('rooms', 'readwrite');
            const store = transaction.objectStore('rooms');
            const request = store.put({ id: roomId, name, code, description });

            request.onsuccess = () => {
                alert('Room updated successfully');
            };

            request.onerror = (event) => {
                console.error('Error updating room:', event.target.errorCode);
            };
        });

        // Delete Room
        deleteRoomBtn.addEventListener('click', () => {
            const roomId = Number(searchRoomIdInput.value);

            if (confirm('Are you sure you want to delete this room?')) {
                const transaction = db.transaction('rooms', 'readwrite');
                const store = transaction.objectStore('rooms');
                const request = store.delete(roomId);

                request.onsuccess = () => {
                    alert('Room deleted successfully');
                    updateChatNameInput.value = '';
                    updateChatCodeInput.value = '';
                    updateDescriptionInput.value = '';
                    roomDetails.style.display = 'none';
                };

                request.onerror = (event) => {
                    console.error('Error deleting room:', event.target.errorCode);
                };
            }
        });
    }).catch(error => {
        console.error('Database error:', error);
    });
});