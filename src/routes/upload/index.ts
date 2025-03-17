import { Router } from "express";
import screenshotController from "../../controllers/screenshot.controller"; 



const uploadRoutes:Router = Router();


const defaultRoutes  = [
    
    {
        path: '/',
        route: screenshotController
    },
    
];


defaultRoutes.forEach((route) => {
    uploadRoutes.use(route.path, route.route);
});

export default uploadRoutes;