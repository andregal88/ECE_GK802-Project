import express from 'express';
import { engine } from 'express-handlebars';
import session from 'express-session';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes.mjs';
import pageRoutes from './routes/pageRoutes.mjs';
import adminRoutes from './routes/adminRoutes.mjs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.engine('.hbs', engine({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: 'views/layouts/'
}));
app.set('view engine', '.hbs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 3600000, sameSite: true }
}));

// Middleware για έλεγχο αν ο χρήστης είναι συνδεδεμένος
app.use((req, res, next) => {
    res.locals.user = req.session.user;
    res.locals.admin = req.session.admin;
    next();
});

// Routes
app.use('/users', userRoutes);
app.use('/', pageRoutes);
app.use('/admin', adminRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});














