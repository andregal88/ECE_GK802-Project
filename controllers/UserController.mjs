import bcrypt from 'bcrypt';
import db from '../db.mjs';

const saltRounds = 10;

export const registerUser = async (req, res) => {
    const { username,firstname,lastname, email, password } = req.body;

    try {
        const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
        const user = stmt.get(username);

        if (user) {
            // Αν υπάρχει ο χρήστης, κάνε redirect με μήνυμα σφάλματος
            return res.render('login', { css: 'login-style.css', error: 'Το username υπάρχει ήδη. Παρακαλώ δοκιμάστε άλλο.' });
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const insertStmt = db.prepare('INSERT INTO users (username,firstname, lastname, email, password) VALUES (?,?, ?, ?, ?)');
        insertStmt.run(username,firstname, lastname, email, hashedPassword);
        res.redirect('/login');
    } catch (error) {
        console.error('Error registering user:', error);
        res.redirect('/register');
    }
};

export const loginUser = async (req, res) => {
    const { username, password } = req.body;

    try {
        const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
        const user = stmt.get(username);

        if (user && await bcrypt.compare(password, user.password)) {
            req.session.user = user;
            res.redirect('/');
        } else {
            res.render('login', { css: 'login-style.css', error: 'Λανθασμένο username ή password.' });
        }
    } catch (error) {
        console.error('Error logging in user:', error);
        res.redirect('/login');
    }
};

export const logoutUser = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error logging out user:', err);
        }
        res.redirect('/');
    });
};



