import { createUser } from '#services/auth.service.js';
import logger from '../config/logger.js';
import { signupSchema } from '../validations/auth.validation.js';
import jwt from 'jsonwebtoken'; // <-- 1. Imported the JWT library!

export const signup = async (req, res, next) => {
  try {
    const validationResult = signupSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.issues.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }

    const { name, email, password, role } = validationResult.data;

    const user = await createUser({ name, email, password, role });

    // 2. Fixed token generation: Used 'jwt.sign' and added a secret key & expiration
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback_super_secret_key', // Usually stored in your .env file
      { expiresIn: '1d' }
    );

    // 3. Fixed cookie setting: Using Express's built-in res.cookie method
    res.cookie('token', token, {
      httpOnly: true, // Security best practice: prevents frontend JavaScript from reading the cookie
      maxAge: 24 * 60 * 60 * 1000 // 1 day in milliseconds
    });

    logger.info(`User registered successfully: ${email}`);
    
    return res.status(201).json({
      message: 'User registered',
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });

  } catch (e) {
    if (typeof logger !== 'undefined' && logger.error) {
      logger.error('Signup error', e);
    } else {
      console.error('Signup error:', e);
    }

    if (e.message === 'User already exists') {
      return res.status(409).json({ error: 'Email already exists' });
    }

    next(e);
  }
};