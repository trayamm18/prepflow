import { Router } from 'express';
import { getProblems, getProblemBySlug, submitProblemSolution, getStriverProgress } from '../controllers/problemController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', getProblems);
router.get('/striver', getStriverProgress);
router.get('/:slug', getProblemBySlug);
router.post('/:slug/submit', authenticateToken, submitProblemSolution);

export default router;
