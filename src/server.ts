import express from "express";
import bodyParser from 'body-parser';
import { PORT } from "./config";
import Database from "./database";
import { IDatabase } from './types/database';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import router from "./routes";

class Server {
    private app: express.Application;
    private port: number;
    private database!: IDatabase;

    constructor() {
        this.app = express();
        this.port = PORT ? parseInt(PORT as string) : 3000;
        this.setupMiddleware();
    }

    private setupMiddleware(): void {
        this.app.use(bodyParser.json());
        this.app.use(cookieParser());
        this.app.use(cors({
            origin: process.env.NODE_ENV === 'production' ? process.env.ALLOWED_ORIGINS?.split(',') : '*',
            credentials: true
        }));
        this.app.use('/', router);
    }

    private async initDatabase(): Promise<void> {
        try {
            this.database = Database.getInstance();
            await this.database.connect();
            console.log('Database connection initialized successfully');
        } catch (error) {
            console.error('Failed to initialize database:', error);
            throw error;
        }
    }
    
    public async start(): Promise<void> {
        try {
            await this.initDatabase();
            
            return new Promise((resolve) => {
                this.app.listen(this.port, () => {
                    console.log(`Server running on port ${this.port}`);
                    resolve();
                });
            });
        } catch (error) {
            console.error('Failed to start server:', error);
            process.exit(1);
        }
    }
}

// Singleton pattern for the server
const server = new Server();
server.start().then(() => {
    console.log('Server is fully initialized');
}).catch(err => {
    console.error('Server initialization failed:', err);
});

export default server;