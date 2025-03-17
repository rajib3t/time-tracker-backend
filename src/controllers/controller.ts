import {  Router } from 'express';
export abstract class Controller{
    public readonly router: Router; 

    constructor(){
        this.router = Router()
    } 


    
}