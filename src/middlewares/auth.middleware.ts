// First, let's fix the auth middleware
import TokenService from "../services/token/token.service";
import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";

// Create a custom interface that extends Express Request
export interface AuthRequest extends Request {
  user?: {
    user_id: number;
    email: string;
    [key: string]: any;
  };
}

// Update the middleware to not return a response type
export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Get token from Authorization header
    const authHeader = req.header('Authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    
    // If no token is provided
    if (!token) {
      res.status(httpStatus.UNAUTHORIZED).json({ 
        success: false, 
        message: 'Access denied. No token provided.'
      });
      return;
    }
    
    // Verify the token
    const decoded = await TokenService.getInstance().verifyToken(token);
    
    // If token is invalid or expired
    if (!decoded) {
      res.status(httpStatus.UNAUTHORIZED).json({ 
        success: false, 
        message: 'Invalid or expired token'
      });
      return;
    }
    
    // Check if token has necessary claims
    if (!decoded.user_id || !decoded.email) {
      res.status(httpStatus.UNAUTHORIZED).json({ 
        success: false, 
        message: 'Invalid token format'
      });
      return;
    }
    
    // Attach user information to request object
    (req as AuthRequest).user = {
      user_id: decoded.user_id,
      email: decoded.email
    };
    
    next();
  } catch (error) {
    res.status(httpStatus.UNAUTHORIZED).json({ 
      success: false, 
      message: 'Authentication failed',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
    return;
  }
};