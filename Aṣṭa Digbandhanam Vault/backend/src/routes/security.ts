import { Router } from 'express';

const router = Router();

// Placeholder security routes
router.get('/status', (req, res) => {
  res.json({ message: 'Security status - coming soon' });
});

router.post('/mfa', (req, res) => {
  res.json({ message: 'MFA setup - coming soon' });
});

router.post('/biometric', (req, res) => {
  res.json({ message: 'Biometric setup - coming soon' });
});

export default router;