import { UserRole } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: UserRole;
        emailVerified: boolean;
        phoneVerified: boolean;
        isActive: boolean;
      };
    }
  }
}

export {};