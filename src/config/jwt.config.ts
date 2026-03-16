import { SignOptions } from 'jsonwebtoken';

export const jwtConfig: { secret: string; signOptions: SignOptions } = {
  secret: process.env.JWT_SECRET as string,
  signOptions: {
    expiresIn: '24h',
  },
};
