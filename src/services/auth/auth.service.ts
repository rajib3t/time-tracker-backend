import UserService from "../users/user.service";
import bcrypt from 'bcrypt';
import httpStatus from 'http-status';
import TokenService from "../token/token.service";
import User from "../../models/user.model";
export class AuthService {
    private userService: UserService;
    private tokenService: TokenService;
    
    constructor() {
        this.userService = new UserService();
        this.tokenService = TokenService.getInstance(); // Use the singleton pattern
    }

    async loginWithEmailPassword(email: string, password: string) {
        try {
            // Find user by email
            const user = await User.scope('withPassword').findOne({where:{email:email}})
            
            // Handle user not found
            if (!user) {
                const error = new Error('Invalid email or password');
                (error as any).statusCode = httpStatus.UNAUTHORIZED;
                throw error;
            }
            
            // Verify password
            const isPasswordValid = await bcrypt.compare(password, user.password);
            console.log(isPasswordValid);
            
            if (!isPasswordValid) {
                const error = new Error('Invalid email or password');
                (error as any).statusCode = httpStatus.UNAUTHORIZED;
                throw error;
            }

            // Revoke any existing tokens for security
            await this.tokenService.revokeAllUserTokens(user);
            
            // Generate new tokens
            const accessToken = await this.tokenService.generateToken(user);
            const refreshToken = await this.tokenService.generateRefreshToken(user);
            
            // Save refresh token to database
            await this.tokenService.saveToken(refreshToken, user);
            
            // Return user without password
            const userObject = user.get({ plain: true });
            const { password: _, ...userWithoutPassword } = userObject;
            
            return {
                success: true,
                user: userWithoutPassword,
                tokens: {
                    accessToken,
                    refreshToken: refreshToken.token,
                    expiresAt: refreshToken.expires
                }
            };
        } catch (error) {
            if ((error as any).statusCode) {
                throw error;
            }
            throw new Error(`Authentication failed: ${(error as Error).message}`);
        }
    }

    async refreshToken(refreshToken: string) {
        try {
            
            const newAccessToken = await this.tokenService.refreshAccessToken(refreshToken);
            
            if (!newAccessToken) {
                const error = new Error('Invalid or expired refresh token');
                (error as any).statusCode = httpStatus.UNAUTHORIZED;
                throw error;
            }
            
            return {
                success: true,
                accessToken: newAccessToken
            };
        } catch (error) {
            if ((error as any).statusCode) {
                throw error;
            }
            throw new Error(`Token refresh failed: ${(error as Error).message}`);
        }
    }

    async logout(refreshToken: string) {
       
        try {
            await this.tokenService.revokeToken(refreshToken);
            return { success: true };
        } catch (error) {
            throw new Error(`Logout failed: ${(error as Error).message}`);
        }
    }
}