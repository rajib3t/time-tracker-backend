import { 
    DB_PORT,
    DB_USERNAME,
    DB_PASSWORD,
    DB_NAME,
    DB_HOST,
    DB_DIALECT
} from '../config'

import * as dotenv from 'dotenv';
dotenv.config();
import { Sequelize } from "sequelize-typescript";
import { log } from 'console';
import { DatabaseConfig, IDatabase } from '../types/database';
import path from 'path';
import { Dialect } from 'sequelize';
class Database implements IDatabase {
    private static instance: Database;
    private sequelize: Sequelize;
    
    private constructor() {
        
        
        const config: DatabaseConfig = {
            dialect: DB_DIALECT as Dialect,
            host: DB_HOST as string,
            username: DB_USERNAME as string,
            password: DB_PASSWORD as string,
            database: DB_NAME as string,
            port: Number(DB_PORT),
            models: [__dirname + '../models'],
            define: {
                timestamps: false,
            },
            // Add these options for better debugging
        };
        
        this.sequelize = new Sequelize(config);
    }

    private async connectToDatabase(): Promise<void> {
        try {
            await this.sequelize.authenticate();
            log('Database connected successfully!');
        } catch (err) {
            log('Error connecting to database:', err);
            // Rethrow the error to be caught by the caller
            throw err;
        }
    }

    public static getInstance(): Database {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }

    public getSequelize(): Sequelize {
        return this.sequelize;
    }
    
    public async connect(): Promise<void> {
        return this.connectToDatabase();
    }
}

export default Database;