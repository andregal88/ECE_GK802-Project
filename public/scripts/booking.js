// Αρχικοποίηση της τρέχουσας ημερομηνίας
let startDate = new Date();
// Αντικείμενο για να αποθηκεύουμε τα κρατημένα slots
let bookedSlots = {};
// Αντικείμενο για να αποθηκεύουμε τον τρέχοντα χρήστη
let currentUser = {};

// API για να εξασφαλίσουμε ότι το Gantt Chart δουλεύει με την πραγματική ώρα και όχι την ώρα της συσκευής
async function getRealTime() {
    // Κάνουμε fetch από το worldtimeapi για την ώρα της Αθήνας
    const response = await fetch('https://worldtimeapi.org/api/timezone/Europe/Athens');
    const data = await response.json();
    // Επιστρέφουμε την πραγματική ώρα σε μορφή Date object
    return new Date(data.utc_datetime);
}

// Συνάρτηση για να κάνουμε fetch τα bookings από τον server
async function fetchBookings() {
    try {
        // Κάνουμε fetch τα bookings από το endpoint του server
        const response = await fetch('/bookings/bookings');
        const bookings = await response.json();
        // Επιστρέφουμε τα bookings ως JSON
        return bookings;
    } catch (error) {
        // Σε περίπτωση σφάλματος, καταγράφουμε το σφάλμα και επιστρέφουμε έναν κενό πίνακα
        console.error('Error fetching bookings:', error);
        return [];
    }
}

// Συνάρτηση για να κάνουμε fetch τον τρέχοντα χρήστη από τον server
async function fetchCurrentUser() {
    try {
        // Κάνουμε fetch τα δεδομένα του τρέχοντα χρήστη από το endpoint του server
        const response = await fetch('/users/current');
        const user = await response.json();
        // Επιστρέφουμε τα δεδομένα του χρήστη ως JSON
        return user;
    } catch (error) {
        // Σε περίπτωση σφάλματος, καταγράφουμε το σφάλμα και επιστρέφουμε null
        console.error('Error fetching current user:', error);
        return null;
    }
}

// Συνάρτηση για να διαγράψουμε κρατήσεις που είναι στο παρελθόν
async function deletePastBooking(date, hour) {
    try {
        // Κάνουμε POST αίτημα για να διαγράψουμε την κράτηση που είναι στο παρελθόν
        await fetch('/bookings/delete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ date, hour })
        });
    } catch (error) {
        // Σε περίπτωση σφάλματος, καταγράφουμε το σφάλμα
        console.error('Error deleting past booking:', error);
    }
}

// Συνάρτηση για να ενημερώνουμε το Gantt Chart
async function updateGanttChart() {
    // Επιλέγουμε το στοιχείο Gantt Chart από το DOM
    const ganttChart = document.getElementById('ganttChart');
    // Παίρνουμε την επιλεγμένη ημερομηνία από το datepicker
    const selectedDate = new Date(document.getElementById('datepicker').value);
    // Παίρνουμε την πραγματική ώρα
    const realNow = await getRealTime();

    // Υπολογίζουμε την αρχική ημερομηνία για το Gantt Chart
    startDate = new Date(selectedDate);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    // Κάνουμε fetch τα bookings
    const bookings = await fetchBookings();

    // Καθαρίζουμε το περιεχόμενο του Gantt Chart
    ganttChart.innerHTML = '';

    // Δημιουργούμε έναν πίνακα (table) για το Gantt Chart
    const table = document.createElement('table');
    ganttChart.appendChild(table);

    // Δημιουργούμε την πρώτη σειρά (header) με τις ημέρες της εβδομάδας
    const headerRow = table.insertRow();
    headerRow.insertCell().textContent = 'Time';
    let currentDate = new Date(startDate);
    for (let i = 0; i < 7; i++) {
        const cell = headerRow.insertCell();
        const dateString = currentDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        cell.textContent = dateString;
        currentDate.setDate(currentDate.getDate() + 1);
    }

    // Δημιουργούμε τις υπόλοιπες σειρές για τις ώρες από 12:00 έως 21:00
    for (let hour = 12; hour < 21; hour++) {
        const row = table.insertRow();
        const hourString = `${hour}:00 - ${hour + 1}:00`;
        row.insertCell().textContent = hourString;
        for (let i = 0; i < 7; i++) {
            const cell = row.insertCell();
            const cellDate = new Date(startDate);
            cellDate.setDate(cellDate.getDate() + i);
            cellDate.setHours(hour);

            cell.dataset.date = cellDate.toISOString().split('T')[0];
            cell.dataset.hour = hour;

            // Ελέγχουμε αν το cell είναι στο παρελθόν
            if (cellDate < realNow || (cellDate.toDateString() === realNow.toDateString() && cellDate.getHours() <= realNow.getHours())) {
                deletePastBooking(cell.dataset.date, cell.dataset.hour);
                cell.style.backgroundColor = "#e0e0e0";
                cell.style.cursor = "not-allowed";
                cell.removeEventListener('click', handleCellClick);
                continue;
            }

            // Αν υπάρχει booking για το συγκεκριμένο slot, το επισημαίνουμε
            const booking = bookings.find(booking => booking.date === cell.dataset.date && booking.hour === cell.dataset.hour);
            if (booking) {
                const userColor = booking.color; // Παίρνουμε το χρώμα από το booking
                cell.classList.add('booked');
                cell.style.backgroundColor = userColor;
                cell.style.cursor = "not-allowed";

                const nameDiv = document.createElement('div');
                nameDiv.textContent = `${booking.firstname} ${booking.lastname}`;
                nameDiv.style.color = "#ffffff";
                nameDiv.style.fontSize = "12px";
                nameDiv.style.whiteSpace = "nowrap";
                nameDiv.style.overflow = "hidden";
                nameDiv.style.textOverflow = "ellipsis";
                cell.appendChild(nameDiv);

                // Αν το booking είναι του τρέχοντα χρήστη, επιτρέπουμε την επεξεργασία
                if (booking.user_id === currentUser.id) {
                    cell.style.cursor = "pointer";
                    cell.addEventListener('click', handleBookedCellClick);
                } else {
                    cell.removeEventListener('click', handleCellClick);
                }
            } else {
                cell.addEventListener('click', handleCellClick);
            }
        }
    }
}

