import { Request, Response, NextFunction } from 'express';

import httpStatus from 'http-status';
class EmptyBodyValidator {


public  createFieldValidator (requiredFields: string[]) {
        return (req: Request, res: Response, next: NextFunction): void => {
          const missingFields = requiredFields.filter(field => !req.body[field] || req.body[field].trim() === '');
          
          if (missingFields.length > 0) {
            res.status(httpStatus.BAD_REQUEST).json({
              success: false,
              message: `Missing required fields: ${missingFields.join(', ')}`,
            });
            return;
          }
          
          next();
        };
      };
}

export default EmptyBodyValidator