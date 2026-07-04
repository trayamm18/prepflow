import { Router } from 'express';
import { getNote, saveNote, deleteNote } from '../controllers/noteController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

router.get('/:problemId', authenticateToken, getNote);
router.put('/:problemId', authenticateToken, saveNote);
router.delete('/:problemId', authenticateToken, deleteNote);

export default router;
