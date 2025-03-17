import { Request, Response, Router } from 'express';

class IndexController {
    public readonly router: Router;

    constructor() {
        this.router = Router();
        this.initRoutes();
    }

    private initRoutes(): void {
        this.router.get('/', this.index.bind(this));
        this.router.post('/', this.post.bind(this));
    }

    private index(req: Request, res: Response): void {
        res.status(200).json({
            success: true,
            message: 'Hello World'
        });
    }

    private post(req: Request, res: Response): void {
        res.status(405).json({
            success: true,  // Fixed typo in "success"
            message: "Not Allowed"  // Fixed grammar in message
        });
    }
}

export default new IndexController().router;