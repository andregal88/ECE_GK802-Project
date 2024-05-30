async function viewMessage(id) {
    try {
        const response = await fetch(`/admin/messages/view/${id}`);
        const message = await response.json();
        
        const messageDetails = document.getElementById('messageDetails');
        messageDetails.textContent = message.message;  
        
        const modal = document.getElementById('messageModal');
        modal.style.display = 'block';
    } catch (error) {
        console.error('Error viewing message:', error);
    }
}

function closeModal() {
    const modal = document.getElementById('messageModal');
    modal.style.display = 'none';
    document.getElementById('messageDetails').textContent = ''; 
}


window.onclick = function(event) {
    const modal = document.getElementById('messageModal');
    if (event.target === modal) {
        closeModal();
    }
}



