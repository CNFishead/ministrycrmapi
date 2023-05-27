import express from 'express'
import authRoutes from './authRoutes'
import userRoutes from './userRoutes'
import uploadRoutes from './uploadRoutes'
import ministryRoutes from './ministryRoutes'

const router = express.Router()

// Import all of our routes
router.use('/auth', authRoutes)
router.use('/user', userRoutes)
router.use('/upload', uploadRoutes)
router.use('/ministry', ministryRoutes)

export default router;