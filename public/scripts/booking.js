let startDate = new Date();
let bookedSlots = {};
let currentUser = {};

async function getRealTime() {
    const response = await fetch('http://worldtimeapi.org/api/timezone/Europe/Athens');
    const data = await response.json();
    return new Date(data.utc_datetime);
}

async function fetchBookings() {
    try {
        const response = await fetch('/bookings/bookings');
        const bookings = await response.json();
        return bookings;
    } catch (error) {
        console.error('Error fetching bookings:', error);
        return [];
    }
}

async function fetchCurrentUser() {
    try {
        const response = await fetch('/users/current');
        const user = await response.json();
        return user;
    } catch (error) {
        console.error('Error fetching current user:', error);
        return null;
    }
}

async function updateGanttChart() {
    const ganttChart = document.getElementById('ganttChart');
    const selectedDate = new Date(document.getElementById('datepicker').value);
    const realNow = await getRealTime();

    startDate = new Date(selectedDate);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    const bookings = await fetchBookings();

    ganttChart.innerHTML = '';

    const table = document.createElement('table');
    ganttChart.appendChild(table);

    const headerRow = table.insertRow();
    headerRow.insertCell().textContent = 'Time';
    let currentDate = new Date(startDate);
    for (let i = 0; i < 7; i++) {
        const cell = headerRow.insertCell();
        const dateString = currentDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        cell.textContent = dateString;
        currentDate.setDate(currentDate.getDate() + 1);
    }

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

            // Check if the cell's date and time is in the past
            if (cellDate < realNow || (cellDate.toDateString() === realNow.toDateString() && cellDate.getHours() <= realNow.getHours())) {
                cell.style.backgroundColor = "#e0e0e0";
                cell.style.cursor = "not-allowed";
                cell.removeEventListener('click', handleCellClick);
            }

            const booking = bookings.find(booking => booking.date === cell.dataset.date && booking.hour === cell.dataset.hour);
            if (booking) {
                const userColor = booking.color; // Get the color from the booking
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

                if (booking.user_id === currentUser.id) {
                    cell.style.cursor = "pointer";
                    cell.addEventListener('click', handleBookedCellClick);
                } else {
                    cell.removeEventListener('click', handleCellClick);
                }
            }
        }
    }
}

async function handleCellClick(event) {
    const realNow = await getRealTime();
    const cellDate = new Date(event.target.dataset.date);
    const cellHour = parseInt(event.target.dataset.hour, 10);

    if (cellDate < realNow && cellDate.getDate() === realNow.getDate() && cellHour <= realNow.getHours()) {
        alert('You cannot select a past time.');
        return;
    }

    const cell = event.target;
    cell.classList.toggle('selected');

    const selectedCells = Array.from(document.querySelectorAll('td.selected'));
    const cellsInColumn = selectedCells.filter(selectedCell => selectedCell.cellIndex === cell.cellIndex);

    if (cellsInColumn.length > 3) {
        cell.classList.remove('selected');
        alert('You cannot select more than 3 time slots for a day.');
    }
}

async function handleBookedCellClick(event) {
    const cell = event.target.closest('td');
    const date = cell.dataset.date;
    const hour = cell.dataset.hour;

    try {
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
        console.error('Error cancelling booking:', error);
        alert('An error occurred while cancelling the booking.');
    }
}

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

    const weekStartDate = new Date(startDate);
    const weekEndDate = new Date(startDate);
    weekEndDate.setDate(weekEndDate.getDate() + 6);
    const weekKey = `${weekStartDate.toISOString().slice(0, 10)}_${weekEndDate.toISOString().split('T')[0]}`;
    if (!bookedSlots[weekKey]) {
        bookedSlots[weekKey] = {};
    }
    selectedCells.forEach(cell => {
        const hour = parseInt(cell.dataset.hour);
        const dayIndex = cell.cellIndex - 1;
        if (!bookedSlots[weekKey][hour]) {
            bookedSlots[weekKey][hour] = {};
        }
        bookedSlots[weekKey][hour][dayIndex] = true;
    });

    const bookings = selectedCells.map(cell => ({
        date: cell.dataset.date,
        hour: cell.dataset.hour
    }));

    try {
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
        }
    } catch (error) {
        console.error('Error booking session:', error);
        alert('An error occurred while booking the session.');
    }
}

document.addEventListener('DOMContentLoaded', async function() {
    currentUser = await fetchCurrentUser(); // Get the current user
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

