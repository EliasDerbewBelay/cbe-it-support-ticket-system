import { SanitizedUser } from './auth';

declare global {
  namespace Express {
    interface Request {
      user?: SanitizedUser;
    }
  }
}
