import express from 'express';
import { saveMessage, getMessages, deleteMessage, viewMessage } from '../controllers/MessageController.mjs';
const router = express.Router();

router.post('/contact', saveMessage);
router.get('/messages', getMessages);
router.post('/admin/messages/delete/:id', deleteMessage);
router.get('/admin/messages/view/:id', viewMessage);

export default router;
