import express from 'express';
import adminController from '../controllers/adminController.js';
import { authenticateJWT } from '../middleware/auth.js';
import roleCheck from '../middleware/roleCheck.js';

const router = express.Router();

router.use(authenticateJWT);
router.use(roleCheck(['admin']));

router.get('/dashboard', adminController.getDashboard);
router.get('/feedback', adminController.getFeedback);
router.put('/feedback/:id/moderate', adminController.moderateFeedback);
router.get('/spam-reports', adminController.getSpamReports);
router.put('/spam-reports/:id/resolve', adminController.resolveSpamReport);

export default router;

