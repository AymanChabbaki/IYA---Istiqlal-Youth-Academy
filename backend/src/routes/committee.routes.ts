import { Router } from 'express';
import { listCommittees, createCommittee, updateCommittee, deleteCommittee } from '../controllers/committee.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Public
router.get('/', listCommittees);

// Admin
router.post('/', authenticate, authorize('ADMIN'), createCommittee);
router.patch('/:id', authenticate, authorize('ADMIN'), updateCommittee);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteCommittee);

export default router;
