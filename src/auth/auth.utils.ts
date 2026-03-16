import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  try {
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    return hash;
  } catch (error) {
    throw new Error('Error hashing password');
  }
}

export async function validatePassword(
  password: string,
  hash: string,
): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    throw new Error('Error validating password');
  }
}

import * as jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt.config';
import { User } from '../users/entities/user.entity';

export async function generateJWT(user: User): Promise<string> {
  try {
    const payload = {
      sub: user.id,
      email: user.email,
    };

    const token = jwt.sign(payload, jwtConfig.secret, jwtConfig.signOptions);

    return token;
  } catch (error) {
    throw new Error('Error generating JWT token');
  }
}
