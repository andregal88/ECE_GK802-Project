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
        const response = await fetch('/admin/bookings');
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
            cell.addEventListener('click', handleCellClick);

            // Αν το cell είναι στο παρελθόν, το γκριζάρουμε και απενεργοποιούμε το click
            if (cellDate < realNow || (cellDate.toDateString() === realNow.toDateString() && cellDate.getHours() <= realNow.getHours())) {
                cell.style.backgroundColor = "#e0e0e0";
                cell.style.cursor = "not-allowed";
                cell.removeEventListener('click', handleCellClick);
            }

            // Αν υπάρχει booking για το συγκεκριμένο slot, το επισημαίνουμε
            const booking = bookings.find(booking => booking.date === cell.dataset.date && booking.hour === cell.dataset.hour);
            if (booking) {
                const userColor = booking.color;
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

                // Αν το booking είναι του τρέχοντα χρήστη ή admin, επιτρέπουμε την επεξεργασία
                if (booking.user_id === currentUser.id || booking.user_id === -1) {
                    cell.style.cursor = "pointer";
                    cell.addEventListener('click', handleBookedCellClick);
                } else {
                    cell.removeEventListener('click', handleCellClick);
                }

                // Αν το cell είναι στο παρελθόν, το γκριζάρουμε
                if (cellDate < realNow || (cellDate.toDateString() === realNow.toDateString() && cellDate.getHours() <= realNow.getHours())) {
                    cell.style.backgroundColor = "#e0e0e0";
                    cell.style.cursor = "not-allowed";
                    cell.removeEventListener('click', handleCellClick);
                    cell.textContent = '';
                }
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
}

// Συνάρτηση για τη διαχείριση του click σε κρατημένο cell
async function handleBookedCellClick(event) {
    const cell = event.target.closest('td');
    const date = cell.dataset.date;
    const hour = cell.dataset.hour;

    try {
        // Κάνουμε POST αίτημα για να αποδεσμεύσουμε το slot
        const response = await fetch('/admin/unblock', {
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
            alert(`Failed to unblock slot: ${result.message}`);
        }
    } catch (error) {
        // Σε περίπτωση σφάλματος, εμφανίζουμε μήνυμα σφάλματος
        console.error('Error unblocking slot:', error);
        alert('An error occurred while unblocking the slot.');
    }
}

// Συνάρτηση για να κλείσουμε (block) τα επιλεγμένα slots
async function blockCells() {
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
        const response = await fetch('/admin/block', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ bookings })
        });

        const result = await response.json();
        if (result.success) {
            alert('Slots blocked successfully!');
            updateGanttChart();
        } else {
            alert(`Failed to block slots: ${result.message}`);
        }
    } catch (error) {
        // Σε περίπτωση σφάλματος, εμφανίζουμε μήνυμα σφάλματος
        console.error('Error blocking slots:', error);
        alert('An error occurred while blocking the slots.');
    }
}

// Συνάρτηση που εκτελείται όταν φορτώνεται η σελίδα
document.addEventListener('DOMContentLoaded', async function() {
    currentUser = await fetchCurrentUser();
    const realNow = await getRealTime();
    document.getElementById('datepicker').valueAsDate = realNow;
    document.getElementById('datepicker').min = realNow.toISOString().split('T')[0];
    updateGanttChart();
});

// Προσθήκη event listeners για τα κουμπιά και το datepicker
document.getElementById('blockBtn').addEventListener('click', blockCells);
document.getElementById('datepicker').addEventListener('change', updateGanttChart);


















