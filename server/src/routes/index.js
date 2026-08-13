import { Router } from 'express';
import { createRoom, joinRoom, getRoom, leaveRoom, discardRoom, getGame } from '../controllers/roomController.js';

const router = Router();

router.post('/rooms', createRoom);
router.post('/rooms/join', joinRoom);
router.get('/rooms/:roomCode', getRoom);
router.post('/rooms/:roomCode/leave', leaveRoom);
router.post('/rooms/:roomCode/discard', discardRoom);
router.get('/games/:roomCode', getGame);

export default router;