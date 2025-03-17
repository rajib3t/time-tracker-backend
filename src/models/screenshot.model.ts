import { Model, DataTypes } from "sequelize";
import { IScreenshot } from "../types/screenshot";
import Database from "../database";
import User from "./user.model";
class Screenshot extends Model<IScreenshot> implements IScreenshot{
    public id!:number
    public user_id!:number
    public timestamp!: number;
    public screenshot!: string;
    public created_at!: Date;
    public updated_at!: Date;

}



// Get the sequelize instance
const sequelize = Database.getInstance().getSequelize();

Screenshot.init({
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
    },
          
          
    user_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
    },
    timestamp:{
        type:DataTypes.INTEGER,
        allowNull:true
    },
    screenshot:{
        type:DataTypes.TEXT,
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
},
{
    sequelize,
    tableName: 'screenshots',
    underscored: false,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
}
)
setTimeout(() => {
    Screenshot.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
  });
}, 0);

export default Screenshot;