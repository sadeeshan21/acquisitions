import logger from '#config/logger.js';
import bcrypt from 'bcrypt';
import { db } from '#config/database.js';
import { users } from '#models/user.model.js';
import { eq } from 'drizzle-orm'; // Make sure eq is imported so your .where() works!

export const hashPassword = async (password) => {
  try {
    return await bcrypt.hash(password, 10);
  } catch (e) {
    // Fixed string interpolation: used backticks (`) instead of single quotes (')
    logger.error(`Error hashing password: ${e}`);
    throw new Error('Error hashing password');
  }
};

export const createUser = async ({ name, email, password, role = 'user' }) => {
  try {
    // 1. Added 'await' here so it actually fetches the data before checking the length
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (existingUser.length > 0) {
      throw new Error('User already exists');
    } // <-- 2. BRACKET FIX: The 'if' block closes right here!

    // 3. User creation logic is now OUTSIDE the if block so it can actually run
    const password_hash = await hashPassword(password);

    const [newUser] = await db.insert(users)
      .values({ name, email, password: password_hash, role })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        created_at: users.created_at,
      });

    // Fixed string interpolation quotes here too
    logger.info(`User ${newUser.email} created successfully`);
    return newUser;

  } catch (e) { // <-- 4. BRACKET FIX: Added the '}' right here to close the 'try' block!
    logger.error(`Error creating the user: ${e}`);
    throw e;
  }
};