import { Model, DataTypes } from "sequelize";
import Database from "../database";
import {ITimer} from '../types/timer'
import User from "./user.model";

class Timer extends Model<ITimer> implements ITimer{
    public id!:number
    public user_id!: number;
    public start_time!: Date;
    public end_time!:Date;
    public time_counter!: number;
    public created_at!: Date;
    public updated_at!: Date;

}


// Get the sequelize instance
const sequelize = Database.getInstance().getSequelize();

// Initialize the model with the database connection
Timer.init({
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      
      
      user_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      start_time:{
        type:DataTypes.DATE,
        allowNull:true
      },
      end_time:{
        type:DataTypes.DATE,
        allowNull:true
      },
      time_counter:{
        type:DataTypes.BIGINT,
        allowNull:true
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: true,
      }
},{
    sequelize,
    tableName: 'time_counters',
    underscored: false,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
})

setTimeout(() => {
  Timer.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
  });
}, 0);
export default Timer

