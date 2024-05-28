import db from '../db.mjs';
import bcrypt from 'bcrypt';
import randomColor from 'randomcolor';

export const registerUser = (req, res) => {
    const { username, password, firstname, lastname, email } = req.body;

    const userExists = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    if (userExists) {
        return res.render('register', { error: 'Username already exists' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const userColor = randomColor(); // Generate a random color for the user

    try {
        db.prepare('INSERT INTO users (username, password, firstname, lastname, email, color) VALUES (?, ?, ?, ?, ?, ?)')
          .run(username, hashedPassword, firstname, lastname, email, userColor);
        res.redirect('/login');
    } catch (error) {
        console.error('Error registering user:', error);
        res.render('register', { error: 'Error registering user' });
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
            res.render('login', { css: 'login-style.css', error: 'Invalid username or password' });
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

export const getCurrentUser = (req, res) => {
    if (req.session && req.session.user) {
        res.json(req.session.user);
    } else {
        res.status(401).json({ error: 'User not logged in' });
    }
};
