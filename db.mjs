import Database from 'better-sqlite3';

const db = new Database('database.sqlite', { verbose: console.log });

db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fullname TEXT NOT NULL,
        email TEXT NOT NULL,
        subject TEXT NOT NULL,
        message TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        firstname TEXT NOT NULL,
        lastname TEXT NOT NULL,
        email TEXT NOT NULL,
        password TEXT NOT NULL,
        color TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS admin (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        firstname TEXT NOT NULL,
        lastname TEXT NOT NULL,
        email TEXT NOT NULL,
        password TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        date TEXT NOT NULL,
        hour TEXT NOT NULL,
        firstname TEXT,
        lastname TEXT,
        color TEXT NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id)
    );
    INSERT OR IGNORE INTO users (id, username, firstname, lastname, email, password, color)
    VALUES (-1, 'maintenance', 'Κλειστό', 'Λόγω Συντήρησης', 'maintenance@example.com', '', '#000000');
`);

export default db;





