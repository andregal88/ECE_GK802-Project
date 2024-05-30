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
        const response = await fetch('/admin/bookings');
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

            if (cellDate < realNow || (cellDate.toDateString() === realNow.toDateString() && cellDate.getHours() <= realNow.getHours())) {
                cell.style.backgroundColor = "#e0e0e0";
                cell.style.cursor = "not-allowed";
                cell.removeEventListener('click', handleCellClick);
            }

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

                if (booking.user_id === currentUser.id || booking.user_id === -1) {
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
}

async function handleBookedCellClick(event) {
    const cell = event.target.closest('td');
    const date = cell.dataset.date;
    const hour = cell.dataset.hour;

    try {
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
        console.error('Error unblocking slot:', error);
        alert('An error occurred while unblocking the slot.');
    }
}

async function blockCells() {
    const selectedCells = Array.from(document.querySelectorAll('td.selected'));
    if (selectedCells.length === 0) {
        alert('Please select a time slot.');
        return;
    }

    const bookings = selectedCells.map(cell => ({
        date: cell.dataset.date,
        hour: cell.dataset.hour
    }));

    try {
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
        console.error('Error blocking slots:', error);
        alert('An error occurred while blocking the slots.');
    }
}

document.addEventListener('DOMContentLoaded', async function() {
    currentUser = await fetchCurrentUser();
    const realNow = await getRealTime();
    document.getElementById('datepicker').valueAsDate = realNow;
    document.getElementById('datepicker').min = realNow.toISOString().split('T')[0];
    updateGanttChart();
});

document.getElementById('blockBtn').addEventListener('click', blockCells);
document.getElementById('datepicker').addEventListener('change', updateGanttChart);

















