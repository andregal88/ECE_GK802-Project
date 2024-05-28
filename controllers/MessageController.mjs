import db from '../db.mjs';

export const saveMessage = (req, res) => {
    const { fullname,email, subject, message } = req.body;
    const stmt = db.prepare('INSERT INTO messages ( fullname, email, subject, message) VALUES (?, ?, ?, ?)');
    stmt.run( fullname,email, subject, message);
    res.redirect('/contact');
};

export const getMessages = (req, res) => {
    const stmt = db.prepare('SELECT * FROM messages');
    const messages = stmt.all();
    res.json(messages);
};

