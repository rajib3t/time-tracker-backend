import User from "../../models/user.model";
import httpStatus from 'http-status';
import bcrypt from 'bcrypt';
import { IUser } from "../../types/user";

class UserService {
    async createUser(user: IUser) {
        // Check if email already exists
        const existingUser = await User.findOne({ where: { email: user.email } });
        
        if (existingUser) {
            const error = new Error('Email already exists');
            (error as any).statusCode = httpStatus.CONFLICT;
            throw error;
        }

        // Hash password and create user in one try-catch block
        try {
            // Hash password (using a constant for salt rounds)
            const SALT_ROUNDS = 10;
            const hashedPassword = await bcrypt.hash(user.password, SALT_ROUNDS);

            // Create user with destructured input and hashed password
            const { firstName, lastName, email, is_admin } = user;
            
            const createdUser = await User.create({
                firstName,
                lastName,
                email,
                password: hashedPassword,
                is_admin
            });
            
            // Return user without password using object destructuring
            const { password, ...userWithoutPassword } = createdUser.get({ plain: true });
            return userWithoutPassword;
        } catch (error) {
            // Preserve status code if it exists, otherwise use a generic error
            if ((error as any).statusCode) {
                throw error;
            }
            throw new Error(`Failed to create user: ${(error as Error).message}`);
        }
    }

    // Simplified findUser with explicit typing
    async findUser(conditions: Record<string, any>) {
        return User.findOne({ where: conditions });
    }
}

export default UserService;