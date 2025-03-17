import { Router } from "express";
import indexController from "../controllers/index.controller";
import authRouts from "./auth";
import timerRoutes from "./timer";
import uploadRoutes from "./upload"
const router:Router = Router();


const defaultRoutes  = [
    {
        path: '/',
        route: indexController
    },
    {
        path:'/auth',
        route:authRouts
    },
    {
        path:'/timer',
        route:timerRoutes
    },
    {
        path:'/screenshot',
        route:uploadRoutes
    },
   
];

defaultRoutes.forEach((route) => {
    router.use(route.path, route.route);
});

export default router;