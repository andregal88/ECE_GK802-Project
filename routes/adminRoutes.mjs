import express from 'express';
import { adminLogin, adminLogout, getMessages } from '../controllers/AdminController.mjs';
const router = express.Router();

const redirectIfNotAdmin = (req, res, next) => {
    if (!req.session.admin) {
        return res.redirect('/admin/login');
    }
    next();
};

router.get('/login', (req, res) => res.render('admin/admin_login', { layout: 'main' }));
router.post('/login', adminLogin);
router.get('/logout', adminLogout);
router.get('/messages', redirectIfNotAdmin, getMessages);


export default router;

