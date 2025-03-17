import { Model, DataTypes } from "sequelize";
import Database from "../database";
import { IToken, TokenType } from "../types/token";


export class Token extends Model<IToken> implements IToken{
    public id!: number ;
    public token!: string;
    public user_id!: number;
    public type!: TokenType ;
    public expires!: Date;
    public is_revoked!: boolean;
    public created_at!: Date;
    public updated_at!: Date;

}
// Get the sequelize instance
const sequelize = Database.getInstance().getSequelize();
// Initialize the model with the database connection
Token.init({
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    
    token: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    is_revoked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: true,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    expires: {
      type: DataTypes.DATE,
        allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'tokens',
    underscored: false,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    
  },
)

export default Token;