import express from 'express';
import { registerUser, loginUser, logoutUser, getCurrentUser } from '../controllers/UserController.mjs';
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/logout', logoutUser);
router.get('/current', getCurrentUser);

export default router;


