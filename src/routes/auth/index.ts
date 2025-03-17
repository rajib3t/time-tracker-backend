import { Router } from "express";

import RegisterController from "../../controllers/auth/register.controller";
import LoginController from "../../controllers/auth/login.controller";


const authRouts:Router = Router();


const defaultRoutes  = [
    
    {
        path: '/',
        route: RegisterController
    },
    {
        path: '/',
        route: LoginController
    }
];


defaultRoutes.forEach((route) => {
    authRouts.use(route.path, route.route);
});

export default authRouts;