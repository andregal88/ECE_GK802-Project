import db from '../db.mjs';
import fetch from 'node-fetch';

// Αποθηκεύει ένα νέο μήνυμα και το στέλνει μέσω Web3Forms API
export async function saveMessage(req, res) {
    const { fullname, email, subject, message } = req.body;

    try {
        // Αποθήκευση στη βάση δεδομένων
        const stmt = db.prepare(`INSERT INTO messages (fullname, email, subject, message) VALUES (?, ?, ?, ?)`);
        stmt.run(fullname, email, subject, message);

        // Προετοιμασία των δεδομένων για αποστολή στο Web3Forms API
        const formData = new URLSearchParams();
        formData.append('access_key', 'dc174a71-952c-4137-bc43-78d3398ae2dc');
        formData.append('fullname', fullname);
        formData.append('email', email);
        formData.append('subject', subject);
        formData.append('message', message);

        // Αποστολή των δεδομένων στο Web3Forms API
        const response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            body: formData,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        if (response.ok) {
            res.redirect('/contact?success=true');
        } else {
            console.error('Error sending message to Web3Forms:', response.statusText);
            res.redirect('/contact?error=true');
        }
    } catch (error) {
        console.error('Error saving message or sending to Web3Forms:', error);
        res.redirect('/contact?error=true');
    }
}

// Επιστρέφει όλα τα μηνύματα στον admin
export async function getMessages(req, res) {
    try {
        const messages = db.prepare('SELECT id, fullname, email, subject FROM messages').all();
        res.render('admin/messages', { messages });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).send('Internal Server Error');
    }
}

// Διαγράφει ένα μήνυμα
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

// Επιστρέφει το περιεχόμενο ενός μηνύματος
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

