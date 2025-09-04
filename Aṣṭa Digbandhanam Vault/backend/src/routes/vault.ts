import { Router } from 'express';

const router = Router();

// Placeholder vault routes
router.get('/', (req, res) => {
  res.json({ message: 'Vault endpoint - coming soon' });
});

router.post('/', (req, res) => {
  res.json({ message: 'Create vault item - coming soon' });
});

router.put('/:id', (req, res) => {
  res.json({ message: 'Update vault item - coming soon' });
});

router.delete('/:id', (req, res) => {
  res.json({ message: 'Delete vault item - coming soon' });
});

export default router;