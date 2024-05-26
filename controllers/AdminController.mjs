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
            res.render('admin_login', { css: 'admin_login-style.css', error: 'Invalid credentials' });
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