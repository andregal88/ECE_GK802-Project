import bcrypt from 'bcrypt';
import db from './db.mjs';

const saltRounds = 10;
const adminUsername = 'admin';
const adminPassword = '1234';

async function createAdminUser() {
    try {
        const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);
        const stmt = db.prepare('INSERT INTO admin (username,firstname,lastname, email, password) VALUES (?, ? , ?, ?, ?)');
        stmt.run(adminUsername, 'Δημητρης','Αντρεας','webdevproject.team12@gmail.com', hashedPassword);
        console.log('Admin user created successfully');
    } catch (error) {
        console.error('Error creating admin user:', error);
    }
}

createAdminUser();