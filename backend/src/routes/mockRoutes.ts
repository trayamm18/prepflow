import { Router } from 'express';
import { getMockQuestions, submitMockAttempt, getMockHistory } from '../controllers/mockController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

router.get('/questions', authenticateToken, getMockQuestions);
router.post('/submit', authenticateToken, submitMockAttempt);
router.get('/history', authenticateToken, getMockHistory);

export default router;
