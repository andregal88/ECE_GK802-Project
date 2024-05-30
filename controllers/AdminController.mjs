import bcrypt from 'bcrypt';
import db from '../db.mjs';

// Συνδέει τον admin
export const adminLogin = async (req, res) => {
    const { username, password } = req.body;

    try {
        const stmt = db.prepare('SELECT * FROM admin WHERE username = ?');
        const admin = stmt.get(username);

        if (admin && await bcrypt.compare(password, admin.password)) {
            req.session.admin = admin;
            res.redirect('/');
        } else {
            res.redirect('/admin_login');
        }
    } catch (error) {
        console.error('Error logging in admin:', error);
        res.render('admin/admin_login', { layout: 'main', error: 'An error occurred. Please try again.' });
    }
};

// Αποσυνδέει τον admin
export const adminLogout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error logging out admin:', err);
        }
        res.redirect('/');
    });
};

// Επιστρέφει όλα τα μηνύματα απο το contact form
export const getMessages = (req, res) => {
    if (!req.session.admin) {
        return res.redirect('/admin/login');
    }
    const messages = db.prepare('SELECT * FROM messages').all();
    res.render('admin/messages', { css: 'messages-style.css', isAdmin: true, messages });
};

// Επιστρέφει όλες τις κρατήσεις
export const getAdminBookings = async (req, res) => {
    if (!req.session.admin) {
        return res.redirect('/admin/login');
    }

    const bookings = db.prepare('SELECT bookings.*, users.firstname, users.lastname FROM bookings LEFT JOIN users ON bookings.user_id = users.id').all();
    res.render('admin/admin-bookings', { layout: 'main', css: 'admin-bookings.css', isAdmin: true, bookings });
};

// Κλείνει ένα slot για συντήρηση
export const blockSlot = async (req, res) => {
    const { date, hour } = req.body;

    try {
        // Ελέγχει αν το slot είναι ήδη κλεισμένο από άλλον χρήστη ή admin
        const existingBooking = db.prepare('SELECT * FROM bookings WHERE date = ? AND hour = ?').get(date, hour);
        if (existingBooking) {
            throw new Error(`The slot on ${date} at ${hour}:00 is already booked.`);
        }

        const stmt = db.prepare('INSERT INTO bookings (user_id, date, hour, color, firstname, lastname) VALUES (?, ?, ?, ?, ?, ?)');
        stmt.run(-1, date, hour, '#000000', 'Κλειστό', 'λόγω συντήρησης');
        res.json({ success: true });
    } catch (error) {
        console.error('Error blocking slot:', error);
        res.json({ success: false, message: 'Failed to block slot' });
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
        res.status(500).json({ message: 'Error fetching bookings' });
    }
};

// Κλείνει πολλαπλά slots για συντήρηση
export const blockCells = (req, res) => {
    const { bookings } = req.body;

    try {
        const insertBooking = db.transaction(() => {
            bookings.forEach(booking => {
                // Ελεγχει αν το cell ειναι ηδη κρατημενο απο αλλο user
                const existingBooking = db.prepare('SELECT * FROM bookings WHERE date = ? AND hour = ?').get(booking.date, booking.hour);
                if (existingBooking) {
                    throw new Error(`The slot on ${booking.date} at ${booking.hour}:00 is already booked.`);
                }

                db.prepare(`
                    INSERT INTO bookings (user_id, date, hour, firstname, lastname, color)
                    VALUES (-1, ?, ?, 'Κλειστό', 'Λόγω Συντήρησης', '#000000')
                `).run(booking.date, booking.hour);
            });
        });

        insertBooking();
        res.json({ success: true });
    } catch (error) {
        console.error('Error blocking cells:', error);
        res.status(500).json({ message: 'Error blocking cells' });
    }
};

// Απελευθερωνει slots που είναι κλεισμένα για συντήρηση
export const unblockCells = (req, res) => {
    const { date, hour } = req.body;

    try {
        db.prepare(`
            DELETE FROM bookings
            WHERE date = ? AND hour = ? AND user_id = -1
        `).run(date, hour);
        res.json({ success: true });
    } catch (error) {
        console.error('Error unblocking cells:', error);
        res.status(500).json({ message: 'Error unblocking cells' });
    }
};