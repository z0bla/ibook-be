// src/auth/auth.utils.ts
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt.config';
import { User } from '../users/entities/user.entity';

const SALT_ROUNDS = 10;

/**
 * Hash a password using bcrypt with 10 salt rounds
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    return await bcrypt.hash(password, SALT_ROUNDS);
  } catch {
    throw new Error('Error hashing password');
  }
}

/**
 * Validate a plain password against a bcrypt hash
 */
export async function validatePassword(
  password: string,
  hash: string,
): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash);
  } catch {
    throw new Error('Error validating password');
  }
}

/**
 * Generate JWT token for a user
 * @param user - user entity
 */
export function generateJWT(user: User): string {
  try {
    const payload = {
      sub: user.id,
      email: user.email,
    };

    return jwt.sign(payload, jwtConfig.secret, jwtConfig.signOptions);
  } catch {
    throw new Error('Error generating JWT token');
  }
}
