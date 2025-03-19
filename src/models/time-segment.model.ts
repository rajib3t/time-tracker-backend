import { Model, DataTypes } from "sequelize";
import Database from "../database";
import DailyTimeRecord from "./daily-time-record.model";
import TimerEvent from "./timer-event.model";

class TimeSegment extends Model {
  public id!: number;
  public daily_record_id!: number;
  public start_time!: Date;
  public end_time!: Date | null;
  public duration_seconds!: number | null;
  public status!: string;
  public created_at!: Date;
  public updated_at!: Date;
}

// Get the sequelize instance
const sequelize = Database.getInstance().getSequelize();

// Initialize the model with the database connection
TimeSegment.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    daily_record_id: {
      type: DataTypes.BIGINT,  // Changed from INTEGER to BIGINT
      allowNull: false,
    },
    start_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    end_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    duration_seconds: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: "active",
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "time_segments",
    underscored: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

// Set up associations after all models are defined
setTimeout(() => {
  TimeSegment.belongsTo(DailyTimeRecord, {
    foreignKey: "daily_record_id",
    as: "dailyRecord",
  });
  
  TimeSegment.hasMany(TimerEvent, {
    foreignKey: "segment_id",
    as: "timerEvents",
  });
}, 0);

export default TimeSegment;