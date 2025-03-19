import { Model, DataTypes } from "sequelize";
import Database from "../database";
import User from "./user.model";
import TimeSegment from "./time-segment.model";

class TimerEvent extends Model {
  public id!: number;
  public user_id!: number;
  public event_type!: string;
  public timestamp!: Date;
  public elapsed_time!: number | null;
  public segment_id!: number | null;
  public created_at!: Date;
  public updated_at!: Date;
}

// Get the sequelize instance
const sequelize = Database.getInstance().getSequelize();

// Initialize the model with the database connection
TimerEvent.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    event_type: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    elapsed_time: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    segment_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
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
    tableName: "timer_events",
    underscored: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

// Set up associations after all models are defined
setTimeout(() => {
  TimerEvent.belongsTo(User, {
    foreignKey: "user_id",
    as: "user",
  });
  
  TimerEvent.belongsTo(TimeSegment, {
    foreignKey: "segment_id",
    as: "timeSegment",
  });
}, 0);

export default TimerEvent;