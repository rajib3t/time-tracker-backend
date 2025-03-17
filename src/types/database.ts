import { Dialect } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';

export interface DatabaseConfig {
  dialect: Dialect;
  host: string;
  username: string;
  password: string;
  database: string;
  port: number;
  models: string[];
  define: {
    timestamps: boolean;
    [key: string]: any;
  };
}

export interface IDatabaseConnection {
  authenticate(): Promise<void>;
  sync(options?: { force?: boolean; alter?: boolean }): Promise<any>;
  close(): Promise<void>;
}

export interface IDatabase {
  getSequelize(): Sequelize;
  connect(): Promise<void>;
}