// Συνάρτηση για τη διαχείριση του click σε ελεύθερο cell
async function handleCellClick(event) {
    // Παίρνουμε την πραγματική ώρα
    const realNow = await getRealTime();
    const cellDate = new Date(event.target.dataset.date);
    const cellHour = parseInt(event.target.dataset.hour, 10);

    // Αν το cell είναι στο παρελθόν, εμφανίζουμε μήνυμα και σταματάμε την επεξεργασία
    if (cellDate < realNow && cellDate.getDate() === realNow.getDate() && cellHour <= realNow.getHours()) {
        alert('You cannot select a past time.');
        return;
    }

    // Εναλλαγή της κλάσης 'selected' στο cell
    const cell = event.target;
    cell.classList.toggle('selected');

    // Ελέγχουμε αν έχουν επιλεγεί περισσότερα από 3 slots στην ίδια στήλη
    const selectedCells = Array.from(document.querySelectorAll('td.selected'));
    const cellsInColumn = selectedCells.filter(selectedCell => selectedCell.cellIndex === cell.cellIndex);

    if (cellsInColumn.length > 3) {
        cell.classList.remove('selected');
        alert('You cannot select more than 3 time slots for a day.');
    }
}

// Συνάρτηση για τη διαχείριση του click σε κρατημένο cell
async function handleBookedCellClick(event) {
    const cell = event.target.closest('td');
    const date = cell.dataset.date;
    const hour = cell.dataset.hour;

    try {
        // Κάνουμε POST αίτημα για να διαγράψουμε την κράτηση
        const response = await fetch('/bookings/delete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ date, hour })
        });

        const result = await response.json();
        if (result.success) {
            updateGanttChart();
        } else {
            alert(`Failed to cancel booking: ${result.message}`);
        }
    } catch (error) {
        // Σε περίπτωση σφάλματος, εμφανίζουμε μήνυμα σφάλματος
        console.error('Error cancelling booking:', error);
        alert('An error occurred while cancelling the booking.');
    }
}

// Συνάρτηση για να κλείσουμε (book) τα επιλεγμένα slots
async function bookSession() {
    const selectedDate = document.getElementById('datepicker').value;
    if (!selectedDate) {
        alert('Please select a date.');
        return;
    }

    const selectedCells = Array.from(document.querySelectorAll('td.selected'));
    if (selectedCells.length === 0) {
        alert('Please select a time slot.');
        return;
    }

    // Δημιουργούμε λίστα με τα επιλεγμένα slots
    const bookings = selectedCells.map(cell => ({
        date: cell.dataset.date,
        hour: cell.dataset.hour
    }));

    try {
        // Κάνουμε POST αίτημα για να κλείσουμε τα επιλεγμένα slots
        const response = await fetch('/bookings/book', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ bookings })
        });

        const result = await response.json();
        if (result.success) {
            alert('Booking successful!');
            updateGanttChart();
        } else {
            alert(`Booking failed: ${result.message}`);
            updateGanttChart(); // Ενημέρωση για να αφαιρεθούν τα επιλεγμένα slots που δεν κρατήθηκαν
        }
    } catch (error) {
        // Σε περίπτωση σφάλματος, εμφανίζουμε μήνυμα σφάλματος
        console.error('Error booking session:', error);
        alert('An error occurred while booking the session.');
    }
}

// Συνάρτηση που εκτελείται όταν φορτώνεται η σελίδα
document.addEventListener('DOMContentLoaded', async function() {
    currentUser = await fetchCurrentUser(); // Παίρνουμε τα δεδομένα του τρέχοντα χρήστη
    const realNow = await getRealTime();
    document.getElementById('datepicker').valueAsDate = realNow;
    document.getElementById('datepicker').min = realNow.toISOString().split('T')[0];
    updateGanttChart();
});
















// async function getRealTime() {
//     // Fetch current time from a reliable API (e.g., World Time API)
//     // Commenting out the real fetch for example purposes, as we don't have internet access
//     const response = await fetch('http://worldtimeapi.org/api/timezone/Europe/Athens');
//     const data = await response.json();
//     return new Date(data.utc_datetime);
// }

