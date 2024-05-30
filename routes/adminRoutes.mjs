import { Router } from 'express';
import {
    adminLogin,
    adminLogout,
    getMessages,
    getAdminBookings,
    blockCells,
    unblockCells,
    getBookings
} from '../controllers/AdminController.mjs';

const router = Router();


router.post('/login', adminLogin);
router.get('/logout', adminLogout);
router.get('/messages', getMessages);
router.get('/admin-bookings', getAdminBookings);
router.post('/block', blockCells);
router.post('/unblock', unblockCells);
router.get('/bookings', getBookings);

export default router;



