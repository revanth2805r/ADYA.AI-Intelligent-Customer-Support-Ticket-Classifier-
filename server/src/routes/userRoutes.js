import express from 'express';
import { login, register } from '../controllers/userController.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', register);

export default router;