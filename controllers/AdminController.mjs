import bcrypt from 'bcrypt';
import db from '../db.mjs';

export const adminLogin = async (req, res) => {
    const { username, password } = req.body;

    try {
        const stmt = db.prepare('SELECT * FROM admin WHERE username = ?');
        const admin = stmt.get(username);

        if (admin && await bcrypt.compare(password, admin.password)) {
            req.session.admin = admin;
            res.redirect('/');
        } else {
            res.render('admin/admin_login', { layout: 'main', error: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Error logging in admin:', error);
        res.redirect('/admin/login');
    }
};

export const adminLogout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error logging out admin:', err);
        }
        res.redirect('/');
    });
};

export const getMessages = (req, res) => {
    if (!req.session.admin) {
        return res.redirect('/admin/login');
    }
    const messages = db.prepare('SELECT * FROM messages').all();
    res.render('admin/messages', { css: 'messages-style.css', isAdmin: true, messages });
};

export const getAdminBookings = async (req, res) => {
    if (!req.session.admin) {
        return res.redirect('/admin/login');
    }

    const bookings = db.prepare('SELECT bookings.*, users.firstname, users.lastname FROM bookings LEFT JOIN users ON bookings.user_id = users.id').all();
    res.render('admin/admin-bookings', { layout: 'main', css: 'admin-bookings.css', isAdmin: true, bookings });
};

export const blockSlot = async (req, res) => {
    const { date, hour } = req.body;

    try {
        const stmt = db.prepare('INSERT INTO bookings (user_id, date, hour, color, firstname, lastname) VALUES (?, ?, ?, ?, ?, ?)');
        stmt.run(-1, date, hour, '#000000', 'Κλειστό', 'λόγω συντήρησης');
        res.json({ success: true });
    } catch (error) {
        console.error('Error blocking slot:', error);
        res.json({ success: false, message: 'Failed to block slot' });
    }
};

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

// Function to block cells for maintenance
export const blockCells = (req, res) => {
    const { bookings } = req.body;

    try {
        const insertBooking = db.transaction(() => {
            bookings.forEach(booking => {
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

// Function to unblock cells for maintenance
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




