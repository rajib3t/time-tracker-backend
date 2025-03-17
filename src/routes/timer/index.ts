import { Router } from "express";
import timerController from "../../controllers/timer.controller";



const timerRoutes:Router = Router();


const defaultRoutes  = [
    
    {
        path: '/',
        route: timerController
    },
    
];


defaultRoutes.forEach((route) => {
    timerRoutes.use(route.path, route.route);
});

export default timerRoutes;