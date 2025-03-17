export interface IUser {
    id?: number;
    firstName: string;
    lastName: string;
    email: string;
    mobile?: string;
    password: string;
    is_admin: boolean;
    created_at?: Date;
    updated_at?: Date;
    deleted_at?: Date;
  }