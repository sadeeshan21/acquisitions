import express from 'express';
import logger from '#config/logger.js';
import { signup } from '../controllers/auth.controller.js'; // Added the import back!

const router = express.Router();

router.post('/sign-up', signup); // Fixed the spelling to 'signup'!

router.post('/sign-in', (req, res) => {
    res.send('POST /api/auth/sign-in response');
});

router.post('/sign-out', (req, res) => {
    res.send('POST /api/auth/sign-out response');
});

export default router;