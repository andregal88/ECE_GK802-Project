import express from 'express';
const router = express.Router();

router.get('/', (req, res) => res.render('index', { css: 'index-style.css' }));
router.get('/login', (req, res) => res.render('login', { css: 'login-style.css' }));

router.get('/booking', (req, res) => {
    if (req.session.user) {
        res.render('user-bookings', { css: 'booking-style.css' });
    } else if (req.session.admin) {
        res.render('admin/admin-bookings', { css: 'booking-style.css' });
    } else {
        res.redirect('/login');
    }
});

router.get('/contact', (req, res) => res.render('contact-us', { css: 'contact-us.css' }));
router.get('/admin_login', (req, res) => res.render('admin/admin_login', { css: 'admin_login-style.css' }));

export default router;










