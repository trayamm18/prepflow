import { Router } from 'express';
import { adminLogin, addProblem, editProblem, deleteProblem } from '../controllers/adminController';
import { authenticateAdmin } from '../middlewares/authMiddleware';

const router = Router();

router.post('/login', adminLogin);
router.post('/problems', authenticateAdmin, addProblem);
router.put('/problems/:id', authenticateAdmin, editProblem);
router.delete('/problems/:id', authenticateAdmin, deleteProblem);

export default router;
