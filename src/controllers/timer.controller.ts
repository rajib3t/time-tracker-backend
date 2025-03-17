import { Controller } from "./controller"
import { Request, Response } from "express";
import AsyncHandler from '../exceptions/asynchandler';
import { authMiddleware, AuthRequest } from "../middlewares/auth.middleware";
import httpStatus from 'http-status';

class TimerController extends Controller {
    constructor() {
        super();
        this.initRoutes();
    }
    
  

    private initRoutes(): void {
        // Use standard Request type for router definition
        this.router.post('/start', authMiddleware, AsyncHandler.handle(this.startTimer.bind(this)));
    }

    // Use AuthRequest in the handler method
    private async startTimer(req: Request, res: Response): Promise<void> {
        // Cast to AuthRequest to access user property
        const authReq = req as AuthRequest;
        const userId = authReq.user?.user_id;
        
        // Your timer logic here
        
        res.status(httpStatus.OK).json({
            success: true,
            message: 'Timer started successfully',
            data: { userId }
        });
    }


    
}

export default new TimerController().router;