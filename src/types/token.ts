export interface IToken{
    id?: number;
    user_id:number
    token:string
    type:TokenType
    expires:Date
    is_revoked:boolean
    created_at:Date
    updated_at:Date
}


// Define token types
export enum TokenType {
    ACCESS = 'access',
    REFRESH = 'refresh',
    ADMIN = 'admin'
  }