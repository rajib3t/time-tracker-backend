import { Controller } from "../controller";
import { Request, Response, NextFunction } from 'express';
import { AuthService } from "../../services/auth/auth.service";
import EmptyBodyValidator from '../../validators/emptybody.validator';
import AsyncHandler from '../../exceptions/asynchandler';
import httpStatus from 'http-status';
import {NODE_ENV} from '../../config'
class LoginController extends Controller {
    
    private authService: AuthService;
    
    constructor() {
        super();
        this.authService = new AuthService();
        this.initRoutes();
    }

    private initRoutes() {
        const validateRequestBody = new EmptyBodyValidator().createFieldValidator(['email', 'password']);
        
        this.router.post('/login', validateRequestBody, AsyncHandler.handle(this.post.bind(this)));
        this.router.post('/refresh-token', AsyncHandler.handle(this.refreshToken.bind(this)));
        this.router.post('/logout', AsyncHandler.handle(this.logout.bind(this)));
    }

    private async post(req: Request, res: Response) {
        const { email, password } = req.body;
        const result = await this.authService.loginWithEmailPassword(email, password);
        
        // Set HTTP-only cookie with refresh token
        // res.cookie('refreshToken', result.tokens.refreshToken, {
        //     httpOnly: true,
        //     secure: NODE_ENV === 'production',
        //     maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        //     path: '/'
        // });
        
        return res.status(httpStatus.OK).json({
            success: true,
            message: 'Login successful',
            data: {
                user: result.user,
                accessToken: result.tokens.accessToken,
                refreshToken: result.tokens.refreshToken,
                expiresAt:result.tokens.expiresAt
            }
        });
    }
    
    private async refreshToken(req: Request, res: Response) {
        const refreshToken =  req.body.refreshToken;
        
        if (!refreshToken) {
            return res.status(httpStatus.UNAUTHORIZED).json({
                success: false,
                message: 'Refresh token is required'
            });
        }
        
        const result = await this.authService.refreshToken(refreshToken);
        
        return res.status(httpStatus.OK).json({
            success: true,
            message: 'Token refreshed successfully',
            data: {
                accessToken: result.accessToken,
                refreshToken:refreshToken
            }
        });
    }
    
    private async logout(req: Request, res: Response) {
        const refreshToken = req.body.refreshToken;
        
        if (!refreshToken) {
            return res.status(httpStatus.BAD_REQUEST).json({
                success: false,
                message: 'Refresh token is required'
            });
        }
        
        // Pass refreshToken directly, not refreshToken.token
        await this.authService.logout(refreshToken);
        
        // Clear the refresh token cookie
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: NODE_ENV === 'production',
            path: '/'
        });
        
        return res.status(httpStatus.OK).json({
            success: true,
            message: 'Logged out successfully'
        });
    }
}

export default new LoginController().router;