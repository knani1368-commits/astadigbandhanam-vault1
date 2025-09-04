import { Router } from 'express';

const router = Router();

// Placeholder user routes
router.get('/profile', (req, res) => {
  res.json({ message: 'User profile - coming soon' });
});

router.put('/profile', (req, res) => {
  res.json({ message: 'Update profile - coming soon' });
});

router.get('/settings', (req, res) => {
  res.json({ message: 'User settings - coming soon' });
});

export default router;