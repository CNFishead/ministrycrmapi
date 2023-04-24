import express from 'express'
import authRoutes from './authRoutes'
const router = express.Router()

// Import all of our routes
router.use('/auth', authRoutes)

export default router;