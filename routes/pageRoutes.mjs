import express from 'express';
const router = express.Router();

// Middleware για έλεγχο αν ο χρήστης είναι ήδη συνδεδεμένος
function redirectIfLoggedIn(req, res, next) {
    if (req.session && req.session.user) {
        return res.redirect('/'); // Ανακατεύθυνση στην αρχική σελίδα
    }
    next();
}

// Middleware για έλεγχο αν ο admin είναι ήδη συνδεδεμένος
function redirectIfAdminLoggedIn(req, res, next) {
    if (req.session && req.session.admin) {
        return res.redirect('/'); // Ανακατεύθυνση στην αρχική σελίδα
    }
    next();
}

// Middleware για έλεγχο αν ο admin προσπαθεί να έχει πρόσβαση σε μη επιτρεπόμενες σελίδες
function restrictAdminAccess(req, res, next) {
    if (req.session && req.session.admin) {
        return res.redirect('/'); // Ανακατεύθυνση στην αρχική σελίδα
    }
    next();
}

// Middleware για έλεγχο αν ο χρήστης προσπαθεί να έχει πρόσβαση σε admin σελίδες
function restrictUserAccess(req, res, next) {
    if (req.session && req.session.user) {
        return res.redirect('/'); // Ανακατεύθυνση στην αρχική σελίδα
    }
    next();
}

router.get('/', (req, res) => res.render('index', { css: 'index-style.css' }));

// Χρησιμοποιήστε το middleware για έλεγχο πριν από την πρόσβαση στις σελίδες login και admin_login
router.get('/login', redirectIfLoggedIn, restrictAdminAccess, (req, res) => res.render('login', { css: 'login-style.css' }));
router.get('/admin_login', redirectIfAdminLoggedIn, restrictUserAccess, (req, res) => res.render('admin/admin_login', { css: 'admin_login-style.css' }));

router.get('/booking', (req, res) => {
    if (req.session.user) {
        res.render('user-bookings', { css: 'booking-style.css' });
    } else if (req.session.admin) {
        res.render('admin/admin-bookings', { css: 'booking-style.css' });
    } else {
        res.redirect('/login');
    }
});

// Χρησιμοποιήστε το middleware για έλεγχο πριν από την πρόσβαση στη σελίδα contact από admin
router.get('/contact', restrictAdminAccess, (req, res) => res.render('contact-us', { css: 'contact-us.css' }));

export default router;













