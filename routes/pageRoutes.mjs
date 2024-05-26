import express from 'express';
const router = express.Router();

router.get('/', (req, res) => res.render('index', { css: 'index-style.css' }));
router.get('/login', (req, res) => res.render('login', { css: 'login-style.css' }));
router.get('/booking', (req, res) => res.render('bookings', { css: 'booking-style.css' }));
router.get('/contact', (req, res) => res.render('contact-us', { css: 'contact-us.css' }));

export default router;









