import { Router } from 'express';
import {
    createBooking,
    getBookings,
    deleteBooking
} from '../controllers/BookingController.mjs';

const router = Router();

router.post('/book', createBooking);
router.get('/bookings', getBookings);
router.post('/delete', deleteBooking);

export default router;







