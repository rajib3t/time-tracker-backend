import { Model, DataTypes } from "sequelize";
import Database from "../database";
import User from "./user.model";
import TimeSegment from "./time-segment.model";
import {IDailyTimeRecord} from '../types/timer'
class DailyTimeRecord extends Model {
  public id!: number;
  public user_id!: number;
  public date!: Date;
  public total_seconds!: number;
  public first_start_time!: Date;
  public last_end_time!: Date;
  public created_at!: Date;
  public updated_at!: Date;
}

// Get the sequelize instance
const sequelize = Database.getInstance().getSequelize();

// Initialize the model with the database connection
DailyTimeRecord.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    total_seconds: {
      type: DataTypes.BIGINT,
      defaultValue: 0,
    },
    first_start_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    last_end_time: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "daily_time_records",
    underscored: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

// Set up associations after all models are defined
setTimeout(() => {
  DailyTimeRecord.belongsTo(User, {
    foreignKey: "user_id",
    as: "user",
  });
  
  DailyTimeRecord.hasMany(TimeSegment, {
    foreignKey: "daily_record_id",
    as: "timeSegments",
  });
}, 0);

export default DailyTimeRecord;