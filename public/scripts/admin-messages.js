// Συνάρτηση για την προβολή μηνύματος με βάση το ID του
async function viewMessage(id) {
    try {
        // Κάνουμε fetch το μήνυμα από το endpoint του server χρησιμοποιώντας το ID
        const response = await fetch(`/admin/messages/view/${id}`);
        const message = await response.json();
        
        // Ενημερώνουμε το περιεχόμενο του στοιχείου 'messageDetails' με το κείμενο του μηνύματος
        const messageDetails = document.getElementById('messageDetails');
        messageDetails.textContent = message.message;
        
        // Εμφανίζουμε το modal για να προβάλλουμε το μήνυμα
        const modal = document.getElementById('messageModal');
        modal.style.display = 'block';
    } catch (error) {
        // Σε περίπτωση σφάλματος, καταγράφουμε το σφάλμα στην κονσόλα
        console.error('Error viewing message:', error);
    }
}

// Συνάρτηση για το κλείσιμο του modal
function closeModal() {
    // Κρύβουμε το modal
    const modal = document.getElementById('messageModal');
    modal.style.display = 'none';
    
    // Καθαρίζουμε το περιεχόμενο του στοιχείου 'messageDetails'
    document.getElementById('messageDetails').textContent = '';
}

// Κλείσιμο του modal όταν ο χρήστης κάνει κλικ έξω από αυτό
window.onclick = function(event) {
    const modal = document.getElementById('messageModal');
    if (event.target === modal) {
        closeModal();
    }
}



