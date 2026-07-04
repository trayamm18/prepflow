import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
  };
  admin?: {
    id: string;
    email: string;
  };
}
