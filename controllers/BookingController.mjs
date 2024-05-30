import db from '../db.mjs';

// Δημιουργεί μια νέα κράτηση
export const createBooking = (req, res) => {
    const bookings = req.body.bookings;
    const userId = req.session.user.id;
    const user = db.prepare('SELECT color FROM users WHERE id = ?').get(userId);

    const bookingsPerDay = {};

    try {
        db.transaction(() => {
            bookings.forEach(booking => {
                if (!bookingsPerDay[booking.date]) {
                    bookingsPerDay[booking.date] = db.prepare('SELECT COUNT(*) AS count FROM bookings WHERE user_id = ? AND date = ?').get(userId, booking.date).count;
                }

                if (bookingsPerDay[booking.date] >= 3) {
                    throw new Error('Δεν μπορεις να κλείσεις πάνω απο 3 ώρες σε μια μέρα');
                }

                // Ελεγχει αν εχει ηδη γινει κρατηση απο αλλο user ή admin
                const existingBooking = db.prepare('SELECT * FROM bookings WHERE date = ? AND hour = ?').get(booking.date, booking.hour);
                if (existingBooking) {
                    throw new Error(`The slot on ${booking.date} at ${booking.hour}:00 is already booked.`);
                }

                db.prepare('INSERT INTO bookings (user_id, date, hour, color) VALUES (?, ?, ?, ?)').run(userId, booking.date, booking.hour, user.color);
                bookingsPerDay[booking.date]++;
            });
        })();
        res.json({ success: true });
    } catch (error) {
        console.error('Error creating booking:', error);
        res.json({ success: false, message: error.message || 'Error creating booking' });
    }
};

// Επιστρέφει όλες τις κρατήσεις
export const getBookings = (req, res) => {
    try {
        const bookings = db.prepare(`
            SELECT bookings.date, bookings.hour, bookings.color, users.firstname, users.lastname, bookings.user_id
            FROM bookings
            JOIN users ON bookings.user_id = users.id
        `).all();
        res.json(bookings);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ success: false, message: 'Error fetching bookings' });
    }
};

// Διαγράφει μια κράτηση
export const deleteBooking = (req, res) => {
    const { date, hour } = req.body;
    const userId = req.session.user.id;

    try {
        db.prepare('DELETE FROM bookings WHERE user_id = ? AND date = ? AND hour = ?').run(userId, date, hour);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting booking:', error);
        res.json({ success: false, message: 'Error deleting booking' });
    }
};












