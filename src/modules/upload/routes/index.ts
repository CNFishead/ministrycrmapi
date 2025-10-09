// modules/notification/routes/index.ts
import express from 'express';
import cloudinaryRoutes from './cloudinary';

const router = express.Router();

router.use('/cloudinary', cloudinaryRoutes);

// Example diagnostic route
router.get('/health', (req, res) => {
  res.json({ status: 'Upload module online' }); 
});

export default router;
