import { Request, Response, NextFunction } from 'express';
import UserService from '../../services/users/user.service';
import { IUser } from '../../types/user';
import httpStatus from 'http-status';
import { Controller } from '../controller';
import EmptyBodyValidator from '../../validators/emptybody.validator';
import AsyncHandler from '../../exceptions/asynchandler';

class RegisterController extends Controller {
    private userService: UserService;
    
    constructor() {
        super();
        this.userService = new UserService();
        this.initRoutes();
    }
    
    private initRoutes(): void {
        const validateRequestBody = new EmptyBodyValidator().createFieldValidator(['firstName', 'lastName', 'email', 'password']);
        this.router.post('/register', validateRequestBody, AsyncHandler.handle(this.post.bind(this)));
        this.router.get('/register', AsyncHandler.handle(this.get.bind(this)));
    }
    
    private async post(req: Request, res: Response) {
        // No need for try-catch here since AsyncHandler will handle errors
        const userData: IUser = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: req.body.password,
            is_admin: req.body.is_admin || false // Default to false if not provided
        };
        
        const user = await this.userService.createUser(userData);
        
        return res.status(httpStatus.CREATED).json({
            success: true,
            message: 'User registered successfully',
            user
        });
    }

    private async get(req: Request, res: Response) {
        return res.status(httpStatus.METHOD_NOT_ALLOWED).json({
            success: false,
            message: "GET method not allowed for registration"
        });
    }
}

export default new RegisterController().router;