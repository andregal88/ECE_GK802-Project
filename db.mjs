import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve('database.sqlite');
const db = new Database(dbPath, { verbose: console.log });

const createTables = () => {
    const createMessagesTable = `
    CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fullname TEXT NOT NULL,
        email TEXT NOT NULL,
        subject TEXT NOT NULL,
        message TEXT NOT NULL
    );`;

    const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        firstname TEXT NOT NULL,
        lastname TEXT NOT NULL,
        email TEXT NOT NULL,
        password TEXT NOT NULL
    );`;

    const createAdminTable = `
    CREATE TABLE IF NOT EXISTS admin (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        firstname TEXT NOT NULL,
        lastname TEXT NOT NULL,
        email TEXT NOT NULL,
        password TEXT NOT NULL
    );`;

    db.exec(createMessagesTable);
    db.exec(createUsersTable);
    db.exec(createAdminTable);

};

createTables();

export default db;



