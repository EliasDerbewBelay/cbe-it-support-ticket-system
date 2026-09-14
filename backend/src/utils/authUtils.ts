import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JwtTokenPayload } from '../types/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'cbe_it_support_system_fallback_secret_key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

/**
 * Compare plain text password against bcrypt hash
 */
export const comparePassword = async (
  plain: string,
  hashed: string
): Promise<boolean> => {
  return bcrypt.compare(plain, hashed);
};

/**
 * Hash a password using bcrypt with 12 salt rounds
 */
export const hashPassword = async (plain: string): Promise<string> => {
  return bcrypt.hash(plain, 12);
};

/**
 * Generate a signed JWT token
 */
export const generateToken = (payload: JwtTokenPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
};

/**
 * Verify and decode a JWT token
 */
export const verifyToken = (token: string): JwtTokenPayload => {
  return jwt.verify(token, JWT_SECRET) as JwtTokenPayload;
};
