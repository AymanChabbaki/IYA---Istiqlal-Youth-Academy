import { Router } from 'express';
import { listMedia, getMedia, createMedia, updateMedia, deleteMedia } from '../controllers/gallery.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Public
router.get('/', listMedia);
router.get('/:id', getMedia);

// Admin: manual curation
router.post('/', authenticate, authorize('ADMIN'), createMedia);
router.patch('/:id', authenticate, authorize('ADMIN'), updateMedia);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteMedia);

export default router;
