import db from '../db.mjs';

export async function saveMessage(req, res) {
    const { fullname, email, subject, message } = req.body;

    try {
        const stmt = db.prepare(`INSERT INTO messages (fullname, email, subject, message) VALUES (?, ?, ?, ?)`);
        stmt.run(fullname, email, subject, message);
        res.redirect('/contact?success=true');
    } catch (error) {
        console.error('Error saving message:', error);
        res.redirect('/contact?error=true');
    }
}

export async function getMessages(req, res) {
    try {
        const messages = db.prepare('SELECT id, fullname, email, subject FROM messages').all();
        res.render('admin/messages', { messages });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).send('Internal Server Error');
    }
}

export async function deleteMessage(req, res) {
    const messageId = req.params.id;

    try {
        db.prepare('DELETE FROM messages WHERE id = ?').run(messageId);
        res.redirect('/admin/messages');
    } catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).send('Internal Server Error');
    }
}

export async function viewMessage(req, res) {
    const messageId = req.params.id;

    try {
        const message = db.prepare('SELECT message FROM messages WHERE id = ?').get(messageId);
        res.json(message);
    } catch (error) {
        console.error('Error viewing message:', error);
        res.status(500).send('Internal Server Error');
    }
}

