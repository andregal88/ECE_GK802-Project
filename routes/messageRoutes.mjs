import express from 'express';
import { saveMessage, getMessages } from '../controllers/MessageController.mjs';
const router = express.Router();

router.post('/contact', saveMessage);
router.get('/messages', getMessages);

export default router;
