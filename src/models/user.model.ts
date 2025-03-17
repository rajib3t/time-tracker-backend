import { Model, DataTypes, InferAttributes, InferCreationAttributes } from "sequelize";
import Database from "../database";
import { IUser } from "../types/user";
import Timer from "./timer.mode";
import Screenshot from "./screenshot.model";

export class User extends Model implements IUser {
  public id!: number;
  public firstName!: string;
  public lastName!: string;
  public email!: string;
  public mobile!: string;
  public password!: string;
  public is_admin!: boolean;
  public created_at!: Date;
  public updated_at!: Date;


  public readonly timers?: Timer[];
}

// Get the sequelize instance
const sequelize = Database.getInstance().getSequelize();

// Initialize the model with the database connection
User.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    mobile: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    is_admin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
    }
  },
  {
    sequelize,
    tableName: 'users',
    underscored: false,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    defaultScope: {
      attributes: {
        exclude: ['password']
      }
    },
    scopes: {
      withPassword: {
          attributes: {
            include: [
                'password'
            ]
          },
      }
  },
  },
  
);
User.hasMany(Timer,{
  foreignKey: 'user_id',
  as: 'timers'
})
User.hasMany(Screenshot,{
  foreignKey: 'user_id',
  as: 'screenshots'
})

export default User;